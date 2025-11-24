import React, { useState } from 'react';
import { Scale, ArrowRight } from 'lucide-react';
const units = {
  temperature: ['celsius', 'fahrenheit', 'kelvin'],
  length: ['meters', 'kilometers', 'miles', 'feet', 'inches'],
  mass: ['kilograms', 'grams', 'pounds', 'ounces'],
};
const UnitConverter: React.FC = () => {
  const [type, setType] = useState<'temperature' | 'length' | 'mass'>('length');
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('meters');
  const [to, setTo] = useState('feet');
  const [result, setResult] = useState<number | null>(null);
  const handleConvert = async () => {
    if(!value) return;
    try {
      const res = await fetch('/api/convert-unit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ value, fromUnit: from, toUnit: to, unitType: type })
      });
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      console.error(e);
    }
  };
  const handleTypeChange = (newType: 'temperature' | 'length' | 'mass') => {
    setType(newType);
    setFrom(units[newType][0]);
    setTo(units[newType][1]);
    setResult(null);
    setValue('');
  };
  return (
    <div className="max-w-2xl mx-auto pt-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white font-mono uppercase">Unit Converter</h2>
        <div className="h-1 w-16 bg-indigo-500 mx-auto mt-2"></div>
      </div>
      <div className="bg-slate-900 border border-white/10 p-8 relative">
         {}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 via-indigo-500 to-slate-900 opacity-50"></div>
        {}
        <div className="flex border border-slate-700 mb-8">
          {(Object.keys(units) as Array<keyof typeof units>).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex-1 py-3 text-xs font-bold font-mono uppercase transition-all ${
                type === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Input Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-4 text-2xl font-bold font-mono text-center bg-slate-800 border border-slate-600 text-white focus:border-indigo-500 outline-none rounded-none placeholder-slate-600"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 font-mono uppercase">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 text-white font-mono uppercase outline-none rounded-none"
              >
                {units[type].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="text-indigo-500 pt-4">
              <ArrowRight />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 font-mono uppercase">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 text-white font-mono uppercase outline-none rounded-none"
              >
                 {units[type].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleConvert}
            className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold font-mono uppercase tracking-wider transition-colors rounded-none"
          >
            Convert
          </button>
          {result !== null && (
            <div className="mt-8 p-6 border border-indigo-500/30 bg-indigo-500/10 text-center animate-fade-in">
               <p className="text-indigo-400 text-xs font-mono uppercase mb-1">Calculated Result</p>
               <p className="text-4xl font-bold text-white font-mono">{result} <span className="text-base text-slate-400 font-normal uppercase">{to}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default UnitConverter;