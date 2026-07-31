import { CalendarDays, Newspaper, Palette, Settings2, Target, Trophy } from 'lucide-react';
import {
  defaultDynastyDashboard,
  type Dynasty,
  type DynastyUpdate,
  type HomeAway,
} from '../../types/dynasty';

interface DynastySettingsPanelProps {
  dynasty: Dynasty;
  onPatch: (patch: DynastyUpdate) => void;
}

function numberValue(value: string, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function DynastySettingsPanel({ dynasty, onPatch }: DynastySettingsPanelProps) {
  const dashboard = { ...defaultDynastyDashboard, ...(dynasty.dashboard ?? {}) };

  function patchDashboard(field: keyof typeof dashboard, value: string) {
    onPatch({ dashboard: { ...dashboard, [field]: value } });
  }

  return (
    <div className="workspace-stack settings-stack">
      <section className="workspace-card">
        <div className="section-heading">
          <div><p className="eyebrow">Save configuration</p><h3>Dynasty settings</h3></div>
          <Settings2 size={25} />
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
            Current season
            <input min="1" type="number" value={dynasty.season} onChange={(event) => onPatch({ season: Math.max(1, numberValue(event.target.value)) })} />
          </label>
          <label>
            Current week
            <input min="1" type="number" value={dynasty.week} onChange={(event) => onPatch({ week: Math.max(1, numberValue(event.target.value)) })} />
          </label>
        </div>
      </section>

      <section className="workspace-card">
        <div className="section-heading">
          <div><p className="eyebrow">Upcoming matchup</p><h3>Game-week setup</h3></div>
          <CalendarDays size={25} />
        </div>
        <div className="form-grid two-column">
          <label>
            Next opponent
            <input value={dashboard.upcomingOpponent} onChange={(event) => patchDashboard('upcomingOpponent', event.target.value)} placeholder="Central Michigan" />
          </label>
          <label>
            Location
            <select value={dashboard.upcomingLocation} onChange={(event) => patchDashboard('upcomingLocation', event.target.value as HomeAway)}>
              <option value="Home">Home</option>
              <option value="Away">Away</option>
              <option value="Neutral">Neutral site</option>
            </select>
          </label>
          <label>
            Kickoff
            <input value={dashboard.upcomingKickoff} onChange={(event) => patchDashboard('upcomingKickoff', event.target.value)} placeholder="Saturday · 3:30 PM" />
          </label>
          <label>
            Broadcast
            <input value={dashboard.upcomingBroadcast} onChange={(event) => patchDashboard('upcomingBroadcast', event.target.value)} placeholder="ESPN+" />
          </label>
        </div>
      </section>

      <section className="workspace-card">
        <div className="section-heading">
          <div><p className="eyebrow">Immersion controls</p><h3>Weekly storyline</h3></div>
          <Target size={25} />
        </div>
        <div className="form-grid two-column">
          <label>
            Weekly focus
            <textarea rows={4} value={dashboard.weeklyFocus} onChange={(event) => patchDashboard('weeklyFocus', event.target.value)} />
          </label>
          <label>
            Weekly standard
            <textarea rows={4} value={dashboard.weeklyGoal} onChange={(event) => patchDashboard('weeklyGoal', event.target.value)} />
          </label>
        </div>
        <label className="full-width-field">
          Season objective
          <textarea rows={4} value={dashboard.seasonGoal} onChange={(event) => patchDashboard('seasonGoal', event.target.value)} />
        </label>
      </section>

      <section className="workspace-card">
        <div className="section-heading">
          <div><p className="eyebrow">News desk</p><h3>Featured headline</h3></div>
          <Newspaper size={25} />
        </div>
        <label className="full-width-field no-top-margin">
          Latest headline
          <textarea rows={3} value={dashboard.latestHeadline} onChange={(event) => patchDashboard('latestHeadline', event.target.value)} placeholder="Write the headline that defines this week." />
        </label>
        <label className="full-width-field">
          Outlet name
          <input value={dashboard.headlineOutlet} onChange={(event) => patchDashboard('headlineOutlet', event.target.value)} placeholder="Dynasty HQ Newswire" />
        </label>
      </section>

      <section className="workspace-card">
        <div className="section-heading">
          <div><p className="eyebrow">Visual identity</p><h3>Team colors</h3></div>
          <Palette size={25} />
        </div>
        <div className="color-setting-grid">
          <label>
            Primary accent
            <div className="color-input-wrap">
              <input type="color" value={dashboard.accentColor} onChange={(event) => patchDashboard('accentColor', event.target.value)} />
              <input value={dashboard.accentColor} onChange={(event) => patchDashboard('accentColor', event.target.value)} aria-label="Primary accent hex value" />
            </div>
          </label>
          <label>
            Secondary color
            <div className="color-input-wrap">
              <input type="color" value={dashboard.secondaryColor} onChange={(event) => patchDashboard('secondaryColor', event.target.value)} />
              <input value={dashboard.secondaryColor} onChange={(event) => patchDashboard('secondaryColor', event.target.value)} aria-label="Secondary color hex value" />
            </div>
          </label>
          <div className="color-preview-card" style={{ background: `linear-gradient(135deg, ${dashboard.accentColor}, ${dashboard.secondaryColor})` }}>
            <Trophy size={28} />
            <div><strong>{dynasty.school}</strong><span>Dashboard theme preview</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
