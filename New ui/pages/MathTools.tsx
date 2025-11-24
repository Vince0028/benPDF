import React, { useState } from 'react';
import { BaseConversionResponse, CalculusResponse } from '../types';
import { Copy, ChevronDown } from 'lucide-react';

export const BaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [sourceBase, setSourceBase] = useState('decimal');
  const [targetBase, setTargetBase] = useState('binary');
  const [result, setResult] = useState<BaseConversionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/convert-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputValue: input, sourceBase, targetBase }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <div className="mb-8 border-l-4 border-emerald-500 pl-6 py-2">
        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">Base Converter</h2>
        <p className="text-slate-400 font-mono text-sm">BIN / OCT / DEC / HEX OPERATIONS</p>
      </div>

      <div className="bg-slate-900 border border-white/10 p-6 md:p-10 relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-emerald-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-2 font-mono uppercase">Source Base</label>
            <div className="relative">
              <select
                value={sourceBase} onChange={(e) => setSourceBase(e.target.value)}
                className="w-full p-4 bg-slate-800 border border-slate-600 text-white appearance-none focus:border-emerald-500 outline-none font-mono rounded-none"
              >
                <option value="binary">BINARY (2)</option>
                <option value="octal">OCTAL (8)</option>
                <option value="decimal">DECIMAL (10)</option>
                <option value="hexadecimal">HEXADECIMAL (16)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-emerald-400 mb-2 font-mono uppercase">Input Value</label>
            <input
              type="text"
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER VALUE..."
              className="w-full p-4 bg-slate-800 border border-slate-600 text-white focus:border-emerald-500 outline-none font-mono rounded-none placeholder-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-2 font-mono uppercase">Target Base</label>
            <div className="relative">
              <select
                value={targetBase} onChange={(e) => setTargetBase(e.target.value)}
                className="w-full p-4 bg-slate-800 border border-slate-600 text-white appearance-none focus:border-emerald-500 outline-none font-mono rounded-none"
              >
                <option value="binary">BINARY (2)</option>
                <option value="octal">OCTAL (8)</option>
                <option value="decimal">DECIMAL (10)</option>
                <option value="hexadecimal">HEXADECIMAL (16)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleConvert}
              disabled={loading || !input}
              className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50 rounded-none"
            >
              {loading ? 'COMPUTING...' : 'EXECUTE CONVERSION'}
            </button>
          </div>
        </div>

        {result && !result.error && (
          <div className="mt-10 space-y-6 animate-fade-in">
            <div className="p-6 bg-slate-800 border-l-4 border-emerald-500">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 font-mono">OUTPUT_RESULT</h3>
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl md:text-4xl font-mono font-bold text-white break-all">
                  {result.result || (result.results && result.results[0])}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(result.result || "")}
                  className="p-3 bg-slate-700 hover:bg-slate-600 text-white transition-colors flex-shrink-0 border border-slate-600 rounded-none"
                  title="Copy"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            {result.solution && (
              <div className="bg-black/20 border border-slate-700 p-6">
                <h3 className="font-bold text-white mb-4 font-mono uppercase text-sm border-b border-slate-700 pb-2">
                  PROCESS_LOG
                </h3>
                <div className="font-mono text-xs text-emerald-400/80 whitespace-pre-wrap leading-loose">
                  {result.solution}
                </div>
              </div>
            )}
          </div>
        )}

        {result?.error && (
          <div className="mt-6 p-4 bg-red-900/20 text-red-400 border border-red-500/30 font-mono text-sm">
            ERROR: {result.error}
          </div>
        )}
      </div>
    </div>
  );
};

