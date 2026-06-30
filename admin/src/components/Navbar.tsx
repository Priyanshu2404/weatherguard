import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/dashboard',
    label: 'Users',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952
             4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07
             M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766
             l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75
             0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625
             2.625 0 015.25 0z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398
             1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127
             .324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49
             l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613
             -.438.995v.01c0 .381.145.754.438.994l1.003.828c.424.35.534.954.26
             1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456
             c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495
             -.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398
             -1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0
             01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0
             01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827
             c.292-.24.437-.613.437-.995v-.001c0-.382-.145-.754-.438-.994l-1.003-.828
             a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491
             l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128
             .332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    adminOnly: false,
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user.role === 'admin',
  );

  return (
    <nav className="h-screen w-56 flex-shrink-0 bg-surface-card border-r border-surface-border
                    flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand/10 border border-brand/20 rounded-lg
                          flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78
                   2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-none">WeatherGuard</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            id={`nav-${item.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
               transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand-light'
                  : 'text-slate-400 hover:bg-surface-hover hover:text-slate-100'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* User / logout */}
      <div className="px-3 py-4 border-t border-surface-border">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full ring-1 ring-surface-border flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center
                            justify-center text-brand text-xs font-semibold flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          id="nav-logout"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                     text-slate-500 hover:text-slate-300 hover:bg-surface-hover
                     transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25
                 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15
                 M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </button>
      </div>
    </nav>
  );
}
