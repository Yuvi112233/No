/**
 * Service to track live viewers on salon pages
 */
class LiveViewersService {
  // Map of salonId -> Set of userIds currently viewing
  private viewers: Map<string, Set<string>> = new Map();
  
  // Map of userId -> salonId they're currently viewing
  private userCurrentView: Map<string, string> = new Map();

  /**
   * User started viewing a salon page
   */
  joinSalonView(salonId: string, userId: string): number {
    // Remove user from previous salon if any
    const previousSalon = this.userCurrentView.get(userId);
    if (previousSalon && previousSalon !== salonId) {
      this.leaveSalonView(previousSalon, userId);
    }

    // Add user to this salon's viewers
    if (!this.viewers.has(salonId)) {
      this.viewers.set(salonId, new Set());
    }
    
    this.viewers.get(salonId)!.add(userId);
    this.userCurrentView.set(userId, salonId);

    return this.getViewerCount(salonId);
  }

  /**
   * User stopped viewing a salon page
   */
  leaveSalonView(salonId: string, userId: string): number {
    const salonViewers = this.viewers.get(salonId);
    if (salonViewers) {
      salonViewers.delete(userId);
      
      // Clean up empty sets
      if (salonViewers.size === 0) {
        this.viewers.delete(salonId);
      }
    }

    // Remove from user's current view
    if (this.userCurrentView.get(userId) === salonId) {
      this.userCurrentView.delete(userId);
    }

    return this.getViewerCount(salonId);
  }

  /**
   * Get current viewer count for a salon
   */
  getViewerCount(salonId: string): number {
    return this.viewers.get(salonId)?.size || 0;
  }

  /**
   * Get all viewer counts (for debugging)
   */
  getAllViewerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.viewers.forEach((viewers, salonId) => {
      counts[salonId] = viewers.size;
    });
    return counts;
  }

  /**
   * Clean up disconnected user
   */
  removeUser(userId: string): void {
    const salonId = this.userCurrentView.get(userId);
    if (salonId) {
      this.leaveSalonView(salonId, userId);
    }
  }
}

export default new LiveViewersService();
