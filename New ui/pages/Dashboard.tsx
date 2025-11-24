import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Image as ImageIcon, Calculator, QrCode, 
  Scale, Binary, Scissors, ArrowRightLeft, ArrowRight
} from 'lucide-react';
const tools = [
  { 
    name: 'Doc Converter', 
    desc: 'Convert PDF to DOCX / DOCX to PDF.', 
    path: '/doc-convert', 
    icon: FileText,
    color: 'text-blue-400',
    borderColor: 'hover:border-blue-500'
  },
  { 
    name: 'Image Converter', 
    desc: 'Transform formats: PNG, JPG, WEBP.', 
    path: '/image-convert', 
    icon: ImageIcon,
    color: 'text-purple-400',
    borderColor: 'hover:border-purple-500'
  },
  { 
    name: 'Background Remover', 
    desc: 'AI-powered background removal.', 
    path: '/remove-bg', 
    icon: Scissors,
    color: 'text-pink-400',
    borderColor: 'hover:border-pink-500'
  },
  { 
    name: 'Calculus Tool', 
    desc: 'Symbolic derivatives & integrals.', 
    path: '/calculus', 
    icon: Calculator,
    color: 'text-orange-400',
    borderColor: 'hover:border-orange-500'
  },
  { 
    name: 'Base Converter', 
    desc: 'Binary, Hex, Octal operations.', 
    path: '/base-convert', 
    icon: Binary,
    color: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500'
  },
  { 
    name: 'QR Generator', 
    desc: 'Generate styled QR codes.', 
    path: '/qr-code', 
    icon: QrCode,
    color: 'text-slate-200',
    borderColor: 'hover:border-slate-300'
  },
  { 
    name: 'Unit Converter', 
    desc: 'Mass, Length, Temperature.', 
    path: '/unit-convert', 
    icon: Scale,
    color: 'text-indigo-400',
    borderColor: 'hover:border-indigo-500'
  },
  { 
    name: 'Image Resizer', 
    desc: 'Pixel-perfect resizing.', 
    path: '/image-resize', 
    icon: ArrowRightLeft,
    color: 'text-cyan-400',
    borderColor: 'hover:border-cyan-500'
  },
  { 
    name: 'ICO Converter', 
    desc: 'Create favicons instantly.', 
    path: '/ico-convert', 
    icon: ImageIcon,
    color: 'text-amber-400',
    borderColor: 'hover:border-amber-500'
  },
];
const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in pb-10">
      <header className="mb-12 pt-4">
        <div className="border-l-4 border-indigo-500 pl-6 py-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono tracking-tighter uppercase">
            Dashboard
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl font-mono">
            Explore available conversion and utility tools.
            </p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link 
            key={tool.path} 
            to={tool.path}
            className={`group relative flex flex-col h-full bg-slate-900/50 border border-white/10 p-6 transition-all duration-200 hover:bg-slate-800 ${tool.borderColor}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 bg-white/5 border border-white/10 ${tool.color}`}>
                <tool.icon size={24} />
              </div>
              <ArrowRight className="text-slate-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">{tool.name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tool.desc}
            </p>
            {}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/50 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-white/50 transition-colors"></div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Dashboard;