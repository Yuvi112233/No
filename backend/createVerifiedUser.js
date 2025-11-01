import bcrypt from 'bcrypt';
import { MongoStorage } from './storage.js';

async function createVerifiedUser() {
  try {
    const storage = new MongoStorage();
    
    const userData = {
      name: 'Verified Test Owner',
      email: 'verifiedowner@example.com',
      phone: '+1234567899',
      password: await bcrypt.hash('password123', 10),
      role: 'salon_owner',
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      loyaltyPoints: 0,
      favoriteSalons: []
    };
    
    await storage.createUser(userData);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createVerifiedUser();