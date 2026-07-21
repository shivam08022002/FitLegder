import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './modules/auth/routes';
import dashboardRoutes from './modules/dashboard/routes';
import memberRoutes from './modules/members/routes';
import planRoutes from './modules/plans/routes';
import paymentRoutes from './modules/payments/routes';
import renewalRoutes from './modules/renewals/routes';
import reportRoutes from './modules/reports/routes';
import settingsRoutes from './modules/settings/routes';
import eventRoutes from './modules/events/routes';
import superadminRoutes from './modules/superadmin/routes';
import attendanceRoutes from './modules/attendance/routes';
import { authenticate, requireSuperadmin } from './middleware/auth';

const app: express.Application = express();

// Security middleware
app.use(helmet());
// Support multiple origins via comma-separated CLIENT_URL (e.g. "https://fit-legder-api.vercel.app,http://localhost:5173")
const allowedOrigins = env.CLIENT_URL ? env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean) : [];
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Return false to deny CORS gracefully without triggering 500 internal server error
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    message: 'Server is running',
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/superadmin', authenticate, requireSuperadmin, superadminRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/members', attendanceRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/renewals', renewalRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/events', eventRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
