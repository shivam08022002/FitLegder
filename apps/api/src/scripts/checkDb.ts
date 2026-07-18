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

  const users = await User.find({}).lean();
  const gyms = await Gym.find({}).lean();

  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));

  console.log('--- GYMS ---');
  console.log(JSON.stringify(gyms, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
