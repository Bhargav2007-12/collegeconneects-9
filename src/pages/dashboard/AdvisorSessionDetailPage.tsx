import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyAdvisorProfile,
  notifyStudentSessionUpdate,
  type AdvisorProfileResponse,
} from "@/lib/restApi";
import { Button } from "@/components/ui/button";

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
  status?: "pending" | "accepted" | "rejected" | "changed";
};

export default function AdvisorSessionDetailPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ from: "/advisor/session/$bookingId" });
  const [booking, setBooking] = useState<SessionBooking | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [newSlot, setNewSlot] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Session details — CollegeConnect";
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      setBooking(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SessionBooking[];
      const found = Array.isArray(parsed)
        ? parsed.find((b) => b.id === bookingId) || null
        : null;
      setBooking(found);
      setNewSlot(found?.selectedSlot || "");
    } catch {
      setBooking(null);
    }
  }, [bookingId]);

  useEffect(() => {
    let cancelled = false;
    const loadAdvisor = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u) return;
      try {
        const token = await u.getIdToken(true);
        const profile = await getMyAdvisorProfile(token);
        if (!cancelled) setAdvisor(profile);
      } catch {
        if (!cancelled) setAdvisor(null);
      }
    };
    void loadAdvisor();
    return () => {
      cancelled = true;
    };
  }, []);

  const preferredSlots = useMemo(
    () => (advisor?.preferred_timezones && advisor.preferred_timezones.length > 0 ? advisor.preferred_timezones : []),
    [advisor],
  );

  const persistBookingPatch = (patch: Partial<SessionBooking>) => {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SessionBooking[];
      const next = parsed.map((b) => (b.id === bookingId ? { ...b, ...patch } : b));
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
      const updated = next.find((b) => b.id === bookingId) || null;
      setBooking(updated);
    } catch {
      // ignore bad local data
    }
  };

  const handleAccept = () => {
    persistBookingPatch({ status: "accepted" });
    setStatusMsg("Session accepted.");
  };

  const handleReject = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) {
        setStatusMsg("Sign in required.");
        return;
      }
      await notifyStudentSessionUpdate(token, {
        action: "reject",
        student_email: booking.studentEmail,
        student_name: booking.studentName,
        old_slot: booking.selectedSlot,
      });
      persistBookingPatch({ status: "rejected" });
      setStatusMsg("Rejected and email sent to student.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Could not reject session.");
    } finally {
      setBusy(false);
    }
  };

  const handleChangeSlot = async () => {
    if (!booking) return;
    if (!newSlot || !preferredSlots.includes(newSlot)) {
      setStatusMsg("Choose one of your preferred time slots.");
      return;
    }
    setBusy(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) {
        setStatusMsg("Sign in required.");
        return;
      }
      await notifyStudentSessionUpdate(token, {
        action: "change",
        student_email: booking.studentEmail,
        student_name: booking.studentName,
        old_slot: booking.selectedSlot,
        new_slot: newSlot,
      });
      persistBookingPatch({
        status: "changed",
        oldSelectedSlot: booking.selectedSlot,
        selectedSlot: newSlot,
      });
      setStatusMsg("Preferred time changed and email sent to student.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Could not change preferred time.");
    } finally {
      setBusy(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">Session not found.</p>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/advisor/dashboard" })}>
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
          to="/advisor/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-orange mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Sessions
        </Link>

        <div className="glass rounded-2xl border border-border p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{booking.studentName}</h1>
            <p className="text-sm text-muted-foreground">{booking.studentEmail}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {booking.status === "changed" && booking.oldSelectedSlot ? (
              <>
                <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Old preferred slot</p>
                  <p className="text-sm font-medium text-foreground">{booking.oldSelectedSlot}</p>
                </div>
                <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">New preferred slot</p>
                  <p className="text-sm font-medium text-neon-orange">{booking.selectedSlot || "—"}</p>
                </div>
              </>
            ) : (
              <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Student selected slot</p>
                <p className="text-sm font-medium text-foreground">{booking.selectedSlot || "—"}</p>
              </div>
            )}
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-medium text-foreground">{booking.status || "pending"}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Session price</p>
              <p className="text-sm font-medium text-foreground">
                {booking.sessionPrice ? `₹${booking.sessionPrice}` : "—"}
              </p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Booked at</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(booking.bookedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={busy}
              className="bg-neon-teal hover:bg-neon-teal/90 text-black"
            >
              <CheckCircle2 size={16} />
              Accept
            </Button>
            <Button
              type="button"
              onClick={handleReject}
              disabled={busy}
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <XCircle size={16} />
              Reject
            </Button>
            <div className="flex gap-2 sm:col-span-1">
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
              >
                <option value="">Select preferred slot</option>
                {preferredSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleChangeSlot}
                disabled={busy}
                className="bg-neon-orange hover:bg-neon-orange/90 text-black"
              >
                <Clock3 size={16} />
                OK
              </Button>
            </div>
          </div>

          {statusMsg ? <p className="text-sm text-muted-foreground">{statusMsg}</p> : null}
        </div>
      </div>
    </div>
  );
}

