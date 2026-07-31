import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarDays,
  Clock3,
  Flame,
  GraduationCap,
  MapPin,
  Newspaper,
  Radio,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Tv,
  UserRound,
} from 'lucide-react';
import {
  defaultDynastyDashboard,
  defaultDynastyProfile,
  type Dynasty,
  type DynastyGame,
  type DynastyUpdate,
  type RecruitSchool,
} from '../../types/dynasty';

export type DashboardDestination = 'profile' | 'games' | 'recruiting' | 'newsroom' | 'legacy' | 'podcast' | 'settings';

interface HomeDashboardPanelProps {
  dynasty: Dynasty;
  games: DynastyGame[];
  recruiting: RecruitSchool[];
  onPatch: (patch: DynastyUpdate) => void;
  onNavigate: (destination: DashboardDestination) => void;
}

function getStreak(games: DynastyGame[]) {
  if (games.length === 0) return 'No streak';
  const latestResult = games[0].result;
  let count = 0;
  for (const game of games) {
    if (game.result !== latestResult) break;
    count += 1;
  }
  return `${latestResult}${count}`;
}

export function HomeDashboardPanel({ dynasty, games, recruiting, onPatch, onNavigate }: HomeDashboardPanelProps) {
  const profile = { ...defaultDynastyProfile, ...(dynasty.profile ?? {}) };
  const dashboard = { ...defaultDynastyDashboard, ...(dynasty.dashboard ?? {}) };
  const currentSeasonGames = games.filter((game) => game.season === dynasty.season);
  const recentGames = currentSeasonGames.slice(0, 4);
  const topSchool = [...recruiting].sort((a, b) => b.interest - a.interest || a.rank - b.rank)[0];
  const offers = recruiting.filter((school) => school.offered).length;
  const streak = getStreak(currentSeasonGames);
  const nextOpponent = dashboard.upcomingOpponent.trim();
  const identityTitle = dynasty.mode === 'RTG'
    ? `${profile.position || 'Player'} ${profile.jerseyNumber || ''}`.trim()
    : dynasty.mode === 'OC' ? 'Offensive Coordinator' : 'Head Coach';

  function patchDashboard(field: keyof typeof dashboard, value: string) {
    onPatch({ dashboard: { ...dashboard, [field]: value } });
  }

  return (
    <div className="home-dashboard-stack">
      <section className="matchup-command-card">
        <div className="matchup-copy">
          <div className="matchup-kicker"><CalendarDays size={17} /> Week {dynasty.week} mission</div>
          <p className="eyebrow">Next assignment</p>
          <div className="matchup-teams">
            <div>
              <span>{dashboard.upcomingLocation === 'Away' ? 'Visitor' : 'Your side'}</span>
              <strong>{dynasty.school}</strong>
            </div>
            <b>VS</b>
            <div className="opponent-side">
              <span>{dashboard.upcomingLocation === 'Away' ? 'Host' : dashboard.upcomingLocation}</span>
              <strong>{nextOpponent || 'Opponent TBD'}</strong>
            </div>
          </div>
          <div className="matchup-details">
            <span><MapPin size={15} /> {dashboard.upcomingLocation}</span>
            <span><Clock3 size={15} /> {dashboard.upcomingKickoff || 'Time TBD'}</span>
            <span><Tv size={15} /> {dashboard.upcomingBroadcast || 'Broadcast TBD'}</span>
          </div>
        </div>
        <div className="matchup-record-block">
          <span>Season record</span>
          <strong>{dynasty.wins}–{dynasty.losses}</strong>
          <small>{streak} current streak</small>
          <button className="dashboard-action-button" onClick={() => onNavigate('games')}>Open game log <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="immersion-stat-grid">
        <article><Trophy size={21} /><span>Current record</span><strong>{dynasty.wins}–{dynasty.losses}</strong><small>Season {dynasty.season}</small></article>
        <article><Flame size={21} /><span>Momentum</span><strong>{streak}</strong><small>{currentSeasonGames.length} results logged</small></article>
        <article><ShieldCheck size={21} /><span>Offers</span><strong>{offers}</strong><small>{recruiting.length} schools tracked</small></article>
        <article><BarChart3 size={21} /><span>{dynasty.mode === 'RTG' ? 'Overall' : 'Prestige'}</span><strong>{dynasty.mode === 'RTG' ? profile.overall : profile.prestige}</strong><small>{dynasty.mode === 'RTG' ? `${profile.stars}-star profile` : `${profile.contractYears} contract years`}</small></article>
      </section>

      <div className="dashboard-feature-grid">
        <section className="dashboard-panel headline-panel">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Latest headline</p><h3>Inside the program</h3></div>
            <Newspaper size={24} />
          </div>
          <blockquote>“{dashboard.latestHeadline || defaultDynastyDashboard.latestHeadline}”</blockquote>
          <div className="headline-footer">
            <span>{dashboard.headlineOutlet || 'Dynasty HQ Newswire'}</span>
            <button onClick={() => onNavigate('newsroom')}>Newsroom <ArrowRight size={15} /></button>
          </div>
        </section>

        <section className="dashboard-panel identity-panel">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Career identity</p><h3>{profile.displayName || dynasty.name}</h3></div>
            {dynasty.mode === 'RTG' ? <UserRound size={24} /> : <Briefcase size={24} />}
          </div>
          <div className="identity-role">{identityTitle}</div>
          {dynasty.mode === 'RTG' ? (
            <div className="identity-metrics">
              <span><b>{profile.classYear}</b> Class</span>
              <span><b>{profile.archetype}</b> Archetype</span>
              <span><b>{profile.stars}★</b> Rating</span>
            </div>
          ) : (
            <div className="identity-metrics">
              <span><b>{profile.almaMater || 'Unlisted'}</b> Alma mater</span>
              <span><b>{profile.prestige}</b> Prestige</span>
              <span><b>{profile.contractYears}</b> Years left</span>
            </div>
          )}
          <button className="text-link-button" onClick={() => onNavigate('profile')}>Edit career profile <ArrowRight size={15} /></button>
        </section>
      </div>

      <div className="dashboard-feature-grid weekly-grid">
        <section className="dashboard-panel weekly-command-panel">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Weekly agenda</p><h3>Win the week</h3></div>
            <Target size={24} />
          </div>
          <div className="agenda-item">
            <span>Primary focus</span>
            <strong>{dashboard.weeklyFocus}</strong>
          </div>
          <div className="agenda-item">
            <span>Weekly standard</span>
            <strong>{dashboard.weeklyGoal}</strong>
          </div>
          <div className="agenda-item season-objective">
            <span>Season objective</span>
            <strong>{dashboard.seasonGoal}</strong>
          </div>
        </section>

        <section className="dashboard-panel recent-results-panel">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Recent results</p><h3>Season pulse</h3></div>
            <Trophy size={24} />
          </div>
          {recentGames.length === 0 ? (
            <div className="dashboard-empty-copy">No results yet. Log the first game to begin your season timeline.</div>
          ) : (
            <div className="result-timeline">
              {recentGames.map((game) => (
                <div key={game.id}>
                  <span className={`result-chip ${game.result === 'W' ? 'win' : 'loss'}`}>{game.result}</span>
                  <p><strong>{game.opponent}</strong><small>Week {game.week} · {game.location}</small></p>
                  <b>{game.teamScore}–{game.opponentScore}</b>
                </div>
              ))}
            </div>
          )}
          <button className="text-link-button" onClick={() => onNavigate('games')}>View full schedule <ArrowRight size={15} /></button>
        </section>
      </div>

      <div className="dashboard-feature-grid recruiting-grid">
        <section className="dashboard-panel recruiting-intel-panel">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Recruiting intelligence</p><h3>{dynasty.mode === 'RTG' ? 'Your market' : 'Talent board'}</h3></div>
            <Star size={24} />
          </div>
          {topSchool ? (
            <div className="recruiting-leader">
              <span className="interest-ring">{topSchool.interest}%</span>
              <div>
                <span>Highest interest</span>
                <strong>{topSchool.school}</strong>
                <small>Board rank #{topSchool.rank} · {topSchool.offered ? 'Official offer received' : 'Offer still pending'}</small>
              </div>
            </div>
          ) : (
            <div className="dashboard-empty-copy">Your recruiting board is empty. Add schools to begin tracking the race.</div>
          )}
          <button className="text-link-button" onClick={() => onNavigate('recruiting')}>Open recruiting board <ArrowRight size={15} /></button>
        </section>

        <section className="dashboard-panel quick-actions-panel">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Career command center</p><h3>Keep the story moving</h3></div>
            {dynasty.mode === 'RTG' ? <GraduationCap size={24} /> : <Radio size={24} />}
          </div>
          <div className="quick-action-grid">
            <button onClick={() => onNavigate('games')}><Trophy size={19} /><span><b>Log result</b>Add or edit a game</span></button>
            <button onClick={() => onNavigate('recruiting')}><Star size={19} /><span><b>Update board</b>Offers and interest</span></button>
            <button onClick={() => onNavigate('newsroom')}><Newspaper size={19} /><span><b>Build headlines</b>Weekly storylines</span></button>
            <button onClick={() => onNavigate('settings')}><Target size={19} /><span><b>Set the week</b>Opponent and goals</span></button>
          </div>
        </section>
      </div>
    </div>
  );
}
