import React, { useState } from 'react';
import { Activity, Play, Terminal, Database } from 'lucide-react';
import { BriefPayload } from '../../../shared/types';

const MOCK_RAW_FEEDS = [
  "Macroeconomic Update May 2026: OFAC General License 58 debt restructuring authorizations have been formally expanded...",
  "Executive Board changes: Calixto Ortega has been designated as IMF governor representing the sovereign position.",
  "Inflation Data: The April inflation metric recorded at 10.6%, showing stabilization.",
  "Currency Exchange: BCV official exchange rate benchmarks pointing to 500.46 Bs/USD.",
  "Energy Sector: Shell offshore gas negotiations in Trinidad and Tobago continue to progress.",
  "Market Movers: George E. Warren LLC has secured new volume allocations.",
  "Debt Structuring: ENI's 'debt-for-oil' swaps via the Cardón IV project have seen renewed authorization windows.",
  "Corporate Milestones: Chevron updates its operational cycles to align with Q2 volume targets.",
  "Legal and Asset Updates: Citgo asset milestones remain critical following recent board rulings."
];

const MOCK_PAYLOAD: BriefPayload = {
  titleBlock: "🛢️ VENEZUELA BRIEF — May 14, 2026",
  titularDelDia: "Macro indicators reflect stabilization in inflation metrics amidst significant corporate restructuring in energy sectors. Strategic GL authorizations and IMF designations set the tone for Q3 financial posture.",
  oilGas: [
    { text: "[Shell Offshore Gas Developments Progressing](https://example.com/shell)", url: "https://example.com/shell" },
    { text: "[George E. Warren LLC Expands Market Incursions](https://example.com/gew)", url: "https://example.com/gew", patternDetected: "📈 Patrón detectado: Increased independent allocator footprint." },
    { text: "[ENI Secures 'Debt-for-Oil' Swaps via Cardón IV](https://example.com/eni)", url: "https://example.com/eni" },
    { text: "[Chevron Q2 Operational Cycles Outlined](https://example.com/chevron)", url: "https://example.com/chevron" }
  ],
  economiaInversion: [
    { text: "[OFAC GL 58 Debt Restructuring Authorizations Formally Expanded](https://example.com/ofac)", url: "https://example.com/ofac" },
    { text: "[Citgo Governance and Asset Milestones Updated](https://example.com/citgo)", url: "https://example.com/citgo" },
    { text: "[Calixto Ortega Designated as IMF Governor](https://example.com/imf)", url: "https://example.com/imf" },
    { text: "[April Inflation Metric Recorded at 10.6%](https://example.com/inflation)", url: "https://example.com/inflation", patternDetected: "📈 Patrón detectado: Stabilization trend in CPI." },
    { text: "[BCV Exchange Benchmarks Hit 500.46 Bs/USD](https://example.com/bcv)", url: "https://example.com/bcv" }
  ],
  contextoInternacional: [
    { text: "[Global Crude Flows React to Regional Adjustments](https://example.com/flows)", url: "https://example.com/flows" }
  ],
  paraTenerEnCuenta: [
    "Port logistical constraints may affect late Q2 loadings.",
    "Regulatory shifts in compliance protocols regarding maritime transit."
  ]
};

