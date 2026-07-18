import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import User, { IUserDocument } from '../../models/User';
import Gym from '../../models/Gym';
import { AppError } from '../../middleware/errorHandler';
import { sendEmail } from '../../utils/email';

export function generateAccessToken(userId: string, gymId: string): string {
  return jwt.sign({ userId, gymId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string, gymId: string): string {
  return jwt.sign({ userId, gymId }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export async function storeRefreshToken(user: IUserDocument, refreshToken: string): Promise<void> {
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gymName: string;
}) {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = new User({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: data.password, // pre-save hook will hash it
    phone: data.phone,
    role: 'owner',
  });
  await user.save();

  const gym = new Gym({
    owner: user._id,
    name: data.gymName,
    email: data.email.toLowerCase(),
    contactNumber: data.phone,
  });
  await gym.save();

  const accessToken = generateAccessToken(user._id.toString(), gym._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString(), gym._id.toString());
  await storeRefreshToken(user, refreshToken);

  return {
    user: user.toJSON(),
    gym: gym.toJSON(),
    accessToken,
    refreshToken,
  };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const gym = await Gym.findOne({ owner: user._id });

  const accessToken = generateAccessToken(
    user._id.toString(),
    gym?._id.toString() || ''
  );
  const refreshToken = generateRefreshToken(
    user._id.toString(),
    gym?._id.toString() || ''
  );
  await storeRefreshToken(user, refreshToken);

  return {
    user: user.toJSON(),
    gym: gym?.toJSON() || null,
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshTokenValue: string) {
  let decoded: { userId: string; gymId: string };
  try {
    decoded = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as {
      userId: string;
      gymId: string;
    };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.refreshTokenHash) {
    throw new AppError('Invalid refresh token', 401);
  }

  const isValid = await bcrypt.compare(refreshTokenValue, user.refreshTokenHash);
  if (!isValid) {
    throw new AppError('Invalid refresh token', 401);
  }

  const gym = await Gym.findOne({ owner: user._id });
  const gymId = gym?._id.toString() || '';

  // Rotate tokens
  const accessToken = generateAccessToken(user._id.toString(), gymId);
  const newRefreshToken = generateRefreshToken(user._id.toString(), gymId);
  await storeRefreshToken(user, newRefreshToken);

  return {
    user: user.toJSON(),
    gym: gym?.toJSON() || null,
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal whether email exists
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  // In V1, log to console. In production, send email.
  console.log(`🔑 Password reset token for ${email}: ${resetToken}`);
  console.log(`   Reset URL: ${env.CLIENT_URL}/reset-password?token=${resetToken}`);

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Reset Password Request',
    text: `You requested a password reset. Please click on the link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #6366f1;">Reset Your Password</h2>
        <p>You requested a password reset for your Gym Pulse account. Click the button below to change your password:</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">This link will expire in 30 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.passwordHash = newPassword; // pre-save hook will hash it
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokenHash = undefined; // invalidate all sessions
  await user.save();
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.passwordHash = newPassword; // pre-save hook will hash it
  await user.save();
}
