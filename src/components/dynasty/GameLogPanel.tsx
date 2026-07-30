import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarPlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { createGame, removeGame, updateGame } from '../../services/dynasties';
import type { CareerMode, CreateGameInput, DynastyGame, HomeAway } from '../../types/dynasty';

interface GameLogPanelProps {
  userId: string;
  dynastyId: string;
  mode: CareerMode;
  season: number;
  week: number;
  games: DynastyGame[];
  onAdvanceWeek: (nextWeek: number) => void;
  onError: (message: string) => void;
}

const emptyGame = (season: number, week: number): CreateGameInput => ({
  season,
  week,
  opponent: '',
  result: 'W',
  location: 'Home',
  teamScore: 0,
  opponentScore: 0,
  passYards: 0,
  passTouchdowns: 0,
  rushYards: 0,
  rushTouchdowns: 0,
  interceptions: 0,
  notes: '',
});

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function GameLogPanel({ userId, dynastyId, mode, season, week, games, onAdvanceWeek, onError }: GameLogPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGameInput>(() => emptyGame(season, week));
  const [saving, setSaving] = useState(false);
  const seasonOptions = useMemo(() => {
    const values = new Set([season, ...games.map((game) => game.season)]);
    return [...values].sort((a, b) => b - a);
  }, [games, season]);
  const [seasonFilter, setSeasonFilter] = useState(season);

  useEffect(() => {
    setSeasonFilter(season);
  }, [season]);

  const visibleGames = games.filter((game) => game.season === seasonFilter);

  function openCreate() {
    setEditingId(null);
    setForm(emptyGame(season, week));
    setShowForm(true);
  }

  function openEdit(game: DynastyGame) {
    setEditingId(game.id);
    setForm({
      season: game.season,
      week: game.week,
      opponent: game.opponent,
      result: game.result,
      location: game.location,
      teamScore: game.teamScore,
      opponentScore: game.opponentScore,
      passYards: game.passYards,
      passTouchdowns: game.passTouchdowns,
      rushYards: game.rushYards,
      rushTouchdowns: game.rushTouchdowns,
      interceptions: game.interceptions,
      notes: game.notes,
    });
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateGame(userId, dynastyId, editingId, form);
      } else {
        await createGame(userId, dynastyId, form);
        if (form.season === season && form.week >= week) onAdvanceWeek(Math.max(week + 1, form.week + 1));
      }
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to save the game.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(game: DynastyGame) {
    if (!window.confirm(`Delete the ${game.opponent} game from your log?`)) return;
    try {
      await removeGame(userId, dynastyId, game.id);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to delete the game.');
    }
  }

  return (
    <div className="workspace-stack">
      <section className="panel-toolbar">
        <div>
          <p className="eyebrow">Season results</p>
          <h3>Game log</h3>
          <p>Track scores, player statistics, notes, and the week-by-week story of the season.</p>
        </div>
        <div className="toolbar-actions">
          <label className="compact-select-label">
            Season
            <select value={seasonFilter} onChange={(event) => setSeasonFilter(Number(event.target.value))}>
              {seasonOptions.map((value) => <option key={value} value={value}>Season {value}</option>)}
            </select>
          </label>
          <button className="primary-button compact" onClick={openCreate}><Plus size={18} /> Add game</button>
        </div>
      </section>

      {visibleGames.length === 0 ? (
        <section className="empty-state compact-empty">
          <div className="empty-icon"><CalendarPlus size={31} /></div>
          <h3>No games logged</h3>
          <p>Add the first game from Season {seasonFilter}. Your record will update automatically.</p>
          <button className="primary-button compact" onClick={openCreate}><Plus size={18} /> Log first game</button>
        </section>
      ) : (
        <section className="game-list">
          {visibleGames.map((game) => (
            <article className="game-row" key={game.id}>
              <div className={`game-result-block ${game.result === 'W' ? 'win' : 'loss'}`}>
                <strong>{game.result}</strong>
                <span>Week {game.week}</span>
              </div>
              <div className="game-opponent">
                <span>{game.location}</span>
                <h4>{game.opponent}</h4>
                <small>{game.notes || `Season ${game.season} matchup`}</small>
              </div>
              <div className="game-score">
                <strong>{game.teamScore}–{game.opponentScore}</strong>
                <span>Final</span>
              </div>
              <div className="game-stats">
                <span><b>{game.passYards}</b> Pass Yds</span>
                <span><b>{game.passTouchdowns}</b> Pass TD</span>
                <span><b>{game.rushYards}</b> Rush Yds</span>
                <span><b>{game.rushTouchdowns}</b> Rush TD</span>
                <span><b>{game.interceptions}</b> INT</span>
              </div>
              <div className="row-actions">
                <button className="icon-button" onClick={() => openEdit(game)} aria-label={`Edit ${game.opponent}`}><Pencil size={16} /></button>
                <button className="icon-button danger" onClick={() => void handleDelete(game)} aria-label={`Delete ${game.opponent}`}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </section>
      )}

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => !saving && setShowForm(false)}>
          <section className="modal-card wide-modal" role="dialog" aria-modal="true" aria-labelledby="game-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading-row">
              <div><p className="eyebrow">Season {form.season} · Week {form.week}</p><h2 id="game-form-title">{editingId ? 'Edit game' : 'Log a game'}</h2></div>
              <button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="workspace-form">
              <div className="form-grid three-column">
                <label>Season<input min="1" type="number" value={form.season} onChange={(event) => setForm((current) => ({ ...current, season: Math.max(1, toNumber(event.target.value)) }))} /></label>
                <label>Week<input min="1" type="number" value={form.week} onChange={(event) => setForm((current) => ({ ...current, week: Math.max(1, toNumber(event.target.value)) }))} /></label>
                <label>Location<select value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value as HomeAway }))}><option>Home</option><option>Away</option><option>Neutral</option></select></label>
              </div>
              <div className="form-grid two-column">
                <label>Opponent<input required value={form.opponent} onChange={(event) => setForm((current) => ({ ...current, opponent: event.target.value }))} placeholder="Michigan State" /></label>
                <label>Result<select value={form.result} onChange={(event) => setForm((current) => ({ ...current, result: event.target.value as 'W' | 'L' }))}><option value="W">Win</option><option value="L">Loss</option></select></label>
                <label>Your score<input min="0" type="number" value={form.teamScore} onChange={(event) => setForm((current) => ({ ...current, teamScore: Math.max(0, toNumber(event.target.value)) }))} /></label>
                <label>Opponent score<input min="0" type="number" value={form.opponentScore} onChange={(event) => setForm((current) => ({ ...current, opponentScore: Math.max(0, toNumber(event.target.value)) }))} /></label>
              </div>

              <div className="form-section-label">{mode === 'RTG' ? 'Player statistics' : 'Offensive production'}</div>
              <div className="form-grid stats-five-column">
                <label>Pass yards<input min="0" type="number" value={form.passYards} onChange={(event) => setForm((current) => ({ ...current, passYards: Math.max(0, toNumber(event.target.value)) }))} /></label>
                <label>Pass TD<input min="0" type="number" value={form.passTouchdowns} onChange={(event) => setForm((current) => ({ ...current, passTouchdowns: Math.max(0, toNumber(event.target.value)) }))} /></label>
                <label>Rush yards<input type="number" value={form.rushYards} onChange={(event) => setForm((current) => ({ ...current, rushYards: toNumber(event.target.value) }))} /></label>
                <label>Rush TD<input min="0" type="number" value={form.rushTouchdowns} onChange={(event) => setForm((current) => ({ ...current, rushTouchdowns: Math.max(0, toNumber(event.target.value)) }))} /></label>
                <label>INT<input min="0" type="number" value={form.interceptions} onChange={(event) => setForm((current) => ({ ...current, interceptions: Math.max(0, toNumber(event.target.value)) }))} /></label>
              </div>
              <label className="full-width-field">Game notes<textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Big moments, injuries, rivalry context, press conference angle..." /></label>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="primary-button compact" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add to game log'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
