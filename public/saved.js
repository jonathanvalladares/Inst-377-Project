let allSaved = [];

async function loadSaved() {
  const container = document.getElementById('savedContainer');
  container.innerHTML = '<p class="status-msg">Loading saved articles...</p>';

  const response = await fetch('/api/saved');
  const data = await response.json();

  allSaved = data;

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="status-msg">No saved articles yet. Go to the home page and save some!</p>';
    return;
  }

  renderSaved(data, container);
}

function renderSaved(articles, container) {
  if (articles.length === 0) {
    container.innerHTML = '<p class="status-msg">No articles match your filter.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'saved-list';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'saved-card';
    card.setAttribute('data-id', article.id);

    const publishedDate = article.published_at
      ? dayjs(article.published_at).format('MMM D, YYYY')
      : 'Unknown date';

    card.innerHTML = `
      <div class="saved-info">
        <p class="saved-source">${article.source || 'Unknown Source'}</p>
        <p class="saved-title">${article.title}</p>
        <p class="saved-desc">${article.description || 'No description available.'}</p>
        <p class="saved-date">${publishedDate}</p>
      </div>
      <div class="saved-actions">
        <a href="${article.url}" target="_blank" rel="noopener">Read More &rarr;</a>
        <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">Remove</button>
      </div>
    `;

    list.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(list);
}

async function deleteArticle(id) {
  const confirmed = confirm('Remove this article from saved?');
  if (!confirmed) return;

  const response = await fetch(`/api/saved/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    allSaved = allSaved.filter(a => a.id !== id);
    const container = document.getElementById('savedContainer');
    renderSaved(allSaved, container);
  } else {
    alert('Could not remove the article. Please try again.');
  }
}

function filterSaved() {
  const keyword = document.getElementById('filterInput').value.toLowerCase();
  const filtered = allSaved.filter(a =>
    (a.title || '').toLowerCase().includes(keyword) ||
    (a.description || '').toLowerCase().includes(keyword) ||
    (a.source || '').toLowerCase().includes(keyword)
  );
  const container = document.getElementById('savedContainer');
  renderSaved(filtered, container);
}

function clearFilter() {
  document.getElementById('filterInput').value = '';
  const container = document.getElementById('savedContainer');
  renderSaved(allSaved, container);
}

window.onload = loadSaved;
