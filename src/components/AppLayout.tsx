import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, 
  FlaskConical, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  Menu, 
  X, 
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation: SidebarItem[] = [
    { name: 'Experiment', path: '/experiment', icon: <Compass className="w-5 h-5" /> },
    { name: 'Lab', path: '/lab', icon: <FlaskConical className="w-5 h-5" /> },
    { name: 'Notebook', path: '/notebook', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Explain', path: '/explain', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Map path to display name for breadcrumbs
  const getBreadcrumbName = (pathname: string) => {
    if (pathname === '/') return 'Home';
    const cleanPath = pathname.substring(1);
    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  };

  return (
    <div className="min-h-screen bg-bg-darkest flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border-subtle bg-bg-dark z-20">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-6 border-b border-border-subtle gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-bg-panel border border-border-muted shadow-glow">
              {/* Ripple SVG minimal logo */}
              <svg className="w-5 h-5 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="7" strokeDasharray="3 3" />
                <circle cx="12" cy="12" r="10" strokeOpacity="0.5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-wider text-text-primary uppercase font-mono">
              Ripple
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-150 gap-3 group
                  ${isActive 
                    ? 'bg-bg-panel text-accent-cyan border border-border-muted shadow-sm shadow-accent-cyan-glow' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel/50 border border-transparent'
                  }
                `}
              >
                {item.icon}
                <span className="font-mono tracking-tight">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border-subtle bg-bg-panel/20">
            <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
              <span>SYS STATUS:</span>
              <span className="flex items-center gap-1.5 text-status-available">
                <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
                STABLE
              </span>
            </div>
            <div className="text-[9px] font-mono text-text-muted mt-1">
              BUILD: v0.1.0-ALPHA
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="flex flex-col flex-1 md:pl-64">
        <header className="sticky top-0 z-10 md:relative h-16 border-b border-border-subtle bg-bg-darkest/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan rounded"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center text-xs font-mono text-text-secondary">
              <NavLink to="/" className="hover:text-text-primary transition-colors">RIPPLE</NavLink>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-text-muted" />
              <span className="text-text-primary tracking-wide font-semibold">
                {getBreadcrumbName(location.pathname).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Minimal top status metric */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-bg-panel/40 border border-border-subtle rounded-md text-xs font-mono text-text-secondary">
              <span className="text-text-muted">EXP:</span>
              <span className="text-text-primary">NONE ACTIVE</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Sidebar panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-bg-dark border-r border-border-subtle pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center px-6 gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-panel border border-border-muted shadow-glow">
                <svg className="w-5 h-5 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="7" strokeDasharray="3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-wider text-text-primary uppercase font-mono">
                Ripple
              </span>
            </div>

            {/* Navigation links */}
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 text-base font-medium rounded-md gap-3
                    ${isActive 
                      ? 'bg-bg-panel text-accent-cyan border border-border-muted shadow-sm shadow-accent-cyan-glow' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel/50 border border-transparent'
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-mono">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border-subtle bg-bg-panel/20">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>SYS STATUS:</span>
                <span className="flex items-center gap-1.5 text-status-available">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
                  STABLE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AppLayout;
