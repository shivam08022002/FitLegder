import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as eventService from './service';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';

// Configure Cloudinary if credentials exist
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export async function getEvents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const events = await eventService.getEvents(req.gymId!);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.getEventById(req.params.id as string);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function getEventRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const registrations = await eventService.getEventRegistrations(req.params.id as string, req.gymId!);
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await eventService.createEvent(req.gymId!, req.body);
    res.status(201).json({ success: true, data: event, message: 'Event created' });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await eventService.updateEvent(req.params.id as string, req.gymId!, req.body);
    res.status(200).json({ success: true, data: event, message: 'Event updated' });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await eventService.deleteEvent(req.params.id as string, req.gymId!);
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
}

export async function uploadPoster(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    let posterUrl = dataUrl;

    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        folder: 'fitledger_events',
      });
      posterUrl = uploadResponse.secure_url;
    }

    const event = await eventService.updateEventPoster(req.params.id as string, req.gymId!, posterUrl);
    res.status(200).json({ success: true, data: event, message: 'Poster uploaded' });
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const registration = await eventService.registerForEvent(req.params.id as string, req.body);
    res.status(201).json({ success: true, data: registration, message: 'Registered successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getPendingRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const registrations = await eventService.getPendingRegistrations(req.gymId!);
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
}

export async function updateRegistrationStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const registration = await eventService.updateRegistrationStatus(req.params.id as string, req.gymId!, status);
    res.status(200).json({ success: true, data: registration, message: `Registration ${status}` });
  } catch (error) {
    next(error);
  }
}
