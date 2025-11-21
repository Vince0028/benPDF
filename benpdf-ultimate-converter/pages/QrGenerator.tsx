import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Loader2, Download, Settings } from 'lucide-react';

const QrGenerator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [style, setStyle] = useState('square');
  const [logoSize, setLogoSize] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('url', url);
    formData.append('fgColor', fgColor);
    formData.append('bgColor', bgColor);
    formData.append('style', style);
    formData.append('logoSize', logoSize.toString());
    if (logo) formData.append('logo', logo);

    try {
      const res = await fetch('/api/generate-qrcode', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("Error generating QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-4">
      <div className="mb-8 border-l-4 border-slate-400 pl-6 py-2">
        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">QR Code Matrix</h2>
        <p className="text-slate-400 font-mono text-sm">// DATA ENCODING MODULE</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-white/10 p-8 relative">
             {/* Tech deco */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Target URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white outline-none focus:border-white rounded-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-10 w-10 p-0 border border-slate-600 cursor-pointer rounded-none"
                    />
                    <input 
                        type="text" 
                        value={fgColor} 
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-none font-mono text-sm uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-10 p-0 border border-slate-600 cursor-pointer rounded-none"
                    />
                    <input 
                        type="text" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-none font-mono text-sm uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Matrix Style</label>
                 <div className="flex gap-0 border border-slate-700">
                    {['square', 'rounded', 'dots'].map((s) => (
                        <label key={s} className={`flex-1 p-4 cursor-pointer hover:bg-slate-800 transition-all text-center ${style === s ? 'bg-slate-800 text-white font-bold' : 'bg-slate-900 text-slate-500'}`}>
                            <input 
                                type="radio" 
                                name="style" 
                                value={s} 
                                checked={style === s} 
                                onChange={(e) => setStyle(e.target.value)}
                                className="hidden"
                            />
                            <span className="uppercase font-mono text-xs">{s}</span>
                        </label>
                    ))}
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Logo Overlay (Optional)</label>
                <FileUploader accept=".png,.jpg,.jpeg" onFileSelect={setLogo} helperText="IMG FORMAT: PNG/JPG" />
              </div>
              
              {logo && (
                  <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Logo Scale ({logoSize}%)</label>
                      <input 
                        type="range" 
                        min="10" 
                        max="40" 
                        value={logoSize} 
                        onChange={(e) => setLogoSize(parseInt(e.target.value))} 
                        className="w-full accent-white h-2 bg-slate-700 rounded-none appearance-none"
                    />
                  </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white hover:bg-slate-200 text-black font-bold rounded-none shadow-none transition-all disabled:opacity-50 flex items-center justify-center font-mono uppercase tracking-wider"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                GENERATE_CODE
              </button>
            </form>
          </div>
        </div>

        {/* Preview / Info Section */}
        <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-white/10 text-white p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-2">
                    <Settings className="text-slate-400" size={18}/>
                    <h3 className="font-bold font-mono uppercase text-sm">System_Notes</h3>
                </div>
                <ul className="space-y-4 text-xs font-mono text-slate-400 leading-relaxed">
                    <li>> High contrast recommended for optimal scan rate.</li>
                    <li>> Logo obstruction >30% may cause data redundancy failure.</li>
                    <li>> Verify matrix integrity via mobile scanning device.</li>
                    <li>> 'Square' style provides maximum device compatibility.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;