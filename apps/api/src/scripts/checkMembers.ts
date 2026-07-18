import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from '../models/Member';
import Gym from '../models/Gym';

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const members = await Member.find({}).lean();
  const gyms = await Gym.find({}).lean();

  console.log('--- MEMBERS ---');
  for (const m of members) {
    const gym = gyms.find(g => g._id.toString() === m.gym.toString());
    console.log(`Member: "${m.fullName}" | Gym: "${gym ? gym.name : 'UNKNOWN'}" (${m.gym})`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
