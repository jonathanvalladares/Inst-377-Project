let chartInstance = null;

async function loadNews(query) {
  const container = document.getElementById('articlesContainer');
  container.innerHTML = '<p class="status-msg">Loading news...</p>';

  const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
  const data = await response.json();

  if (!data.articles || data.articles.length === 0) {
    container.innerHTML = '<p class="status-msg">No articles found. Try a different search.</p>';
    return;
  }

  renderArticles(data.articles, container);
  renderChart(data.articles);
}

function renderArticles(articles, container) {
  const grid = document.createElement('div');
  grid.className = 'articles-grid';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'article-card';

    const publishedDate = dayjs(article.publishedAt).format('MMM D, YYYY');

    const imgHtml = article.image
      ? `<img src="${article.image}" alt="Article image" onerror="this.style.display='none'" />`
      : '';

    card.innerHTML = `
      ${imgHtml}
      <div class="card-body">
        <span class="card-source">${article.source.name}</span>
        <p class="card-title">${article.title}</p>
        <p class="card-desc">${article.description || 'No description available.'}</p>
        <span class="card-date">${publishedDate}</span>
        <div class="card-actions">
          <a href="${article.url}" target="_blank" rel="noopener">Read More &rarr;</a>
          <button class="btn btn-save" onclick='saveArticle(${JSON.stringify(article)})'>+ Save</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

function renderChart(articles) {
  const counts = {
    Ransomware: 0,
    Phishing: 0,
    Malware: 0,
    'Data Breach': 0,
    Hacking: 0,
    Other: 0
  };

  articles.forEach(article => {
    const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
    if (text.includes('ransomware')) {
      counts['Ransomware']++;
    } else if (text.includes('phishing')) {
      counts['Phishing']++;
    } else if (text.includes('malware') || text.includes('trojan') || text.includes('virus')) {
      counts['Malware']++;
    } else if (text.includes('breach') || text.includes('leak') || text.includes('exposed')) {
      counts['Data Breach']++;
    } else if (text.includes('hack') || text.includes('exploit') || text.includes('vuln')) {
      counts['Hacking']++;
    } else {
      counts['Other']++;
    }
  });

  const ctx = document.getElementById('threatChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Articles by Threat Type',
        data: Object.values(counts),
        backgroundColor: [
          '#ef444480',
          '#f97316a0',
          '#a855f780',
          '#00bcd480',
          '#00ff8880',
          '#64748b80'
        ],
        borderColor: [
          '#ef4444',
          '#f97316',
          '#a855f7',
          '#00bcd4',
          '#00ff88',
          '#64748b'
        ],
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#1e293b' }
        },
        y: {
          ticks: { color: '#94a3b8', stepSize: 1 },
          grid: { color: '#1e293b' },
          beginAtZero: true
        }
      }
    }
  });
}

async function saveArticle(article) {
  const body = {
    title: article.title,
    source: article.source.name,
    description: article.description || '',
    url: article.url,
    published_at: article.publishedAt,
    image_url: article.image || ''
  };

  const response = await fetch('/api/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
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
  loadNews(query);
}

function filterCategory(keyword, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('searchInput').value = '';
  loadNews(keyword);
}

document.getElementById('searchInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') searchNews();
});

window.onload = function () {
  loadNews('cybersecurity');
};
