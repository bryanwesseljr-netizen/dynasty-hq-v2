import { CalendarDays, ClipboardList, GraduationCap, ShieldCheck, Star, Trophy, UserRound } from 'lucide-react';
import {
  defaultDynastyProfile,
  type Dynasty,
  type DynastyGame,
  type DynastyUpdate,
  type RecruitSchool,
} from '../../types/dynasty';

interface OverviewPanelProps {
  dynasty: Dynasty;
  games: DynastyGame[];
  recruiting: RecruitSchool[];
  onPatch: (patch: DynastyUpdate) => void;
}

function numberValue(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function OverviewPanel({ dynasty, games, recruiting, onPatch }: OverviewPanelProps) {
  const profile = { ...defaultDynastyProfile, ...(dynasty.profile ?? {}) };
  const currentGames = games.filter((game) => game.season === dynasty.season);
  const offers = recruiting.filter((school) => school.offered).length;
  const topSchool = [...recruiting].sort((a, b) => b.interest - a.interest)[0];
  const latestGames = games.slice(0, 3);

  function patchProfile(field: keyof typeof profile, value: string | number) {
    onPatch({ profile: { ...profile, [field]: value } });
  }

  return (
    <div className="workspace-stack">
      <section className="workspace-stat-grid">
        <article className="workspace-stat"><CalendarDays size={20} /><span>Current point</span><strong>Season {dynasty.season}, Week {dynasty.week}</strong></article>
        <article className="workspace-stat"><Trophy size={20} /><span>Current record</span><strong>{dynasty.wins}–{dynasty.losses}</strong></article>
        <article className="workspace-stat"><ClipboardList size={20} /><span>Games logged</span><strong>{currentGames.length}</strong></article>
        <article className="workspace-stat"><ShieldCheck size={20} /><span>Offers received</span><strong>{offers}</strong></article>
      </section>

      <section className="workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Career identity</p>
            <h3>{dynasty.mode === 'RTG' ? 'Player profile' : 'Coach profile'}</h3>
          </div>
          {dynasty.mode === 'RTG' ? <UserRound size={25} /> : <GraduationCap size={25} />}
        </div>

        <div className="form-grid two-column">
          <label>
            Dynasty name
            <input value={dynasty.name} onChange={(event) => onPatch({ name: event.target.value })} />
          </label>
          <label>
            Current school
            <input value={dynasty.school} onChange={(event) => onPatch({ school: event.target.value })} />
          </label>
          <label>
            Season
            <input min="1" type="number" value={dynasty.season} onChange={(event) => onPatch({ season: Math.max(1, numberValue(event.target.value, 1)) })} />
          </label>
          <label>
            Week
            <input min="1" type="number" value={dynasty.week} onChange={(event) => onPatch({ week: Math.max(1, numberValue(event.target.value, 1)) })} />
          </label>
          <label>
            {dynasty.mode === 'RTG' ? 'Player name' : 'Coach name'}
            <input value={profile.displayName} onChange={(event) => patchProfile('displayName', event.target.value)} placeholder={dynasty.mode === 'RTG' ? 'Bryan Wessel' : 'Coach name'} />
          </label>

          {dynasty.mode === 'RTG' ? (
            <>
              <label>
                Position
                <input value={profile.position} onChange={(event) => patchProfile('position', event.target.value)} placeholder="QB" />
              </label>
              <label>
                Jersey number
                <input value={profile.jerseyNumber} onChange={(event) => patchProfile('jerseyNumber', event.target.value)} placeholder="#2" />
              </label>
              <label>
                Class year
                <select value={profile.classYear} onChange={(event) => patchProfile('classYear', event.target.value)}>
                  <option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option><option>Graduate</option>
                </select>
              </label>
              <label>
                Archetype
                <input value={profile.archetype} onChange={(event) => patchProfile('archetype', event.target.value)} placeholder="Dual-Threat" />
              </label>
              <label>
                Star rating
                <input min="0" max="5" type="number" value={profile.stars} onChange={(event) => patchProfile('stars', Math.min(5, Math.max(0, numberValue(event.target.value))))} />
              </label>
              <label>
                Overall rating
                <input min="0" max="99" type="number" value={profile.overall} onChange={(event) => patchProfile('overall', Math.min(99, Math.max(0, numberValue(event.target.value))))} />
              </label>
            </>
          ) : (
            <>
              <label>
                Alma mater
                <input value={profile.almaMater} onChange={(event) => patchProfile('almaMater', event.target.value)} placeholder="Eastern Michigan" />
              </label>
              <label>
                Coach prestige
                <input value={profile.prestige} onChange={(event) => patchProfile('prestige', event.target.value)} placeholder="C+" />
              </label>
              <label>
                Contract years remaining
                <input min="0" type="number" value={profile.contractYears} onChange={(event) => patchProfile('contractYears', Math.max(0, numberValue(event.target.value)))} />
              </label>
            </>
          )}
        </div>

        <label className="full-width-field">
          Career backstory / notes
          <textarea value={profile.bio} onChange={(event) => patchProfile('bio', event.target.value)} placeholder="Add the backstory, goals, coaching philosophy, or season storyline that makes this career yours." rows={4} />
        </label>
      </section>

      <div className="workspace-two-column">
        <section className="workspace-card">
          <div className="section-heading compact-heading">
            <div><p className="eyebrow">Recent results</p><h3>Latest games</h3></div>
            <Trophy size={22} />
          </div>
          {latestGames.length === 0 ? (
            <p className="muted-copy">No games logged yet. Add your first result from the Game Log tab.</p>
          ) : (
            <div className="mini-list">
              {latestGames.map((game) => (
                <div key={game.id} className="mini-list-row">
                  <span className={`result-chip ${game.result === 'W' ? 'win' : 'loss'}`}>{game.result}</span>
                  <div><strong>{game.opponent}</strong><small>Season {game.season} · Week {game.week}</small></div>
                  <b>{game.teamScore}–{game.opponentScore}</b>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="workspace-card">
          <div className="section-heading compact-heading">
            <div><p className="eyebrow">Recruiting pulse</p><h3>Top interest</h3></div>
            <Star size={22} />
          </div>
          {!topSchool ? (
            <p className="muted-copy">Your recruiting board is empty. Add interested schools from the Recruiting tab.</p>
          ) : (
            <div className="top-school-card">
              <span className="interest-ring">{topSchool.interest}%</span>
              <div><strong>{topSchool.school}</strong><small>Rank #{topSchool.rank} · {topSchool.offered ? 'Offer received' : 'No offer yet'}</small></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
