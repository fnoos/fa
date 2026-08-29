import slogans from '../data/slogans.json';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FanoosApp({ posts }: { posts: any[] }) {
  const [openDrawer, setOpenDrawer] = useState<null | 'cat' | 'color' | 'about'>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [themeColor, setThemeColor] = useState('#10b981');

  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlogan, setCurrentSlogan] = useState('');

  useEffect(() => {
    const savedDark = localStorage.getItem('fanoos_dark');
    const savedColor = localStorage.getItem('fanoos_color');
    const savedSize = localStorage.getItem('fanoos_size');

    if (savedDark !== null) setIsDarkMode(savedDark === 'true');
    if (savedColor !== null) setThemeColor(savedColor);
    if (savedSize !== null) setFontSize(parseInt(savedSize));
  }, []);

  useEffect(() => {
    localStorage.setItem('fanoos_dark', isDarkMode.toString());
    localStorage.setItem('fanoos_color', themeColor);
    localStorage.setItem('fanoos_size', fontSize.toString());
  }, [isDarkMode, themeColor, fontSize]);
  
  useEffect(() => {
    if (slogans && slogans.length > 0) {
      const randomIndex = Math.floor(Math.random() * slogans.length);
      setCurrentSlogan(slogans[randomIndex]);
    }
  }, []);

  useEffect(() => {
    if (openDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [openDrawer]);

  const colors = ['#a78bfa', '#38bdf8', '#fb7185', '#10b981', '#ffb088'];
  
  const cleanText = (text: string) => 
    text?.replace(/[\u064B-\u065F\u0640\u0610-\u061A]/g, "") 
        .replace(/‌/g, " ") 
        .replace(/ی/g, 'ی').replace(/ک/g, 'ک')
        .trim() || '';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchQuery('');
    setSelectedCategory('همه');
    setOpenDrawer(null);
  };

  const dynamicCategories = useMemo(
    () => ['همه', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))],
    [posts]
  );

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const postCat = p.category ? p.category.trim() : '';
      const targetCat = selectedCategory.trim();
      
      if (searchQuery !== '') {
        const normalizedQuery = searchQuery
          .replace(/_/g, '')
          .replace(/\u200c/g, '')
          .replace(/\s/g, '')
          .toLowerCase();

        const normalizedContent = (p.content || '')
          .replace(/_/g, '')
          .replace(/\u200c/g, '')
          .replace(/\s/g, '')
          .toLowerCase();

        const normalizedHashtags = (p.hashtags || '')
          .replace(/_/g, '')
          .replace(/\u200c/g, '')
          .replace(/\s/g, '')
          .toLowerCase();

        const isMatch = normalizedContent.includes(normalizedQuery) || 
                        normalizedHashtags.includes(normalizedQuery);
        
        return isMatch;
      }
      
      return selectedCategory === 'همه' || postCat === targetCat;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <main style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#121212' : `${themeColor}15`, 
      transition: '0.4s', 
      direction: 'rtl' 
    }}>
      <style>{`
        .post-card .interactive-icons { opacity: 0; transition: 0.3s; }
        .post-card:hover .interactive-icons, .post-card:active .interactive-icons { opacity: 1; }
        .hashtag-link { color: ${themeColor}; text-decoration: none; font-weight: 800; cursor: pointer; }
        .post-card blockquote {
          margin: 18px 0;
          padding: 18px 24px;
          border-right: 5px solid ${themeColor};
          border-radius: 20px;
          background: ${isDarkMode ? '#13151a' : `${themeColor}0d`};
          box-shadow: 0 12px 28px -14px rgba(0, 0, 0, 0.35);
          font-size: 1.02em;
          font-weight: 500;
          line-height: 1.8;
          color: inherit;
        }
        .post-card blockquote p { margin: 0; }
        .copy-feedback { position: fixed; background: #333; color: #fff; padding: 6px 12px; border-radius: 10px; font-size: 12px; z-index: 1000; pointer-events: none; transition: 0.4s; }
        .fade-out { opacity: 0; transform: translateY(-10px); }
        .social-icon { transition: 0.3s; display: flex; align-items: center; justify-content: center; width: 45px; height: 45px; border-radius: 50%; }
        .social-icon img { transition: 0.3s; filter: ${isDarkMode ? 'invert(1)' : 'none'}; }
        .social-icon:active { background-color: ${themeColor}; transform: scale(0.9); }
        .social-icon:active img { filter: ${isDarkMode ? 'brightness(0)' : 'brightness(0) invert(1)'}; }
        @media (hover: none) {
          .post-card .interactive-icons { opacity: 1; }
        }
      `}</style>
      
      <AnimatePresence>
        {(openDrawer && openDrawer !== 'about') && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setOpenDrawer(null)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 90, backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openDrawer === 'about' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}
            onClick={() => setOpenDrawer(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', 
                borderRadius: '40px', 
                padding: '30px 25px', 
                maxWidth: '380px', 
                width: '100%', 
                height: 'auto', 
                textAlign: 'center', 
                boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ textAlign: 'right', direction: 'rtl' }}>
                <h2 style={{ color: themeColor, fontWeight: '900', fontSize: '24px', marginBottom: '15px', textAlign: 'center' }}>درباره فانوس</h2>
                <strong style={{ fontSize: '18px', display: 'block', marginBottom: '10px', fontWeight: '900', color: themeColor }}>فانوس | رفیقِ شب‌های تردید 🌙</strong>
                
                <div style={{ color: isDarkMode ? '#eee' : '#333', lineHeight: '1.7', fontSize: '15px', textAlign: 'justify' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    همه ما شب‌هایی را داشته‌ایم که سوالات مثل خوره به جانمان افتاده‌اند. اینجا نه قرار است نصیحت بشنوی و نه قرار است با کلماتِ سنگین محاصره شوی. ما فقط فانوسی را بالا گرفته‌ایم تا در کنار هم، راه را از بیراهه، و حقیقت را از نمایش‌های ساختگی تشخیص دهیم.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    قلبِ تو بزرگ‌تر از آن است که در قفسِ «پوچی» بماند.
                  </p>
                  <p style={{ margin: '0' }}>
                    بیا با هم، از نو شروع کنیم. 🤍
                  </p>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', borderTop: isDarkMode ? '1px solid #333' : '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
                  <a href="https://t.me/fanoosarea" target="_blank" rel="noreferrer" onMouseEnter={() => setHoveredSocial('tel')} onMouseLeave={() => setHoveredSocial(null)}><IconTelegram color={hoveredSocial === 'tel' ? themeColor : '#999'} /></a>
                  <a href="https://instagram.com/fanoosarea" target="_blank" rel="noreferrer" onMouseEnter={() => setHoveredSocial('insta')} onMouseLeave={() => setHoveredSocial(null)}><IconInsta color={hoveredSocial === 'insta' ? themeColor : '#999'} /></a>
                  <a href="https://tiktok.com/@fanoosarea" target="_blank" rel="noreferrer" onMouseEnter={() => setHoveredSocial('tik')} onMouseLeave={() => setHoveredSocial(null)}><IconTiktok color={hoveredSocial === 'tik' ? themeColor : '#999'} /></a>
                </div>
                <button onClick={() => setOpenDrawer(null)} style={{ backgroundColor: themeColor, color: '#fff', border: 'none', padding: '12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', width: '100%' }}>بستن پنجره</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '40px 10px 10px', textAlign: 'center', position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ position: 'absolute', left: '13px', top: '48px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ position: 'relative' }} onMouseEnter={() => setHoveredIcon('about')} onMouseLeave={() => setHoveredIcon(null)}>
            <div onClick={() => setOpenDrawer('about')} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
              <IconAbout themeColor={themeColor} />
            </div>
            {hoveredIcon === 'about' && (
              <div style={{ position: 'absolute', left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)', backgroundColor: themeColor, color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '13px', fontFamily: "'Vazirmatn', sans-serif", whiteSpace: 'nowrap', zIndex: 1000, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: 'none', borderRight: '6px solid ' + themeColor }} />
                درباره ما
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }} onMouseEnter={() => setHoveredIcon('projects')} onMouseLeave={() => setHoveredIcon(null)}>
            <div onClick={() => window.open('https://mohajercul.vercel.app/', '_blank', 'noopener')} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
              <IconProjects themeColor={themeColor} />
            </div>
            {hoveredIcon === 'projects' && (
              <div style={{ position: 'absolute', left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)', backgroundColor: themeColor, color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '13px', fontFamily: "'Vazirmatn', sans-serif", whiteSpace: 'nowrap', zIndex: 1000, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: 'none', borderRight: '6px solid ' + themeColor }} />
                پروژه‌های دیگر
              </div>
            )}
          </div>
        </div>
        <h1 style={{ color: themeColor, fontSize: '48px', fontWeight: '900', margin: 0 }}>فـانـوس</h1>
        <p style={{ color: isDarkMode ? '#888' : '#666', fontSize: '14px', fontWeight: '700', marginTop: '8px', marginBottom: '15px' }}>
          {currentSlogan}
        </p>
      </div>

      <div style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '160px', maxWidth: '480px', margin: '0 auto' }}>
        <input 
          type="text" 
          placeholder="جستجو در فانوس..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ width: '100%', padding: '18px 25px', borderRadius: '25px', backgroundColor: isDarkMode ? '#222' : '#fff', color: isDarkMode ? '#fff' : '#333', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', boxSizing: 'border-box', outline: 'none' }} 
        />

        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} fontSize={fontSize} themeColor={themeColor} isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '350px', zIndex: 100 }}>
        <AnimatePresence>
          {openDrawer === 'cat' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ width: '100%', marginBottom: '12px', backgroundColor: isDarkMode ? '#222' : '#fff', borderRadius: '25px', padding: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {dynamicCategories.map(cat => (
                  <div key={cat} onClick={() => {
                    setSelectedCategory(cat); 
                    setSearchQuery('');
                    setOpenDrawer(null);
                  }} style={{ padding: '12px', textAlign: 'center', borderRadius: '15px', backgroundColor: selectedCategory === cat ? themeColor : 'rgba(128,128,128,0.05)', color: selectedCategory === cat ? '#fff' : (isDarkMode ? '#bbb' : '#555'), fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>{cat}</div>
                ))}
              </div>
            </motion.div>
          )}

          {openDrawer === 'color' && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ width: 'fit-content', marginBottom: '12px', backgroundColor: isDarkMode ? '#222' : '#fff', borderRadius: '25px', padding: '15px 20px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
                {colors.map(c => (
                  <div key={c} onClick={() => {setThemeColor(c); setOpenDrawer(null)}} style={{ width: '45px', height: '45px', borderRadius: '15px', backgroundColor: c, cursor: 'pointer', border: themeColor === c ? (isDarkMode ? '3px solid #fff' : '3px solid #333') : 'none', flexShrink: 0 }} />
                ))}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <nav style={{ backgroundColor: isDarkMode ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)', height: '75px', borderRadius: '28px', display: 'flex', alignItems: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
          <div onClick={() => { scrollToTop(); setOpenDrawer(null); }} style={navItem}><IconHome color={(selectedCategory === 'همه' && searchQuery === '') ? themeColor : '#999'} /><span style={{...navText, color: (selectedCategory === 'همه' && searchQuery === '') ? themeColor : '#999'}}>خانه</span></div>
          <div onClick={() => setOpenDrawer(openDrawer === 'cat' ? null : 'cat')} style={navItem}><IconGrid color={(openDrawer === 'cat' || (selectedCategory !== 'همه' && searchQuery === '')) ? themeColor : '#999'} /><span style={{...navText, color: (openDrawer === 'cat' || (selectedCategory !== 'همه' && searchQuery === '')) ? themeColor : '#999'}}>دسته</span></div>
          <div onClick={() => setOpenDrawer(openDrawer === 'color' ? null : 'color')} style={navItem}><IconColor color={openDrawer === 'color' ? themeColor : '#999'} /><span style={{...navText, color: openDrawer === 'color' ? themeColor : '#999'}}>رنگ</span></div>
          <div onClick={() => { setIsDarkMode(!isDarkMode); setOpenDrawer(null); }} style={navItem}>{isDarkMode ? <IconSun /> : <IconMoon />}<span style={{...navText, color: '#999'}}>تم</span></div>
          <div onClick={() => { setFontSize(fontSize >= 28 ? 16 : fontSize + 3); setOpenDrawer(null); }} style={navItem}><div style={{ width: '28px', height: '28px', backgroundColor: themeColor, borderRadius: '50%', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', fontWeight: '900' }}>Aa</div><span style={{...navText, color: '#999'}}>سایز</span></div>
        </nav>
      </div>
    </main>
  );
}

function AudioPlayer({ src, themeColor, isDarkMode }: any) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const seek = (e: any) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const changeSpeed = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeed(false);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => setPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
    };
  }, []);

  useEffect(() => {
    if (!showSpeed) return;
    const close = () => setShowSpeed(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showSpeed]);

  const handleDownload = (e: any) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = src;
    a.download = '';
    a.click();
  };

  const handleShareAudio = (e: any) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: '', text: '🎧 یه صوت از فانوس', url: src });
    } else {
      navigator.clipboard.writeText(src);
      const fb = document.createElement('div');
      fb.innerText = 'لینک صوت کپی شد';
      fb.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:14px;font-size:13px;font-weight:700;z-index:999;font-family:Vazirmatn,sans-serif;direction:rtl';
      document.body.appendChild(fb);
      setTimeout(() => { fb.classList.add('fade-out'); setTimeout(() => fb.remove(), 400); }, 1200);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  const Tip = ({ text }: any) => (
    <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', backgroundColor: isDarkMode ? '#444' : '#333', color: '#fff', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', zIndex: 20, fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' }}>
      {text}
    </div>
  );

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '14px', backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: '18px', padding: '14px', position: 'relative' }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div onClick={togglePlay} onMouseEnter={() => setTip('play')} onMouseLeave={() => setTip(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: themeColor, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 12px ${themeColor}40`, position: 'relative' }}>
          <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24">
            {playing ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
          {tip === 'play' && <Tip text={playing ? 'توقف' : 'پخش'} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={seek} style={{ height: '6px', backgroundColor: isDarkMode ? '#444' : '#ddd', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: themeColor, borderRadius: '3px', transition: 'width 0.1s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: isDarkMode ? '#888' : '#999' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={(e) => { e.stopPropagation(); setShowSpeed(!showSpeed); }} onMouseEnter={() => setTip('speed')} onMouseLeave={() => setTip(null)} style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#aaa' : '#777', padding: '4px 6px', borderRadius: '8px', backgroundColor: isDarkMode ? '#3a3a3a' : '#e8e8e8', position: 'relative' }}>
            {playbackRate}x
            {tip === 'speed' && <Tip text="سرعت پخش" />}
            {showSpeed && (
              <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: isDarkMode ? '#333' : '#fff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', padding: '6px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {speeds.map(s => (
                  <div key={s} onClick={(e) => { e.stopPropagation(); changeSpeed(s); }} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: playbackRate === s ? themeColor : 'transparent', color: playbackRate === s ? '#fff' : (isDarkMode ? '#ccc' : '#555'), whiteSpace: 'nowrap' }}>{s}x</div>
                ))}
              </div>
            )}
          </div>
          <div onClick={handleShareAudio} onMouseEnter={() => setTip('share')} onMouseLeave={() => setTip(null)} style={{ cursor: 'pointer', flexShrink: 0, position: 'relative', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" stroke={isDarkMode ? '#888' : '#999'} strokeWidth="2" fill="none" /></svg>
            {tip === 'share' && <Tip text="اشتراک صوت" />}
          </div>
          <div onClick={handleDownload} onMouseEnter={() => setTip('download')} onMouseLeave={() => setTip(null)} style={{ cursor: 'pointer', flexShrink: 0, position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" stroke={isDarkMode ? '#888' : '#999'} strokeWidth="2" fill="none" /></svg>
            {tip === 'download' && <Tip text="دانلود" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, fontSize, themeColor, isDarkMode, setSearchQuery }: any) {
  const readingTimeText = useMemo(() => {
    const words = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const seconds = Math.max(3, Math.ceil(words * 0.8));
    return seconds < 60 ? `${seconds} ثانیه مطالعه` : `${Math.ceil(seconds / 60)} دقیقه مطالعه`;
  }, [post.content]);

  const handleShare = async (e: any) => {
    e.stopPropagation();
    const plainText = post.content.replace(/<[^>]*>/g, '').trim();
    const shareMessage = `${plainText}\n\n✨ فـانـوس\n---------------------------\nهمراه ما باشید در:\n\nتلگرام: t.me/fanoosarea\nاینستا: instagram.com/fanoosarea\nسایت: https://fanoosarea.vercel.app`;
    try {
      await navigator.clipboard.writeText(shareMessage);
      showFeedback(e);
    } catch (err) {}
    if (navigator.share) {
      try {
        await navigator.share({ title: "", text: shareMessage });
      } catch (err) {}
    }
  };

  const showFeedback = (event: any) => {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.innerText = 'متن کپی و آماده ارسال شد';
    feedback.style.left = `${event.clientX}px`;
    feedback.style.top = `${event.clientY - 40}px`;
    document.body.appendChild(feedback);
    setTimeout(() => {
      feedback.classList.add('fade-out');
      setTimeout(() => feedback.remove(), 400);
    }, 1000);
  };

  const renderHashtags = (tags: string) => {
    if (!tags) return null;
    return tags.split('  ').filter(t => t.trim() !== "").map((tag, i) => {
      const internalTag = tag.trim().replace(/ /g, '_');
      const fullTag = internalTag.startsWith('#') ? internalTag : `#${internalTag}`;
      const visualTag = fullTag.replace(/_/g, '\u200c');

      return (
        <span key={i} className="hashtag-link" onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setSearchQuery(internalTag); 
        }} style={{ marginLeft: '12px' }}>
          {visualTag}
        </span>
      );
    });
  };

  return (
    <motion.article className="post-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', padding: '25px', borderRadius: '35px', border: isDarkMode ? '1px solid #333' : '1px solid #f0f0f0', position: 'relative' }}>
      <style>{`.post-card .interactive-icons { opacity: 0; transition: opacity 0.2s; } .post-card:hover .interactive-icons, .post-card:active .interactive-icons { opacity: 1; }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
        <span style={{ backgroundColor: `${themeColor}15`, color: themeColor, padding: '8px 16px', borderRadius: '12px', fontWeight: '900', fontSize: '14px' }}>{post.category}</span>
        <span style={{ color: '#bbb', fontSize: '13px' }}>{post.date}</span>
      </div>
      <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.8', color: isDarkMode ? '#eee' : '#444', textAlign: 'justify', textJustify: 'inter-word' }} dangerouslySetInnerHTML={{ __html: post.content }} />
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{renderHashtags(post.hashtags)}</div>
      {post.audio_url && <AudioPlayer src={post.audio_url} themeColor={themeColor} isDarkMode={isDarkMode} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: post.audio_url ? '12px' : '18px', borderTop: '1px solid rgba(128,128,128,0.08)', paddingTop: '15px' }}>
        <div className="interactive-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div onClick={handleShare} style={{cursor: 'pointer'}}><IconShare /></div>
        </div>
        <span style={{ color: '#bbb', fontSize: '11px', fontWeight: '500' }}>{readingTimeText}</span>
      </div>
    </motion.article>
  );
}

const navItem = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '5px', flex: 1, cursor: 'pointer' };
const navText = { fontSize: '12px', fontWeight: '700' };
const IconHome = ({color}: any) => <svg width="24" height="24" fill={color} viewBox="0 0 24 24"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875-0 01-1.875-1.875v-6.198a2.29 2.29 0 00-.086L12 5.432z" /></svg>;
const IconGrid = ({color}: any) => <svg width="24" height="24" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const IconMoon = () => <svg width="24" height="24" fill="#999" viewBox="0 0 24 24"><path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" /></svg>;
const IconSun = () => <svg width="24" height="24" fill="none" stroke="#999" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const IconShare = () => <svg width="20" height="20" fill="none" stroke="#ccc" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IconColor = ({color}: any) => (
  <svg width="26" height="26" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
  </svg>
);
const IconAbout = ({themeColor}: any) => (
  <div style={{ width: '20px', height: '20px', backgroundColor: themeColor, WebkitMaskImage: 'url("/about.svg")', maskImage: 'url("/about.svg")', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
);
const IconProjects = ({themeColor}: any) => (
  <div style={{ width: '20px', height: '20px', backgroundColor: themeColor, WebkitMaskImage: 'url("/projects.svg")', maskImage: 'url("/projects.svg")', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
);
const IconTelegram = ({color}: any) => <div style={{ width: '28px', height: '28px', backgroundColor: color, WebkitMaskImage: 'url("/tel.svg")', maskImage: 'url("/tel.svg")', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }} />;
const IconInsta = ({color}: any) => <div style={{ width: '28px', height: '28px', backgroundColor: color, WebkitMaskImage: 'url("/insta.svg")', maskImage: 'url("/insta.svg")', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }} />;
const IconTiktok = ({color}: any) => <div style={{ width: '28px', height: '28px', backgroundColor: color, WebkitMaskImage: 'url("/tik.svg")', maskImage: 'url("/tik.svg")', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }} />;
