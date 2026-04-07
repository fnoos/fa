const SHEET_API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMXsvYxcZElwr7tmc6R4ZKtm3IRDpCdSE0uDzJeIXnP5xioSROq2OCp9n7sYu4kiy_Hdd8v3niREw2GFen50FAppNvuKRQRt-ZfMIC_gsrshTu3OlR_Smdd0MpmXu8XHaU6hUpnmG9YLAlsOQtk5uAPVqQGzxaxaErLbYkFC0v3XcL1YAO2mJNd9IStMW620RQK1ndZoWsj1Nc6xVFabqlJfSCctOcI5BnEkqlJkH2ioHqF2xGth_s3rPo1LhccezWEnilLzlzLWVCQOQH0&lib=MW_jymRbi8bNJxFwP9YWfX9Uj6pQy2WoH"; 
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
                <span class="date-text text-[10px] opacity-30 font-bold">${p.date || ''}</span>
            </div>
            <p class="text-2xl leading-[1.8] font-medium opacity-90 mb-8">${p.content}</p>
            
            <div class="flex justify-end pt-5 border-t border-black/5 dark:border-white/5">
                <button onclick="share('${p.content.replace(/'/g, "\\'")}')" class="text-[var(--main-accent)] opacity-40 hover:opacity-100 transition-all p-1">
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

    // بستن همه پنل‌ها قبل از هر چیز (حتی برای تم)
    closePanels();

    if (action === 'theme') {
        toggleDark();
        return;
    }
    
    if (!isAlreadyOpen) {
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
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    // بازگرداندن حالت فعال به خانه در صورتی که منو بسته شد
    document.getElementById('nav-home').classList.add('active');
    document.body.style.overflow = ''; 
}

function toggleDark() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('theme-sun').classList.toggle('hidden', isDark);
    document.getElementById('theme-moon').classList.toggle('hidden', !isDark);
}

function openAbout() { document.getElementById('about-overlay').style.display = 'flex'; }
function closeAbout() { document.getElementById('about-overlay').style.display = 'none'; }

function setTheme(bg, accent, text) {
    document.documentElement.style.setProperty('--main-bg', bg);
    document.documentElement.style.setProperty('--main-accent', accent);
    document.documentElement.style.setProperty('--main-text', text);
    closePanels();
}

function share(text) {
    const shareMessage = `${text}\n\n✨ فانوس\n---------------------------\nهمراه ما باشید در:\nاینستاگرام: instagram.com/fanoosarea\nتلگرام: t.me/fanoosarea`;
    if (navigator.share) {
        navigator.share({ text: shareMessage }).catch(() => copyToClipboard(shareMessage));
    } else {
        copyToClipboard(shareMessage);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast("متن کپی شد!"));
}

function showToast(message) {
    const old = document.querySelector('.toast-msg');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

window.addEventListener('click', function(e) {
    const panels = document.querySelectorAll('.panel-popup');
    const navItems = document.querySelectorAll('.nav-item');
    const aboutOverlay = document.getElementById('about-overlay');
    
    let clickedInsidePanel = false;
    panels.forEach(p => { if(p.contains(e.target)) clickedInsidePanel = true; });
    
    let clickedNav = false;
    navItems.forEach(n => { if(n.contains(e.target)) clickedNav = true; });

    if (!clickedInsidePanel && !clickedNav && e.target !== aboutOverlay) {
        closePanels();
    }
});

window.onload = fetchPosts;