export const CalculusTool: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [variable, setVariable] = useState('x');
  const [operation, setOperation] = useState('derivative');
  const [order, setOrder] = useState(1);
  const [lower, setLower] = useState('');
  const [upper, setUpper] = useState('');
  const [result, setResult] = useState<CalculusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload: any = { expression, operation, variable };
      if (operation === 'derivative') payload.order = order;
      if (operation === 'integral' && lower && upper) {
        payload.lower = lower;
        payload.upper = upper;
      }
      const res = await fetch('/api/calculus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <div className="mb-8 border-l-4 border-orange-500 pl-6 py-2">
        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">Calculus Engine</h2>
        <p className="text-slate-400 font-mono text-sm">SYMBOLIC COMPUTATION MODULE</p>
      </div>
      <div className="bg-slate-900 border border-white/10 p-6 md:p-10 relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-orange-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500"></div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-orange-400 mb-2 font-mono uppercase">Operation</label>
            <select
              value={operation} onChange={(e) => setOperation(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 text-white outline-none font-mono focus:border-orange-500 rounded-none uppercase"
            >
              <option value="derivative">DERIVATIVE (d/dx)</option>
              <option value="integral">INTEGRAL (∫)</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-orange-400 mb-2 font-mono uppercase">Expression</label>
            <input
              type="text"
              value={expression} onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. sin(x)*x^2 + 3*x"
              className="w-full p-3 bg-slate-800 border border-slate-600 text-white outline-none font-mono focus:border-orange-500 rounded-none placeholder-slate-600 mb-2"
            />
            <div className="grid grid-cols-6 gap-1">
              {['+', '-', '*', '/', '^', '(', ')', 'x', 'sin(', 'cos(', 'tan(', 'sqrt(', 'log(', 'exp(', 'pi'].map((sym) => (
                <button
                  key={sym}
                  type="text" value={variable} onChange={(e) => setVariable(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-600 text-white outline-none font-mono text-center focus:border-orange-500 rounded-none"
                />
          </div>
            {operation === 'derivative' ? (
              <div>
                <label className="block text-xs font-bold text-orange-400 mb-2 font-mono uppercase">Order</label>
                <input
                  type="number" min="1" value={order} onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-800 border border-slate-600 text-white outline-none font-mono text-center focus:border-orange-500 rounded-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-orange-400 mb-2 font-mono uppercase">Lower Bound</label>
                  <input
                    type="text" placeholder="Optional" value={lower} onChange={(e) => setLower(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-600 text-white outline-none font-mono text-center focus:border-orange-500 rounded-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-400 mb-2 font-mono uppercase">Upper Bound</label>
                  <input
                    type="text" placeholder="Optional" value={upper} onChange={(e) => setUpper(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-600 text-white outline-none font-mono text-center focus:border-orange-500 rounded-none placeholder-slate-600"
                  />
                </div>
              </>
            )}
            <div className={operation === 'derivative' ? 'col-span-2' : 'col-span-1'}>
              <label className="block text-xs font-bold text-transparent mb-2 font-mono uppercase">.</label>
              <button
                onClick={handleCalculate}
                disabled={loading || !expression}
                className="w-full p-3 bg-orange-600 hover:bg-orange-500 text-white font-bold font-mono uppercase transition-colors rounded-none"
              >
                {loading ? '...' : 'CALCULATE'}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-8 space-y-4 border-t border-slate-700 pt-6 animate-fade-in">
              <div className="bg-slate-800 border-l-4 border-orange-500 p-4">
                <div className="text-xs font-mono text-orange-400 uppercase mb-1">Result (LaTeX)</div>
                <div className="font-mono text-white text-lg overflow-x-auto">{result.result_latex}</div>
              </div>
              <div className="bg-black/30 border border-slate-800 p-4">
                <div className="text-xs font-mono text-slate-500 uppercase mb-2 border-b border-slate-800 pb-2">Plain Result</div>
                <div className="font-mono text-slate-300 text-sm">{result.result}</div>
              </div>
              <div className="bg-black/30 border border-slate-800 p-4">
                <div className="text-xs font-mono text-slate-500 uppercase mb-2 border-b border-slate-800 pb-2">Computation Steps</div>
                <div className="space-y-1">
                  {result.steps.map((step, i) => (
                    <div key={i} className="font-mono text-xs text-orange-300/70">
                      {`> ${step}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      );
};