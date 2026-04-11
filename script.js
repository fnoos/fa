const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwk__J16xhfOD4E6nJqyM7Z2AjqQzwUCSx-iPsFt1eB0JZH6pl7J8HumA2pNggDkz1e/exec"; 
let posts = [];
let currentFilter = 'همه';
let scrollY = 0;

// ✅ ۱. منطق چرخش فونت (هماهنگ با دایره رنگی جدید)
let fontState = 0; 
function rotateFontSize() {
    closePanels(); // 👈 این خط اضافه شد تا موقع تغییر سایز، بقیه پنل‌ها بسته شوند
    
    const sizes = ['18px', '21px', '24px', '27px', '30px'];
    fontState = (fontState + 1) % sizes.length;
    document.documentElement.style.setProperty('--user-font-size', sizes[fontState]);
    
    // ایجاد افکت ضربان روی دایره رنگی
    const fontCircle = document.querySelector('.font-icon-circle');
    if (fontCircle) {
        fontCircle.style.transform = 'scale(1.2)';
        setTimeout(() => fontCircle.style.transform = 'scale(1)', 200);
    }
}

// -------------------- POSTS --------------------
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
    const tags = ['همه', ...new Set(posts.map(p => p.category).filter(Boolean))];
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
    container.innerHTML = dataArray.map(p => {
        const categoryVal = p.category || "بدون دسته"; 
        const hashtagsVal = p.hashtags || "";         
        
        const tagsHtml = hashtagsVal ? hashtagsVal.split(',').map(t => `
            <span class="sub-tag" onclick="event.stopPropagation(); filterByHashtag('${t.trim()}')">#${t.trim()}</span>
        `).join('') : '';

        const safeContent = p.content
            .replace(/'/g, "\\'")     
            .replace(/\n/g, "\\n")    
            .replace(/\r/g, "\\r");

        return `
        <article class="glass-card">
            <div class="flex justify-between items-center mb-5">
                <span class="tag">${categoryVal}</span>
                <span class="date-text opacity-30 font-bold">${p.date || ''}</span>
            </div>
            <p class="post-content font-medium opacity-90 mb-8">${p.content}</p>
            <div class="flex justify-between items-center pt-5 border-t border-black/5 dark:border-white/5">
                <div class="sub-tags-container">
                    ${tagsHtml}
                </div>
                <button onclick="share(event, '${safeContent}')" class="text-[var(--main-accent)] opacity-40 hover:opacity-100 transition-all p-1">
                    <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                </button>
            </div>
        </article>
    `}).join('');
}

function filterByHashtag(tagName) {
    const filtered = posts.filter(p => (p.hashtags || "").includes(tagName));
    renderPosts(filtered);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------- FILTER --------------------
function searchPosts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const baseList = currentFilter === 'همه' ? posts : posts.filter(p => p.category === currentFilter);
    const filtered = baseList.filter(p => 
        p.content.toLowerCase().includes(term) || 
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.hashtags && p.hashtags.toLowerCase().includes(term)) ||
        (p.date && p.date.toString().includes(term))
    );
    renderPosts(filtered);
}

function filterCat(btn, tag) {
    currentFilter = tag;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('searchInput').value = '';
    const filtered = tag === 'همه' ? posts : posts.filter(p => p.category === tag);
    renderPosts(filtered);
    closePanels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------- SCROLL LOCK --------------------
function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
}

function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
}

// -------------------- PANELS --------------------
function handleNav(action) {
    if (action === 'theme') {
        closePanels();
        toggleDark();
        return;
    }
    const targetPanel = action === 'categories' ? 'category-panel' : (action === 'colors' ? 'color-panel' : null);
    const isAlreadyOpen = targetPanel ? document.getElementById(targetPanel).classList.contains('show') : false;

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
        } else {
            if (action === 'categories') {
                document.getElementById('nav-cats').classList.add('active');
                document.getElementById('category-panel').classList.add('show');
            } else if (action === 'colors') {
                document.getElementById('nav-colors').classList.add('active');
                document.getElementById('color-panel').classList.add('show');
            }
            lockScroll();
        }
    }
}

function closePanels() {
    document.querySelectorAll('.panel-popup').forEach(p => p.classList.remove('show'));
    unlockScroll();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (currentFilter !== 'همه') {
        document.getElementById('nav-cats').classList.add('active');
    } else {
        document.getElementById('nav-home').classList.add('active');
    }
}

// -------------------- ABOUT --------------------
function openAbout() {
    document.getElementById('about-overlay').style.display = 'flex';
    lockScroll();
}

function closeAbout() {
    document.getElementById('about-overlay').style.display = 'none';
    unlockScroll();
}

// -------------------- OTHER --------------------
function toggleDark() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('theme-sun').classList.toggle('hidden', isDark);
    document.getElementById('theme-moon').classList.toggle('hidden', !isDark);
}

function setTheme(bg, accent, text) {
    document.documentElement.style.setProperty('--main-bg', bg);
    document.documentElement.style.setProperty('--main-accent', accent);
    document.documentElement.style.setProperty('--main-text', text);
    closePanels();
}

// -------------------- SHARE --------------------
async function share(event, text) {
    // اضافه کردن یک فاصله دقیق قبل از لینک‌ها برای شناسایی در iOS
    const shareMessage = `${text}
    
✨ فـانـوس
---------------------------
همراه ما باشید در:
اینستـــا: instagram.com/fanoosarea
تلگـــرام: t.me/fanoosarea
تیک تاک: tiktok.com/@fanoosarea
ســـایت: fa.fanos.workers.com`;

    try {
        // متنی که کپی می‌شود
        await navigator.clipboard.writeText(shareMessage);
    } catch (err) {
        console.error("خطا در کپی");
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (navigator.share && isMobile) {
        try {
            // در متد share، بهتر است لینک سایت را در فیلد url هم بفرستیم تا آیفون حتما آن را بشناسد
            await navigator.share({ 
                title: "فانوس", 
                text: shareMessage
            });
        } catch (err) {}
    }
    showFeedback(event);
}

function showFeedback(event) {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.innerText = 'متن و لینک کپی شد';
    
    if (event && event.clientX && event.clientY) {
        feedback.style.left = `${event.clientX}px`;
        feedback.style.top = `${event.clientY - 40}px`;
    } else {
        feedback.style.left = '50%';
        feedback.style.top = '50%';
    }
    
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.classList.add('fade-out');
        setTimeout(() => feedback.remove(), 400);
    }, 1000);
}

// -------------------- CLICK LISTENER --------------------
window.addEventListener('click', function(e) {
    const aboutOverlay = document.getElementById('about-overlay');
    if (e.target === aboutOverlay) {
        closeAbout();
        return;
    }

    let clickedInsidePanel = false;
    document.querySelectorAll('.panel-popup').forEach(p => {
        if (p.contains(e.target)) clickedInsidePanel = true;
    });

    const isNav = e.target.closest('.nav-item');
    const isFont = e.target.closest('.special-font-btn'); 
    const isOpen = document.querySelector('.panel-popup.show');

    if (isOpen && !clickedInsidePanel && !isNav && !isFont) {
        closePanels();
    }
});

window.onload = fetchPosts;