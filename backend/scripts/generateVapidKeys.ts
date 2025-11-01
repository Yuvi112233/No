/**
 * Script to generate VAPID keys for push notifications
 * Run with: npx tsx backend/scripts/generateVapidKeys.ts
 */

import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();
