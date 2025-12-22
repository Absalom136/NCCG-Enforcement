import React from 'react';
import { LayoutDashboard, Search, PlusCircle, Users, Menu, X, ShieldAlert, Zap, ZapOff, Home, ClipboardList } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isAiConnected: boolean;
  onConnectAi: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, isAiConnected, onConnectAi, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItemSidebar = ({ view, label, icon: Icon }: { view: AppView; label: string; icon: any }) => (
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

  const MobileTab = ({ view, label, icon: Icon }: { view: AppView; label: string; icon: any }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${
        currentView === view ? 'text-[#00875a]' : 'text-gray-400'
      }`}
    >
      <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
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
          <NavItemSidebar view={AppView.DASHBOARD} label="Dashboard" icon={LayoutDashboard} />
          <NavItemSidebar view={AppView.SEARCH} label="Search Records" icon={Search} />
          <NavItemSidebar view={AppView.NEW_ENTRY} label="New Entry" icon={PlusCircle} />
          <NavItemSidebar view={AppView.ADMIN_STRUCTURE} label="Admin Hierarchy" icon={Users} />
        </nav>
        
        <div className="p-4 border-t border-gray-800">
            <button 
                onClick={onConnectAi}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    isAiConnected 
                    ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                }`}
            >
                {isAiConnected ? <Zap size={16} /> : <ZapOff size={16} />}
                <span>{isAiConnected ? 'AI Active' : 'Enable AI Tools'}</span>
            </button>
        </div>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <p>© 2025 Nairobi City County</p>
          <p className="mt-1">v1.0.0 (Beta)</p>
        </div>
      </aside>

      {/* Mobile Header (Portal Style) */}
      <div className="md:hidden bg-white text-gray-900 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
           <span className="text-lg font-bold text-gray-800">
             {currentView === AppView.DASHBOARD ? 'Enforcement Portal' : 
              currentView === AppView.SEARCH ? 'Records' : 
              currentView === AppView.NEW_ENTRY ? 'New Entry' : 'Admin'}
           </span>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={onConnectAi} className={isAiConnected ? 'text-green-600' : 'text-indigo-400'}>
                {isAiConnected ? <Zap size={22} /> : <ZapOff size={22} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900/95 z-50 pt-16 px-4 pb-4 space-y-2 backdrop-blur-md">
          <div className="flex justify-end p-4">
             <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={32}/></button>
          </div>
          <NavItemSidebar view={AppView.DASHBOARD} label="Home Portal" icon={Home} />
          <NavItemSidebar view={AppView.SEARCH} label="Search Records" icon={Search} />
          <NavItemSidebar view={AppView.NEW_ENTRY} label="New Entry" icon={PlusCircle} />
          <NavItemSidebar view={AppView.ADMIN_STRUCTURE} label="Admin Hierarchy" icon={Users} />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${currentView === AppView.DASHBOARD ? 'md:ml-64 p-0' : 'md:ml-64 p-4 md:p-8'} transition-all duration-300 pb-24 md:pb-8`}>
        <div className={currentView === AppView.DASHBOARD ? "" : "max-w-6xl mx-auto"}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-1 flex justify-between items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <MobileTab view={AppView.DASHBOARD} label="Portal" icon={Home} />
        <div className="w-16"></div> {/* Spacer for FAB */}
        <MobileTab view={AppView.SEARCH} label="Search" icon={ClipboardList} />
        
        {/* Mobile FAB */}
        <button 
          onClick={() => setCurrentView(AppView.NEW_ENTRY)}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00875a] text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <PlusCircle size={32} />
        </button>
      </div>
    </div>
  );
};

export default Layout;