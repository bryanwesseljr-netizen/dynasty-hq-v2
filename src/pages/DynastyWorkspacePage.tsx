import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ClipboardList, LayoutDashboard, School, Trophy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { GameLogPanel } from '../components/dynasty/GameLogPanel';
import { OverviewPanel } from '../components/dynasty/OverviewPanel';
import { RecruitingPanel } from '../components/dynasty/RecruitingPanel';
import { SaveStatusBadge } from '../components/dynasty/SaveStatusBadge';
import { FullPageLoader } from '../components/ui/FullPageLoader';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToDynasty,
  subscribeToGames,
  subscribeToRecruiting,
  updateDynasty,
} from '../services/dynasties';
import {
  defaultDynastyProfile,
  type Dynasty,
  type DynastyGame,
  type DynastyUpdate,
  type RecruitSchool,
  type SaveStatus,
} from '../types/dynasty';

type WorkspaceTab = 'overview' | 'games' | 'recruiting';

function normalizeDynasty(dynasty: Dynasty): Dynasty {
  return {
    ...dynasty,
    season: dynasty.season || 1,
    week: dynasty.week || 1,
    wins: dynasty.wins || 0,
    losses: dynasty.losses || 0,
    profile: { ...defaultDynastyProfile, ...(dynasty.profile ?? {}) },
  };
}

