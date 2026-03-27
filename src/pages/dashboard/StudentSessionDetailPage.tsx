import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";
import { getAdvisorById, notifyAdvisorFinalSlot } from "@/lib/restApi";

const BOOKINGS_STORAGE_KEY = "collegeconnect_bookings_v1";

type SessionBooking = {
  id: string;
  advisorId: string;
  advisorName: string;
  studentName: string;
  studentEmail: string;
  sessionPrice: string;
  selectedSlot: string;
  oldSelectedSlot?: string;
  bookedAt: string;
  status?: "pending" | "accepted" | "rejected" | "changed" | "finalized";
};

export default function StudentSessionDetailPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ from: "/student/session/$bookingId" });
  const [booking, setBooking] = useState<SessionBooking | null>(null);
  const [advisorSlots, setAdvisorSlots] = useState<string[]>([]);
  const [finalSlot, setFinalSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SessionBooking[];
      const found = parsed.find((b) => b.id === bookingId) || null;
      setBooking(found);
      setFinalSlot(found?.selectedSlot || "");
    } catch {
      setBooking(null);
    }
  }, [bookingId]);

  useEffect(() => {
    let cancelled = false;
    const loadSlots = async () => {
      if (!booking?.advisorId) return;
      try {
        const detail = await getAdvisorById(booking.advisorId);
        const slots = Array.isArray(detail.preferred_timezones) ? detail.preferred_timezones : [];
        if (!cancelled) setAdvisorSlots(slots);
      } catch {
        if (!cancelled) setAdvisorSlots([]);
      }
    };
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [booking?.advisorId]);

  const patchBooking = (patch: Partial<SessionBooking>) => {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SessionBooking[];
      const next = parsed.map((b) => (b.id === bookingId ? { ...b, ...patch } : b));
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
      setBooking(next.find((b) => b.id === bookingId) || null);
    } catch {
      // ignore local parsing errors
    }
  };

  const handleFinalize = async () => {
    if (!booking) return;
    if (!finalSlot || !advisorSlots.includes(finalSlot)) {
      setMsg("Choose one of advisor preferred slots.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) {
        setMsg("Sign in required.");
        return;
      }
      await notifyAdvisorFinalSlot(token, {
        advisor_id: booking.advisorId,
        old_slot: booking.selectedSlot,
        new_slot: finalSlot,
      });
      patchBooking({
        oldSelectedSlot: booking.selectedSlot,
        selectedSlot: finalSlot,
        status: "finalized",
      });
      setMsg("Final slot saved and advisor notified.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not finalize slot.");
    } finally {
      setBusy(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">Session not found.</p>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/student/dashboard" })}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-teal mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Sessions
        </Link>

        <div className="glass rounded-2xl border border-border p-6 sm:p-8 space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{booking.advisorName}</h1>
          <p className="text-sm text-muted-foreground">Status: {booking.status || "pending"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Current preferred slot</p>
              <p className="text-sm font-medium text-foreground">{booking.selectedSlot || "—"}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Old preferred slot</p>
              <p className="text-sm font-medium text-foreground">{booking.oldSelectedSlot || "—"}</p>
            </div>
          </div>

          <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              Final preferred time slot (student final change)
            </p>
            <div className="flex gap-2">
              <select
                value={finalSlot}
                onChange={(e) => setFinalSlot(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
              >
                <option value="">Select preferred slot</option>
                {advisorSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={busy}
                onClick={handleFinalize}
                className="bg-neon-teal hover:bg-neon-teal/90 text-black"
              >
                <CheckCircle2 size={16} />
                Finalize
              </Button>
            </div>
          </div>

          {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
        </div>
      </div>
    </div>
  );
}

