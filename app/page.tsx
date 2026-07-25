"use client";

import { useState, useEffect } from "react";
import { Download, Link as LinkIcon, AlertCircle, CheckCircle2, X, Loader2, Sparkles, Server, ShieldCheck, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function isUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function gatherLinks(obj: any): { label: string, url: string }[] {
  const links: { label: string, url: string }[] = [];
  
  if (typeof obj === 'string' && isUrl(obj)) {
    links.push({ label: 'Media Source', url: obj });
    return links;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (typeof item === 'string' && isUrl(item)) {
        links.push({ label: `Media Link ${index + 1}`, url: item });
      } else if (typeof item === 'object') {
        links.push(...gatherLinks(item));
      }
    });
  } else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && isUrl(value)) {
        // Clean up keys for better display
        const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        links.push({ label: cleanKey, url: value });
      } else if (typeof value === 'object') {
        const nested = gatherLinks(value);
        nested.forEach(n => links.push({ label: `${key} - ${n.label}`, url: n.url }));
      }
    });
  }
  return links;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Show popup immediately upon first visit
    setShowPopup(true);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // Show install prompt if community popup is closed and prompt is available
    if (!showPopup && deferredPrompt) {
      const showTimer = setTimeout(() => {
        setShowInstallPopup(true);
      }, 500); // Small delay after closing modal
      
      const hideTimer = setTimeout(() => {
        setShowInstallPopup(false);
      }, 8500); // Hide after 8s automatically

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showPopup, deferredPrompt]);

  const handleInstallClick = async () => {
    setShowInstallPopup(false);
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`, {
        method: "GET",
      });
      const data = await res.json();
      if (!data.Status) {
        setError(data.Error || "Failed to process the URL.");
      } else {
        setResult(data.Result);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const links = result ? gatherLinks(result) : [];

  return (
    <div className="flex flex-col min-h-screen w-full bg-black relative overflow-hidden">
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Brutal Navigation */}
      <header className="relative z-40 border-b-4 border-cyan-400 bg-black">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-400 flex items-center justify-center font-mono font-bold text-black text-xl border-4 border-white">
              VX
            </div>
            <div>
              <h1 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">
                VAN-X 313
              </h1>
              <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest">ALL IN ONE</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-3">
            <a href="#" className="px-6 py-3 bg-magenta-500 text-black font-black uppercase text-sm border-4 border-white hover:bg-magenta-400 transition-colors">
              BERANDA
            </a>
            <a href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-black text-white font-black uppercase text-sm border-4 border-white hover:bg-white hover:text-black transition-colors">
              KOMUNITAS
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-6 py-20 flex flex-col gap-16">
        
        {/* Brutal Hero */}
        <section className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-block px-6 py-2 bg-black border-4 border-yellow-400 font-mono text-yellow-400 font-bold uppercase text-xs tracking-widest mb-12">
              [ UNIVERSAL MEDIA EXTRACTION ]
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-black uppercase text-6xl md:text-8xl leading-none tracking-tighter mb-8"
          >
            <span className="text-white">PENGUNDUH</span><br/>
            <span className="neon-text-cyan">MEDIA</span><br/>
            <span className="neon-text-magenta">UNIVERSAL</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mb-16 font-mono leading-relaxed"
          >
            EKSTRAKSI KONTEN DARI INSTAGRAM // TIKTOK // FACEBOOK // CAPCUT // SPOTIFY
          </motion.p>
          
          {/* Brutal Input Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-4xl"
          >
            <form onSubmit={handleDownload} className="flex flex-col gap-6">
              <div className="relative">
                <input 
                  type="url" 
                  placeholder="PASTE_URL_HERE://" 
                  className="w-full h-20 bg-black text-white text-lg font-mono px-8 border-4 border-white placeholder:text-gray-600 focus:border-cyan-400 focus:neon-border-cyan focus:outline-none transition-all uppercase"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <motion.button 
                whileHover={{ scale: (url && !loading) ? 1.02 : 1 }}
                whileTap={{ scale: (url && !loading) ? 0.98 : 1 }}
                type="submit" 
                disabled={loading || !url}
                className="h-20 bg-magenta-500 text-black text-xl font-black uppercase px-12 border-4 border-white hover:bg-magenta-400 active:bg-magenta-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-gray-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" /> PROCESSING
                  </>
                ) : (
                  <>
                    <Download className="w-8 h-8" /> EXTRACT_MEDIA
                  </>
                )}
              </motion.button>
            </form>
            
            {/* Brutal Error */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-6"
                >
                  <div className="flex items-start gap-4 bg-red-500 text-black font-bold px-6 py-4 border-4 border-white">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span className="uppercase text-sm">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.section 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-full max-w-4xl bg-black border-4 border-cyan-400 p-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b-4 border-white pb-6 gap-4">
                  <div>
                    <h3 className="text-4xl font-black uppercase text-white leading-none mb-2">EXTRACTION_COMPLETE</h3>
                    <p className="text-cyan-400 font-mono text-sm uppercase">READY_TO_DOWNLOAD</p>
                  </div>
                  <div className="bg-green-400 text-black font-black px-6 py-2 uppercase text-xs border-4 border-white flex items-center gap-2">
                     <CheckCircle2 className="w-5 h-5" /> SUCCESS
                  </div>
                </div>

                {links.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {links.map((link, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        key={idx} 
                        className="brutalist-box bg-black p-6 border-4 border-white"
                      >
                        <div className="mb-6">
                          <h4 className="text-lg font-black uppercase text-white mb-2 truncate" title={link.label}>
                            {link.label}
                          </h4>
                          <p className="text-gray-500 font-mono text-xs uppercase">FILE_READY</p>
                        </div>
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-14 flex items-center justify-center gap-3 bg-yellow-400 text-black font-black uppercase text-sm border-4 border-white hover:bg-yellow-300 transition-colors"
                        >
                          <Download className="w-5 h-5" /> ACCESS_FILE
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center border-4 border-dashed border-gray-700 bg-black mb-8">
                    <p className="text-gray-500 font-mono uppercase text-sm">
                      NO_EXTRACTABLE_DATA_FOUND
                    </p>
                  </div>
                )}

                <details className="group border-4 border-white overflow-hidden bg-black">
                  <summary className="bg-black text-white font-black uppercase text-sm px-6 py-4 hover:bg-gray-900 cursor-pointer transition-colors user-select-none outline-none flex items-center justify-between border-b-4 border-white group-open:border-b-0">
                    <span>[ TECHNICAL_DATA ]</span>
                    <span className="text-xs text-gray-500 group-open:hidden">EXPAND_+</span>
                    <span className="text-xs text-gray-500 hidden group-open:block">COLLAPSE_-</span>
                  </summary>
                  <div className="p-6 bg-black text-green-400 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto">
                    {JSON.stringify(result, null, 2)}
                  </div>
                </details>

              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Brutal Features Grid */}
        <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Platform Support */}
          <div className="bg-black border-4 border-magenta-500 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-magenta-500"></div>
              <h3 className="text-2xl font-black uppercase text-white">SUPPORTED_PLATFORMS</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'CAPCUT', 'SPOTIFY'].map((platform, idx) => (
                <div key={idx} className="bg-black border-2 border-white p-4 hover:bg-white hover:text-black transition-colors group">
                  <span className="font-mono font-bold text-sm">{platform}</span>
                </div>
              ))}
              <div className="bg-magenta-500 border-2 border-white p-4">
                <span className="font-mono font-bold text-sm text-black">+MORE</span>
              </div>
            </div>
          </div>

          {/* Tech Info */}
          <div className="bg-black border-4 border-cyan-400 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400"></div>
              <h3 className="text-2xl font-black uppercase text-white">SYSTEM_STATUS</h3>
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-500">API_SPEED</span>
                <span className="text-green-400 font-bold">ULTRA_FAST</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-500">UPTIME</span>
                <span className="text-green-400 font-bold">99.9%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-500">SERVERS</span>
                <span className="text-cyan-400 font-bold">GLOBAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">STATUS</span>
                <span className="text-magenta-400 font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Brutal Footer */}
      <footer className="relative z-10 w-full border-t-4 border-white bg-black py-12 px-6 mt-auto">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-cyan-400 flex items-center justify-center font-mono font-bold text-black text-lg border-4 border-white">
                  VX
                </div>
                <div>
                  <h3 className="text-white font-black text-xl uppercase">VAN-X 313</h3>
                  <p className="text-cyan-400 font-mono text-xs uppercase">ALL IN ONE MEDIA</p>
                </div>
              </div>
              <p className="text-gray-500 font-mono text-sm">
                UNIVERSAL_MEDIA_EXTRACTION // PROFESSIONAL_GRADE // ZERO_DOWNTIME
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-left md:text-right">
                <p className="text-gray-500 font-mono text-sm mb-2">
                  DEVELOPED_BY
                </p>
                <p className="text-white font-black uppercase text-lg">
                  VAN-X 313 . ALL IN
                </p>
              </div>
              <a 
                href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-3 bg-magenta-500 text-black font-black uppercase text-sm border-4 border-white hover:bg-magenta-400 transition-colors"
              >
                JOIN_COMMUNITY →
              </a>
            </div>
          </div>
          
          <div className="border-t-4 border-gray-900 pt-6">
            <p className="text-center text-gray-700 font-mono text-xs uppercase">
              © {new Date().getFullYear()} VAN-X 313 GROUP // ALL_RIGHTS_RESERVED
            </p>
          </div>
        </div>
      </footer>

      {/* Modern Modal / Popup Layer */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            {/* Brutal Neon Modal */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-black border-4 border-cyan-400 w-full max-w-[500px] p-10 relative neon-border-cyan"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-white hover:text-cyan-400 transition-colors p-2"
                aria-label="Close"
              >
                <X className="w-8 h-8 font-bold" strokeWidth={3} />
              </button>
              
              <div className="w-16 h-16 bg-cyan-400 flex items-center justify-center font-mono font-black text-black text-2xl border-4 border-white mb-8">
                !!
              </div>

              <h3 className="text-5xl font-black uppercase leading-none mb-6">
                <span className="text-white">STAY</span><br/>
                <span className="neon-text-magenta">CONNECTED</span>
              </h3>
              
              <p className="text-gray-400 font-mono text-sm leading-relaxed mb-8 uppercase">
                JOIN_VAN-X_313_CHANNEL_ON_WHATSAPP // GET_UPDATES // TOOLS // NEWS
              </p>
              
              <div className="flex flex-col gap-4">
                <a 
                  href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setShowPopup(false)}
                  className="h-16 w-full bg-magenta-500 text-black font-black uppercase text-lg px-8 border-4 border-white hover:bg-magenta-400 transition-colors flex items-center justify-center"
                >
                  JOIN_NOW →
                </a>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="h-16 w-full bg-black text-white font-black uppercase text-lg px-8 border-4 border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center"
                >
                  SKIP →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brutal Install Notification */}
      <AnimatePresence>
        {showInstallPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4"
          >
            <div className="bg-black border-4 border-yellow-400 p-6 max-w-lg w-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center font-mono font-black text-black shrink-0">
                  !
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black uppercase text-white mb-2">INSTALL_APP</h4>
                  <p className="text-gray-500 font-mono text-xs uppercase mb-4">ADD_TO_HOME_SCREEN_FOR_FAST_ACCESS</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleInstallClick}
                      className="bg-yellow-400 text-black font-black uppercase text-xs px-5 py-2 border-2 border-white hover:bg-yellow-300 transition-colors"
                    >
                      INSTALL
                    </button>
                    <button 
                      onClick={() => setShowInstallPopup(false)}
                      className="bg-black text-white font-black uppercase text-xs px-5 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
                    >
                      LATER
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

