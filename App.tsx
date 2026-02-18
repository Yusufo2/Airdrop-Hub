import React, { useState } from 'react';
import { AirdropFeed } from './components/AirdropFeed';
import { SubmitAirdrop } from './components/SubmitAirdrop';
import { 
  RocketLaunchIcon, 
  PlusCircleIcon, 
  GiftIcon
} from '@heroicons/react/24/outline';

enum ActiveView {
  FEED = 'FEED',
  SUBMIT = 'SUBMIT'
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.FEED);

  const renderContent = () => {
    switch (activeView) {
      case ActiveView.FEED:
        return <AirdropFeed />;
      case ActiveView.SUBMIT:
        return <SubmitAirdrop onBack={() => setActiveView(ActiveView.FEED)} />;
      default:
        return <AirdropFeed />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ActiveView, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`group flex flex-col items-center justify-center p-3 w-full rounded-xl transition-all duration-300 relative overflow-hidden ${
        activeView === view 
          ? 'text-white' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {/* Active background glow */}
      {activeView === view && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl pointer-events-none" />
      )}
      
      {/* Icon with glow effect if active */}
      <div className={`relative transition-transform duration-300 ${activeView === view ? 'transform -translate-y-1' : ''}`}>
        <Icon className={`w-6 h-6 mb-1 transition-colors duration-300 ${
            activeView === view ? 'text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-current'
        }`} />
      </div>
      
      <span className={`text-xs font-medium transition-opacity duration-300 ${
          activeView === view ? 'opacity-100 text-primary' : 'opacity-70'
      }`}>
          {label}
      </span>
      
      {/* Bottom indicator bar */}
      {activeView === view && (
         <div className="absolute bottom-1 w-8 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto overflow-hidden relative">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b border-white/5 glass z-20">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 rounded-xl bg-dark flex items-center justify-center ring-1 ring-white/10">
                <GiftIcon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary tracking-tight">
              Airdrop Hub
            </h1>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Live Alpha</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-10">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-none glass border-t border-white/5 pb-safe z-20">
        <div className="grid grid-cols-2 gap-2 p-2 max-w-lg mx-auto">
          <NavItem view={ActiveView.FEED} icon={RocketLaunchIcon} label="Feed" />
          <NavItem view={ActiveView.SUBMIT} icon={PlusCircleIcon} label="Submit" />
        </div>
      </nav>
    </div>
  );
};

export default App;