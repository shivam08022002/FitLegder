import Event from '../../models/Event';
import EventRegistration from '../../models/EventRegistration';
import { AppError } from '../../middleware/errorHandler';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';
import { sendEmail } from '../../utils/email';

// Configure Cloudinary if credentials exist
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

async function uploadToCloudinary(dataUrl: string, folder: string): Promise<string> {
  if (dataUrl && dataUrl.startsWith('data:')) {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      const res = await cloudinary.uploader.upload(dataUrl, { folder });
      return res.secure_url;
    }
  }
  return dataUrl;
}

export async function getEvents(gymId: string) {
  return Event.find({ gym: gymId }).sort({ date: 1, time: 1 });
}

export async function getEventById(eventId: string) {
  const event = await Event.findById(eventId).populate('gym', 'name address logo contactNumber email');
  if (!event) throw new AppError('Event not found', 404);
  return event;
}

export async function getEventRegistrations(eventId: string, gymId: string) {
  const event = await Event.findOne({ _id: eventId, gym: gymId });
  if (!event) throw new AppError('Event not found', 404);
  return EventRegistration.find({ event: eventId, status: 'approved' }).sort({ createdAt: -1 });
}

export async function createEvent(gymId: string, data: any) {
  if (data.paymentDetailsQR) {
    data.paymentDetailsQR = await uploadToCloudinary(data.paymentDetailsQR, 'fitledger_qrs');
  }
  if (data.posterUrl) {
    data.posterUrl = await uploadToCloudinary(data.posterUrl, 'fitledger_posters');
  }
  const event = new Event({ ...data, gym: gymId });
  await event.save();
  return event;
}

export async function updateEvent(eventId: string, gymId: string, data: any) {
  if (data.paymentDetailsQR) {
    data.paymentDetailsQR = await uploadToCloudinary(data.paymentDetailsQR, 'fitledger_qrs');
  }
  if (data.posterUrl) {
    data.posterUrl = await uploadToCloudinary(data.posterUrl, 'fitledger_posters');
  }
  const event = await Event.findOneAndUpdate(
    { _id: eventId, gym: gymId },
    data,
    { new: true, runValidators: true }
  );
  if (!event) throw new AppError('Event not found', 404);
  return event;
}

export async function deleteEvent(eventId: string, gymId: string) {
  const event = await Event.findOneAndDelete({ _id: eventId, gym: gymId });
  if (!event) throw new AppError('Event not found', 404);
  await EventRegistration.deleteMany({ event: eventId });
  return event;
}

export async function updateEventPoster(eventId: string, gymId: string, posterUrl: string) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, gym: gymId },
    { posterUrl },
    { new: true }
  );
  if (!event) throw new AppError('Event not found', 404);
  return event;
}

