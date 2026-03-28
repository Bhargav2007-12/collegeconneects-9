/**
 * CollegeConnect FastAPI (MongoDB). Use Vite proxy for /api/students and /api/advisors in dev,
 * or set VITE_REST_API_URL=http://localhost:8000
 */

export function restApiBase(): string {
  const v = import.meta.env.VITE_REST_API_URL;
  if (typeof v === "string" && v.trim()) {
    return v.replace(/\/$/, "");
  }
  return "";
}

function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = restApiBase();
  return base ? `${base}${p}` : p;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    const endpoint = (() => {
      try {
        return new URL(res.url).pathname || res.url;
      } catch {
        return res.url || "unknown endpoint";
      }
    })();
    throw new Error(
      `API returned non-JSON response for ${endpoint}. Configure VITE_REST_API_URL to your backend URL.`,
    );
  }
  return (await res.json()) as T;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    const d = data.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      return d
        .map((x) =>
          typeof x === "object" && x && "msg" in x
            ? String((x as { msg: string }).msg)
            : String(x),
        )
        .join("; ");
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`;
}

/** Response from POST /api/students or /api/advisors after MongoDB insert. */
export type RegisteredProfileResponse = {
  id: string;
  name: string;
  created_at: string;
  email?: string;
  college_email?: string;
};

export type AdvisorProfileResponse = {
  id: string;
  name: string;
  college_email: string;
  detected_college: string;
  branch: string;
  phone?: string;
  state?: string;
  bio: string;
  skills: string;
  achievements?: string;
  languages: string[];
  preferred_timezones?: string[];
  session_price: string;
  total_earnings?: number;
  total_sessions?: number;
  total_students?: number;
};

export type StudentProfileResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  academic_status: string;
  jee_mains_percentile: string;
  jee_mains_rank: string;
  jee_advanced_rank?: string;
  languages?: string[];
  language_other?: string;
};

export type AdvisorDirectoryItem = {
  id: string;
  name: string;
  college: string;
  branch: string;
  session_price: string;
  skills: string;
  bio: string;
  languages: string[];
  preferred_timezones?: string[];
};

/** Public advisor profile from GET /api/advisors/id/{id} (Mongo fields, snake_case after normalize). */
export type AdvisorPublicDetail = {
  id: string;
  name?: string;
  gender?: string;
  detected_college?: string;
  branch?: string;
  state?: string;
  bio?: string;
  skills?: string;
  achievements?: string;
  languages?: string[];
  language_other?: string;
  session_price?: string;
  preferred_timezones?: string[];
  jee_mains_percentile?: string;
  jee_mains_rank?: string;
  jee_advanced_rank?: string;
};

export type PasswordResetRole = "student" | "advisor";

export async function requestPasswordResetOtp(
  role: PasswordResetRole,
  email: string,
): Promise<{ ok: boolean; expires_in_seconds: number }> {
  const res = await fetch(url("/api/auth/password-reset/request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean; expires_in_seconds: number }>(res);
}

export async function confirmPasswordResetOtp(
  role: PasswordResetRole,
  email: string,
  otp: string,
  newPassword: string,
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/auth/password-reset/confirm"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email, otp, new_password: newPassword }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export type BookingResponse = {
  id: string;
  advisor_id: string;
  student_id: string;
  advisor_name: string;
  student_name: string;
  student_email: string;
  scheduled_time: string;
  end_time: string;
  selected_slot: string;
  session_price: string;
  status: "pending" | "confirmed" | "cancelled" | "finalized";
  google_event_id?: string;
  meet_link?: string;
  student_joined: boolean;
  advisor_joined: boolean;
  created_at: string;
  updated_at: string;
};

export async function registerStudent(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<RegisteredProfileResponse> {
  const res = await fetch(url("/api/students"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<RegisteredProfileResponse>(res);
}

export async function registerAdvisor(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<RegisteredProfileResponse> {
  const res = await fetch(url("/api/advisors"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<RegisteredProfileResponse>(res);
}

export async function getMyAdvisorProfile(
  firebaseIdToken: string,
): Promise<AdvisorProfileResponse> {
  const res = await fetch(url("/api/advisors/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorProfileResponse>(res);
}

export async function updateMyAdvisorProfile(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<AdvisorProfileResponse> {
  const res = await fetch(url("/api/advisors/me"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorProfileResponse>(res);
}

export async function getMyStudentProfile(
  firebaseIdToken: string,
): Promise<StudentProfileResponse> {
  const res = await fetch(url("/api/students/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<StudentProfileResponse>(res);
}

export async function updateMyStudentProfile(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<StudentProfileResponse> {
  const res = await fetch(url("/api/students/me"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<StudentProfileResponse>(res);
}

export async function getAdvisorsDirectory(): Promise<AdvisorDirectoryItem[]> {
  const res = await fetch(url("/api/advisors/list"), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorDirectoryItem[]>(res);
}

export async function getAdvisorById(
  advisorId: string,
): Promise<AdvisorPublicDetail> {
  const res = await fetch(url(`/api/advisors/id/${encodeURIComponent(advisorId)}`), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorPublicDetail>(res);
}

export async function bookAdvisorSession(
  firebaseIdToken: string,
  advisorId: string,
  selectedSlot: string,
): Promise<{
  ok: boolean;
  advisor_email?: string;
  selected_slot?: string;
  email_sent?: boolean;
  email_error?: string;
}> {
  const res = await fetch(url("/api/advisors/book"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify({ advisor_id: advisorId, selected_slot: selectedSlot }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<{
    ok: boolean;
    advisor_email?: string;
    selected_slot?: string;
    email_sent?: boolean;
    email_error?: string;
  }>(res);
}

export async function notifyStudentSessionUpdate(
  firebaseIdToken: string,
  payload: {
    action: "reject" | "change";
    student_email: string;
    student_name: string;
    old_slot: string;
    new_slot?: string;
  },
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/advisors/sessions/notify-student"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export async function notifyAdvisorFinalSlot(
  firebaseIdToken: string,
  payload: {
    advisor_id: string;
    old_slot: string;
    new_slot: string;
  },
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/students/sessions/notify-advisor-final-slot"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export async function createBooking(
  firebaseIdToken: string,
  payload: {
    advisor_id: string;
    student_id: string;
    advisor_name: string;
    student_name: string;
    student_email: string;
    scheduled_time: string;
    end_time: string;
    selected_slot: string;
    session_price: string;
  },
): Promise<BookingResponse> {
  const res = await fetch(url("/api/bookings"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<BookingResponse>(res);
}

export async function getMyBookings(firebaseIdToken: string): Promise<BookingResponse[]> {
  const res = await fetch(url("/api/bookings/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<BookingResponse[]>(res);
}

export async function getBookingById(
  firebaseIdToken: string,
  bookingId: string,
): Promise<BookingResponse> {
  const res = await fetch(url(`/api/bookings/${bookingId}`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<BookingResponse>(res);
}

export async function joinBookingAction(
  firebaseIdToken: string,
  bookingId: string,
): Promise<{ message: string }> {
  const res = await fetch(url(`/api/bookings/${bookingId}/join`), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ message: string }>(res);
}

export async function reportNoShowAction(
  firebaseIdToken: string,
  bookingId: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(url(`/api/bookings/${bookingId}/report-noshow`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean; message?: string }>(res);
}
