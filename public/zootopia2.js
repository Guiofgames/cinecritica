
const SUPABASE_URL = 'https://dqwsszhbrbxqghyyxrvg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd3NzemhicmJ4cWdoeXl4cnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NjI0NDksImV4cCI6MjA3OTMzODQ0OX0.6fZkR4qpqC4zB5gWg3FLhkWSXP1HOgrdgXA4Dtr4LOI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const els = {
  stars: document.querySelectorAll('.star'),
  ratingInp: document.getElementById('rating'),
  form: document.getElementById('reviewForm'),
  reviewsList: document.getElementById('reviewsList'),
  avgScore: document.getElementById('avgScore'),
  countLabel: document.getElementById('countLabel'),
  search: document.getElementById('search'),
  filter: document.getElementById('filterRating'),
  sort: document.getElementById('sortBy'),
  btnClear: document.getElementById('btnClear'),
  btnSubmit: document.getElementById('btnSubmit'),
  submitLoader: document.getElementById('submitLoader'),
  submitText: document.getElementById('submitText'),
  status: document.getElementById('formStatus'),
  btnRefresh: document.getElementById('btnRefresh')
};


let allReviews = [];


async function fetchReviews() {
  els.reviewsList.innerHTML = '<div style="padding:20px;color:var(--muted)">Carregando avaliações...</div>';

  const { data, error } = await supabase
    .from('reviews_zootopia')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    els.reviewsList.innerHTML = '<div style="color:var(--danger)">Erro ao carregar dados. Verifique o console.</div>';
    return;
  }

  allReviews = data;
  render();
}

async function upsertReview(payload) {
  setLoading(true);

  const { error } = await supabase.from('reviews_zootopia').insert(payload);

  setLoading(false);

  if (error) {
    els.status.style.color = 'var(--danger)';
    els.status.textContent = 'Erro ao salvar: ' + error.message;
  } else {
    els.status.style.color = 'var(--success)';
    els.status.textContent = 'Avaliação enviada com sucesso!';
    els.form.reset();
    setRating(0);
    fetchReviews();

    setTimeout(() => els.status.textContent = '', 3000);
  }
}


function render() {
  let list = [...allReviews];

  const q = (els.search.value || '').toLowerCase().trim();
  if (q) list = list.filter(r => (r.title + r.comment + (r.name || '')).toLowerCase().includes(q));

  const fr = Number(els.filter.value || 0);
  if (fr > 0) list = list.filter(r => r.rating === fr);

  const s = els.sort.value;
  if (s === 'new') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (s === 'old') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (s === 'top') list.sort((a, b) => b.rating - a.rating);
  if (s === 'low') list.sort((a, b) => a.rating - b.rating);

  els.reviewsList.innerHTML = '';
  if (list.length === 0) {
    els.reviewsList.innerHTML = '<div style="padding:28px;color:var(--muted)">Nenhuma avaliação encontrada</div>';
  }

  list.forEach(r => {
    const div = document.createElement('article');
    div.className = 'review';
    div.innerHTML = `
      <div class="avatar">${(r.name || 'AN').slice(0, 2).toUpperCase()}</div>
      <div class="rv-body">
        <div class="rv-head">
          <div>
            <div class="rv-title">${escapeHtml(r.title)}</div>
            <div class="rv-meta">
              ${escapeHtml(r.name || 'Anônimo')} • ${new Date(r.created_at).toLocaleDateString('pt-BR')} 
              <span class="chip">${r.rating}★</span>
            </div>
          </div>
        </div>
        <p style="margin-top:8px;color:var(--muted);white-space:pre-wrap">${escapeHtml(r.comment)}</p>
      </div>
    `;
    els.reviewsList.appendChild(div);
  });

  const count = list.length;
  const totalAvg = allReviews.length ? (allReviews.reduce((a, b) => a + b.rating, 0) / allReviews.length) : 0;

  els.avgScore.textContent = allReviews.length ? (Math.round(totalAvg * 10) / 10) + ' / 5' : '—';
  els.countLabel.textContent = allReviews.length + ' avaliações no total';
}

function setRating(n) {
  els.ratingInp.value = n;
  els.stars.forEach(s => {
    const v = Number(s.dataset.value);
    s.classList.toggle('active', v <= n);
  });
}

function setLoading(isLoading) {
  els.btnSubmit.disabled = isLoading;
  els.submitLoader.style.display = isLoading ? 'block' : 'none';
  els.submitText.style.display = isLoading ? 'none' : 'block';
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

els.stars.forEach(s => {
  s.addEventListener('click', () => setRating(Number(s.dataset.value)));
});

els.form.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const comment = document.getElementById('comment').value.trim();
  const rating = Number(els.ratingInp.value);
  const name = document.getElementById('name').value.trim();


  if (!title || !comment || rating < 1) {
    alert('Preencha título, comentário e selecione uma nota.');
    return;
  }

  upsertReview({ title, comment, rating, name });
});

[els.search, els.filter, els.sort].forEach(el => el.addEventListener('input', render));

els.btnClear.addEventListener('click', () => {
  els.form.reset();
  setRating(0);
});

els.btnRefresh.addEventListener('click', fetchReviews);

window.addEventListener('DOMContentLoaded', fetchReviews);
