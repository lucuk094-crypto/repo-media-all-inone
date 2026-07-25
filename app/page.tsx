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
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Sticky Navigation Menu Bar */}
      <header className="h-[70px] sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-4 md:px-[32px] shadow-sm">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <div className="w-[44px] h-[44px] bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Download className="w-[22px] h-[22px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-900 font-bold text-[19px] tracking-tight">
              VAN-X 313
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-[8px]">
            <a href="#" className="text-slate-900 text-[15px] font-semibold px-[20px] py-[10px] rounded-xl bg-slate-100 hover:bg-slate-200 transition-all">
              Beranda
            </a>
            <a href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" target="_blank" rel="noopener noreferrer" className="text-slate-600 text-[15px] font-medium px-[20px] py-[10px] rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all">
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
            className="inline-flex items-center gap-[10px] bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-[20px] py-[10px] rounded-full mb-[32px] font-medium text-[13px] md:text-[14px] border border-slate-200 shadow-sm"
          >
            <Sparkles className="w-[16px] h-[16px] text-slate-600" />
            <span>Cepat, Aman, dan Integrasi API Universal</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-[42px] md:text-[64px] font-bold leading-[1.1] text-slate-900 mb-[20px] max-w-4xl tracking-tight"
          >
            Pengunduh Media<br/>Universal
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] font-normal leading-[1.6] text-slate-600 mb-[48px] max-w-2xl px-4"
          >
            Unduh video dan media dari platform sosial favoritmu secara instan. Dibangun dengan arsitektur profesional yang menjamin ketersediaan tinggi dan tanpa downtime.
          </motion.p>
          
          {/* Main Input Card (Card Light) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-3xl bg-white/90 backdrop-blur-sm p-[32px] rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 relative z-10"
          >
            <form onSubmit={handleDownload} className="flex flex-col md:flex-row gap-[16px]">
              <div className="flex-1 relative">
                <input 
                  type="url" 
                  placeholder="Tempel URL di sini (contoh: https://vt.tiktok.com/...)" 
                  className="w-full h-[52px] bg-slate-50 text-slate-900 text-[16px] font-medium px-[20px] rounded-xl border-2 border-slate-200 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 focus:outline-none focus:bg-white transition-all"
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
                className="h-[52px] shrink-0 bg-gradient-to-r from-slate-900 to-slate-700 text-white text-[15px] font-semibold px-[32px] rounded-xl hover:from-slate-800 hover:to-slate-600 active:scale-95 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-[10px] shadow-lg shadow-slate-900/20"
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
                  <div className="flex items-center gap-[10px] bg-red-50 text-red-700 text-[14px] font-medium px-[16px] py-[12px] rounded-xl border border-red-200">
                    <AlertCircle className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>{error}</span>
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
              <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm p-[32px] md:p-[40px] rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[28px] border-b border-slate-200 pb-[20px] gap-[16px]">
                  <div>
                    <h3 className="text-[28px] md:text-[32px] font-bold leading-tight text-slate-900">Ekstraksi Selesai</h3>
                    <p className="text-slate-600 text-[15px] mt-[6px]">Pratinjau dan unduh media yang Anda minta.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 text-[13px] font-semibold px-[16px] py-[8px] rounded-full flex items-center gap-[8px] shrink-0 border border-emerald-200">
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
                        className="flex flex-col justify-between p-[24px] border-2 border-slate-200 rounded-xl bg-gradient-to-br from-white to-slate-50 hover:border-slate-300 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start gap-[14px] mb-[20px]">
                          <div className="w-[44px] h-[44px] bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                            <LinkIcon className="w-[22px] h-[22px] text-white" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-[15px] font-semibold text-slate-900 truncate" title={link.label}>
                              {link.label}
                            </h4>
                            <p className="text-[13px] text-slate-500 truncate mt-[4px]">Siap diakses</p>
                          </div>
                        </div>
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-[46px] flex items-center justify-center gap-[10px] bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl text-[14px] font-semibold transition-all hover:from-slate-800 hover:to-slate-600 active:scale-95 shadow-lg shadow-slate-900/20"
                        >
                          <Download className="w-[18px] h-[18px]" /> Akses Media
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-[40px] text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mb-[28px]">
                    <p className="text-[16px] font-normal leading-relaxed text-slate-600">
                      Tidak ada URL yang dapat diekstrak dari respons.
                    </p>
                  </div>
                )}

                <details className="group border-2 border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                  <summary className="bg-slate-50 text-slate-900 text-[14px] font-semibold p-[18px] hover:bg-slate-100 cursor-pointer transition-colors user-select-none outline-none flex items-center justify-between">
                    <span>Lihat Data Teknis</span>
                    <span className="text-[13px] text-slate-500 group-open:hidden">Buka</span>
                    <span className="text-[13px] text-slate-500 hidden group-open:block">Tutup</span>
                  </summary>
                  <div className="p-[20px] bg-white text-[12px] font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto border-t-2 border-slate-200">
                    {JSON.stringify(result, null, 2)}
                  </div>
                </details>

              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Info Grid (Features & Supported Platforms) */}
        <section className="w-full max-w-5xl mx-auto mt-[24px] md:mt-[48px] grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {/* Card Default (Warm) */}
          <div className="md:col-span-1 flex flex-col gap-[24px]">
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-[32px] rounded-2xl text-white h-full shadow-xl shadow-slate-900/20 flex flex-col items-start">
              <div className="w-[52px] h-[52px] bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-[20px] shadow-lg">
                <Globe className="w-[26px] h-[26px] text-white" />
              </div>
              <h3 className="text-[20px] font-bold leading-tight mb-[10px]">Jangkauan Global</h3>
              <p className="text-[15px] font-normal leading-relaxed flex-1 text-white/80">
                Server dioptimalkan secara global untuk mengambil konten Anda dengan latensi ultra-rendah dan keandalan yang tak tertandingi.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white/80 backdrop-blur-sm p-[32px] rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-[12px] mb-[20px] pb-[20px] border-b border-slate-200">
              <Server className="w-[22px] h-[22px] text-slate-700" />
              <h3 className="text-[20px] font-semibold leading-tight text-slate-900">Platform yang Didukung</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">IG</div>
                <span className="text-sm font-medium text-slate-700">Instagram</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">TT</div>
                <span className="text-sm font-medium text-slate-700">TikTok</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">FB</div>
                <span className="text-sm font-medium text-slate-700">Facebook</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">CC</div>
                <span className="text-sm font-medium text-slate-700">CapCut</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">SP</div>
                <span className="text-sm font-medium text-slate-700">Spotify</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">+5</div>
                <span className="text-sm font-medium text-slate-700">Lainnya</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Mendukung download video, gambar, dan audio dari berbagai platform sosial media populer dengan kualitas terbaik.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-[48px] bg-white px-4 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-[32px]">
          
          <div className="flex flex-col items-center md:items-start gap-[12px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[36px] h-[36px] bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Download className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[18px] font-bold leading-tight text-slate-900 tracking-tight">
                VAN-X 313
              </p>
            </div>
            <p className="text-[14px] font-normal leading-relaxed text-slate-600 max-w-sm text-center md:text-left">
              Alat ekstraksi media kelas enterprise. Andal, cepat, dan dapat diakses secara universal.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end md:text-right gap-[8px]">
            <p className="text-[14px] font-normal leading-relaxed text-slate-600">
              Dikembangkan & Dikelola oleh <span className="font-semibold text-slate-900">VAN-X 313 . ALL IN</span>
            </p>
            <p className="text-[13px] font-semibold leading-tight text-slate-500 uppercase tracking-wider mb-[6px]">
              VAN-X 313 GROUP © {new Date().getFullYear()}
            </p>
            <a href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" target="_blank" rel="noopener noreferrer" className="text-slate-900 text-[14px] font-semibold leading-relaxed hover:text-slate-700 transition-colors flex items-center gap-[8px] group">
              <span className="group-hover:underline underline-offset-4">Bergabung dengan Channel Komunitas</span>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            {/* Card Dark (Modal) */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white w-full max-w-[460px] p-[40px] rounded-2xl shadow-2xl relative border border-slate-700/50"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-[24px] right-[24px] text-white/50 hover:text-white transition-colors p-[6px] rounded-lg hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-[24px] h-[24px]" />
              </button>
              
              <div className="w-[56px] h-[56px] bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-[28px] shadow-lg">
                <ShieldCheck className="w-[28px] h-[28px] text-white" />
              </div>

              <h3 className="text-[36px] font-bold leading-tight mb-[16px] tracking-tight">Tetap Terhubung</h3>
              <p className="text-[17px] font-normal leading-relaxed mb-[36px] text-white/70">
                Bergabunglah dengan channel VAN-X 313 . ALL IN di WhatsApp untuk menerima pembaruan terbaru, tools enterprise, dan berita developer.
              </p>
              
              <div className="flex flex-col gap-[16px]">
                <a 
                  href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setShowPopup(false)}
                  className="h-[52px] w-full bg-white text-slate-900 text-[15px] font-bold px-[28px] rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center shadow-xl"
                >
                  Gabung Channel Resmi
                </a>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="h-[52px] w-full bg-transparent text-white text-[15px] font-semibold px-[28px] rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/50 active:scale-95 transition-all flex items-center justify-center"
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
            <div className="bg-white text-slate-900 shadow-2xl rounded-2xl border-2 border-slate-200 p-[20px] max-w-md w-full flex items-start gap-[16px]">
              <div className="w-[48px] h-[48px] bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <Download className="w-[24px] h-[24px] text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-[16px] font-bold leading-tight">Instal VAN-X 313 . ALL IN</h4>
                <p className="text-[13px] text-slate-600 mt-[4px]">Tambahkan ke Layar Utama untuk akses lebih cepat.</p>
                <div className="flex items-center gap-[10px] mt-[16px]">
                  <button 
                    onClick={handleInstallClick}
                    className="bg-gradient-to-r from-slate-900 to-slate-700 text-white text-[13px] font-semibold px-[20px] py-[8px] rounded-lg hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg"
                  >
                    Instal Aplikasi
                  </button>
                  <button 
                    onClick={() => setShowInstallPopup(false)}
                    className="bg-transparent text-slate-600 text-[13px] font-medium px-[20px] py-[8px] rounded-lg border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
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

