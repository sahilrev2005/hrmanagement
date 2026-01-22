import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">HR Match AI</h1>
          <p className="text-xs text-slate-400 mt-1">Resource Allocation System</p>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem 
            active={currentView === ViewState.DASHBOARD} 
            onClick={() => onNavigate(ViewState.DASHBOARD)} 
            icon="📊" label="Dashboard" 
          />
          <NavItem 
            active={currentView === ViewState.MATCHING} 
            onClick={() => onNavigate(ViewState.MATCHING)} 
            icon="🧠" label="Match Engine" 
          />
          <NavItem 
            active={currentView === ViewState.EMPLOYEES} 
            onClick={() => onNavigate(ViewState.EMPLOYEES)} 
            icon="👥" label="Employees" 
          />
          <NavItem 
            active={currentView === ViewState.PROJECTS} 
            onClick={() => onNavigate(ViewState.PROJECTS)} 
            icon="📁" label="Projects" 
          />
           <div className="pt-8 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase">Student Tools</p>
          </div>
          <NavItem 
            active={currentView === ViewState.PYTHON_EXPORT} 
            onClick={() => onNavigate(ViewState.PYTHON_EXPORT)} 
            icon="🐍" label="Get Python Code" 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);