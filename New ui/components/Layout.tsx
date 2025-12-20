import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText, ImageIcon, Calculator, QrCode,
  Scale, FileJson, Menu, X, Binary, Scissors, ArrowRightLeft,
  Wand2, ChevronDown, ChevronRight, Snowflake,
  Shield, EyeOff, Palette
} from 'lucide-react';

const SNOWFLAKES = [...Array(50)].map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 10}s`,
  shakeDelay: `${Math.random() * 2}s`,
  opacity: Math.random() * 0.7 + 0.3,
  size: `${Math.random() * 1.2 + 0.5}em`,
  duration: `${Math.random() * 5 + 7}s`
}));

const SnowOverlay: React.FC<{ isSnowing: boolean }> = ({ isSnowing }) => {
  if (!isSnowing) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {SNOWFLAKES.map((s) => (
        <div
          key={s.id}
          className="snowflake"
          style={{
            left: s.left,
            animationDelay: `${s.delay}, ${s.shakeDelay}`,
            animationDuration: `${s.duration}, 3s`,
            opacity: s.opacity,
            fontSize: s.size
          }}
        >
          ❅
        </div>
      ))}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSnowing, setIsSnowing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'PDF & WRITING': true,
    'IMAGE PROCESSING': false,
    'CALCULUS & DATA': false,
    'PRIVACY & SECURITY': false,
    'DESIGN TOOLS': false,
    'UTILITIES': false,
  });

  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <FileJson size={18} />, category: 'main' },
    { label: 'AI Humanizer', path: '/humanizer', icon: <Wand2 size={18} />, category: 'PDF & WRITING' },
    { label: 'Doc Converter', path: '/doc-convert', icon: <FileText size={18} />, category: 'PDF & WRITING' },
    { label: 'Image Converter', path: '/image-convert', icon: <ImageIcon size={18} />, category: 'IMAGE PROCESSING' },
    { label: 'Image Resizer', path: '/image-resize', icon: <ArrowRightLeft size={18} />, category: 'IMAGE PROCESSING' },
    { label: 'ICO Converter', path: '/ico-convert', icon: <ImageIcon size={18} />, category: 'IMAGE PROCESSING' },
    { label: 'Remove Background', path: '/remove-bg', icon: <Scissors size={18} />, category: 'IMAGE PROCESSING' },
    { label: 'Base Converter', path: '/base-convert', icon: <Binary size={18} />, category: 'CALCULUS & DATA' },
    { label: 'Calculus', path: '/calculus', icon: <Calculator size={18} />, category: 'CALCULUS & DATA' },
    { label: 'QR Generator', path: '/qr-code', icon: <QrCode size={18} />, category: 'UTILITIES' },
    { label: 'Unit Converter', path: '/unit-convert', icon: <Scale size={18} />, category: 'CALCULUS & DATA' },
    // PRIVACY & SECURITY
    { label: 'Password Gen', path: '/password-gen', icon: <Shield size={18} />, category: 'PRIVACY & SECURITY' },
    { label: 'Metadata Strip', path: '/metadata-stripper', icon: <EyeOff size={18} />, category: 'PRIVACY & SECURITY' },
    // DESIGN TOOLS
    { label: 'Palette Gen', path: '/palette-gen', icon: <Palette size={18} />, category: 'DESIGN TOOLS' },
  ];

  const categories = ['PDF & WRITING', 'IMAGE PROCESSING', 'CALCULUS & DATA', 'PRIVACY & SECURITY', 'DESIGN TOOLS', 'UTILITIES'];

  const isActive = (path: string) => location.pathname === path;

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-slate-300">
      <div className="p-6 border-b border-white/10 bg-slate-900/50">
        <h1 className="text-2xl font-bold flex items-center gap-3 font-mono tracking-tighter text-white">
          <div className="p-2 bg-indigo-600 text-white">
            <FileText size={20} />
          </div>
          BENPDF
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar space-y-2">
        {/* Main Dashboard Link */}
        <Link
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 border-l-2 ${isActive('/')
            ? 'bg-white/5 border-indigo-500 text-white'
            : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
        >
          <span className={`mr-3 ${isActive('/') ? 'text-indigo-400' : 'text-slate-500'}`}>
            <FileJson size={18} />
          </span>
          <span className="uppercase tracking-wider text-xs">Dashboard</span>
        </Link>

        {/* Categories */}
        {categories.map(cat => {
          const items = navItems.filter(i => i.category === cat);
          const isExpanded = expandedCategories[cat];
          const hasActiveItem = items.some(i => isActive(i.path));

          return (
            <div key={cat} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-full flex items-center justify-between px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${hasActiveItem ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <span>{cat}</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isExpanded && (
                <div className="space-y-1 animate-fade-in">
                  {items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center pl-10 pr-6 py-3 text-sm font-medium transition-all duration-200 border-l-2 ${isActive(item.path)
                        ? 'bg-white/5 border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <span className={`mr-3 ${isActive(item.path) ? 'text-indigo-400' : 'text-slate-500'}`}>
                        {item.icon}
                      </span>
                      <span className="tracking-wide text-[11px] uppercase">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Snow Toggle */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        <button
          onClick={() => setIsSnowing(!isSnowing)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-300 ${isSnowing
            ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
        >
          <div className="flex items-center gap-3">
            <Snowflake size={18} className={isSnowing ? 'animate-spin-slow' : ''} />
            <span className="text-xs font-bold uppercase tracking-widest">Snow Mode</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isSnowing ? 'bg-indigo-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all duration-300 ${isSnowing ? 'left-5' : 'left-1'}`}></div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative font-sans selection:bg-indigo-500/30">
      <SnowOverlay isSnowing={isSnowing} />
      { }
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-30"></div>
      { }
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>
      { }
      <div className="hidden md:flex md:w-72 z-20 border-r border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="w-full h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>
      { }
      <div className="md:hidden fixed top-0 w-full z-30 h-16 flex items-center justify-between px-4 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-600">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-white font-mono tracking-tighter">BENPDF</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      { }
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-slate-900 w-72 h-full shadow-2xl border-r border-white/10">
            <SidebarContent />
          </div>
        </div>
      )}
      { }
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-0 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;