import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Users, Calendar, MapPin, Clock, Info, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EventRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gym } = useAuth();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['eventRegistrations', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}/registrations`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const isLoading = eventLoading || regsLoading;

  return (
    <div className="space-y-6 page-enter stagger-children">
      {/* Header with back button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/5 hover:bg-white/10 h-9 w-9 shrink-0" 
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {event?.gym ? (event.gym as any).name : gym?.name || 'Event Registrations'}
            </h1>
            <p className="text-sm text-slate-400">
              {event ? `Registrants for ${event.title}` : 'Loading event details...'}
            </p>
          </div>
        </div>
        {event && (
          <span className="text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
            Total Attendees: {registrations?.length || 0}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : !event ? (
        <Card className="border-white/5 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Info className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">Event not found</p>
            <p className="text-sm text-slate-400 mb-6">The event you are looking for does not exist or has been deleted.</p>
            <Link to="/events">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Event details summary */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-base font-bold text-slate-200">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-sm text-slate-300">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 mb-1">{event.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
                </div>
                <div className="space-y-2 border-t border-white/5 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-violet-400 shrink-0" strokeWidth={1.5} />
                    <span>{format(new Date(event.date), 'PPPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-400 shrink-0" strokeWidth={1.5} />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-violet-400 shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Entry Fee:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {event.entryFee > 0 ? `₹${event.entryFee}` : 'Free'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Registrations List */}
          <div className="lg:col-span-2 space-y-3">
            {registrations?.length === 0 ? (
              <Card className="border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <Users className="h-10 w-10 text-slate-500 mb-3 opacity-40" strokeWidth={1.5} />
                  <p className="text-base font-semibold text-slate-200">No registrations yet</p>
                  <p className="text-xs text-slate-400">Share the event QR code or link to collect registrations.</p>
                </CardContent>
              </Card>
            ) : (
              registrations?.map((reg: any) => (
                <Card key={reg._id} className="border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl">
                  <CardContent className="p-4 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-200">{reg.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-1">
                          <span>{reg.phone}</span>
                          <span>·</span>
                          <span>{reg.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-white/5 px-2.5 py-1 rounded-full font-medium shrink-0">
                        {format(new Date(reg.createdAt), 'PP p')}
                      </span>
                    </div>
                    {(reg.utr || reg.paymentScreenshot) && (
                      <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                        {reg.utr && (
                          <p className="text-xs text-slate-400">UTR: <span className="font-mono text-violet-400 font-semibold">{reg.utr}</span></p>
                        )}
                        {reg.paymentScreenshot && (
                          <a href={reg.paymentScreenshot} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 hover:underline">
                            View Screenshot
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
