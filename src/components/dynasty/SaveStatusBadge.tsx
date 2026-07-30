import { CheckCircle2, Cloud, CloudOff, Loader2 } from 'lucide-react';
import type { SaveStatus } from '../../types/dynasty';

interface SaveStatusBadgeProps {
  status: SaveStatus;
}

export function SaveStatusBadge({ status }: SaveStatusBadgeProps) {
  if (status === 'saving' || status === 'dirty') {
    return (
      <span className="save-status saving">
        <Loader2 className="spin" size={16} /> {status === 'dirty' ? 'Changes pending' : 'Saving...'}
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="save-status error">
        <CloudOff size={16} /> Sync failed
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className="save-status saved">
        <CheckCircle2 size={16} /> Saved to cloud
      </span>
    );
  }

  return (
    <span className="save-status idle">
      <Cloud size={16} /> Cloud sync ready
    </span>
  );
}
