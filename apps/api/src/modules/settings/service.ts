import Gym from '../../models/Gym';
import { AppError } from '../../middleware/errorHandler';

export async function getGymSettings(gymId: string) {
  const gym = await Gym.findById(gymId);
  if (!gym) throw new AppError('Gym not found', 404);
  return gym;
}

export async function updateGymSettings(gymId: string, data: any) {
  const gym = await Gym.findByIdAndUpdate(gymId, data, {
    new: true,
    runValidators: true,
  });
  if (!gym) throw new AppError('Gym not found', 404);
  return gym;
}

export async function updateGymLogo(gymId: string, logoUrl: string) {
  const gym = await Gym.findByIdAndUpdate(
    gymId,
    { logo: logoUrl },
    { new: true }
  );
  if (!gym) throw new AppError('Gym not found', 404);
  return gym;
}
