import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing from env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);

  const adminEmail = 'admin@gympulse.com';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    existing.role = 'superadmin';
    await existing.save();
    console.log(`✅ User ${adminEmail} updated to superadmin successfully.`);
  } else {
    const admin = new User({
      name: 'Super Admin',
      email: adminEmail,
      passwordHash: 'AdminPassword123', // Mongoose pre-save hook will hash it
      role: 'superadmin',
    });
    await admin.save();
    console.log(`✅ Superadmin created: email: ${adminEmail}, password: AdminPassword123`);
  }

  await mongoose.disconnect();
  console.log('Database disconnected.');
}

run().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
