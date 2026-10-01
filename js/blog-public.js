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

onValue(ref(db, 'articles'), (snap) => {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const data = snap.val();
  if (!data) {
    grid.innerHTML = '<p class="loading-blog">Belum ada artikel.</p>';
    return;
  }

  const articles = Object.entries(data)
    .map(([id, a]) => ({ id, ...a }))
    .filter(a => a.published !== false)
    .sort((a, b) => (b.date || 0) - (a.date || 0));

  if (articles.length === 0) {
    grid.innerHTML = '<p class="loading-blog">Belum ada artikel.</p>';
    return;
  }

  grid.innerHTML = articles.map(a => {
    const url = 'blog/artikel.html?slug=' + encodeURIComponent(a.slug || a.id);
    const date = a.date ? new Date(a.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const lang = (a.lang || 'bm').toUpperCase();
    return `
      <a href="${url}" class="blog-card">
        <h2>${a.title || 'Tanpa Tajuk'}</h2>
        <p>${a.excerpt || ''}</p>
        <div class="blog-card-meta">
          <span class="blog-card-link">Baca artikel →</span>
          <span class="blog-card-date">${date} · ${lang}</span>
        </div>
      </a>
    `;
  }).join('');
});