const formatLinkText = (text: string) => {
  const match = text.match(/\[(.*?)\]/);
  return match ? match[1] : text;
};

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<BriefPayload | null>(null);

  const handleTrigger = () => {
    setIsRunning(true);
    setData(null);
    setTimeout(() => {
      setData(MOCK_PAYLOAD);
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-industrial-900 text-industrial-100 font-mono overflow-hidden">
      {/* Header Control Panel */}
      <header className="flex items-center justify-between border-b border-industrial-800 bg-[#0f1523] px-6 py-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="text-emerald-400 h-5 w-5" />
          <h1 className="text-sm font-semibold tracking-wide uppercase text-industrial-100">
            AVPG Insights Intelligence Workspace
          </h1>
          <span className="ml-4 rounded-full bg-[#132c25] px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-900/50">
            System Operational
          </span>
        </div>
        <button 
          onClick={handleTrigger}
          disabled={isRunning}
          className="flex items-center gap-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-industrial-800 disabled:text-industrial-400 px-4 py-2 text-sm font-medium transition-colors"
        >
          {isRunning ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <><Play className="h-4 w-4" /> Trigger Manual Automation Loop</>
          )}
        </button>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Input Intake Sandbox */}
        <section className="flex flex-col w-[35%] border-r border-industrial-800 bg-[#0a0f18]">
          <div className="flex items-center gap-2 border-b border-industrial-800 bg-industrial-900/50 px-4 py-3 shrink-0">
            <Database className="h-4 w-4 text-industrial-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-industrial-400">Source Ingestion Feeds</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {MOCK_RAW_FEEDS.map((feed, idx) => (
              <div key={idx} className="rounded border border-industrial-800/50 bg-[#121926] p-3 text-xs leading-relaxed text-industrial-400 shadow-inner">
                <span className="text-emerald-500/70 mr-2 font-semibold">
                  [{new Date(Date.now() - Math.random() * 100000).toISOString().split('T')[1].substring(0,8)}]
                </span>
                {feed}
              </div>
            ))}
          </div>
        </section>

        {/* Right Panel: Interactive Preview */}
        <section className="flex flex-col flex-1 bg-[#0d131f] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-industrial-800 bg-industrial-900/50 px-4 py-3 shrink-0">
            <Terminal className="h-4 w-4 text-industrial-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-industrial-400">Structured Data Payload Preview</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center scrollbar-hide">
            {isRunning ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-indigo-400 animate-pulse text-sm flex items-center gap-2">
                  <Terminal className="animate-bounce" /> Aggregating and Curating via LLM Engine...
                </div>
              </div>
            ) : data ? (
              <div className="w-full max-w-4xl rounded-md border border-industrial-800 bg-[#131b2b] p-10 shadow-2xl font-sans h-fit">
                <h1 className="text-2xl font-bold border-b border-industrial-700/50 pb-4 mb-5 text-gray-100 tracking-tight">{data.titleBlock}</h1>
                <p className="text-sm text-gray-300 font-medium mb-10 leading-relaxed max-w-3xl">{data.titularDelDia}</p>

                <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Oil & Gas (Critical)</h2>
                <ul className="space-y-4 mb-10">
                  {data.oilGas.map((item, i) => (
                    <li key={i} className="text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium hover:underline underline-offset-4 decoration-blue-400/40">
                        {formatLinkText(item.text)}
                      </a>
                      {item.patternDetected && (
                        <div className="mt-1.5 text-xs text-emerald-400 font-mono bg-emerald-900/10 inline-block px-2 py-1 rounded border border-emerald-900/30">
                          {item.patternDetected}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <h2 className="text-sm font-bold text-teal-500 uppercase tracking-widest mb-4">Economía e Inversión</h2>
                <ul className="space-y-4 mb-10">
                  {data.economiaInversion.map((item, i) => (
                    <li key={i} className="text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium hover:underline underline-offset-4 decoration-blue-400/40">
                        {formatLinkText(item.text)}
                      </a>
                      {item.patternDetected && (
                        <div className="mt-1.5 text-xs text-emerald-400 font-mono bg-emerald-900/10 inline-block px-2 py-1 rounded border border-emerald-900/30">
                          {item.patternDetected}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Contexto Internacional</h2>
                <ul className="space-y-4 mb-10">
                  {data.contextoInternacional.map((item, i) => (
                    <li key={i} className="text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium hover:underline underline-offset-4 decoration-blue-400/40">
                        {formatLinkText(item.text)}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="bg-[#1a1710] border-l-4 border-amber-500/80 p-5 rounded-r mt-8 shadow-inner">
                  <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Para Tener en Cuenta</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-amber-500/90 font-medium">
                    {data.paraTenerEnCuenta.map((item, i) => (
                      <li key={i} className="pl-1">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-industrial-500 text-sm border border-industrial-800 border-dashed rounded-xl p-10 flex flex-col items-center gap-4">
                  <Terminal className="h-8 w-8 opacity-40" />
                  No structured data generated. Awaiting manual trigger loop.
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
