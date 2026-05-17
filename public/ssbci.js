let chartInstance = null;
let currentTopic = 'all';
let currentState = '';

function buildApiUrl() {
  const params = new URLSearchParams();
  if (currentTopic && currentTopic !== 'all') params.set('topic', currentTopic);
  if (currentState) params.set('state', currentState);
  return '/api/ssbci-news?' + params.toString();
}

async function loadNews() {
  const container = document.getElementById('articlesContainer');
  container.innerHTML = '<p class="status-msg">Loading SSBCI news...</p>';

  const url = buildApiUrl();
  const response = await fetch(url);
  const data = await response.json();

  console.log('SSBCI news data:', data);

  if (!data.articles || data.articles.length === 0) {
    container.innerHTML = '<p class="status-msg">No SSBCI articles found. Try adjusting your filters.</p>';
    return;
  }

  renderArticles(data.articles, container);
  renderChart(data.articles);
}

function renderArticles(articles, container) {
  const grid = document.createElement('div');
  grid.className = 'articles-grid';

  articles.forEach(function(article) {
    const card = document.createElement('div');
    card.className = 'article-card ssbci-card';

    const publishedDate = dayjs(article.publishedAt).format('MMM D, YYYY');

    let imgHtml = '';
    if (article.image) {
      imgHtml = '<img src="' + article.image + '" alt="Article image" />';
    }

    card.innerHTML = `
      ${imgHtml}
      <div class="card-body">
        <span class="card-source ssbci-source">${article.source.name}</span>
        <p class="card-title">${article.title}</p>
        <p class="card-desc">${article.description || 'No description available.'}</p>
        <span class="card-date">${publishedDate}</span>
        <div class="card-actions">
          <a href="${article.url}" target="_blank">Read More &rarr;</a>
          <button class="btn btn-save ssbci-save-btn" onclick='saveArticle(${JSON.stringify(article)})'>+ Save</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

function categorizeArticle(article) {
  const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();

  if (text.includes('fund') || text.includes('allocat') || text.includes('million') || text.includes('billion') || text.includes('capital')) {
    return 'Funding';
  } else if (text.includes('applic') || text.includes('approv') || text.includes('eligible') || text.includes('award')) {
    return 'Applications';
  } else if (text.includes('state') || text.includes('program') || text.includes('initiative') || text.includes('department')) {
    return 'State Programs';
  } else if (text.includes('policy') || text.includes('legislat') || text.includes('law') || text.includes('bill') || text.includes('congress') || text.includes('regulat')) {
    return 'Policy';
  } else if (text.includes('loan') || text.includes('credit') || text.includes('borrow') || text.includes('lender')) {
    return 'Loans & Credit';
  } else {
    return 'Other';
  }
}

function renderChart(articles) {
  const counts = {
    'Funding': 0,
    'Applications': 0,
    'State Programs': 0,
    'Policy': 0,
    'Loans & Credit': 0,
    'Other': 0
  };

  articles.forEach(function(article) {
    counts[categorizeArticle(article)]++;
  });

  console.log('SSBCI category counts:', counts);

  const ctx = document.getElementById('ssbciChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Articles by SSBCI Category',
        data: Object.values(counts),
        backgroundColor: [
          '#2563eb80',
          '#16a34a80',
          '#d97706a0',
          '#7c3aed80',
          '#0891b280',
          '#64748b80'
        ],
        borderColor: [
          '#2563eb',
          '#16a34a',
          '#d97706',
          '#7c3aed',
          '#0891b2',
          '#64748b'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#94a3b8' },
          grid: { color: '#1e293b' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#1e293b' }
        }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      }
    }
  });
}

async function saveArticle(article) {
  console.log('Saving article:', article.title);

  const response = await fetch('/api/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title,
      source: article.source.name,
      description: article.description || '',
      url: article.url,
      published_at: article.publishedAt,
      image_url: article.image || ''
    })
  });

  if (response.ok) {
    alert('Article saved!');
  } else {
    alert('Could not save article. Please try again.');
  }
}

function searchNews() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  const container = document.getElementById('articlesContainer');
  container.innerHTML = '<p class="status-msg">Searching SSBCI news...</p>';

  const params = new URLSearchParams({ q: query });
  if (currentState) params.set('state', currentState);

  fetch('/api/ssbci-news?' + params.toString())
    .then(r => r.json())
    .then(data => {
      if (!data.articles || data.articles.length === 0) {
        container.innerHTML = '<p class="status-msg">No results found for that search.</p>';
        return;
      }
      renderArticles(data.articles, container);
      renderChart(data.articles);
    });
}

function filterTopic(topic, btn) {
  document.querySelectorAll('.ssbci-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTopic = topic;
  document.getElementById('searchInput').value = '';
  loadNews();
}

function filterState() {
  currentState = document.getElementById('stateSelect').value;
  loadNews();
}

function resetSearch() {
  currentTopic = 'all';
  currentState = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('stateSelect').value = '';
  document.querySelectorAll('.ssbci-filter').forEach(b => b.classList.remove('active'));
  document.querySelector('.ssbci-filter[data-topic="all"]').classList.add('active');
  loadNews();
}

document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchNews();
});

window.onload = function() {
  loadNews();
};
