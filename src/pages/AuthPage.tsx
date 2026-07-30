import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cloud,
  Eye,
  EyeOff,
  Gamepad2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset';

function readableAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  const codeMatch = message.match(/auth\/([a-z-]+)/);
  const code = codeMatch?.[1];

  const friendly: Record<string, string> = {
    'invalid-credential': 'That email or password is incorrect.',
    'email-already-in-use': 'An account already exists with that email.',
    'weak-password': 'Use a stronger password with at least six characters.',
    'invalid-email': 'Enter a valid email address.',
    'popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'operation-not-allowed': 'This login method still needs to be enabled in Firebase.',
    'network-request-failed': 'Check your internet connection and try again.',
  };

  return code && friendly[code] ? friendly[code] : message;
}

export function AuthPage() {
  const { user, loading, signIn, signUp, signInWithGoogle, continueAsGuest, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const destination = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/dashboard';
  }, [location.state]);

  useEffect(() => {
    setError('');
    setNotice('');
  }, [mode]);

  if (!loading && user) {
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setNotice('Password reset email sent. Check your inbox.');
        return;
      }

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signUp({ displayName, email, password, remember });
      } else {
        await signIn(email, password, remember);
      }

      navigate(destination, { replace: true });
    } catch (nextError) {
      setError(readableAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setSubmitting(true);
    setError('');
    try {
      await signInWithGoogle(remember);
      navigate(destination, { replace: true });
    } catch (nextError) {
      setError(readableAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuest() {
    setSubmitting(true);
    setError('');
    try {
      await continueAsGuest();
      navigate('/dashboard', { replace: true });
    } catch (nextError) {
      setError(readableAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <div className="hero-brand"><span>DHQ</span> Dynasty HQ</div>
          <p className="eyebrow">Your season. Your story. Your legacy.</p>
          <h1>Make every week of your college football career matter.</h1>
          <p className="hero-copy">
            Track recruiting, build storylines, publish headlines, archive milestones, and carry your dynasty across devices.
          </p>
          <div className="hero-features">
            <div><Cloud size={20} /><span><strong>Cloud saves</strong>Never lose your progress</span></div>
            <div><Gamepad2 size={20} /><span><strong>Immersive careers</strong>RTG, coordinator, and head coach</span></div>
            <div><Trophy size={20} /><span><strong>Living legacy</strong>History, news, awards, and more</span></div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><span>DHQ</span> Dynasty HQ</div>
          <div className="auth-heading">
            <div className="auth-icon"><ShieldCheck size={25} /></div>
            <div>
              <p className="eyebrow">Secure your dynasty</p>
              <h2>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <label>
                Coach or player name
                <div className="input-wrap">
                  <Trophy size={18} />
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required placeholder="Bryan Wessel" autoComplete="name" />
                </div>
              </label>
            )}

            <label>
              Email address
              <div className="input-wrap">
                <Mail size={18} />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="coach@example.com" autoComplete="email" />
              </div>
            </label>

            {mode !== 'reset' && (
              <label>
                Password
                <div className="input-wrap">
                  <LockKeyhole size={18} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'signup' && (
              <label>
                Confirm password
                <div className="input-wrap">
                  <LockKeyhole size={18} />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={6} placeholder="Repeat your password" autoComplete="new-password" />
                </div>
              </label>
            )}

            {mode !== 'reset' && (
              <div className="auth-options">
                <label className="checkbox-row">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  Keep me signed in
                </label>
                {mode === 'login' && <button type="button" className="text-button" onClick={() => setMode('reset')}>Forgot password?</button>}
              </div>
            )}

            {error && <div className="auth-alert error">{error}</div>}
            {notice && <div className="auth-alert success">{notice}</div>}

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />}
              {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Log in'}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="divider"><span>or continue with</span></div>
              <button className="google-button" type="button" onClick={() => void handleGoogle()} disabled={submitting}>
                <span className="google-g">G</span> Google
              </button>
              <button className="guest-button" type="button" onClick={() => void handleGuest()} disabled={submitting}>
                Continue as guest
              </button>
              <p className="guest-note">Guest saves are tied to this browser. Upgrade later to keep the same dynasty across devices.</p>
            </>
          )}

          <div className="auth-switch">
            {mode === 'login' && <>New to Dynasty HQ? <button onClick={() => setMode('signup')}>Create an account</button></>}
            {mode === 'signup' && <>Already have an account? <button onClick={() => setMode('login')}>Log in</button></>}
            {mode === 'reset' && <button onClick={() => setMode('login')}>Return to login</button>}
          </div>
        </div>
      </section>
    </main>
  );
}
