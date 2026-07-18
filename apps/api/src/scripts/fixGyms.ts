import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Gym from '../models/Gym';

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const owners = await User.find({ role: 'owner' });
  console.log(`Found ${owners.length} owners. Checking gyms...`);

  for (const owner of owners) {
    const gym = await Gym.findOne({ owner: owner._id });
    if (!gym) {
      console.log(`⚠️  Owner "${owner.name}" (${owner.email}) has no gym. Creating one...`);
      const newGym = new Gym({
        owner: owner._id,
        name: `${owner.name}'s Gym`,
        email: owner.email,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      });
      await newGym.save();
      console.log(`  ✅ Created gym: "${newGym.name}"`);
    } else {
      console.log(`  👍 Owner "${owner.name}" already has gym: "${gym.name}"`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
