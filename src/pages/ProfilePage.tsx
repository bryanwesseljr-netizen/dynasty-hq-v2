import { useState, type FormEvent } from 'react';
import { CheckCircle2, Cloud, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, upgradeGuest } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleUpgrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      await upgradeGuest(email, password, displayName);
      setNotice('Your guest save is now secured. A verification email has been sent.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to secure this account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-content profile-page">
      <section className="profile-card">
        <div className="profile-avatar"><UserRound size={34} /></div>
        <div>
          <p className="eyebrow">Dynasty HQ account</p>
          <h2>{user?.displayName || (user?.isAnonymous ? 'Guest Coach' : 'Coach')}</h2>
          <p>{user?.email || 'No permanent email connected'}</p>
        </div>
        <div className="profile-status">
          {user?.isAnonymous ? <ShieldCheck size={20} /> : <Cloud size={20} />}
          {user?.isAnonymous ? 'Guest account' : 'Cloud account'}
        </div>
      </section>

      {user?.isAnonymous ? (
        <section className="settings-card">
          <div>
            <p className="eyebrow">Keep the same UID and save data</p>
            <h3>Secure this guest dynasty</h3>
            <p>Adding an email and password upgrades the current anonymous Firebase account instead of creating a disconnected save.</p>
          </div>
          <form onSubmit={handleUpgrade} className="auth-form upgrade-form">
            <label>
              Display name
              <div className="input-wrap"><UserRound size={18} /><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Bryan Wessel" /></div>
            </label>
            <label>
              Email address
              <div className="input-wrap"><Mail size={18} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="coach@example.com" /></div>
            </label>
            <label>
              Password
              <div className="input-wrap"><LockKeyhole size={18} /><input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></div>
            </label>
            {error && <div className="auth-alert error">{error}</div>}
            {notice && <div className="auth-alert success">{notice}</div>}
            <button className="primary-button compact" type="submit" disabled={saving}><ShieldCheck size={18} /> {saving ? 'Securing...' : 'Secure my save'}</button>
          </form>
        </section>
      ) : (
        <section className="settings-card permanent-account">
          <CheckCircle2 size={36} />
          <div>
            <p className="eyebrow">Permanent cloud account</p>
            <h3>Your dynasty is protected.</h3>
            <p>Log in with the same account on another browser or device to load your Dynasty HQ saves.</p>
          </div>
        </section>
      )}
    </main>
  );
}
