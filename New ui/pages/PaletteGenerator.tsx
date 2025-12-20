import React, { useState, useRef, useEffect } from 'react';
import { Palette, Copy, CheckCircle2, RefreshCw, Hash, Download, Image as ImageIcon, Terminal, ExternalLink, Code, Database, Monitor } from 'lucide-react';

const PALETTE_PRESETS = {
    'DARK_MODE': { hue: [200, 260], sat: [15, 40], lum: [5, 45] },
    'MINT_TEA': { hue: [140, 170], sat: [20, 70], lum: [30, 95] },
    'OCEAN_BLUE': { hue: [190, 240], sat: [40, 90], lum: [10, 85] },
    'NEON_CYBER': { hue: [180, 340], sat: [70, 100], lum: [20, 80] },
    'PASTEL_VIBE': { hue: [0, 360], sat: [10, 50], lum: [60, 98] },
};

const PaletteGenerator: React.FC = () => {
    const [palettes, setPalettes] = useState<string[][]>([]);
    const [activeCategory, setActiveCategory] = useState<keyof typeof PALETTE_PRESETS | 'ALL'>('ALL');
    const [previewPalette, setPreviewPalette] = useState<string[]>(['#020617', '#1E293B', '#334155', '#38BDF8', '#F8FAFC']);
    const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
    const [copiedColor, setCopiedColor] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = (s * Math.min(l, 1 - l)) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const generatePalettes = () => {
        setIsGenerating(true);
        const newPalettes = [];

        for (let i = 0; i < 50; i++) {
            const catKey = activeCategory === 'ALL'
                ? (Object.keys(PALETTE_PRESETS) as Array<keyof typeof PALETTE_PRESETS>)[Math.floor(Math.random() * Object.keys(PALETTE_PRESETS).length)]
                : activeCategory;

            const preset = PALETTE_PRESETS[catKey];
            const baseHue = Math.floor(Math.random() * (preset.hue[1] - preset.hue[0] + 1)) + preset.hue[0];

            // Smart Spread: Force a range of lightness levels to ensure high contrast
            // [Background, Surface, Mid, Accent, Text/Highlight]
            const lightnessSteps = [
                Math.floor(Math.random() * (preset.lum[0] + (preset.lum[1] - preset.lum[0]) * 0.2)), // Low
                Math.floor(preset.lum[0] + (preset.lum[1] - preset.lum[0]) * 0.4),                // Mid-Low
                Math.floor(preset.lum[0] + (preset.lum[1] - preset.lum[0]) * 0.6),                // Mid
                Math.floor(preset.lum[0] + (preset.lum[1] - preset.lum[0]) * 0.8),                // Mid-High
                Math.floor(Math.random() * (preset.lum[1] - preset.lum[1] * 0.1) + preset.lum[1] * 0.1) // High
            ].sort((a, b) => a - b);

            const palette = lightnessSteps.map((l, index) => {
                const h = (baseHue + (index * 12)) % 360;
                const s = Math.floor(Math.random() * (preset.sat[1] - preset.sat[0] + 1)) + preset.sat[0];
                return hslToHex(h, s, l);
            });

            newPalettes.push(palette);
        }
        setPalettes(newPalettes);
        if (newPalettes.length > 0) {
            setPreviewPalette(newPalettes[0]);
        }
        setTimeout(() => setIsGenerating(false), 500);
    };

    useEffect(() => {
        generatePalettes();
    }, [activeCategory]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(label);
        setTimeout(() => setCopiedColor(''), 2000);
    };

    const getExportString = (format: 'CSS' | 'JSON' | 'TAILWIND') => {
        if (format === 'CSS') {
            return previewPalette.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
        }
        if (format === 'JSON') {
            return JSON.stringify(previewPalette, null, 2);
        }
        return `colors: {\n  brand: {\n${previewPalette.map((c, i) => `    ${(i + 1) * 100}: '${c}',`).join('\n')}\n  }\n}`;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const colors: { [key: string]: number } = {};
            for (let i = 0; i < imageData.length; i += 400) {
                const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
                colors[hex] = (colors[hex] || 0) + 1;
            }
            const sortedColors = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([color]) => color);
            setExtractedPalette(sortedColors);
            setPreviewPalette(sortedColors);
        };
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pt-4 pb-20 space-y-12">
            <header className="border-l-4 border-fuchsia-500 pl-6 py-2">
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white font-mono uppercase tracking-tighter">Palette Gen <span className="text-fuchsia-500 italic">2.0</span></h2>
                    <span className="text-[10px] bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/50 px-3 py-1 font-bold font-mono tracking-widest animate-pulse">SYSTEM_ACTIVE</span>
                </div>
                <p className="text-slate-400 font-mono text-sm max-w-2xl">High-fidelity color matrices for next-gen interface development. Extract, generate, and preview live UI structures.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Generator & List */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/10 p-6 space-y-6 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-fuchsia-600/10 transition-colors"></div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-fuchsia-400 font-mono uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} /> Matrix_Selector
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['ALL', ...Object.keys(PALETTE_PRESETS)].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat as any)}
                                        className={`px-3 py-3 text-[9px] font-bold font-mono uppercase transition-all border ${activeCategory === cat ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:border-white/20'}`}
                                    >
                                        {cat.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={generatePalettes}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-fuchsia-500 hover:text-white p-4 text-xs font-black font-mono uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                                Regenerate_Matrix
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-white/10 relative p-4">
                        <h3 className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-4 px-2">Recent_Harmonies</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {palettes.map((palette, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setPreviewPalette(palette)}
                                    className={`flex h-12 cursor-pointer border transition-all hover:scale-[1.02] ${previewPalette === palette ? 'border-fuchsia-500 p-1 bg-fuchsia-500/5' : 'border-white/5 p-1 hover:border-white/20'}`}
                                >
                                    {palette.map((c, i) => (
                                        <div key={i} className="flex-1" style={{ backgroundColor: c }}></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Column: Live Preview & Export */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-slate-900 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-fuchsia-500"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-fuchsia-500"></div>

                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-fuchsia-400 font-mono uppercase tracking-widest flex items-center gap-2">
                                    <Monitor size={14} /> Neural_Interface_Preview
                                </h3>
                            </div>

                            {/* Mockup Preview */}
                            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ backgroundColor: previewPalette[0] }}>
                                <div className="p-4 flex items-center justify-between border-b border-white/5" style={{ backgroundColor: previewPalette[1] }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: previewPalette[3] }}></div>
                                        <div className="w-16 h-2 rounded-full opacity-20" style={{ backgroundColor: previewPalette[4] }}></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-10 h-4 rounded-sm" style={{ backgroundColor: previewPalette[3] }}></div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <div className="h-4 w-3/4 rounded-sm" style={{ backgroundColor: previewPalette[4] }}></div>
                                        <div className="h-2 w-1/2 rounded-full opacity-40" style={{ backgroundColor: previewPalette[4] }}></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="aspect-[4/3] rounded-lg p-4 flex flex-col justify-end gap-2" style={{ backgroundColor: previewPalette[2] }}>
                                            <div className="h-2 w-full rounded-full opacity-25" style={{ backgroundColor: previewPalette[4] }}></div>
                                            <div className="h-6 w-1/2 rounded-md" style={{ backgroundColor: previewPalette[3] }}></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-10 w-full rounded-md border-2" style={{ borderColor: previewPalette[3] }}></div>
                                            <div className="h-10 w-full rounded-md shadow-lg" style={{ backgroundColor: previewPalette[3], boxShadow: `0 8px 16px -4px ${previewPalette[3]}66` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Export Options */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'CSS', icon: <Code size={12} />, format: 'CSS' as const },
                                    { label: 'JSON', icon: <Database size={12} />, format: 'JSON' as const },
                                    { label: 'Tailwind', icon: <Hash size={12} />, format: 'TAILWIND' as const }
                                ].map(opt => (
                                    <button
                                        key={opt.label}
                                        onClick={() => copyToClipboard(getExportString(opt.format), opt.label)}
                                        className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 border border-white/5 hover:border-fuchsia-500/50 hover:bg-slate-800 transition-all text-[9px] font-mono text-slate-400 group"
                                    >
                                        <span className="group-hover:text-fuchsia-400">{opt.icon}</span>
                                        <span className="uppercase font-bold group-hover:text-white">{copiedColor === opt.label ? 'COPIED!' : opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Source & Data */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-slate-900 border border-white/10 p-6 space-y-8">
                        <h3 className="text-xs font-bold text-fuchsia-400 font-mono uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} /> Source_Analysis
                        </h3>

                        <div className="border border-dashed border-white/10 p-6 text-center hover:border-fuchsia-500/50 transition-colors relative cursor-pointer bg-slate-800/20 group">
                            <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                            <ImageIcon className="text-slate-600 group-hover:text-fuchsia-400 transition-colors mx-auto mb-3" size={32} />
                            <p className="text-slate-500 text-[9px] font-mono uppercase font-bold tracking-widest">Import_Source</p>
                        </div>

                        <div className="space-y-3">
                            {previewPalette.map((color, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-800/30 p-2 border border-white/5 group hover:border-fuchsia-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center font-mono text-[8px] text-white/50 border border-white/10" style={{ backgroundColor: color }}>
                                            {i + 1}
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-400 group-hover:text-white">{color}</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(color, color)}
                                        className="text-slate-600 hover:text-fuchsia-400 transition-colors"
                                    >
                                        {copiedColor === color ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default PaletteGenerator;
