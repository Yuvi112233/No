import { MongoStorage } from '../mongoStorage';
import { connectDB } from '../db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function createSuperAdmin() {
  let storage: MongoStorage | null = null;

  try {
    console.log('🔌 Connecting to MongoDB...');

    // Connect to database first
    await connectDB();

    console.log('✅ Connected to MongoDB');

    // Initialize storage
    storage = new MongoStorage();

    // Super admin credentials
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@smartq.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const name = 'Platform Admin';

    console.log('🔍 Checking for existing admin...');

    // Check if super admin already exists
    const existingAdmin = await storage.getUserByEmail(email);

    if (existingAdmin) {
      console.log('ℹ️  Super admin already exists with email:', email);

      // Update to super_admin role if not already
      if (existingAdmin.role !== 'super_admin') {
        await storage.updateUser(existingAdmin.id, { role: 'super_admin' });
        console.log('✅ Updated existing user to super_admin role');
      } else {
        console.log('✅ User already has super_admin role');
      }

      return;
    }

    console.log('👤 Creating new super admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'super_admin',
    });

    console.log('✅ Super admin user created');

    // Mark as verified
    await storage.updateUser(superAdmin.id, {
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
    });

    console.log('\n🎉 Super admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Failed to create super admin:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      console.log('🔌 Closing MongoDB connection...');
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

createSuperAdmin();