export async function registerForEvent(eventId: string, data: any) {
  const event = await Event.findById(eventId).populate('gym');
  if (!event) throw new AppError('Event not found', 404);
  
  // Optional: Check maxAttendees
  if (event.maxAttendees) {
    const count = await EventRegistration.countDocuments({ event: eventId });
    if (count >= event.maxAttendees) {
      throw new AppError('Event is full', 400);
    }
  }

  if (data.paymentScreenshot) {
    data.paymentScreenshot = await uploadToCloudinary(data.paymentScreenshot, 'fitledger_screenshots');
  }

  const status = event.entryFee && event.entryFee > 0 ? 'pending' : 'approved';

  const registration = new EventRegistration({
    event: eventId,
    status,
    ...data,
  });
  await registration.save();

  // Send email to registrant
  const gymName = (event.gym as any)?.name || 'Paradise Gym';
  if (registration.email) {
    if (status === 'approved') {
      await sendEmail({
        to: registration.email,
        subject: `Registration Confirmed - ${event.title}`,
        text: `Hi ${registration.name},\n\nYou have registered successfully for ${event.title} at ${gymName}.\n\nEvent details:\nDate: ${new Date(event.date).toLocaleDateString()}\nTime: ${event.time}\nLocation: ${event.location}\n\nSee you there!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #6366f1;">Registration Confirmed! 🎉</h2>
            <p>Hi <strong>${registration.name}</strong>,</p>
            <p>You have successfully registered for <strong>${event.title}</strong> at <strong>${gymName}</strong>.</p>
            <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px; border: 1px solid #eee;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${event.time}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${event.location}</p>
              ${event.entryFee ? `<p style="margin: 4px 0;"><strong>Entry Fee:</strong> ₹${event.entryFee}</p>` : ''}
            </div>
            <p>If you have any questions, please contact us at ${(event.gym as any)?.email || 'the gym reception'}.</p>
            <p style="margin-top: 20px; color: #666;">Best regards,<br>${gymName} Team</p>
          </div>
        `,
      });
    } else {
      await sendEmail({
        to: registration.email,
        subject: `Registration Pending - ${event.title}`,
        text: `Hi ${registration.name},\n\nWe have received your registration for ${event.title} at ${gymName}. Since this is a paid event, our team is verifying your payment details. You will receive a confirmation email once approved.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #6366f1;">Registration Pending ⏳</h2>
            <p>Hi <strong>${registration.name}</strong>,</p>
            <p>We have received your registration for <strong>${event.title}</strong> at <strong>${gymName}</strong>.</p>
            <p>Since this is a paid event, our team is currently verifying your payment (UTR: <strong>${registration.utr}</strong>). We will send you a confirmation email once the verification is complete.</p>
            <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px; border: 1px solid #eee;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${event.time}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${event.location}</p>
              <p style="margin: 4px 0;"><strong>Entry Fee:</strong> ₹${event.entryFee}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">Best regards,<br>${gymName} Team</p>
          </div>
        `,
      });
    }
  }

  return registration;
}

export async function getPendingRegistrations(gymId: string) {
  const events = await Event.find({ gym: gymId }).select('_id');
  const eventIds = events.map(e => e._id);
  return EventRegistration.find({ event: { $in: eventIds }, status: 'pending' })
    .populate('event', 'title')
    .sort({ createdAt: -1 });
}

export async function updateRegistrationStatus(registrationId: string, gymId: string, status: 'approved' | 'rejected') {
  const registration = await EventRegistration.findById(registrationId).populate('event');
  if (!registration) throw new AppError('Registration not found', 404);
  
  const event = registration.event as any;
  if (event.gym.toString() !== gymId) {
    throw new AppError('Unauthorized access to registration', 403);
  }
  
  registration.status = status;
  await registration.save();

  const gymName = event.gymName || 'Paradise Gym';
  
  if (registration.email) {
    if (status === 'approved') {
      await sendEmail({
        to: registration.email,
        subject: `Registration Approved - ${event.title}`,
        text: `Hi ${registration.name},\n\nYour payment has been verified! You are now successfully registered for ${event.title} at ${gymName}.\n\nEvent details:\nDate: ${new Date(event.date).toLocaleDateString()}\nTime: ${event.time}\nLocation: ${event.location}\n\nSee you there!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #10b981;">Registration Approved! 🎉</h2>
            <p>Hi <strong>${registration.name}</strong>,</p>
            <p>Your payment has been successfully verified! You are now registered for <strong>${event.title}</strong>.</p>
            <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px; border: 1px solid #eee;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${event.time}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${event.location}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">Best regards,<br>${gymName} Team</p>
          </div>
        `,
      });
    } else if (status === 'rejected') {
      await sendEmail({
        to: registration.email,
        subject: `Registration Declined - ${event.title}`,
        text: `Hi ${registration.name},\n\nWe could not verify your payment details for ${event.title}. Please re-register with correct payment details or contact the gym reception.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #ef4444;">Registration Declined ❌</h2>
            <p>Hi <strong>${registration.name}</strong>,</p>
            <p>We were unable to verify the payment details provided for your registration to <strong>${event.title}</strong>.</p>
            <p>Please double-check your transaction UTR / receipt screenshot and try registering again, or reach out to the gym staff for help.</p>
            <p style="margin-top: 20px; color: #666;">Best regards,<br>${gymName} Team</p>
          </div>
        `,
      });
    }
  }

  return registration;
}
