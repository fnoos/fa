const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwk__J16xhfOD4E6nJqyM7Z2AjqQzwUCSx-iPsFt1eB0JZH6pl7J8HumA2pNggDkz1e/exec"; 
let posts = [];
let currentFilter = 'همه';

async function fetchPosts() {
    try {
        const res = await fetch(SHEET_API_URL);
        const data = await res.json();
        posts = data.reverse(); 
        createDynamicCategories(); 
        renderPosts(posts);
    } catch (e) {
        console.error("خطا در دریافت اطلاعات");
    }
}

function createDynamicCategories() {
    const container = document.getElementById('dynamic-cats');
    const tags = ['همه', ...new Set(posts.map(p => p.tag))];
    container.innerHTML = tags.map(tag => `
        <div class="cat-btn ${tag === 'همه' ? 'active' : ''}" onclick="filterCat(this, '${tag}')">
            ${tag}
        </div>
    `).join('');
}

function renderPosts(dataArray) {
    const container = document.getElementById('content-area');
    
    if (dataArray.length === 0) {
        container.innerHTML = '<p class="text-center opacity-40 py-10">موردی یافت نشد...</p>';
        return;
    }

    container.innerHTML = dataArray.map(p => `
        <article class="glass-card">
            <div class="flex justify-between items-center mb-5">
                <span class="tag">${p.tag}</span>
                <span class="date-text opacity-30 font-bold">${p.date || ''}</span>
            </div>
            <p class="text-2xl leading-[1.8] font-medium opacity-90 mb-8">${p.content}</p>
            
            <div class="flex justify-end pt-5 border-t border-black/5 dark:border-white/5">
                <button onclick="share(event, '${p.content.replace(/'/g, "\\'")}')" class="text-[var(--main-accent)] opacity-40 hover:opacity-100 transition-all p-1">
                    <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                </button>
            </div>
        </article>
    `).join('');
}

function searchPosts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const baseList = currentFilter === 'همه' ? posts : posts.filter(p => p.tag === currentFilter);
    const filtered = baseList.filter(p => 
        p.content.toLowerCase().includes(term) || 
        (p.tag && p.tag.toLowerCase().includes(term)) ||
        (p.date && p.date.toString().includes(term))
    );
    renderPosts(filtered);
}

function filterCat(btn, tag) {
    currentFilter = tag;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('searchInput').value = '';
    const filtered = tag === 'همه' ? posts : posts.filter(p => p.tag === tag);
    renderPosts(filtered);
    closePanels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleNav(action) {
    const targetPanel = action === 'categories' ? 'category-panel' : (action === 'colors' ? 'color-panel' : null);
    const isAlreadyOpen = targetPanel ? document.getElementById(targetPanel).classList.contains('show') : false;

    if (action === 'theme') {
        toggleDark();
        return;
    }

    if (isAlreadyOpen) {
        closePanels();
    } else {
        document.querySelectorAll('.panel-popup').forEach(p => p.classList.remove('show'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

        if (action === 'home') {
            document.getElementById('nav-home').classList.add('active');
            currentFilter = 'همه';
            document.getElementById('searchInput').value = '';
            renderPosts(posts);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'categories') {
            document.getElementById('nav-cats').classList.add('active');
            document.getElementById('category-panel').classList.add('show');
            document.body.style.overflow = 'hidden'; 
        } else if (action === 'colors') {
            document.getElementById('nav-colors').classList.add('active');
            document.getElementById('color-panel').classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
}

function closePanels() {
    document.querySelectorAll('.panel-popup').forEach(p => p.classList.remove('show'));
    document.body.style.overflow = ''; 
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    if (currentFilter !== 'همه') {
        document.getElementById('nav-cats').classList.add('active');
    } else {
        document.getElementById('nav-home').classList.add('active');
    }
}

function toggleDark() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('theme-sun').classList.toggle('hidden', isDark);
    document.getElementById('theme-moon').classList.toggle('hidden', !isDark);
}

function openAbout() { 
    document.getElementById('about-overlay').style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
}

function closeAbout() { 
    document.getElementById('about-overlay').style.display = 'none'; 
    document.body.style.overflow = ''; 
}

function setTheme(bg, accent, text) {
    document.documentElement.style.setProperty('--main-bg', bg);
    document.documentElement.style.setProperty('--main-accent', accent);
    document.documentElement.style.setProperty('--main-text', text);
    closePanels();
}

// --- بخش اصلاح شده برای حل مشکل آیفون و لرزش اندروید ---
function share(event, text) {
    const shareMessage = `${text}\n\n✨ فانوس\n---------------------------\nهمراه ما باشید در:\nاینســــتا: instagram.com/fanoosarea\nتلگــــرام: t.me/fanoosarea\nتیک تاک: tiktok.com/@fanoosarea\nســــایت: fa.fanos.workers.dev`;
    
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (navigator.share && isIOS) {
        // در آیفون فقط از منوی سیستم استفاده می‌کنیم (بدون کپی دستی برای جلوگیری از تداخل)
        navigator.share({ text: shareMessage }).catch(() => {});
    } else {
        // در اندروید و پی‌سی ابتدا کپی می‌کنیم و پیام می‌دهیم
        showFeedback(event);
        copyToClipboardManual(shareMessage);

        // در اندروید، با کمی تاخیر منو را باز می‌کنیم تا لرزش حذف شود
        if (navigator.share) {
            setTimeout(() => {
                navigator.share({ text: shareMessage }).catch(() => {});
            }, 300);
        }
    }
}

function copyToClipboardManual(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showFeedback(event) {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.innerText = 'لینک و متن کپی شد';
    
    let x = event.clientX || (event.touches ? event.touches[0].clientX : 0);
    let y = event.clientY || (event.touches ? event.touches[0].clientY : 0);
    
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y - 35}px`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.add('fade-out');
        setTimeout(() => feedback.remove(), 400);
    }, 800);
}

window.addEventListener('click', function(e) {
    const panels = document.querySelectorAll('.panel-popup');
    const navItems = document.querySelectorAll('.nav-item');
    const aboutOverlay = document.getElementById('about-overlay');
    
    let clickedInsidePanel = false;
    panels.forEach(p => { if(p.contains(e.target)) clickedInsidePanel = true; });
    
    let clickedNav = false;
    navItems.forEach(n => { if(n.contains(e.target)) clickedNav = true; });

    if (!clickedInsidePanel && !clickedNav) {
        if (e.target === aboutOverlay || aboutOverlay.contains(e.target)) {
            closeAbout(); 
        } else {
            closePanels();
        }
    }
});

window.onload = fetchPosts;