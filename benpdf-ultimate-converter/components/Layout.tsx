import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, Image as ImageIcon, Calculator, QrCode, 
  Scale, FileJson, Menu, X, Binary, Scissors, ArrowRightLeft
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <FileJson size={18} />, category: 'main' },
    { label: 'Doc Converter', path: '/doc-convert', icon: <FileText size={18} />, category: 'files' },
    { label: 'Image Converter', path: '/image-convert', icon: <ImageIcon size={18} />, category: 'files' },
    { label: 'Image Resizer', path: '/image-resize', icon: <ArrowRightLeft size={18} />, category: 'files' },
    { label: 'ICO Converter', path: '/ico-convert', icon: <ImageIcon size={18} />, category: 'files' },
    { label: 'Remove Background', path: '/remove-bg', icon: <Scissors size={18} />, category: 'files' },
    { label: 'Base Converter', path: '/base-convert', icon: <Binary size={18} />, category: 'math' },
    { label: 'Calculus', path: '/calculus', icon: <Calculator size={18} />, category: 'math' },
    { label: 'QR Generator', path: '/qr-code', icon: <QrCode size={18} />, category: 'utilities' },
    { label: 'Unit Converter', path: '/unit-convert', icon: <Scale size={18} />, category: 'utilities' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-slate-300">
      <div className="p-6 border-b border-white/10 bg-slate-900/50">
        <h1 className="text-2xl font-bold flex items-center gap-3 font-mono tracking-tighter text-white">
          <div className="p-2 bg-indigo-600 text-white">
            <FileText size={20} />
          </div>
          BENPDF_V1
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-0 custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-l-2 ${
              isActive(item.path)
                ? 'bg-white/5 border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white hover:border-slate-600'
            }`}
          >
            <span className={`mr-3 ${isActive(item.path) ? 'text-indigo-400' : 'text-slate-500'}`}>
              {item.icon}
            </span>
            <span className="uppercase tracking-wider text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative font-sans selection:bg-indigo-500/30">
      {/* Tech Background */}
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-30"></div>
      
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 z-20 border-r border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="w-full h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
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

      {/* Mobile Sidebar Overlay */}
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

      {/* Main Content */}
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