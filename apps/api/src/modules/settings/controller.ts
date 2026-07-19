import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as settingsService from './service';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';
import SystemSettings from '../../models/SystemSettings';
import Gym from '../../models/Gym';
import { AppError } from '../../middleware/errorHandler';

// Configure Cloudinary if credentials exist
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const gym = await settingsService.getGymSettings(req.gymId!);
    res.status(200).json({ success: true, data: gym, message: 'Settings fetched' });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const gym = await settingsService.updateGymSettings(req.gymId!, req.body);
    res.status(200).json({ success: true, data: gym, message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
}

export async function uploadLogo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    let logoUrl = dataUrl;

    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        folder: 'fitledger_logos',
      });
      logoUrl = uploadResponse.secure_url;
    }

    const gym = await settingsService.updateGymLogo(req.gymId!, logoUrl);
    res.status(200).json({ success: true, data: gym, message: 'Logo uploaded' });
  } catch (error) {
    next(error);
  }
}

export async function getSaaSDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
      await settings.save();
    }
    res.status(200).json({
      success: true,
      data: settings,
      message: 'SaaS details fetched successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function requestUpgrade(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { plan, transactionId } = req.body;
    if (!plan || !['tier1', 'tier2', 'tier3'].includes(plan)) {
      throw new AppError('Invalid subscription plan selected', 400);
    }

    const gym = await Gym.findById(req.gymId);
    if (!gym) {
      throw new AppError('Gym profile not found', 404);
    }

    gym.subscriptionStatus = 'pending_approval';
    gym.subscriptionPendingPlan = plan as any;
    gym.subscriptionPaymentDetails = {
      transactionId: transactionId || '',
      submittedAt: new Date(),
    };

    await gym.save();

    res.status(200).json({
      success: true,
      data: gym,
      message: 'Upgrade request submitted successfully. Waiting for admin approval.',
    });
  } catch (error) {
    next(error);
  }
}
