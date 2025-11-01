import { MongoStorage } from '../mongoStorage';
import { connectDB } from '../db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function createSuperAdmin() {
  let storage: MongoStorage | null = null;

  try {
    // Connect to database first
    await connectDB();

    // Initialize storage
    storage = new MongoStorage();

    // Super admin credentials
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@smartq.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const name = 'Platform Admin';

    // Check if super admin already exists
    const existingAdmin = await storage.getUserByEmail(email);

    if (existingAdmin) {
      // Update to super_admin role if not already
      if (existingAdmin.role !== 'super_admin') {
        await storage.updateUser(existingAdmin.id, { role: 'super_admin' });
      }

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'super_admin',
    });

    // Mark as verified
    await storage.updateUser(superAdmin.id, {
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
    });

  } catch (error) {
    console.error('\n❌ Failed to create super admin:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

createSuperAdmin();
