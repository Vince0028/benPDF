import React, { useState } from 'react';
import { Shield, Copy, RefreshCw, CheckCircle2, Terminal } from 'lucide-react';

const PasswordGenerator: React.FC = () => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        const charset = 'abcdefghijklmnopqrstuvwxyz' +
            (includeUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') +
            (includeNumbers ? '0123456789' : '') +
            (includeSymbols ? '!@#$%^&*()_+~`|}{[]:;?><,./-=' : '');

        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(result);
        setCopied(false);
    };

    const copyToClipboard = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto pt-4 animate-fade-in">
            <div className="mb-8 border-l-4 border-rose-500 pl-6 py-2">
                <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">Password Gen</h2>
                <p className="text-slate-400 font-mono text-sm">Generate secure hex/alpha passwords with zero logging.</p>
            </div>

            <div className="bg-slate-900 border border-white/10 relative">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-500"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-500"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-500"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-500"></div>

                <div className="p-8 space-y-8">
                    <div className="relative">
                        <label className="block text-xs font-bold text-rose-400 mb-2 font-mono uppercase">Generated Sequence</label>
                        <div className="flex items-center border border-slate-600 bg-slate-800/50">
                            <div className="px-3 text-slate-500"><Terminal size={16} /></div>
                            <input
                                type="text"
                                readOnly
                                value={password}
                                placeholder="--- INITIATE SEQUENCE ---"
                                className="w-full px-4 py-4 bg-transparent text-white focus:outline-none font-mono text-lg tracking-wider"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="p-4 text-slate-400 hover:text-white transition-colors border-l border-slate-600"
                            >
                                {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-rose-400 font-mono uppercase">Entropy Length: {length}</label>
                            </div>
                            <input
                                type="range"
                                min="8"
                                max="64"
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { label: 'UPPERCASE_CHAR', state: includeUppercase, setter: setIncludeUppercase },
                                { label: 'NUMERIC_VAL', state: includeNumbers, setter: setIncludeNumbers },
                                { label: 'SPECIAL_SYMB', state: includeSymbols, setter: setIncludeSymbols },
                            ].map((opt) => (
                                <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={opt.state}
                                            onChange={(e) => opt.setter(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none border border-slate-600 bg-slate-800 checked:bg-rose-500 transition-all"
                                        />
                                        <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-1" />
                                    </div>
                                    <span className="text-slate-400 font-mono text-xs group-hover:text-white transition-colors">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={generatePassword}
                        className="w-full flex items-center justify-center py-4 px-6 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 font-mono uppercase tracking-wider transition-all shadow-lg shadow-rose-600/10"
                    >
                        <RefreshCw size={18} className="mr-3" />
                        Initiate Generation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordGenerator;
