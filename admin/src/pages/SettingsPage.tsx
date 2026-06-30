import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUpdateCity } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const { user } = useAuth();
  const updateCity = useUpdateCity();
  const [city, setCity] = useState(user?.city ?? '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateCity.mutateAsync(city);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure your weather alert preferences
        </p>
      </div>

      {/* Account info */}
      <div className="card space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Account</h3>
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full ring-2 ring-surface-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center
                            justify-center text-brand font-semibold">
              {user.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Telegram section */}
      <div className="card space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Telegram</h3>
        {user.telegramChatId ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Telegram account linked
            {user.telegramUsername && (
              <span className="text-slate-400">(@{user.telegramUsername})</span>
            )}
          </div>
        ) : user.status === 'approved' && user.telegramLinkToken ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Send the following command to the bot to link your account:
            </p>
            <code className="block text-sm text-amber-400 bg-amber-400/10 border
                             border-amber-400/20 rounded-lg px-4 py-3 font-mono break-all">
              /link {user.telegramLinkToken}
            </code>
            <p className="text-xs text-slate-500">
              After linking, use{' '}
              <code className="text-slate-400">/setcity CITY_NAME</code> in the bot
              to set your alert location, or update it below.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Telegram linking will be available once your account is approved.
          </p>
        )}
      </div>

      {/* City preference */}
      <div className="card space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Alert City</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="city-input" className="block text-xs text-slate-500 mb-1.5">
              City name (used for weather alerts)
            </label>
            <input
              id="city-input"
              type="text"
              className="input"
              placeholder="e.g. London, Mumbai, New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          {saved && (
            <p className="text-xs text-emerald-400">City updated successfully.</p>
          )}
          {updateCity.isError && (
            <p className="text-xs text-red-400">Failed to update city. Try again.</p>
          )}

          <button
            id="save-city-btn"
            type="submit"
            disabled={updateCity.isPending || !city.trim()}
            className="btn-primary"
          >
            {updateCity.isPending ? <LoadingSpinner size="sm" /> : null}
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
