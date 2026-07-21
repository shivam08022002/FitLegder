import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Clock, CheckCircle2, User, Mail, Phone, Hash, Upload, ShieldCheck, Copy, Check } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventRegistrationSchema, EventRegistrationInput } from '@/validation';

export default function PublicEventPage() {
  const { id } = useParams();
  const [isRegistered, setIsRegistered] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ['publicEvent', id],
    queryFn: async () => {
      const res = await api.get(`/events/public/${id}`);
      return res.data.data;
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EventRegistrationInput>({
    resolver: zodResolver(eventRegistrationSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('paymentScreenshot', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({ title: 'Copied!', description: `${fieldName} copied to clipboard.` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const mutation = useMutation({
    mutationFn: (data: EventRegistrationInput) => api.post(`/events/public/${id}/register`, data),
    onSuccess: () => {
      setIsRegistered(true);
      toast({ title: 'Success', description: 'You have been registered for this event!' });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] text-white">Loading...</div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center text-xl bg-[#0B0E14] text-white">Event not found</div>;
  }

  const screenshot = watch('paymentScreenshot');

  return (
    <div className="min-h-screen bg-[#0B0E14] text-foreground py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10 stagger-children">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          {event.gym?.logo ? (
            <img src={event.gym.logo} alt={event.gym.name} className="h-16 w-16 rounded-2xl object-cover border-2 border-violet-500/20 shadow-md" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <CalendarDays className="h-8 w-8 text-violet-400" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{event.gym?.name || 'Paradise Gym'} presents</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mt-2">{event.title}</h1>
            <p className="text-slate-400 text-base md:text-lg mt-3 font-medium">Test your strength. Claim the title.</p>
          </div>
        </div>

        {event.posterUrl && (
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 max-h-[360px] shadow-2xl relative bg-slate-950/40">
            <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover max-h-[360px]" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Event Details & Payment */}
          <div className="space-y-6">
            <Card className="border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl">
              <CardContent className="p-6 space-y-6">
                <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">{format(new Date(event.date), 'PPPP')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">{event.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(event.entryFee > 0 || event.paymentDetailsQR || event.bankDetails) && (
              <Card className="border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-200">Payment Details</h3>
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5 space-y-4">
                    <p className="text-base font-semibold text-slate-300">
                      Entry Fee:{' '}
                      <span className="text-xl font-extrabold gradient-text bg-gradient-to-r from-emerald-400 to-teal-400 ml-1">
                        ₹{event.entryFee}
                      </span>
                    </p>
                    
                    {event.paymentDetailsQR && (
                      <div className="flex flex-col items-center sm:items-start">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Scan to Pay:</p>
                        <div className="bg-white p-3 rounded-xl shadow-md border border-white/10 w-fit mb-3">
                          <img src={event.paymentDetailsQR} alt="Payment QR" className="max-w-[160px] rounded-lg" />
                        </div>
                      </div>
                    )}

                    {event.upiId && (
                      <div className="flex flex-col items-center sm:items-start mt-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pay via UPI ID:</p>
                        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-white/5 w-full sm:w-auto">
                          <span className="font-mono text-sm text-slate-200 select-all truncate">{event.upiId}</span>
                          <Button 
                            variant="secondary"
                            size="sm"
                            type="button"
                            className="h-7 w-7 rounded-lg p-0 bg-white/5 hover:bg-white/10 border border-white/5 shrink-0"
                            onClick={() => handleCopy(event.upiId, 'UPI ID')}
                          >
                            {copiedField === 'UPI ID' ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {event.bankDetails && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bank Transfer Details / Instructions:</p>
                        <div className="relative">
                          <pre className="text-xs whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed text-slate-300">
                            {event.bankDetails}
                          </pre>
                          <Button 
                            variant="secondary"
                            size="sm"
                            type="button"
                            className="absolute top-2 right-2 h-7 w-7 rounded-lg p-0 bg-white/5 hover:bg-white/10 border border-white/5"
                            onClick={() => handleCopy(event.bankDetails, 'Bank details')}
                          >
                            {copiedField === 'Bank details' ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Registration Form / Success */}
          <div>
            <Card className="border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl p-1 shadow-2xl">
              <CardContent className="p-6 md:p-8">
                {isRegistered ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100">You're in! 🎉</h3>
                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                      Your registration has been confirmed. You can now download/print your receipt.
                    </p>
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 w-full text-sm text-left text-slate-300 space-y-3 mt-4">
                      <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                        <span className="text-slate-500 font-medium">Event</span>
                        <span className="font-semibold text-slate-200 text-right">{event.title}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                        <span className="text-slate-500 font-medium">Date</span>
                        <span className="font-semibold text-slate-200 text-right">{format(new Date(event.date), 'PPPP')}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                        <span className="text-slate-500 font-medium">Location</span>
                        <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">{event.location}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="font-bold text-emerald-400">Confirmed</span>
                      </div>
                    </div>
                    <Button onClick={() => window.print()} className="w-full mt-4 rounded-xl shadow-lg shadow-violet-500/10">
                      Print Confirmation
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                      Register Now
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                        <Input {...register('name')} placeholder="John Doe" className="pl-10" />
                      </div>
                      {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">Email Address (Optional)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                        <Input type="email" {...register('email')} placeholder="john@example.com" className="pl-10" />
                      </div>
                      {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                        <Input type="tel" {...register('phone')} placeholder="+91 99999 99999" className="pl-10" />
                      </div>
                      {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
                    </div>

                    {event.entryFee > 0 && (
                      <div className="border-t border-white/5 pt-4 mt-4 space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Payment Verification</h4>
                        
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-slate-400">Transaction UTR / Reference No. *</Label>
                          <div className="relative">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                            <Input {...register('utr')} placeholder="e.g. 123456789012" className="pl-10" required />
                          </div>
                          {errors.utr && <p className="text-xs text-red-400">{errors.utr.message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-slate-400">Payment Screenshot (Optional)</Label>
                          <div className="relative border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-xl p-6 transition-all group flex flex-col items-center justify-center text-center cursor-pointer bg-slate-800/10">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange} 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload className="h-6 w-6 text-slate-500 mb-2 group-hover:text-violet-400 transition-colors" />
                            {screenshot ? (
                              <p className="text-xs text-emerald-400 font-semibold">Screenshot Attached</p>
                            ) : (
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium text-slate-300">Click or drag image to upload</p>
                                <p className="text-[10px] text-slate-500">PNG, JPG or JPEG up to 5MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full mt-6 h-12 rounded-xl text-base font-semibold shadow-lg shadow-violet-500/20" size="lg" disabled={mutation.isPending}>
                      {mutation.isPending ? 'Registering...' : 'Confirm Registration'}
                    </Button>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 justify-center pt-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Secured and encrypted transaction verification</span>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
}
