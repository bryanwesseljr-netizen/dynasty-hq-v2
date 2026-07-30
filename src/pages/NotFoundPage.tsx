import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 · Play not found</p>
      <h1>That route is out of bounds.</h1>
      <Link className="primary-button compact" to="/dashboard">Return to Dynasty HQ</Link>
    </main>
  );
}
