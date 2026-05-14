const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

// serve files from the public folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

const GNEWS_KEY = process.env.GNEWS_API_KEY;

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/about', (req, res) => {
  res.sendFile('public/about.html', { root: __dirname });
});

app.get('/saved', (req, res) => {
  res.sendFile('public/saved.html', { root: __dirname });
});

// GET /api/news - fetch news from GNews API
app.get('/api/news', async (req, res) => {
  const query = req.query.q || 'cybersecurity';
  console.log('Fetching news for:', query);

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&token=${GNEWS_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Got', data.articles ? data.articles.length : 0, 'articles');
    res.json(data);
  } catch (err) {
    console.log('Error fetching from GNews:', err);
    res.statusCode = 500;
    res.json({ error: 'Failed to fetch news' });
  }
});

// GET /api/saved - retrieve all saved articles from Supabase
app.get('/api/saved', async (req, res) => {
  console.log('Getting all saved articles');

  const { data, error } = await supabase.from('saved_articles').select();

  if (error) {
    console.log('Supabase error:', error);
    res.statusCode = 500;
    res.send(error);
  } else {
    console.log('Saved articles found:', data.length);
    res.json(data);
  }
});

// POST /api/saved - save/bookmark an article to Supabase
app.post('/api/saved', async (req, res) => {
  const { title, source, description, url, published_at, image_url } = req.body;
  console.log('Saving article:', title);

  const { data, error } = await supabase
    .from('saved_articles')
    .insert({ title, source, description, url, published_at, image_url })
    .select();

  if (error) {
    console.log('Supabase error:', error);
    res.statusCode = 500;
    res.send(error);
  } else {
    res.json(data);
  }
});

// DELETE /api/saved/:id - remove a saved article from Supabase
app.delete('/api/saved/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Deleting saved article id:', id);

  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.log('Supabase error:', error);
    res.statusCode = 500;
    res.send(error);
  } else {
    res.json({ message: 'Article removed successfully' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
