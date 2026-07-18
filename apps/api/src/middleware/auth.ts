import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';
import Gym from '../models/Gym';

export interface AuthRequest extends Request {
  userId?: string;
  gymId?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      gymId: string;
    };

    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokenHash');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    req.userId = decoded.userId;
    req.gymId = decoded.gymId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Access token expired',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid access token',
    });
  }
}

export async function requireSuperadmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'superadmin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Superadmin access required',
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
