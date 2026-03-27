import { FirebaseError } from "firebase/app";

export function isFirebaseAuthCode(error: unknown, code: string): boolean {
  return error instanceof FirebaseError && error.code === code;
}

/**
 * Maps Firebase Auth errors to short, actionable text for alerts/toasts.
 */
export function formatFirebaseAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    const code = error.code;
    const hints: Record<string, string> = {
      "auth/email-already-in-use":
        "This email is already registered. Use Sign in, or reset your password if you forgot it.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/invalid-credential":
        "Email or password is incorrect. If you just signed up, use Sign in instead of signing up again.",
      "auth/wrong-password":
        "Wrong password. Try again or use Forgot password.",
      "auth/user-not-found":
        "No account with this email. Complete sign-up first.",
      "auth/weak-password":
        "Password is too weak. Use at least 6 characters and mix letters and numbers.",
      "auth/operation-not-allowed":
        "Email/password sign-in is turned off in Firebase. In Firebase Console → Authentication → Sign-in method, enable Email/Password.",
      "auth/network-request-failed":
        "Network error. Check your internet connection and try again.",
      "auth/too-many-requests":
        "Too many attempts. Wait a few minutes or use a different network.",
      "auth/internal-error":
        "Firebase had an internal error. Check Firebase status, your .env keys, and try again.",
      "auth/invalid-api-key":
        "Invalid Firebase API key. Copy the web app config from Firebase Console → Project settings into your .env (VITE_FIREBASE_*).",
      "auth/app-not-authorized":
        "This app is not allowed to use Firebase with this API key. Check the key in Firebase Console → Project settings.",
      "auth/configuration-not-found":
        "Firebase Auth is not set up for this project. Enable Authentication in Firebase Console and add a Web app.",
      "auth/unauthorized-continue-uri":
        "This app sent a redirect URL that is not in Firebase authorized domains. In Firebase Console → Authentication → Settings → Authorized domains, add your site (e.g. localhost, 127.0.0.1, or your production domain).",
    };
    if (hints[code]) return hints[code];
    return `${error.message} (${code})`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
