import React, { useState, useEffect } from 'react';
import { Activity, Play, Terminal, Database, Key, Mail, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BriefPayload, ExecutionPayload } from '../../../shared/types';

const MOCK_RAW_FEEDS = `Macroeconomic Update May 2026: OFAC General License 58 debt restructuring authorizations have been formally expanded...
Executive Board changes: Calixto Ortega has been designated as IMF governor representing the sovereign position.
Inflation Data: The April inflation metric recorded at 10.6%, showing stabilization.
Currency Exchange: BCV official exchange rate benchmarks pointing to 500.46 Bs/USD.
Energy Sector: Shell offshore gas negotiations in Trinidad and Tobago continue to progress.
Market Movers: George E. Warren LLC has secured new volume allocations.
Debt Structuring: ENI's 'debt-for-oil' swaps via the Cardón IV project have seen renewed authorization windows.
Corporate Milestones: Chevron updates its operational cycles to align with Q2 volume targets.
Legal and Asset Updates: Citgo asset milestones remain critical following recent board rulings.`;

const formatLinkText = (text: string) => {
  const match = text.match(/\[(.*?)\]/);
  return match ? match[1] : text;
};

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<BriefPayload | null>(null);
  
  // Config state
  const [senderEmail, setSenderEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [rawSourceData, setRawSourceData] = useState(MOCK_RAW_FEEDS);

  // UI state
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Load from local storage
    const savedSenderEmail = localStorage.getItem('avpg_senderEmail');
    const savedAppPassword = localStorage.getItem('avpg_appPassword');
    const savedRecipientEmail = localStorage.getItem('avpg_recipientEmail');

    if (savedSenderEmail) setSenderEmail(savedSenderEmail);
    if (savedAppPassword) setAppPassword(savedAppPassword);
    if (savedRecipientEmail) setRecipientEmail(savedRecipientEmail);
  }, []);

  const saveConfig = (key: string, value: string) => {
    localStorage.setItem(`avpg_${key}`, value);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleTrigger = async () => {
    if (!senderEmail || !appPassword || !recipientEmail) {
      showToast('Missing required configuration fields.', 'error');
      return;
    }

    if (!validateEmail(recipientEmail)) {
      showToast('Invalid recipient email format.', 'error');
      return;
    }

    setIsRunning(true);
    setData(null);

    const payload: ExecutionPayload = {
      credentials: {
        senderEmail,
        appPassword
      },
      config: {
        recipientEmail
      },
      rawSourceData
    };

    try {
      const response = await fetch('/api/execute-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data);
        showToast('Intelligence Loop Executed Successfully.', 'success');
      } else {
        throw new Error(result.error || 'Unknown execution error');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to execute custom intelligence loop.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-gray-300 font-mono overflow-hidden selection:bg-cyan-900 selection:text-cyan-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="text-cyan-500 h-5 w-5" />
          <h1 className="text-sm font-bold tracking-widest uppercase text-gray-100">
            AVPG Insights Intelligence Workspace
          </h1>
          <span className="ml-4 rounded bg-[#0a1f24] px-2 py-0.5 text-[10px] font-bold tracking-widest text-cyan-400 border border-cyan-900/50 uppercase">
            System Operational
          </span>
        </div>
      </header>

      {/* Main Workspace - 3 Columns */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Column 1: Configuration Drawer */}
        <section className="flex flex-col w-[25%] border-r border-[#1a1a1a] bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 shrink-0 sticky top-0 z-10">
            <Key className="h-4 w-4 text-gray-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Configuration</h2>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-b border-[#1a1a1a] pb-2">Google API Infrastructure</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Sender Gmail Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2 h-4 w-4 text-gray-600" />
                  <input 
                    type="email" 
                    value={senderEmail}
                    onChange={(e) => { setSenderEmail(e.target.value); saveConfig('senderEmail', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-cyan-500/50 text-xs pl-9 pr-3 py-2 rounded-sm outline-none transition-colors text-gray-300 placeholder-[#333]"
                    placeholder="automation@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">16-Character App Password</label>
                <div className="relative">
                  <input 
                    type={showSecret ? "text" : "password"} 
                    value={appPassword}
                    onChange={(e) => { setAppPassword(e.target.value); saveConfig('appPassword', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-cyan-500/50 text-xs px-3 py-2 pr-9 rounded-sm outline-none transition-colors text-gray-300 placeholder-[#333]"
                    placeholder="Enter App Password"
                  />
                  <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-2 text-gray-500 hover:text-cyan-400">
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-b border-[#1a1a1a] pb-2">Distribution Layer</h3>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Recipient Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2 h-4 w-4 text-gray-600" />
                  <input 
                    type="email" 
                    value={recipientEmail}
                    onChange={(e) => { setRecipientEmail(e.target.value); saveConfig('recipientEmail', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-cyan-500/50 text-xs pl-9 pr-3 py-2 rounded-sm outline-none transition-colors text-gray-300 placeholder-[#333]"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleTrigger}
                disabled={isRunning}
                className="w-full flex justify-center items-center gap-2 rounded-sm bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/50 disabled:bg-[#111] disabled:border-[#222] disabled:text-gray-600 px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(8,145,178,0.15)] hover:shadow-[0_0_25px_rgba(8,145,178,0.3)] text-cyan-100"
              >
                {isRunning ? (
                  <span className="animate-pulse flex items-center gap-2"><Activity className="h-4 w-4" /> Processing...</span>
                ) : (
                  <><Play className="h-4 w-4" /> Execute Custom Intelligence Loop</>
                )}
              </button>
            </div>

            {toast && (
              <div className={`mt-2 p-3 rounded-sm border text-xs flex gap-2 items-start ${toast.type === 'error' ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-cyan-950/30 border-cyan-900/50 text-cyan-400'}`}>
                {toast.type === 'error' ? <ShieldAlert className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span className="leading-relaxed">{toast.message}</span>
              </div>
            )}
          </div>
        </section>

        {/* Column 2: Intake Sandbox */}
        <section className="flex flex-col w-[30%] border-r border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 shrink-0">
            <Database className="h-4 w-4 text-gray-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Intake Sandbox</h2>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold px-1">Raw Feed Data Override</label>
            <textarea 
              value={rawSourceData}
              onChange={(e) => setRawSourceData(e.target.value)}
              className="flex-1 w-full bg-[#111] border border-[#222] focus:border-cyan-900 rounded-sm p-4 text-[11px] leading-loose text-gray-400 outline-none resize-none custom-scrollbar placeholder-[#333]"
              placeholder="Paste raw data feeds here..."
              spellCheck="false"
            />
          </div>
        </section>

        {/* Column 3: Payload Preview */}
        <section className="flex flex-col flex-1 bg-[#050505] overflow-hidden relative">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 shrink-0">
            <Terminal className="h-4 w-4 text-cyan-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Terminal Environment / Output</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
            {isRunning ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-cyan-500 animate-pulse text-xs uppercase tracking-widest font-bold flex items-center gap-3">
                  <Terminal className="h-5 w-5 animate-bounce" /> Aggregating and Curating via LLM Engine...
                </div>
              </div>
            ) : data ? (
              <div className="w-full max-w-2xl border border-[#222] bg-[#0a0a0a] p-10 shadow-2xl font-sans h-fit rounded-sm text-gray-200">
                <h1 className="text-xl font-black border-b border-[#333] pb-4 mb-6 text-white tracking-tight">{data.titleBlock}</h1>
                <p className="text-sm text-gray-400 font-medium mb-10 leading-relaxed">{data.titularDelDia}</p>

                <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Oil & Gas (Critical)</h2>
                <ul className="space-y-4 mb-10">
                  {data.oilGas.map((item, i) => (
                    <li key={i} className="text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline underline-offset-4 decoration-cyan-400/30 transition-colors">
                        {formatLinkText(item.text)}
                      </a>
                      {item.patternDetected && (
                        <div className="mt-2 text-[10px] text-emerald-400 font-mono bg-[#051a14] inline-block px-2 py-1 border border-emerald-900/30 uppercase tracking-wider font-bold">
                          {item.patternDetected}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Economía e Inversión</h2>
                <ul className="space-y-4 mb-10">
                  {data.economiaInversion.map((item, i) => (
                    <li key={i} className="text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline underline-offset-4 decoration-cyan-400/30 transition-colors">
                        {formatLinkText(item.text)}
                      </a>
                      {item.patternDetected && (
                        <div className="mt-2 text-[10px] text-emerald-400 font-mono bg-[#051a14] inline-block px-2 py-1 border border-emerald-900/30 uppercase tracking-wider font-bold">
                          {item.patternDetected}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Contexto Internacional</h2>
                <ul className="space-y-4 mb-10">
                  {data.contextoInternacional.map((item, i) => (
                    <li key={i} className="text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline underline-offset-4 decoration-cyan-400/30 transition-colors">
                        {formatLinkText(item.text)}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="bg-[#141005] border-l-2 border-amber-500 p-6 mt-8">
                  <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Para Tener en Cuenta</h2>
                  <ul className="list-none space-y-3 text-sm text-amber-500/80 font-medium">
                    {data.paraTenerEnCuenta.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-amber-500/50 shrink-0">→</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-[#333] text-xs uppercase tracking-widest font-bold border border-[#1a1a1a] border-dashed rounded-sm p-12 flex flex-col items-center gap-4">
                  <Terminal className="h-6 w-6 opacity-40" />
                  No structured data generated. Awaiting manual trigger loop.
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Global Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
