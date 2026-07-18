import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import Gym from '../../models/Gym';
import Member from '../../models/Member';
import MembershipPlan from '../../models/MembershipPlan';
import Payment from '../../models/Payment';
import Membership from '../../models/Membership';
import Event from '../../models/Event';
import { AppError } from '../../middleware/errorHandler';

export async function getOwners(req: Request, res: Response, next: NextFunction) {
  try {
    const owners = await User.find({ role: 'owner' }).select('-passwordHash -refreshTokenHash');
    const gyms = await Gym.find({ owner: { $in: owners.map((o) => o._id) } });

    const merged = owners.map((owner) => {
      const gym = gyms.find((g) => g.owner.toString() === owner._id.toString());
      return {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        createdAt: owner.createdAt,
        gym: gym
          ? {
              _id: gym._id,
              name: gym.name,
              email: gym.email,
              contactNumber: gym.contactNumber,
              address: gym.address,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      data: merged,
      message: 'Owners list fetched successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function createOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, phone, gymName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // Pre-save hook hashes this
      phone,
      role: 'owner',
    });
    await user.save();

    const gym = new Gym({
      owner: user._id,
      name: gymName,
      email: email.toLowerCase(),
      contactNumber: phone,
    });
    await gym.save();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        gym: {
          _id: gym._id,
          name: gym.name,
          email: gym.email,
          contactNumber: gym.contactNumber,
        },
      },
      message: 'Owner and gym created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, phone, gymName } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'owner') {
      throw new AppError('Owner not found', 404);
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    const gym = await Gym.findOne({ owner: user._id });
    if (gym) {
      if (gymName !== undefined) gym.name = gymName;
      if (phone !== undefined) gym.contactNumber = phone;
      await gym.save();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        gym: gym
          ? {
              _id: gym._id,
              name: gym.name,
              email: gym.email,
              contactNumber: gym.contactNumber,
            }
          : null,
      },
      message: 'Owner details updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function changeOwnerPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'owner') {
      throw new AppError('Owner not found', 404);
    }

    user.passwordHash = password; // Pre-save hook hashes this
    user.refreshTokenHash = undefined; // Invalidate current sessions
    await user.save();

    res.status(200).json({
      success: true,
      data: null,
      message: "Owner's password updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== 'owner') {
      throw new AppError('Owner not found', 404);
    }

    const gym = await Gym.findOne({ owner: user._id });
    if (gym) {
      const gymId = gym._id;
      
      // Cascade delete related entities
      const members = await Member.find({ gym: gymId });
      const memberIds = members.map((m) => m._id);
      
      await Membership.deleteMany({ member: { $in: memberIds } });
      await Member.deleteMany({ gym: gymId });
      await MembershipPlan.deleteMany({ gym: gymId });
      await Payment.deleteMany({ gym: gymId });
      await Event.deleteMany({ gym: gymId });
      await gym.deleteOne();
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: null,
      message: 'Owner and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
