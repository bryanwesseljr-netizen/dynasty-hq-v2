import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Cloud,
  Plus,
  ShieldAlert,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createDynasty, removeDynasty, subscribeToDynasties, touchDynasty } from '../services/dynasties';
import { defaultDynastyDashboard, type CareerMode, type Dynasty } from '../types/dynasty';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dynasties, setDynasties] = useState<Dynasty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [mode, setMode] = useState<CareerMode>('RTG');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    return subscribeToDynasties(
      user.uid,
      (nextDynasties) => {
        setDynasties(nextDynasties);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, [user]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      await createDynasty(user.uid, { name, school, mode });
      setName('');
      setSchool('');
      setMode('RTG');
      setShowCreate(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to create dynasty.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-content">
      {user?.isAnonymous && (
        <section className="guest-banner">
          <ShieldAlert size={22} />
          <div>
            <strong>Your dynasty is using a guest account.</strong>
            <span>Secure it from the Account page so the same save works on every device.</span>
          </div>
          <a href="/profile">Secure my save <ArrowRight size={16} /></a>
        </section>
      )}

      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">My dynasty universe</p>
          <h2>Continue the story</h2>
          <p>Create separate careers for Road to Glory, coordinator journeys, rebuilds, and head-coaching legacies.</p>
        </div>
        <button className="primary-button compact" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> New dynasty
        </button>
      </section>

      <section className="stat-grid">
        <article className="stat-card"><Trophy size={23} /><div><span>Active careers</span><strong>{dynasties.length}</strong></div></article>
        <article className="stat-card"><CalendarDays size={23} /><div><span>Total seasons</span><strong>{dynasties.reduce((total, dynasty) => total + dynasty.season, 0)}</strong></div></article>
        <article className="stat-card"><Cloud size={23} /><div><span>Save status</span><strong>{user?.isAnonymous ? 'Guest' : 'Synced'}</strong></div></article>
      </section>

      {error && <div className="auth-alert error dashboard-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading your dynasties...</div>
      ) : dynasties.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon"><Trophy size={34} /></div>
          <h3>Your first legacy starts here.</h3>
          <p>Create a career now. The next sprint will migrate recruiting, game logs, news, podcast audio, awards, and your existing Dynasty HQ data into each save.</p>
          <button className="primary-button compact" onClick={() => setShowCreate(true)}><Plus size={18} /> Create first dynasty</button>
        </section>
      ) : (
        <section className="dynasty-grid">
          {dynasties.map((dynasty) => {
            const dashboard = { ...defaultDynastyDashboard, ...(dynasty.dashboard ?? {}) };
            return (
            <article
              className="dynasty-card themed-dynasty-card"
              key={dynasty.id}
              style={{ '--card-accent': dashboard.accentColor, '--card-secondary': dashboard.secondaryColor } as CSSProperties}
            >
              <div className="dynasty-card-top">
                <span className="mode-badge">{dynasty.mode}</span>
                <button
                  className="icon-button danger"
                  aria-label={`Delete ${dynasty.name}`}
                  onClick={() => {
                    if (!user || !window.confirm(`Delete ${dynasty.name} and all of its game and recruiting data?`)) return;
                    void removeDynasty(user.uid, dynasty.id).catch((nextError: unknown) => {
                      setError(nextError instanceof Error ? nextError.message : 'Unable to delete the dynasty.');
                    });
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <div>
                <p className="eyebrow">Season {dynasty.season} · Week {dynasty.week}</p>
                <h3>{dynasty.name}</h3>
                <p>{dynasty.school}</p>
              </div>
              <div className="record-row">
                <strong>{dynasty.wins}–{dynasty.losses}</strong>
                <span>Current record</span>
              </div>
              <button className="card-action" onClick={() => {
                if (!user) return;
                void touchDynasty(user.uid, dynasty.id);
                navigate(`/dynasties/${dynasty.id}`);
              }}>
                Enter dynasty <ArrowRight size={17} />
              </button>
            </article>
            );
          })}
        </section>
      )}

      {showCreate && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowCreate(false)}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={(event) => event.stopPropagation()}>
            <p className="eyebrow">New save file</p>
            <h2 id="create-title">Create a dynasty</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <label>
                Dynasty name
                <div className="input-wrap"><Trophy size={18} /><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="The Eastern Michigan Grind" /></div>
              </label>
              <label>
                School or player
                <div className="input-wrap"><Trophy size={18} /><input required value={school} onChange={(event) => setSchool(event.target.value)} placeholder="Eastern Michigan" /></div>
              </label>
              <label>
                Career mode
                <select value={mode} onChange={(event) => setMode(event.target.value as CareerMode)}>
                  <option value="RTG">Road to Glory</option>
                  <option value="OC">Offensive Coordinator</option>
                  <option value="HC">Head Coach</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="primary-button compact" disabled={saving}>{saving ? 'Creating...' : 'Create dynasty'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
