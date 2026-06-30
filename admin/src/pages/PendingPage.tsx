import { useAuth } from '../context/AuthContext';

export default function PendingPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Status icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10
                        border border-amber-500/20 rounded-2xl mb-6">
          <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73
                 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          Access Pending
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Your request has been received. An admin will review and approve your
          access shortly. You will be notified via Telegram once approved.
        </p>

        {/* User info */}
        <div className="card text-left mb-6">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full ring-2 ring-surface-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center
                              justify-center text-brand font-semibold text-sm">
                {user.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-100">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>

        <button id="pending-logout" onClick={logout} className="btn-ghost text-slate-500">
          Sign out
        </button>
      </div>
    </div>
  );
}
