import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, QrCode, Link as LinkIcon, Download, Users, CheckCircle2, Calendar, MapPin, Clock, Info, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, CreateEventInput } from '@/validation';

export default function EventsPage() {
  // Rebundle trigger comment
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Success', description: 'Event deleted successfully.' });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenQR = (event: any) => {
    setSelectedEvent(event);
    setIsQROpen(true);
  };

  const getEventStatus = (dateStr: string) => {
    try {
      const eventDate = new Date(dateStr);
      const today = new Date();
      
      // Reset hours to compare dates only
      eventDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      
      if (eventDate.getTime() === today.getTime()) {
        return 'live';
      } else if (eventDate.getTime() < today.getTime()) {
        return 'completed';
      }
      return 'upcoming';
    } catch {
      return 'upcoming';
    }
  };

  const eventUrl = selectedEvent ? `${window.location.origin}/e/${selectedEvent._id}` : '';

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-emerald-400 to-lime-300">Events</h1>
          <p className="text-slate-400 mt-1">Manage and track your gym events and workshops</p>
        </div>
        <Button onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Create Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : events?.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Calendar className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">No events found</p>
            <p className="text-sm text-slate-400 mb-6">Create your first public-facing event or workshop</p>
            <Button onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events?.map((event: any) => {
            const status = getEventStatus(event.date);
            const eventDate = new Date(event.date);
            const dayNum = format(eventDate, 'd');
            const monthStr = format(eventDate, 'MMM').toUpperCase();
            
            return (
              <Card key={event._id} className="overflow-hidden border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl hover:translate-x-1 duration-300">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                  {/* Left: Date badge in a gradient box */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600 text-slate-950 shadow-md">
                    <span className="text-3xl font-extrabold text-white leading-none">{dayNum}</span>
                    <span className="text-[10px] uppercase font-bold text-white/80 tracking-widest mt-1">{monthStr}</span>
                  </div>

                  {/* Middle: Event name, time, location */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-bold text-slate-100 truncate">{event.title}</h3>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-[9px] uppercase tracking-wider px-2 py-0.5",
                          status === 'live' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          status === 'completed' && "bg-slate-500/10 text-slate-400 border border-slate-500/20",
                          status === 'upcoming' && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}
                      >
                        {status}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-emerald-400" /> {event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> {event.location}</span>
                      <span className="font-semibold text-slate-300">
                        Entry: {event.entryFee > 0 ? `₹${event.entryFee}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5 w-full sm:w-auto">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => navigate(`/events/${event._id}/registrations`)}
                      className="gap-1.5 rounded-xl h-9 hover:bg-white/10"
                    >
                      <Users className="h-4 w-4" strokeWidth={1.5} /> Registrations
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleOpenQR(event)}
                      className="rounded-xl h-9 w-9"
                    >
                      <QrCode className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => { setSelectedEvent(event); setIsFormOpen(true); }}
                      className="rounded-xl h-9 w-9"
                    >
                      <Edit className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(event._id)} 
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EventFormDialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        event={selectedEvent} 
      />

      {/* QR Code Dialog */}
      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="sm:max-w-md flex flex-col items-center text-center bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Share Event</DialogTitle>
            <DialogDescription className="text-slate-400">Scan to register for {selectedEvent?.title}</DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 rounded-2xl my-4 shadow-xl border border-white/10">
            <QRCodeSVG value={eventUrl} size={180} />
          </div>
          <div className="flex items-center gap-2 w-full mt-2">
            <Input readOnly value={eventUrl} className="flex-1 text-xs select-all bg-slate-900/50" />
            <Button size="icon" variant="outline" className="rounded-xl shrink-0" onClick={() => {
              navigator.clipboard.writeText(eventUrl);
              toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
            }}>
              <LinkIcon className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function EventFormDialog({ open, onClose, event }: { open: boolean; onClose: () => void; event: any }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      maxAttendees: event.maxAttendees || undefined,
      entryFee: event.entryFee || 0,
      bankDetails: event.bankDetails || '',
      paymentDetailsQR: event.paymentDetailsQR || '',
      upiId: event.upiId || '',
      posterUrl: event.posterUrl || '',
    } : {
      date: new Date().toISOString().split('T')[0],
      entryFee: 0,
      upiId: '',
      posterUrl: '',
    },
  });

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        time: event.time,
        location: event.location,
        maxAttendees: event.maxAttendees || undefined,
        entryFee: event.entryFee || 0,
        bankDetails: event.bankDetails || '',
        paymentDetailsQR: event.paymentDetailsQR || '',
        upiId: event.upiId || '',
        posterUrl: event.posterUrl || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        maxAttendees: undefined,
        entryFee: 0,
        bankDetails: '',
        paymentDetailsQR: '',
        upiId: '',
        posterUrl: '',
      });
    }
  }, [event, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('paymentDetailsQR', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('posterUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => event ? api.put(`/events/${event._id}`, data) : api.post('/events', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Success', description: `Event ${event ? 'updated' : 'created'} successfully.` });
      onClose();
      reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">Fill in the event configuration details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">Title *</Label>
            <Input {...register('title')} placeholder="e.g. Arm Wrestling League" />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">Description *</Label>
            <Textarea {...register('description')} rows={3} placeholder="Provide details about the competition..." />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Date *</Label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Time *</Label>
              <Input type="time" {...register('time')} />
              {errors.time && <p className="text-xs text-red-400">{errors.time.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Location *</Label>
              <Input {...register('location')} placeholder="e.g. Gym Main Studio" />
              {errors.location && <p className="text-xs text-red-400">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Max Attendees</Label>
              <Input type="number" {...register('maxAttendees', { valueAsNumber: true })} placeholder="Unlimited" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Entry Fee (₹)</Label>
              <Input type="number" {...register('entryFee', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Payment QR Code</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {watch('paymentDetailsQR') && (
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                  <CheckCircle2 className="h-3 w-3" /> QR Uploaded
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">UPI ID (Optional)</Label>
              <Input {...register('upiId')} placeholder="e.g. name@upi" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Event Poster (Optional)</Label>
              <Input type="file" accept="image/*" onChange={handlePosterChange} />
              {watch('posterUrl') && (
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                  <CheckCircle2 className="h-3 w-3" /> Poster Uploaded
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">Bank Details / Instructions</Label>
            <Textarea {...register('bankDetails')} rows={2} placeholder="Account No: 1234567890\nIFSC: XYZ000123" />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-xl shimmer-btn">
              {mutation.isPending ? 'Saving...' : 'Save Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

