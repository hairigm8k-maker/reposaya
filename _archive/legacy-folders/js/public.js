import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-AJp-CHodVdfHBGiAHTFHSBWYZh3p44k",
  authDomain: "fikri-2a880.firebaseapp.com",
  databaseURL: "https://fikri-2a880-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fikri-2a880",
  storageBucket: "fikri-2a880.firebasestorage.app",
  messagingSenderId: "844408547984",
  appId: "1:844408547984:web:63336207d709bb9f090615"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentLang = localStorage.getItem('preferredLang') || 'bm';

// ============================================
// HELPER — Update text/attr pada element
// ============================================
function setEl(sel, value, attr) {
  const el = document.querySelector(sel);
  if (!el || value === undefined || value === null) return;
  if (attr) el.setAttribute(attr, value);
  else el.textContent = value;
}

function setAll(sel, values) {
  const els = document.querySelectorAll(sel);
  values.forEach((v, i) => {
    if (els[i] && v) els[i].textContent = v;
  });
}

// ============================================
// RENDER SECTIONS
// ============================================
function renderSections(s) {
  if (!s) return;

  // Alert bar
  if (s.alertBar) {
    const alertText = document.querySelector('.top-alert-text span:first-child');
    if (alertText) alertText.textContent = s.alertBar;
  }

  // Hero
  if (s.heroLine1) setEl('.hero-big span:nth-child(1)', s.heroLine1);
  if (s.heroLine2) setEl('.hero-big span:nth-child(2)', s.heroLine2);

  // Hero price (SVG)
  if (s.heroPrice) {
    const svgText = document.querySelector('.price-svg-text');
    if (svgText) {
      const m = s.heroPrice.match(/^(RM)?\s*(\d+)\s*(.+)?$/i);
      if (m) {
        const [_, rm = 'RM', num, rest = ''] = m;
        svgText.innerHTML = `${rm}<tspan class="price-svg-99" fill="#E31E24">${num}</tspan> ${rest}`;
      }
    }
  }

  // Kredibiliti
  if (s.kredibiliti) setEl('.kredibiliti-text', s.kredibiliti);

  // Bantu
  if (s.bantuTitle) {
    const lines = s.bantuTitle.split('|');
    const bantu = document.querySelector('.bantu-title');
    if (bantu) bantu.innerHTML = lines.map((l, i) =>
      i === 1 ? `<span class="bantu-outline">${l}</span>` : l
    ).join('<br>');
  }
  if (Array.isArray(s.bantuItems)) {
    setAll('.bantu-list li', s.bantuItems.map(t => t + '|' + t));
    document.querySelectorAll('.bantu-list li').forEach((li, i) => {
      if (s.bantuItems[i]) {
        const svg = li.querySelector('svg');
        li.innerHTML = '';
        const checkSpan = document.createElement('span');
        checkSpan.className = 'check';
        checkSpan.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 13 10 18 19 7"></polyline></svg>';
        li.appendChild(checkSpan);
        li.appendChild(document.createTextNode(' ' + s.bantuItems[i]));
      }
    });
  }

  // Video
  if (s.videoUrl) {
    const video = document.querySelector('.hero-video-bg source');
    if (video) video.src = s.videoUrl;
    const v = document.querySelector('.hero-video-bg');
    if (v) v.load();
  }

  // Pakej
  if (s.pakejTitle) {
    const el = document.querySelector('.pakej-title');
    if (el) {
      const m = s.pakejTitle.match(/^(.*?)(\d+)(.*)$/);
      if (m) el.innerHTML = `${m[1]}<em class="pakej-99">${m[2]}</em>${m[3]}`;
      else el.textContent = s.pakejTitle;
    }
  }
  if (Array.isArray(s.pakejItems)) {
    document.querySelectorAll('.pakej-list li').forEach((li, i) => {
      if (s.pakejItems[i]) {
        li.innerHTML = '<span class="pakej-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 13 10 18 19 7"></polyline></svg></span> ' + s.pakejItems[i];
      }
    });
  }
  if (s.pakejNote) setEl('.pakej-note', s.pakejNote);
  if (s.pakejCtaText) setEl('.pakej-cta', s.pakejCtaText);
  if (s.pakejCtaUrl) {
    const cta = document.querySelector('.pakej-cta');
    if (cta) cta.href = s.pakejCtaUrl;
  }

  // Feedback
  if (s.feedbackTitle) setEl('.feedback-title', s.feedbackTitle);
  if (s.feedbackSub) setEl('.feedback-sub', s.feedbackSub);

  // Blog teaser
  if (s.blogTeaserTitle) setEl('.teaser-head h2', s.blogTeaserTitle);
}

// ============================================
// LOAD — Realtime + tukar bila bahasa berubah
// ============================================
function loadSections(lang) {
  onValue(ref(db, 'sections/' + lang), (snap) => {
    renderSections(snap.val());
  });
}

loadSections(currentLang);

// Expose untuk detect perubahan bahasa
window.reloadSections = function(lang) {
  currentLang = lang;
  loadSections(lang);
};

// Watch localStorage untuk perubahan bahasa
const origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, val) {
  origSetItem(key, val);
  if (key === 'preferredLang' && val !== currentLang) {
    window.reloadSections(val);
  }
};
