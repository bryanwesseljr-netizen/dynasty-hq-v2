import { useEffect, useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, School, Trash2, X } from 'lucide-react';
import { createRecruit, removeRecruit, updateRecruit } from '../../services/dynasties';
import { interestToTier, type CreateRecruitInput, type RecruitSchool } from '../../types/dynasty';

interface RecruitingPanelProps {
  userId: string;
  dynastyId: string;
  recruiting: RecruitSchool[];
  onError: (message: string) => void;
}

const emptyRecruit = (rank: number): CreateRecruitInput => ({
  school: '',
  interest: 10,
  tier: 'None',
  offered: false,
  rank,
  notes: '',
});

function clampInterest(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function RecruitingPanel({ userId, dynastyId, recruiting, onError }: RecruitingPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateRecruitInput>(() => emptyRecruit(recruiting.length + 1));
  const [saving, setSaving] = useState(false);
  const [interestDrafts, setInterestDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    setInterestDrafts(Object.fromEntries(recruiting.map((recruit) => [recruit.id, recruit.interest])));
  }, [recruiting]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyRecruit(recruiting.length + 1));
    setShowForm(true);
  }

  function openEdit(recruit: RecruitSchool) {
    setEditingId(recruit.id);
    setForm({ school: recruit.school, interest: recruit.interest, tier: recruit.tier, offered: recruit.offered, rank: recruit.rank, notes: recruit.notes });
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const finalInterest = clampInterest(form.interest);
    const input = { ...form, interest: finalInterest, tier: interestToTier(finalInterest), rank: Math.max(1, form.rank) };

    try {
      if (editingId) await updateRecruit(userId, dynastyId, editingId, input);
      else await createRecruit(userId, dynastyId, input);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to save the school.');
    } finally {
      setSaving(false);
    }
  }

  async function quickUpdate(recruit: RecruitSchool, patch: Partial<CreateRecruitInput>) {
    try {
      const interest = patch.interest === undefined ? recruit.interest : clampInterest(patch.interest);
      await updateRecruit(userId, dynastyId, recruit.id, {
        ...patch,
        ...(patch.interest === undefined ? {} : { interest, tier: interestToTier(interest) }),
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to update recruiting.');
    }
  }

  async function commitInterest(recruit: RecruitSchool) {
    const nextInterest = interestDrafts[recruit.id] ?? recruit.interest;
    if (nextInterest === recruit.interest) return;
    await quickUpdate(recruit, { interest: nextInterest });
  }

  async function handleDelete(recruit: RecruitSchool) {
    if (!window.confirm(`Remove ${recruit.school} from the recruiting board?`)) return;
    try {
      await removeRecruit(userId, dynastyId, recruit.id);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to remove the school.');
    }
  }

  return (
    <div className="workspace-stack">
      <section className="panel-toolbar">
        <div>
          <p className="eyebrow">Recruiting command center</p>
          <h3>School interest board</h3>
          <p>Rank interested programs, track offers, and follow momentum throughout the season.</p>
        </div>
        <button className="primary-button compact" onClick={openCreate}><Plus size={18} /> Add school</button>
      </section>

      {recruiting.length === 0 ? (
        <section className="empty-state compact-empty">
          <div className="empty-icon"><School size={31} /></div>
          <h3>No schools added</h3>
          <p>Build your board as offers and interest begin to arrive.</p>
          <button className="primary-button compact" onClick={openCreate}><Plus size={18} /> Add first school</button>
        </section>
      ) : (
        <section className="recruiting-board">
          <div className="recruiting-header"><span>Rank</span><span>Program</span><span>Interest</span><span>Offer</span><span>Notes</span><span>Actions</span></div>
          {recruiting.map((recruit) => (
            <article className="recruiting-row" key={recruit.id}>
              <strong className="recruit-rank">#{recruit.rank}</strong>
              <div className="recruit-school"><span className={`tier-dot ${recruit.tier.toLowerCase()}`} /><div><strong>{recruit.school}</strong><small>{recruit.tier} interest</small></div></div>
              <div className="interest-control">
                <input
                  aria-label={`${recruit.school} interest`}
                  type="range"
                  min="0"
                  max="100"
                  value={interestDrafts[recruit.id] ?? recruit.interest}
                  onChange={(event) => setInterestDrafts((current) => ({ ...current, [recruit.id]: Number(event.target.value) }))}
                  onPointerUp={() => void commitInterest(recruit)}
                  onBlur={() => void commitInterest(recruit)}
                  onKeyUp={(event) => { if (event.key === 'Enter' || event.key.startsWith('Arrow')) void commitInterest(recruit); }}
                />
                <b>{interestDrafts[recruit.id] ?? recruit.interest}%</b>
              </div>
              <button className={`offer-toggle ${recruit.offered ? 'active' : ''}`} onClick={() => void quickUpdate(recruit, { offered: !recruit.offered })}>
                {recruit.offered ? <><Check size={15} /> Offered</> : 'No offer'}
              </button>
              <span className="recruit-notes">{recruit.notes || '—'}</span>
              <div className="row-actions">
                <button className="icon-button" onClick={() => openEdit(recruit)} aria-label={`Edit ${recruit.school}`}><Pencil size={16} /></button>
                <button className="icon-button danger" onClick={() => void handleDelete(recruit)} aria-label={`Delete ${recruit.school}`}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </section>
      )}

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => !saving && setShowForm(false)}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="recruit-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading-row">
              <div><p className="eyebrow">Recruiting board</p><h2 id="recruit-form-title">{editingId ? 'Edit school' : 'Add a school'}</h2></div>
              <button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form className="workspace-form" onSubmit={handleSubmit}>
              <label>School<input required value={form.school} onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))} placeholder="Michigan" /></label>
              <div className="form-grid two-column">
                <label>Board rank<input min="1" type="number" value={form.rank} onChange={(event) => setForm((current) => ({ ...current, rank: Math.max(1, Number(event.target.value) || 1) }))} /></label>
                <label>Interest percentage<input min="0" max="100" type="number" value={form.interest} onChange={(event) => setForm((current) => ({ ...current, interest: clampInterest(Number(event.target.value) || 0) }))} /></label>
              </div>
              <label className="checkbox-card"><input type="checkbox" checked={form.offered} onChange={(event) => setForm((current) => ({ ...current, offered: event.target.checked }))} /><span><strong>Official offer received</strong><small>Display this school as an active scholarship offer.</small></span></label>
              <label>Recruiting notes<textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Visit scheduled, playing-time pitch, conference preference..." /></label>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="primary-button compact" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add to board'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
