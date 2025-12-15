import React from 'react';
import { LayoutDashboard, Search, PlusCircle, Users, Menu, X, ShieldAlert } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, label, icon: Icon }: { view: AppView; label: string; icon: any }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentView === view
          ? 'bg-yellow-400 text-black font-semibold shadow-sm'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 z-30 shadow-xl">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
            <div className="bg-yellow-400 p-2 rounded-full text-gray-900">
                <ShieldAlert size={24} />
            </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">NCC Enforcement</h1>
            <p className="text-xs text-gray-400">Automation App</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view={AppView.DASHBOARD} label="Dashboard" icon={LayoutDashboard} />
          <NavItem view={AppView.SEARCH} label="Search Records" icon={Search} />
          <NavItem view={AppView.NEW_ENTRY} label="New Entry" icon={PlusCircle} />
          <NavItem view={AppView.ADMIN_STRUCTURE} label="Admin Hierarchy" icon={Users} />
        </nav>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <p>© 2025 Nairobi City County</p>
          <p className="mt-1">v1.0.0 (Beta)</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
            <div className="bg-yellow-400 p-1.5 rounded-full text-gray-900">
                <ShieldAlert size={20} />
            </div>
          <span className="font-bold">NCC Enforcement</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900 z-30 pt-16 px-4 pb-4 space-y-2">
          <NavItem view={AppView.DASHBOARD} label="Dashboard" icon={LayoutDashboard} />
          <NavItem view={AppView.SEARCH} label="Search Records" icon={Search} />
          <NavItem view={AppView.NEW_ENTRY} label="New Entry" icon={PlusCircle} />
          <NavItem view={AppView.ADMIN_STRUCTURE} label="Admin Hierarchy" icon={Users} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
