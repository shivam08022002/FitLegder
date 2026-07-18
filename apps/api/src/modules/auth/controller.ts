import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as authService from './service';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        gym: result.gym,
        accessToken: result.accessToken,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        gym: result.gym,
        accessToken: result.accessToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
      return;
    }

    const result = await authService.refresh(token);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        gym: result.gym,
        accessToken: result.accessToken,
      },
      message: 'Token refreshed',
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.userId) {
      await authService.logout(req.userId);
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      data: null,
      message: 'If that email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(
      req.userId!,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.status(200).json({
      success: true,
      data: null,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const User = (await import('../../models/User')).default;
    const Gym = (await import('../../models/Gym')).default;

    const user = await User.findById(req.userId).select('-passwordHash -refreshTokenHash');
    const gym = await Gym.findOne({ owner: req.userId });

    res.status(200).json({
      success: true,
      data: { user, gym },
      message: 'User profile fetched',
    });
  } catch (error) {
    next(error);
  }
}
