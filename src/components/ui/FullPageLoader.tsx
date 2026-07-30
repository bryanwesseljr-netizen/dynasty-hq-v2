import { LoaderCircle } from 'lucide-react';

export function FullPageLoader({ label }: { label: string }) {
  return (
    <main className="full-page-loader">
      <div className="loader-badge">
        <LoaderCircle className="spin" size={30} />
        <span>{label}</span>
      </div>
    </main>
  );
}
