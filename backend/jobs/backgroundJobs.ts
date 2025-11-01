import queueService from '../services/queueService';
import { QueueModel, SalonModel } from '../db';
import wsManager from '../websocket';

/**
 * Background job to detect and mark no-shows
 * Runs every 5 minutes
 */
export function startNoShowDetectionJob() {
  // Run immediately on startup
  processNoShowsJob();
  
  // Then run every 5 minutes
  setInterval(processNoShowsJob, 5 * 60 * 1000);
}

/**
 * Process no-shows job
 */
async function processNoShowsJob() {
  try {
    await queueService.processNoShows();
  } catch (error) {
    console.error('❌ Error in no-show detection job:', error);
  }
}

/**
 * Background job to auto-reject pending verifications after timeout
 * Checks every minute for pending verifications older than 5 minutes
 */
export function startPendingVerificationTimeoutJob() {
  // Run immediately on startup
  processPendingVerificationTimeouts();
  
  // Then run every minute
  setInterval(processPendingVerificationTimeouts, 60 * 1000);
}

/**
 * Background job to auto-reject queues after 30 minutes of no response
 * Checks every minute for queues in waiting/notified status older than 30 minutes
 */
export function startQueueTimeoutJob() {
  // Run immediately on startup
  processQueueTimeouts();
  
  // Then run every minute
  setInterval(processQueueTimeouts, 60 * 1000);
}

/**
 * Process pending verification timeouts
 */
async function processPendingVerificationTimeouts() {
  try {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // Find queues in pending_verification status for more than 5 minutes
    const expiredVerifications = await QueueModel.find({
      status: 'pending_verification',
      checkInAttemptedAt: { $lte: fiveMinutesAgo }
    });

    if (expiredVerifications.length === 0) {
      return;
    }

    for (const queue of expiredVerifications) {
      // Revert status to 'notified'
      queue.status = 'notified';
      await queue.save();

      // Note: We could send a notification to the user here
      // For now, just log it
    }
  } catch (error) {
    console.error('❌ Error in pending verification timeout job:', error);
  }
}

/**
 * Process queue timeouts - auto-reject after 30 minutes
 */
async function processQueueTimeouts() {
  try {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    // Find queues in waiting or notified status for more than 30 minutes
    const expiredQueues = await QueueModel.find({
      status: { $in: ['waiting', 'notified'] },
      timestamp: { $lte: thirtyMinutesAgo }
    });

    if (expiredQueues.length === 0) {
      return;
    }

    for (const queue of expiredQueues) {
      const oldStatus = queue.status;
      queue.status = 'no-show';
      queue.noShowMarkedAt = new Date();
      queue.noShowReason = 'Auto-rejected: No response within 30 minutes';
      await queue.save();

      // Broadcast update to admin
      wsManager.broadcastQueueUpdate(queue.salonId, {
        queueId: queue.id,
        status: 'no-show',
        oldStatus
      });
    }
  } catch (error) {
    console.error('❌ Error in queue timeout job:', error);
  }
}

/**
 * Initialize all background jobs
 */
export function initializeBackgroundJobs() {
  startNoShowDetectionJob();
  startPendingVerificationTimeoutJob();
  startQueueTimeoutJob();
}
