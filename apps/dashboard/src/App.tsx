import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Terminal,
  Key,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Server,
  Settings,
  ChevronRight,
  AlertTriangle,
  Cpu,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const [errorPhase, setErrorPhase] = useState<string | null>(null);

  // Hardcoded Defaults
  const [cloudRunUrl, setCloudRunUrl] = useState('https://avpg-service-517381595351.us-central1.run.app');
  const [senderEmail, setSenderEmail] = useState('mario101104s@gmail.com');
  const [appPassword, setAppPassword] = useState('vacd oxpg tyqh tcly');
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyBVfCp1m0aTfcFC6x_NzIglb_Iub3dVL8I');
  const [recipientEmail, setRecipientEmail] = useState('mjsanchezr.eng@gmail.com');

  // UI state
  const [showConfig, setShowConfig] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  const handleExecutePipeline = async () => {
    setIsRunning(true);
    setMarkdown(null);
    setErrorPhase(null);
    setTrace(["[LOG] Initializing Intelligence Loop..."]);

    const payload = {
      credentials: {
        senderEmail: senderEmail,
        appPassword: appPassword,
        geminiApiKey: geminiApiKey
      },
      config: {
        recipientEmail: recipientEmail
      }
    };

    try {
      setTrace(prev => [...prev, "[LOG] Dispatching Request to Cloud Run..."]);

      const response = await fetch(`${cloudRunUrl.replace(/\/$/, '')}/api/execute-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.trace) setTrace(result.trace);

      if (!response.ok) {
        // Determine failure phase from trace or status
        const lastStep = result.trace && result.trace.length > 0 ? result.trace[result.trace.length - 1] : "Request Initiation";
        setErrorPhase(lastStep);
        throw new Error(result.error || `Server Error ${response.status}`);
      }

      if (result.success) {
        setMarkdown(result.data);
        showToast('Intelligence Loop Executed Successfully.', 'success');
      } else {
        const lastStep = result.trace && result.trace.length > 0 ? result.trace[result.trace.length - 1] : "Execution Phase";
        setErrorPhase(lastStep);
        throw new Error(result.error || 'Unknown execution error');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Pipeline Failure', 'error');
      setTrace(prev => [...prev, `[CRITICAL] ${error.message}`]);
      if (!errorPhase) setErrorPhase("Network/Connection Layer");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-gray-300 font-mono overflow-hidden selection:bg-blue-900 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0a1b2e_0%,#050505_70%)] opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative flex items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-md px-8 py-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Activity className="text-blue-500 h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-[0.2em] uppercase text-white">
              AVPG Intelligence <span className="text-blue-500">Loop</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Friday, May 15, 2026 • Production Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em]">Cloud Run Active</span>
            <span className="text-[9px] text-gray-600 font-mono uppercase">{cloudRunUrl.substring(0, 30)}...</span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-full transition-all ${showConfig ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'} border border-transparent`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="relative flex flex-1 overflow-hidden z-10">

        {/* Configuration Overlay (Optional) */}
        {showConfig && (
          <div className="absolute left-8 top-8 w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl z-30 p-6 space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-white">Parameters</h2>
              <button onClick={() => setShowConfig(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Service URL</label>
                <input value={cloudRunUrl} onChange={e => setCloudRunUrl(e.target.value)} className="w-full bg-black border border-[#222] rounded px-3 py-2 text-[10px] outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Gemini Key</label>
                <input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} className="w-full bg-black border border-[#222] rounded px-3 py-2 text-[10px] outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">App Password</label>
                <input type="password" value={appPassword} onChange={e => setAppPassword(e.target.value)} className="w-full bg-black border border-[#222] rounded px-3 py-2 text-[10px] outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <div className="pt-2 text-[8px] text-gray-600 italic">
                Config values are hardcoded for current session stability.
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">

          {!markdown && !isRunning && (
            <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-10 py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <div className="relative p-8 bg-blue-500/5 border border-blue-500/20 rounded-full">
                  <Cpu className="h-16 w-16 text-blue-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase sm:text-4xl">
                  Automated <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Intelligence Brief</span>
                </h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                  Trigger the May 15 orchestration loop. The system will perform real-time grounding,
                  render a 30-page high-fidelity PDF, and dispatch via Gmail.
                </p>
              </div>

              <button
                onClick={handleExecutePipeline}
                className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:shadow-[0_0_60px_rgba(59,130,246,0.4)]"
              >
                <Play className="h-5 w-5 fill-current" />
                Launch Pipeline Sequence
              </button>

              <div className="flex items-center gap-8 pt-8 border-t border-white/5 w-full justify-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Grounding</span>
                  <span className="text-xs text-gray-400 font-bold">Gemini 2.0 Flash</span>
                </div>
                <div className="h-8 w-px bg-white/5" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Renderer</span>
                  <span className="text-xs text-gray-400 font-bold">Puppeteer Engine</span>
                </div>
                <div className="h-8 w-px bg-white/5" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">MTA</span>
                  <span className="text-xs text-gray-400 font-bold">Gmail SMTP API</span>
                </div>
              </div>
            </div>
          )}

          {isRunning && (
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping" />
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Execution in Progress</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider font-bold">
                    Pipeline stability: High • Real-time telemetry active
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Terminal className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Engine Logs</span>
                    </div>
                    <span className="text-[9px] text-blue-500 animate-pulse font-bold uppercase">Streaming...</span>
                  </div>
                  <div className="h-64 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1.5 pr-2">
                    {trace.map((t, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-gray-700 shrink-0">{i.toString().padStart(2, '0')}</span>
                        <span className={`${t.includes('[ERROR]') || t.includes('[CRITICAL]') ? 'text-red-400' : 'text-blue-400/80'}`}>
                          {t}
                        </span>
                      </div>
                    ))}
                    <div className="animate-pulse text-gray-600">_</div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-black rounded-2xl p-10 border border-white/5 flex flex-col items-center text-center space-y-6">
                  <div className="p-5 bg-blue-500/10 rounded-full">
                    <Activity className="h-10 w-10 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-white uppercase tracking-widest">Synthesizing Macro Data</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                      Cross-referencing Venezuelan energy clusters and global market pricing for grounding...
                    </p>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full animate-[progress_10s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorPhase && (
            <div className="max-w-2xl w-full bg-red-950/20 border border-red-900/40 rounded-2xl p-10 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-300">
              <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sequence Interrupted</h2>
                <p className="text-sm text-red-400/80 font-bold uppercase tracking-widest">
                  Critical failure at phase: <span className="text-white underline">{errorPhase}</span>
                </p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed pt-2">
                  The automation engine encountered an unrecoverable state. Check logs for authentication or timeout errors.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleExecutePipeline}
                  className="bg-red-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
                >
                  Re-Attempt Sequence
                </button>
                <button
                  onClick={() => { setMarkdown(null); setErrorPhase(null); setTrace([]); }}
                  className="bg-white/5 text-gray-400 border border-white/10 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}

          {markdown && (
            <div className="w-full max-w-5xl space-y-8 py-8 animate-in fade-in slide-in-from-bottom duration-700">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Loop Completed</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Intelligence synthesized & distributed successfully</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setMarkdown(null); setTrace([]); }}
                    className="flex items-center gap-2 bg-white/5 text-gray-400 border border-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Reset Dashboard
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 space-y-4">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">Telemetry</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-gray-600 font-bold uppercase">Grounding</span>
                        <span className="text-[9px] text-green-500 font-bold uppercase">Verified</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-gray-600 font-bold uppercase">PDF Render</span>
                        <span className="text-[9px] text-green-500 font-bold uppercase">30-Page HD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-gray-600 font-bold uppercase">MTA Delivery</span>
                        <span className="text-[9px] text-green-500 font-bold uppercase">Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 space-y-4">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">System Info</h3>
                    <div className="space-y-1">
                      <div className="text-[9px] text-gray-500 font-bold uppercase">Target Recipient</div>
                      <div className="text-[10px] text-gray-300 font-mono break-all">{recipientEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[800px]">
                  <div className="flex items-center gap-2 border-b border-white/5 bg-[#0f0f0f] px-6 py-4 shrink-0">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">Live Intelligence Preview</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar selection:bg-blue-600 selection:text-white">
                    <article className="max-w-none prose prose-invert prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-h1:text-4xl prose-h1:border-b prose-h1:border-blue-900 prose-h1:pb-6 prose-h2:text-xl prose-h2:text-blue-400 prose-h2:mt-12 prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown>
                        {markdown}
                      </ReactMarkdown>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        .prose { color: #888; font-size: 14px; line-height: 1.8; }
        .prose strong { color: #fff; }
        .prose table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .prose th { background: #0f172a; border: 1px solid #1e293b; padding: 0.75rem; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; }
        .prose td { border: 1px solid #1e293b; padding: 0.75rem; font-size: 12px; color: #94a3b8; }
      `}</style>
    </div>
  );
}
