# CyberFeed - Cybersecurity News Dashboard

## Description

CyberFeed is a web app that lets you search and browse the latest cybersecurity news all in one place. You can search for topics like ransomware or phishing, filter articles by threat category, and save articles to read later. It uses the GNews API to pull in live news, Supabase to store saved articles, and Chart.js to show a breakdown of what types of threats are showing up in the results.

This was built as a final project for INST 377 at the University of Maryland.

## Target Browsers

This app works best on desktop browsers. We tested it on:

- Google Chrome (recommended)
- Firefox
- Microsoft Edge
- Safari

It works on mobile too but the layout is mainly designed for desktop.

## Link to Developer Manual

[Jump to Developer Manual](#developer-manual)

---

# Developer Manual

This section is for future developers who want to run or work on this project. It assumes you know basic web development and Node.js but haven't seen this project before.

## How to Install

### What you need first

- Node.js installed on your computer (v18 or higher)
- A Supabase account (free at supabase.com)
- A GNews API key (free at gnews.io)

### Steps

1. Clone the repo and go into the folder:
   ```bash
   git clone https://github.com/jonathanvalladares/inst-377-project.git
   cd inst-377-project
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root folder with these three variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   GNEWS_API_KEY=your_gnews_key
   ```

4. In your Supabase project, create a table called `saved_articles` with these columns:

   | Column       | Type      | Notes                  |
   |-------------|-----------|------------------------|
   | id          | uuid      | primary key, auto      |
   | title       | text      |                        |
   | source      | text      |                        |
   | description | text      |                        |
   | url         | text      |                        |
   | published_at| text      |                        |
   | image_url   | text      |                        |
   | created_at  | timestamp | default: now()         |

## How to Run the App

To start the server locally:

```bash
npm start
```

This runs nodemon so the server restarts automatically when you save changes. Open `http://localhost:3000` in your browser.

If you just want to run it without nodemon:

```bash
node index.js
```

### Deploying to Vercel

There is already a `vercel.json` file in the project. To deploy:

1. Run `npm install -g vercel`
2. Run `vercel` in the project folder and follow the steps
3. Add your environment variables in the Vercel dashboard under Settings > Environment Variables

## Tests

We didn't write any automated tests for this project. To test it manually:

1. Run `npm start` and open `http://localhost:3000`
2. Try searching for a keyword and make sure articles load
3. Click the filter buttons and make sure they change the results
4. Click "+ Save" on an article and check that it shows up on the Saved Articles page
5. On the Saved Articles page, try deleting an article

## API Endpoints

All the routes are in `index.js`.

### GET `/api/news`

Gets news articles from the GNews API. Used by the home page to load articles.

Query params:
- `q` - the search term (defaults to "cybersecurity" if you don't pass one)

Example:
```
GET /api/news?q=ransomware
```

Response:
```json
{
  "totalArticles": 10,
  "articles": [
    {
      "title": "Article title here",
      "description": "Short description",
      "url": "https://example.com",
      "image": "https://example.com/image.jpg",
      "publishedAt": "2024-11-01T10:00:00Z",
      "source": { "name": "Example News" }
    }
  ]
}
```

---

### GET `/api/saved`

Gets all saved articles from Supabase. Used by the Saved Articles page.

Example:
```
GET /api/saved
```

Response:
```json
[
  {
    "id": "some-uuid",
    "title": "Article title",
    "source": "Source name",
    "description": "Description",
    "url": "https://example.com",
    "published_at": "2024-11-01T10:00:00Z",
    "image_url": "https://example.com/image.jpg"
  }
]
```

---

### POST `/api/saved`

Saves an article to Supabase. Called when you click the "+ Save" button.

Request body:
```json
{
  "title": "Article title",
  "source": "Source name",
  "description": "Description",
  "url": "https://example.com",
  "published_at": "2024-11-01T10:00:00Z",
  "image_url": "https://example.com/image.jpg"
}
```

Returns the saved article object from Supabase.

---

### DELETE `/api/saved/:id`

Deletes a saved article by its id. Called when you click the Remove button.

Example:
```
DELETE /api/saved/some-uuid-here
```

Response:
```json
{ "message": "Article removed successfully" }
```

## Known Bugs

- GNews free tier only allows 100 requests per day. After that the news feed won't load.
- You can save the same article more than once, there's no duplicate check right now.
- Some article images are broken links so those cards just show up without an image.
- There's no login system so everyone shares the same saved articles list.

## Future Development

- Add user accounts so everyone has their own saved list
- Check for duplicate articles before saving
- Add pagination so you can load more than 10 articles at a time
- Save search history so you can re-run searches easily
- Better mobile layout
