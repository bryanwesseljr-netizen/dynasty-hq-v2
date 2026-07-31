import { Award, BookOpen, Mic2, Newspaper, Radio, Trophy } from 'lucide-react';
import { defaultDynastyDashboard, type Dynasty, type DynastyGame, type RecruitSchool } from '../../types/dynasty';

export type PreviewModule = 'newsroom' | 'legacy' | 'podcast';

interface ModulePreviewPanelProps {
  module: PreviewModule;
  dynasty: Dynasty;
  games: DynastyGame[];
  recruiting: RecruitSchool[];
}

const moduleCopy: Record<PreviewModule, { eyebrow: string; title: string; description: string }> = {
  newsroom: {
    eyebrow: 'Story engine preview',
    title: 'Newsroom',
    description: 'This section will turn weekly results, recruiting movement, and career decisions into a living media universe.',
  },
  legacy: {
    eyebrow: 'Career archive preview',
    title: 'Legacy room',
    description: 'This section will preserve awards, milestones, season history, records, championships, and defining career moments.',
  },
  podcast: {
    eyebrow: 'Media studio preview',
    title: 'Podcast studio',
    description: 'This section will organize podcast episodes, audio uploads, show notes, and Gridiron Grind storylines for the active dynasty.',
  },
};

export function ModulePreviewPanel({ module, dynasty, games, recruiting }: ModulePreviewPanelProps) {
  const copy = moduleCopy[module];
  const dashboard = { ...defaultDynastyDashboard, ...(dynasty.dashboard ?? {}) };
  const currentGames = games.filter((game) => game.season === dynasty.season);
  const offers = recruiting.filter((school) => school.offered).length;

  return (
    <div className="module-preview-stack">
      <section className="module-preview-hero">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
        <span className="module-preview-badge">Foundation ready</span>
      </section>

      {module === 'newsroom' && (
        <div className="preview-card-grid">
          <article className="preview-feature-card wide-preview-card">
            <Newspaper size={26} />
            <span>Featured headline</span>
            <blockquote>“{dashboard.latestHeadline}”</blockquote>
            <small>{dashboard.headlineOutlet}</small>
          </article>
          <article className="preview-feature-card"><Radio size={25} /><span>Weekly coverage</span><strong>{currentGames.length} results available</strong><small>Ready to become recaps and storylines.</small></article>
          <article className="preview-feature-card"><BookOpen size={25} /><span>Recruiting desk</span><strong>{recruiting.length} schools tracked</strong><small>{offers} official offers can drive insider updates.</small></article>
        </div>
      )}

      {module === 'legacy' && (
        <div className="preview-card-grid">
          <article className="preview-feature-card"><Trophy size={25} /><span>Season record</span><strong>{dynasty.wins}–{dynasty.losses}</strong><small>Season {dynasty.season}, Week {dynasty.week}</small></article>
          <article className="preview-feature-card"><Award size={25} /><span>Trophy case</span><strong>Ready for milestones</strong><small>Awards and championships migrate next.</small></article>
          <article className="preview-feature-card wide-preview-card"><BookOpen size={26} /><span>Career timeline</span><blockquote>Every game, commitment, promotion, and headline will eventually live here in chronological order.</blockquote></article>
        </div>
      )}

      {module === 'podcast' && (
        <div className="preview-card-grid">
          <article className="preview-feature-card wide-preview-card"><Mic2 size={28} /><span>The Gridiron Grind</span><blockquote>Record the story behind {dynasty.name}, from game-week pressure to recruiting rumors and career-changing decisions.</blockquote><small>Audio migration and cloud storage are planned for the podcast sprint.</small></article>
          <article className="preview-feature-card"><Radio size={25} /><span>Episode feed</span><strong>Cloud-ready structure</strong><small>Episodes will be isolated inside this dynasty.</small></article>
          <article className="preview-feature-card"><Newspaper size={25} /><span>Show notes</span><strong>Story data connected</strong><small>Games and recruiting can feed each episode.</small></article>
        </div>
      )}
    </div>
  );
}
