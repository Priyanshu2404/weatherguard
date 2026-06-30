import { useState } from 'react';
import { useUsers, useUpdateStatus, useTriggerAlerts } from '../hooks/useUsers';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function DashboardPage() {
  const { data: users, isLoading, isError } = useUsers();
  const updateStatus = useUpdateStatus();
  const triggerAlerts = useTriggerAlerts();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [triggerMessage, setTriggerMessage] = useState('');

  const filtered = users?.filter((u) =>
    filter === 'all' ? true : u.status === filter,
  );

  const counts = {
    all: users?.length ?? 0,
    pending: users?.filter((u) => u.status === 'pending').length ?? 0,
    approved: users?.filter((u) => u.status === 'approved').length ?? 0,
    rejected: users?.filter((u) => u.status === 'rejected').length ?? 0,
  };

  const handleTrigger = async () => {
    try {
      await triggerAlerts.mutateAsync();
      setTriggerMessage('Weather alerts dispatched successfully.');
    } catch {
      setTriggerMessage('Failed to dispatch alerts. Check server logs.');
    }
    setTimeout(() => setTriggerMessage(''), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card text-sm text-red-400">
        Failed to load users. You may not have admin access.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage access requests and user status
          </p>
        </div>

        <button
          id="trigger-alerts-btn"
          onClick={handleTrigger}
          disabled={triggerAlerts.isPending}
          className="btn-primary"
        >
          {triggerAlerts.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          Dispatch Alerts
        </button>
      </div>

      {triggerMessage && (
        <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20
                        rounded-lg px-4 py-3">
          {triggerMessage}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1 w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            id={`filter-${tab}`}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === tab
                ? 'bg-brand text-white'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-xs ${filter === tab ? 'text-blue-200' : 'text-slate-600'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Telegram
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  City
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {filtered?.map((user) => (
                <tr key={user._id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full ring-1 ring-surface-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center
                                        justify-center text-brand text-xs font-semibold flex-shrink-0">
                          {user.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 capitalize">{user.provider ?? '—'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {user.telegramChatId ? (
                      <span className="text-emerald-400">
                        {user.telegramUsername ? `@${user.telegramUsername}` : 'Linked'}
                      </span>
                    ) : user.status === 'approved' && user.telegramLinkToken ? (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Link token:</p>
                        <code className="text-xs text-amber-400 bg-amber-400/10
                                         px-2 py-0.5 rounded font-mono break-all">
                          {user.telegramLinkToken}
                        </code>
                      </div>
                    ) : (
                      <span className="text-slate-600">Not linked</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {user.city ?? <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.status !== 'approved' && (
                        <button
                          id={`approve-${user._id}`}
                          onClick={() =>
                            updateStatus.mutate({ id: user._id, status: 'approved' })
                          }
                          disabled={updateStatus.isPending}
                          className="btn-success"
                        >
                          Approve
                        </button>
                      )}
                      {user.status !== 'rejected' && (
                        <button
                          id={`reject-${user._id}`}
                          onClick={() =>
                            updateStatus.mutate({ id: user._id, status: 'rejected' })
                          }
                          disabled={updateStatus.isPending}
                          className="btn-danger"
                        >
                          Reject
                        </button>
                      )}
                      {user.status === 'rejected' && (
                        <button
                          id={`restore-${user._id}`}
                          onClick={() =>
                            updateStatus.mutate({ id: user._id, status: 'pending' })
                          }
                          disabled={updateStatus.isPending}
                          className="btn-ghost text-xs"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