export function DynastyWorkspacePage() {
  const { user } = useAuth();
  const { dynastyId } = useParams<{ dynastyId: string }>();
  const [dynasty, setDynasty] = useState<Dynasty | null>(null);
  const [draft, setDraft] = useState<Dynasty | null>(null);
  const [games, setGames] = useState<DynastyGame[]>([]);
  const [recruiting, setRecruiting] = useState<RecruitSchool[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState('');
  const [dynastyLoading, setDynastyLoading] = useState(true);
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const lastRecordSyncRef = useRef('');

  useEffect(() => {
    dirtyRef.current = false;
    revisionRef.current = 0;
    lastRecordSyncRef.current = '';
    setDynasty(null);
    setDraft(null);
    setGames([]);
    setRecruiting([]);
    setDynastyLoading(true);
    setGamesLoaded(false);
    setSaveStatus('idle');
  }, [dynastyId]);

  useEffect(() => {
    if (!user || !dynastyId) return;

    return subscribeToDynasty(
      user.uid,
      dynastyId,
      (nextDynasty) => {
        const normalized = nextDynasty ? normalizeDynasty(nextDynasty) : null;
        setDynasty(normalized);
        if (!dirtyRef.current) setDraft(normalized);
        setDynastyLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setDynastyLoading(false);
      },
    );
  }, [dynastyId, user]);

  useEffect(() => {
    if (!user || !dynastyId) return;

    const unsubscribeGames = subscribeToGames(
      user.uid,
      dynastyId,
      (nextGames) => {
        setGames(nextGames);
        setGamesLoaded(true);
      },
      (nextError) => setError(nextError.message),
    );

    const unsubscribeRecruiting = subscribeToRecruiting(
      user.uid,
      dynastyId,
      setRecruiting,
      (nextError) => setError(nextError.message),
    );

    return () => {
      unsubscribeGames();
      unsubscribeRecruiting();
    };
  }, [dynastyId, user]);

  useEffect(() => {
    if (!user || !dynastyId || !draft || !dirtyRef.current) return;

    const revision = revisionRef.current;
    setSaveStatus('dirty');
    const timer = window.setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateDynasty(user.uid, dynastyId, {
          name: draft.name.trim() || 'Untitled Dynasty',
          mode: draft.mode,
          school: draft.school.trim() || 'Unassigned',
          season: Math.max(1, draft.season),
          week: Math.max(1, draft.week),
          profile: draft.profile,
        });

        if (revisionRef.current === revision) {
          dirtyRef.current = false;
          setSaveStatus('saved');
        } else {
          setSaveStatus('dirty');
        }
      } catch (nextError) {
        setSaveStatus('error');
        setError(nextError instanceof Error ? nextError.message : 'Cloud autosave failed.');
      }
    }, 750);

    return () => window.clearTimeout(timer);
  }, [draft, dynastyId, user]);

  const currentRecord = useMemo(() => {
    if (!draft) return { wins: 0, losses: 0 };
    const currentSeasonGames = games.filter((game) => game.season === draft.season);
    return {
      wins: currentSeasonGames.filter((game) => game.result === 'W').length,
      losses: currentSeasonGames.filter((game) => game.result === 'L').length,
    };
  }, [draft, games]);

  useEffect(() => {
    if (!user || !dynastyId || !draft || !gamesLoaded) return;
    const recordKey = `${draft.season}:${currentRecord.wins}:${currentRecord.losses}`;
    if (lastRecordSyncRef.current === recordKey) return;
    lastRecordSyncRef.current = recordKey;

    setDraft((current) => current ? { ...current, ...currentRecord } : current);
    setDynasty((current) => current ? { ...current, ...currentRecord } : current);
    void updateDynasty(user.uid, dynastyId, currentRecord).catch((nextError: unknown) => {
      setError(nextError instanceof Error ? nextError.message : 'Unable to update the season record.');
    });
  }, [currentRecord, draft, dynastyId, gamesLoaded, user]);

  function patchDynasty(patch: DynastyUpdate) {
    dirtyRef.current = true;
    revisionRef.current += 1;
    setDraft((current) => current ? { ...current, ...patch } : current);
  }

  if (dynastyLoading) return <FullPageLoader label="Loading dynasty workspace..." />;

  if (!dynasty || !draft || !user || !dynastyId) {
    return (
      <main className="page-content">
        <section className="empty-state">
          <Trophy size={40} />
          <h3>Dynasty not found</h3>
          <p>This save may have been deleted or belongs to a different account.</p>
          <Link className="primary-button compact" to="/dashboard"><ArrowLeft size={17} /> Back to dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-content workspace-page">
      <Link className="back-link" to="/dashboard"><ArrowLeft size={17} /> All dynasties</Link>

      <section className="workspace-hero">
        <div className="workspace-title-block">
          <div className="workspace-badges"><span className="mode-badge">{draft.mode}</span><SaveStatusBadge status={saveStatus} /></div>
          <p className="eyebrow">{draft.school} · Season {draft.season} · Week {draft.week}</p>
          <h2>{draft.name}</h2>
          <p>{draft.mode === 'RTG' ? 'Road to Glory career headquarters' : `${draft.mode === 'OC' ? 'Offensive coordinator' : 'Head coach'} career headquarters`}</p>
        </div>
        <div className="workspace-record-card">
          <span>Current record</span>
          <strong>{currentRecord.wins}–{currentRecord.losses}</strong>
          <small>{games.filter((game) => game.season === draft.season).length} games logged</small>
        </div>
      </section>

      {error && <div className="auth-alert error workspace-error"><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}

      <nav className="workspace-tabs" aria-label="Dynasty workspace sections">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><LayoutDashboard size={18} /> Overview</button>
        <button className={activeTab === 'games' ? 'active' : ''} onClick={() => setActiveTab('games')}><ClipboardList size={18} /> Game log <span>{games.length}</span></button>
        <button className={activeTab === 'recruiting' ? 'active' : ''} onClick={() => setActiveTab('recruiting')}><School size={18} /> Recruiting <span>{recruiting.length}</span></button>
      </nav>

      {activeTab === 'overview' && <OverviewPanel dynasty={{ ...draft, ...currentRecord }} games={games} recruiting={recruiting} onPatch={patchDynasty} />}
      {activeTab === 'games' && (
        <GameLogPanel
          userId={user.uid}
          dynastyId={dynastyId}
          mode={draft.mode}
          season={draft.season}
          week={draft.week}
          games={games}
          onAdvanceWeek={(nextWeek) => patchDynasty({ week: nextWeek })}
          onError={setError}
        />
      )}
      {activeTab === 'recruiting' && <RecruitingPanel userId={user.uid} dynastyId={dynastyId} recruiting={recruiting} onError={setError} />}
    </main>
  );
}
