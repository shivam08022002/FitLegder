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

  const gyms = await Gym.find({}).lean();
  const users = await User.find({}).lean();

  console.log('--- GYMS ---');
  for (const g of gyms) {
    const owner = users.find(u => u._id.toString() === g.owner.toString());
    console.log(`Gym: "${g.name}" (${g._id}) | Owner: "${owner ? owner.name : 'UNKNOWN'}" (${owner ? owner.email : 'UNKNOWN'})`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
