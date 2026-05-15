import React, { useState, useEffect } from 'react';
import { Activity, Play, Terminal, Database, Key, Mail, Eye, EyeOff, ShieldAlert, CheckCircle2, Globe, Server } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  
  // Config state
  const [cloudRunUrl, setCloudRunUrl] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  // UI state
  const [showSecret, setShowSecret] = useState(false);
  const [showGeminiSecret, setShowGeminiSecret] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Load from local storage
    setCloudRunUrl(localStorage.getItem('avpg_cloudRunUrl') || '');
    setSenderEmail(localStorage.getItem('avpg_senderEmail') || '');
    setAppPassword(localStorage.getItem('avpg_appPassword') || '');
    setGeminiApiKey(localStorage.getItem('avpg_geminiApiKey') || '');
    setRecipientEmail(localStorage.getItem('avpg_recipientEmail') || '');
  }, []);

  const saveConfig = (key: string, value: string) => {
    localStorage.setItem(`avpg_${key}`, value);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  const handleExecutePipeline = async () => {
    if (!cloudRunUrl || !senderEmail || !appPassword || !recipientEmail || !geminiApiKey) {
      showToast('Missing required configuration fields.', 'error');
      return;
    }

    setIsRunning(true);
    setMarkdown(null);
    setTrace(["[LOG] Initializing Intelligence Loop..."]);

    const payload = {
      config: {
        smtpUser: senderEmail,
        smtpPass: appPassword,
        recipientEmail: recipientEmail
      }
    };

    try {
      setTrace(prev => [...prev, "[LOG] Dispatching Request to Cloud Run..."]);
      
      const response = await fetch(`${cloudRunUrl.replace(/\/$/, '')}/api/execute-brief`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': geminiApiKey // If you decide to add an API key for your own server
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.trace) setTrace(result.trace);

      if (!response.ok) {
        throw new Error(result.error || `Server Error ${response.status}`);
      }

      if (result.success) {
        setMarkdown(result.markdown);
        showToast('Intelligence Loop Executed Successfully.', 'success');
      } else {
        throw new Error(result.error || 'Unknown execution error');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to execute custom intelligence loop.', 'error');
      setTrace(prev => [...prev, `[ERROR] ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-gray-300 font-mono overflow-hidden selection:bg-blue-900 selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 h-5 w-5" />
          <h1 className="text-sm font-bold tracking-widest uppercase text-gray-100">
            AVPG Industrial Brief Automation
          </h1>
          <span className="ml-4 rounded bg-[#0a1b2e] px-2 py-0.5 text-[10px] font-bold tracking-widest text-blue-400 border border-blue-900/50 uppercase">
            Cloud Run Environment
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Column 1: Configuration Drawer */}
        <section className="flex flex-col w-[30%] border-r border-[#1a1a1a] bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 shrink-0 sticky top-0 z-10">
            <Key className="h-4 w-4 text-gray-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">System Parameters</h2>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest border-b border-[#1a1a1a] pb-2">Infrastructure</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Cloud Run Service URL</label>
                <div className="relative">
                  <Server className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" 
                    value={cloudRunUrl}
                    onChange={(e) => { setCloudRunUrl(e.target.value); saveConfig('cloudRunUrl', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-blue-500/50 text-xs pl-9 pr-3 py-2.5 rounded-sm outline-none transition-colors text-gray-300"
                    placeholder="https://automation-xyz.a.run.app"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Gemini API Key</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
                  <input 
                    type={showGeminiSecret ? "text" : "password"} 
                    value={geminiApiKey}
                    onChange={(e) => { setGeminiApiKey(e.target.value); saveConfig('geminiApiKey', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-blue-500/50 text-xs pl-9 pr-9 py-2.5 rounded-sm outline-none transition-colors text-gray-300"
                    placeholder="AIza..."
                  />
                  <button onClick={() => setShowGeminiSecret(!showGeminiSecret)} className="absolute right-2 top-2.5 text-gray-500 hover:text-blue-400">
                    {showGeminiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest border-b border-[#1a1a1a] pb-2">Distribution (SMTP)</h3>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Sender Gmail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
                  <input 
                    type="email" 
                    value={senderEmail}
                    onChange={(e) => { setSenderEmail(e.target.value); saveConfig('senderEmail', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-blue-500/50 text-xs pl-9 pr-3 py-2.5 rounded-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">App Password</label>
                <div className="relative">
                  <input 
                    type={showSecret ? "text" : "password"} 
                    value={appPassword}
                    onChange={(e) => { setAppPassword(e.target.value); saveConfig('appPassword', e.target.value); }}
                    className="w-full bg-[#141414] border border-[#222] focus:border-blue-500/50 text-xs px-3 py-2.5 rounded-sm outline-none"
                  />
                  <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-2.5 text-gray-500 hover:text-blue-400">
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Recipient Email</label>
                <input 
                  type="email" 
                  value={recipientEmail}
                  onChange={(e) => { setRecipientEmail(e.target.value); saveConfig('recipientEmail', e.target.value); }}
                  className="w-full bg-[#141414] border border-[#222] focus:border-blue-500/50 text-xs px-3 py-2.5 rounded-sm outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleExecutePipeline}
              disabled={isRunning}
              className="w-full flex justify-center items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all shadow-lg text-white"
            >
              {isRunning ? (
                <span className="animate-pulse flex items-center gap-2"><Activity className="h-4 w-4" /> Executing...</span>
              ) : (
                <><Play className="h-4 w-4" /> Trigger Automation Loop</>
              )}
            </button>

            {toast && (
              <div className={`mt-2 p-3 rounded-sm border text-xs flex gap-2 items-start ${toast.type === 'error' ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-blue-950/30 border-blue-900/50 text-blue-400'}`}>
                {toast.type === 'error' ? <ShieldAlert className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span className="leading-relaxed">{toast.message}</span>
              </div>
            )}
          </div>
        </section>

        {/* Column 2: Trace Panel */}
        <section className="flex flex-col w-[25%] border-r border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 shrink-0">
            <Terminal className="h-4 w-4 text-gray-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">System Trace</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black font-mono text-[10px]">
            {trace.length === 0 ? (
              <div className="text-gray-700 italic">No active telemetry...</div>
            ) : (
              trace.map((t, i) => (
                <div key={i} className="mb-1 text-blue-500/80">
                  <span className="text-gray-600 mr-2">[{i}]</span> {t}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Column 3: Output Preview */}
        <section className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 shrink-0">
            <Globe className="h-4 w-4 text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Markdown Brief Preview</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {markdown ? (
              <div className="max-w-3xl mx-auto prose prose-invert">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold border-b border-blue-900 pb-2 mb-6 text-white" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-400 mt-8 mb-4 uppercase tracking-wide" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                    table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse border border-gray-800" {...props} /></div>,
                    th: ({node, ...props}) => <th className="bg-blue-900/30 border border-gray-800 p-2 text-left text-blue-200" {...props} />,
                    td: ({node, ...props}) => <td className="border border-gray-800 p-2 text-gray-400" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-700">
                <Activity className="h-12 w-12 mb-4 opacity-10" />
                <p className="text-xs uppercase tracking-[0.2em]">Awaiting Data Synthesis</p>
              </div>
            )}
          </div>
        </section>

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        .prose { color: #ccc; max-width: none; }
      `}</style>
    </div>
  );
}
