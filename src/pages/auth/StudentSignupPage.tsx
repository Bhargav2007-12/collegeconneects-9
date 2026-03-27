import { LanguageMultiSelect } from "@/components/signup/LanguageMultiSelect";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { OTHER_LANGUAGE_LABEL } from "@/constants/signupLanguages";
import { getFirebaseAuth } from "@/lib/firebase";
import { afterVerificationEmailSent } from "@/lib/authMessages";
import {
  formatFirebaseAuthError,
  isFirebaseAuthCode,
} from "@/lib/firebaseAuthErrors";
import { useEmailVerificationSync } from "@/hooks/useEmailVerificationSync";
import { finalizeFirebaseSignup } from "@/lib/firebaseSignupFinalize";
import { studentPostAuthPath } from "@/lib/studentPostAuthGate";
import { registerStudent } from "@/lib/restApi";
import { FirebaseError } from "firebase/app";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { CheckCircle, Loader, Mail, UserPlus } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { AuthShell } from "./AuthShell";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [academicStatus, setAcademicStatus] = useState("");
  const [jeeMainsPercentile, setJeeMainsPercentile] = useState("");
  const [jeeMainsRank, setJeeMainsRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageOther, setLanguageOther] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [refreshingEmail, setRefreshingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Student Sign Up — CollegeConnect";
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, setAuthUser);
  }, []);

  useEmailVerificationSync(authUser, setAuthUser, bump);

  const isValidEmail = (e: string) => e.includes("@") && e.includes(".");

  const handleAuthenticate = async () => {
    if (!email || !isValidEmail(email)) {
      alert("Enter a valid email.");
      return;
    }
    if (!password || password !== confirmPassword) {
      alert("Passwords must match.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    const auth = getFirebaseAuth();
    setAuthenticating(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      try {
        await sendEmailVerification(cred.user);
        alert(afterVerificationEmailSent(email.trim()));
      } catch (verifyErr) {
        alert(
          `Your account was created, but the verification email could not be sent:\n\n${formatFirebaseAuthError(verifyErr)}`,
        );
      }
    } catch (e) {
      if (isFirebaseAuthCode(e, "auth/email-already-in-use")) {
        try {
          const cred = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password,
          );
          try {
            if (!cred.user.emailVerified) {
              await sendEmailVerification(cred.user);
              alert(afterVerificationEmailSent(email.trim()));
            } else {
              alert(
                "This email is already verified. Use Sign in below to open your account.",
              );
            }
          } catch (verifyErr) {
            alert(
              `Could not send verification email:\n\n${formatFirebaseAuthError(verifyErr)}`,
            );
          }
        } catch (signInErr) {
          alert(formatFirebaseAuthError(signInErr));
        }
      } else {
        alert(formatFirebaseAuthError(e));
      }
    } finally {
      setAuthenticating(false);
    }
  };

  const handleResendEmail = async () => {
    if (!authUser) return;
    try {
      await sendEmailVerification(authUser);
      alert(afterVerificationEmailSent(authUser.email ?? ""));
    } catch (e) {
      alert(formatFirebaseAuthError(e));
    }
  };

  const handleRefreshEmail = async () => {
    if (!authUser) return;
    setRefreshingEmail(true);
    try {
      await reload(authUser);
      bump();
    } finally {
      setRefreshingEmail(false);
    }
  };

  const handleSignOutFirebase = async () => {
    await signOut(getFirebaseAuth());
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignup = async () => {
    if (
      !name ||
      !email ||
      !phone ||
      !gender ||
      !state ||
      !academicStatus ||
      !jeeMainsPercentile ||
      !jeeMainsRank
    ) {
      alert("Please fill all required fields!");
      return;
    }
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) {
      alert("Tap Authenticate first (enter email and password above).");
      return;
    }
    await reload(u);
    if (!u.emailVerified) {
      alert(
        "Open the link in the verification email, then tap Refresh email status.",
      );
      return;
    }
    if (!password || password !== confirmPassword) {
      alert(
        "Re-enter your password (and confirmation) to verify with Firebase before saving your profile.",
      );
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (languages.includes(OTHER_LANGUAGE_LABEL) && !languageOther.trim()) {
      alert('Please specify your language(s) when "Other" is selected.');
      return;
    }

    const payload: Record<string, unknown> = {
      name,
      email: email.trim(),
      phone,
      gender,
      state,
      academicStatus,
      jeeMainsPercentile,
      jeeMainsRank,
      languages,
    };
    const adv = jeeAdvancedRank.trim();
    if (adv) payload.jeeAdvancedRank = adv;
    const lo = languageOther.trim();
    if (lo) payload.languageOther = lo;

    setSubmitting(true);
    try {
      await finalizeFirebaseSignup(email.trim(), password, name);
      const after = getFirebaseAuth().currentUser;
      if (!after) {
        alert("Signed out unexpectedly. Sign in again and try once more.");
        return;
      }
      const token = await after.getIdToken(true);
      const saved = await registerStudent(token, payload);
      const afterSignup = studentPostAuthPath();
      if (afterSignup === "/student/dashboard") {
        navigate({
          to: "/student/dashboard",
          state: { profileSavedId: saved.id } as Record<string, unknown>,
        });
      } else {
        navigate({ to: afterSignup });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        alert(formatFirebaseAuthError(e));
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(
          "Could not save your profile. Is the API running (pnpm api on port 8001)?",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const emailOk = !!authUser?.emailVerified;
  const passwordLockedUntilVerified = !!authUser && !emailOk;

  return (
    <AuthShell
      title="Student Sign Up"
      subtitle="Create your student account to book sessions with advisors."
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 px-3 py-2">
          Sign-in uses{" "}
          <strong className="text-foreground">Firebase Authentication</strong>:
          your password and <strong className="text-foreground">email verification</strong>{" "}
          are handled by Google.
        </p>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-name"
            className="text-sm text-muted-foreground"
          >
            Full Name <span className="text-neon-teal">•</span>
          </label>
          <input
            id="student-signup-name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        {/* Email + password (Authenticate → Firebase) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-email"
            className="text-sm text-muted-foreground"
          >
            Email <span className="text-neon-teal">•</span>
          </label>
          <input
            id="student-signup-email"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!authUser}
            className={`bg-background border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none transition-colors ${
              authUser
                ? "border-green-500/60 cursor-not-allowed opacity-80"
                : "border-border focus:border-neon-teal"
            }`}
          />
        </div>

        <PasswordField
          id="student-signup-password"
          label={
            <>
              Password (Firebase) <span className="text-neon-teal">•</span>
            </>
          }
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={setPassword}
          disabled={passwordLockedUntilVerified}
          variant="teal"
        />

        <PasswordField
          id="student-signup-password-confirm"
          label={
            <>
              Confirm password <span className="text-neon-teal">•</span>
            </>
          }
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={passwordLockedUntilVerified}
          variant="teal"
        />

        {authUser && emailOk ? (
          <p className="text-xs text-muted-foreground rounded-lg border border-border/60 px-3 py-2">
            After email verification, re-enter your password. On{" "}
            <strong className="text-foreground">Create account</strong>, we
            verify it with Firebase, set your display name, then save your
            profile to our database.
          </p>
        ) : null}

        {!authUser ? (
          <Button
            type="button"
            onClick={handleAuthenticate}
            disabled={authenticating || !isValidEmail(email)}
            className="w-full bg-neon-teal/90 hover:bg-neon-teal text-background font-semibold rounded-xl"
          >
            {authenticating ? (
              <Loader size={16} className="mr-2 animate-spin" />
            ) : (
              <Mail size={16} className="mr-2" />
            )}
            {authenticating ? "Authenticating…" : "Authenticate"}
          </Button>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Email verification</span>
              {emailOk ? (
                <span className="inline-flex items-center gap-1 text-green-500">
                  <CheckCircle size={16} /> Verified
                </span>
              ) : (
                <span className="text-amber-500/90">
                  Pending — check your inbox
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResendEmail}
                className="text-xs underline text-neon-teal"
              >
                Resend verification email
              </button>
              <button
                type="button"
                onClick={handleRefreshEmail}
                disabled={refreshingEmail}
                className="text-xs underline text-neon-teal disabled:opacity-50"
              >
                {refreshingEmail ? "Refreshing…" : "Refresh email status"}
              </button>
              <button
                type="button"
                onClick={handleSignOutFirebase}
                className="text-xs underline text-muted-foreground"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-mobile"
            className="text-sm text-muted-foreground"
          >
            Mobile number <span className="text-neon-teal">•</span>
          </label>
          <input
            id="student-signup-mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-gender"
            className="text-sm text-muted-foreground"
          >
            Gender <span className="text-neon-teal">•</span>
          </label>
          <select
            id="student-signup-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-state"
            className="text-sm text-muted-foreground"
          >
            State <span className="text-neon-teal">•</span>
          </label>
          <select
            id="student-signup-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
          >
            <option value="">Select your state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Status */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-academic"
            className="text-sm text-muted-foreground"
          >
            Academic Status <span className="text-neon-teal">•</span>
          </label>
          <select
            id="student-signup-academic"
            value={academicStatus}
            onChange={(e) => setAcademicStatus(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
          >
            <option value="">Select status</option>
            <option value="12th">Currently in 12th</option>
            <option value="drop1">1st Drop</option>
            <option value="drop2">2nd Drop</option>
          </select>
        </div>

        {/* JEE Mains */}
        <div className="flex flex-col gap-2">
          <p
            className="text-sm text-muted-foreground"
            id="student-signup-jee-mains-label"
          >
            JEE Mains <span className="text-neon-teal">•</span>
          </p>
          <div
            className="flex gap-2"
            aria-labelledby="student-signup-jee-mains-label"
          >
            <input
              type="number"
              placeholder="Percentile (e.g. 98.5)"
              value={jeeMainsPercentile}
              onChange={(e) => setJeeMainsPercentile(e.target.value)}
              aria-label="JEE Mains percentile"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
            />
            <input
              type="number"
              placeholder="Rank"
              value={jeeMainsRank}
              onChange={(e) => setJeeMainsRank(e.target.value)}
              aria-label="JEE Mains rank"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-jee-adv"
            className="text-sm text-muted-foreground"
          >
            JEE Advanced Rank <span className="text-xs">(optional)</span>
          </label>
          <input
            id="student-signup-jee-adv"
            type="number"
            placeholder="Optional — e.g. rank, or leave blank"
            value={jeeAdvancedRank}
            onChange={(e) => setJeeAdvancedRank(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
          <p className="text-xs text-muted-foreground">
            Not attempted or no rank yet? Leave empty — you can still create
            your account.
          </p>
        </div>

        <LanguageMultiSelect
          variant="teal"
          label="Languages I speak"
          optionalHint="(optional)"
          value={languages}
          onChange={setLanguages}
          otherDetail={languageOther}
          onOtherDetailChange={setLanguageOther}
        />

        <div className="mt-2">
          <Button
            onClick={handleSignup}
            disabled={!authUser || !emailOk || submitting}
            className="w-full bg-neon-teal hover:bg-neon-teal/90 text-background font-semibold rounded-xl px-5 glow-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader size={16} className="mr-2 animate-spin" />
            ) : (
              <UserPlus size={16} className="mr-2" />
            )}
            {submitting ? "Creating account…" : "Create account"}
          </Button>
          {authUser && !emailOk ? (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Verify your email (link in inbox), then tap Refresh email status.
            </p>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            to="/auth/student/login"
            className="text-neon-teal hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
