"use client";

import { useState, useEffect } from "react";
import { Download, Link as LinkIcon, AlertCircle, CheckCircle2, X, Loader2, Sparkles, Server, ShieldCheck, Globe, Moon, Sun } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode === 'true' || (!savedMode && prefersDark);
    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

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
    <div className="flex flex-col min-h-screen w-full">
      {/* 3D Glassmorphism Navigation Bar with Dark Mode Toggle */}
      <header className="h-[70px] sticky top-0 z-40 glass flex items-center px-4 md:px-[32px]">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <div className="w-[44px] h-[44px] bg-stone-900 dark:bg-stone-100 rounded-xl flex items-center justify-center btn-3d">
              <Download className="w-[22px] h-[22px] text-stone-50 dark:text-stone-900" strokeWidth={2} />
            </div>
            <span className="text-stone-900 dark:text-stone-50 font-raleway font-black text-[20px] tracking-tight uppercase">
              VAN-X 313
            </span>
          </div>
          <nav className="flex items-center gap-[8px]">
            <button
              onClick={toggleDarkMode}
              className="glass-strong p-[10px] rounded-xl hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-all btn-3d group"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg className="w-[20px] h-[20px] text-stone-900 dark:text-stone-50 transition-transform group-hover:rotate-45" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg className="w-[20px] h-[20px] text-stone-900 dark:text-stone-50 transition-transform group-hover:-rotate-12" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <a href="#" className="hidden sm:block text-stone-900 dark:text-stone-50 text-[15px] font-medium px-[20px] py-[10px] rounded-xl glass-strong hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-all">
              Beranda
            </a>
            <a href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" target="_blank" rel="noopener noreferrer" className="hidden sm:block text-stone-600 dark:text-stone-400 text-[15px] font-medium px-[20px] py-[10px] rounded-xl hover:glass-strong hover:text-stone-900 dark:hover:text-stone-50 transition-all">
              Komunitas
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-[32px] md:px-[48px] py-[60px] md:py-[100px] flex flex-col gap-[32px] md:gap-[48px]">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center mb-[24px] md:mb-[40px] text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-[10px] glass-card text-stone-700 dark:text-stone-300 px-[20px] py-[10px] rounded-full mb-[32px] font-medium text-[13px] md:text-[14px]"
          >
            <Sparkles className="w-[16px] h-[16px] text-stone-600 dark:text-stone-400" strokeWidth={2} />
            <span>Cepat, Aman, dan Integrasi API Universal</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-[42px] md:text-[72px] font-raleway font-black leading-[1.05] text-stone-900 dark:text-stone-50 mb-[20px] max-w-4xl tracking-tight uppercase"
          >
            Pengunduh Media<br/>Universal
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] font-normal leading-[1.6] text-stone-600 dark:text-stone-400 mb-[48px] max-w-2xl px-4"
          >
            Unduh video dan media dari platform sosial favoritmu secara instan. Dibangun dengan arsitektur profesional yang menjamin ketersediaan tinggi dan tanpa downtime.
          </motion.p>
          
          {/* 3D Glassmorphism Input Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-3xl glass-card p-[32px] rounded-2xl relative z-10"
          >
            <form onSubmit={handleDownload} className="flex flex-col md:flex-row gap-[16px]">
              <div className="flex-1 relative">
                <input 
                  type="url" 
                  placeholder="Tempel URL di sini (contoh: https://vt.tiktok.com/...)" 
                  className="w-full h-[52px] glass-strong text-stone-900 dark:text-stone-50 text-[16px] font-normal px-[20px] rounded-xl placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-4 focus:ring-stone-900/10 dark:focus:ring-stone-50/10 focus:outline-none transition-all"
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
                className="h-[52px] shrink-0 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[15px] font-medium px-[32px] rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-[10px] btn-3d"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-[20px] h-[20px] animate-spin" /> Memproses
                  </>
                ) : (
                  <>
                    <Download className="w-[20px] h-[20px]" /> Unduh Media
                  </>
                )}
              </motion.button>
            </form>
            
            {/* Error Badge */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-[10px] bg-red-50/90 text-red-700 text-[14px] font-medium px-[16px] py-[12px] rounded-xl border border-red-200/60 backdrop-blur-sm">
                    <AlertCircle className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Results Section with Glassmorphism */}
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
              <div className="w-full max-w-3xl glass-card p-[32px] md:p-[40px] rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[28px] border-b border-stone-200/60 dark:border-stone-700/60 pb-[20px] gap-[16px]">
                  <div>
                    <h3 className="text-[28px] md:text-[32px] font-semibold leading-tight text-stone-900 dark:text-stone-50">Ekstraksi Selesai</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-[15px] mt-[6px]">Pratinjau dan unduh media yang Anda minta.</p>
                  </div>
                  <div className="bg-emerald-50/90 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[13px] font-medium px-[16px] py-[8px] rounded-full flex items-center gap-[8px] shrink-0 border border-emerald-200/60 dark:border-emerald-700/60 backdrop-blur-sm">
                     <CheckCircle2 className="w-[16px] h-[16px]" /> Berhasil
                  </div>
                </div>

                {links.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[28px]">
                    {links.map((link, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        key={idx} 
                        className="flex flex-col justify-between p-[24px] glass-strong rounded-xl transition-all group"
                      >
                        <div className="flex items-start gap-[14px] mb-[20px]">
                          <div className="w-[44px] h-[44px] bg-stone-900 dark:bg-stone-100 rounded-xl flex items-center justify-center shrink-0 btn-3d">
                            <LinkIcon className="w-[22px] h-[22px] text-stone-50 dark:text-stone-900" strokeWidth={2} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-[15px] font-medium text-stone-900 dark:text-stone-50 truncate" title={link.label}>
                              {link.label}
                            </h4>
                            <p className="text-[13px] text-stone-500 dark:text-stone-400 truncate mt-[4px]">Siap diakses</p>
                          </div>
                        </div>
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-[46px] flex items-center justify-center gap-[10px] bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-xl text-[14px] font-medium transition-all hover:bg-stone-800 dark:hover:bg-stone-200 btn-3d"
                        >
                          <Download className="w-[18px] h-[18px]" /> Akses Media
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-[40px] text-center glass-strong rounded-xl mb-[28px]">
                    <p className="text-[16px] font-normal leading-relaxed text-stone-600 dark:text-stone-400">
                      Tidak ada URL yang dapat diekstrak dari respons.
                    </p>
                  </div>
                )}

                <details className="group glass-strong rounded-xl overflow-hidden transition-colors">
                  <summary className="glass text-stone-900 dark:text-stone-50 text-[14px] font-medium p-[18px] hover:glass-strong cursor-pointer transition-colors user-select-none outline-none flex items-center justify-between">
                    <span>Lihat Data Teknis</span>
                    <span className="text-[13px] text-stone-500 dark:text-stone-400 group-open:hidden">Buka</span>
                    <span className="text-[13px] text-stone-500 dark:text-stone-400 hidden group-open:block">Tutup</span>
                  </summary>
                  <div className="p-[20px] glass-strong text-[12px] font-mono text-stone-700 dark:text-stone-300 whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto">
                    {JSON.stringify(result, null, 2)}
                  </div>
                </details>

              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Info Grid with 3D Glassmorphism & Dark Mode */}
        <section className="w-full max-w-5xl mx-auto mt-[24px] md:mt-[48px] grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {/* Dark Feature Card with 3D Effect */}
          <div className="md:col-span-1 flex flex-col gap-[24px]">
            <div className="bg-stone-900 dark:bg-stone-800 p-[32px] rounded-2xl text-stone-50 h-full flex flex-col items-start btn-3d">
              <div className="w-[52px] h-[52px] glass-strong rounded-xl flex items-center justify-center mb-[20px]">
                <Globe className="w-[26px] h-[26px] text-stone-900 dark:text-stone-50" strokeWidth={1.5} />
              </div>
              <h3 className="text-[20px] font-semibold leading-tight mb-[10px]">Jangkauan Global</h3>
              <p className="text-[15px] font-normal leading-relaxed flex-1 text-stone-200 dark:text-stone-300">
                Server dioptimalkan secara global untuk mengambil konten Anda dengan latensi ultra-rendah dan keandalan yang tak tertandingi.
              </p>
            </div>
          </div>
          
          {/* Platform Cards with 3D Line Icons */}
          <div className="md:col-span-2 glass-card p-[32px] rounded-2xl transition-all">
            <div className="flex items-center gap-[12px] mb-[20px] pb-[20px] border-b border-stone-200/60 dark:border-stone-700/60">
              <Server className="w-[22px] h-[22px] text-stone-700 dark:text-stone-300" strokeWidth={1.5} />
              <h3 className="text-[20px] font-medium leading-tight text-stone-900 dark:text-stone-50">Platform yang Didukung</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Instagram */}
              <div className="flex items-center gap-3 p-4 glass-strong rounded-xl hover:scale-105 transition-all group btn-3d">
                <svg className="w-7 h-7 text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-50 transition-colors" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Instagram</span>
              </div>
              
              {/* TikTok */}
              <div className="flex items-center gap-3 p-4 glass-strong rounded-xl hover:scale-105 transition-all group btn-3d">
                <svg className="w-7 h-7 text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-50 transition-colors" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">TikTok</span>
              </div>
              
              {/* Facebook */}
              <div className="flex items-center gap-3 p-4 glass-strong rounded-xl hover:scale-105 transition-all group btn-3d">
                <svg className="w-7 h-7 text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-50 transition-colors" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Facebook</span>
              </div>
              
              {/* CapCut */}
              <div className="flex items-center gap-3 p-4 glass-strong rounded-xl hover:scale-105 transition-all group btn-3d">
                <svg className="w-7 h-7 text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-50 transition-colors" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M7 10h5M12 15h5M7 15h2"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">CapCut</span>
              </div>
              
              {/* Spotify */}
              <div className="flex items-center gap-3 p-4 glass-strong rounded-xl hover:scale-105 transition-all group btn-3d">
                <svg className="w-7 h-7 text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-50 transition-colors" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14.5c2.5-1 5.5-1 8 0M7.5 11c3-1 6.5-1 9 0M7 17.5c2.5-1 5.5-1 8 0"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Spotify</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-4 leading-relaxed">
              Mendukung download video, gambar, dan audio dari berbagai platform sosial media populer dengan kualitas terbaik.
            </p>
          </div>
        </section>

      </main>

      {/* 3D Glassmorphism Footer with Dark Mode */}
      <footer className="w-full glass py-[48px] px-4 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-[32px]">
          
          <div className="flex flex-col items-center md:items-start gap-[12px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[36px] h-[36px] bg-stone-900 dark:bg-stone-100 rounded-xl flex items-center justify-center btn-3d">
                <Download className="w-[18px] h-[18px] text-stone-50 dark:text-stone-900" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold leading-tight text-stone-900 dark:text-stone-50 tracking-tight">
                VAN-X 313
              </p>
            </div>
            <p className="text-[14px] font-normal leading-relaxed text-stone-600 dark:text-stone-400 max-w-sm text-center md:text-left">
              Alat ekstraksi media kelas enterprise. Andal, cepat, dan dapat diakses secara universal.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end md:text-right gap-[8px]">
            <p className="text-[14px] font-normal leading-relaxed text-stone-600 dark:text-stone-400">
              Dikembangkan & Dikelola oleh <span className="font-medium text-stone-900 dark:text-stone-50">VAN-X 313 . ALL IN</span>
            </p>
            <p className="text-[13px] font-medium leading-tight text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-[6px]">
              VAN-X 313 GROUP © {new Date().getFullYear()}
            </p>
            <a href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" target="_blank" rel="noopener noreferrer" className="text-stone-900 dark:text-stone-50 text-[14px] font-medium leading-relaxed hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-[8px] group">
              <span className="group-hover:underline underline-offset-4">Bergabung dengan Channel Komunitas</span>
              <span className="text-stone-400 group-hover:translate-x-1 transition-transform">→</span>
            </a>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md"
          >
            {/* 3D Dark Modal with Glassmorphism */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-stone-900 dark:bg-stone-800 text-stone-50 w-full max-w-[460px] p-[40px] rounded-2xl shadow-2xl relative btn-3d"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-[24px] right-[24px] text-stone-400 hover:text-stone-50 transition-colors p-[6px] rounded-lg hover:bg-stone-800 dark:hover:bg-stone-700"
                aria-label="Close"
              >
                <X className="w-[24px] h-[24px]" />
              </button>
              
              <div className="w-[56px] h-[56px] glass-strong rounded-xl flex items-center justify-center mb-[28px]">
                <ShieldCheck className="w-[28px] h-[28px] text-stone-900 dark:text-stone-50" strokeWidth={1.5} />
              </div>

              <h3 className="text-[36px] font-semibold leading-tight mb-[16px] tracking-tight">Tetap Terhubung</h3>
              <p className="text-[17px] font-normal leading-relaxed mb-[36px] text-stone-200 dark:text-stone-300">
                Bergabunglah dengan channel VAN-X 313 . ALL IN di WhatsApp untuk menerima pembaruan terbaru, tools enterprise, dan berita developer.
              </p>
              
              <div className="flex flex-col gap-[16px]">
                <a 
                  href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setShowPopup(false)}
                  className="h-[52px] w-full glass-strong text-stone-900 dark:text-stone-50 text-[15px] font-medium px-[28px] rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-all flex items-center justify-center btn-3d"
                >
                  Gabung Channel Resmi
                </a>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="h-[52px] w-full bg-transparent text-stone-50 text-[15px] font-medium px-[28px] rounded-xl border border-stone-700 dark:border-stone-600 hover:bg-stone-800 dark:hover:bg-stone-700 hover:border-stone-600 dark:hover:border-stone-500 transition-all flex items-center justify-center"
                >
                  Lanjut ke Aplikasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install App Popup (Top Notification) */}
      <AnimatePresence>
        {showInstallPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4"
          >
            <div className="glass-strong text-stone-900 dark:text-stone-50 shadow-2xl rounded-2xl p-[20px] max-w-md w-full flex items-start gap-[16px] btn-3d">
              <div className="w-[48px] h-[48px] bg-stone-900 dark:bg-stone-100 rounded-xl flex items-center justify-center shrink-0">
                <Download className="w-[24px] h-[24px] text-stone-50 dark:text-stone-900" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h4 className="text-[16px] font-semibold leading-tight">Instal VAN-X 313 . ALL IN</h4>
                <p className="text-[13px] text-stone-600 dark:text-stone-400 mt-[4px]">Tambahkan ke Layar Utama untuk akses lebih cepat.</p>
                <div className="flex items-center gap-[10px] mt-[16px]">
                  <button 
                    onClick={handleInstallClick}
                    className="bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[13px] font-medium px-[20px] py-[8px] rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-all btn-3d"
                  >
                    Instal Aplikasi
                  </button>
                  <button 
                    onClick={() => setShowInstallPopup(false)}
                    className="bg-transparent text-stone-600 dark:text-stone-400 text-[13px] font-medium px-[20px] py-[8px] rounded-lg glass-card hover:glass-strong transition-all"
                  >
                    Nanti
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

