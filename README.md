# CyberFeed - Cybersecurity News & Threat Feed Dashboard

## Description

CyberFeed is a full-stack web application that aggregates cybersecurity news and threat intelligence into a single, organized dashboard. Instead of visiting multiple websites to stay informed, users can search for cybersecurity topics, filter articles by threat category (ransomware, phishing, malware, data breaches, hacking), and bookmark articles to read later. The application pulls live news from the GNews API, stores saved articles in a Supabase database, and visualizes threat category breakdowns using Chart.js.

## Target Browsers

This application is designed for use on contemporary desktop browsers. It has been tested and works on:

- **Google Chrome** (version 100+) - Recommended
- **Mozilla Firefox** (version 100+)
- **Microsoft Edge** (version 100+)
- **Safari** (version 15+)

The app is functional on mobile browsers but is optimized for desktop use.

## Link to Developer Manual

[Developer Manual](#developer-manual)

---

# Developer Manual

## Audience

This document is written for future developers who will be taking over or contributing to the CyberFeed project. It assumes you have general knowledge of web development, Node.js, and working with APIs, but no prior knowledge of this specific system.

## How to Install the Application and All Dependencies

### Prerequisites

Before getting started, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Supabase** account - [Sign up here](https://supabase.com/)
- A **GNews API** key - [Get one here](https://gnews.io/)

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/jonathanvalladares/inst-377-project.git
   cd inst-377-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project with the following variables:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   GNEWS_API_KEY=your_gnews_api_key
   ```

4. Set up the Supabase database. In your Supabase project, create a table called `saved_articles` with the following columns:

   | Column Name  | Type      | Notes                    |
   |-------------|-----------|--------------------------|
   | id          | uuid      | Primary key, auto-generated |
   | title       | text      |                          |
   | source      | text      |                          |
   | description | text      |                          |
   | url         | text      |                          |
   | published_at| text      |                          |
   | image_url   | text      |                          |
   | created_at  | timestamp | Default: now()           |

## How to Run the Application on a Server

### Running Locally

Start the development server with:

```bash
npm start
```

This uses `nodemon` which automatically restarts the server when you make changes. The app will be available at `http://localhost:3000`.

### Running in Production

For a standard production environment, you can run:

```bash
node index.js
```

### Deploying to Vercel

This project includes a `vercel.json` configuration file. To deploy:

1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project root and follow the prompts
3. Set your environment variables in the Vercel dashboard under Project Settings > Environment Variables

## How to Run Tests

There are no automated tests written for this project at this time. To manually test the application:

1. Start the server with `npm start`
2. Open `http://localhost:3000` in your browser
3. Test the search functionality by typing keywords and clicking Search
4. Test category filters by clicking the filter buttons
5. Test saving an article by clicking the "+ Save" button on any article card
6. Navigate to `/saved` and verify the saved article appears
7. Test the delete button to remove a saved article

## API Documentation

All API routes are defined in `index.js`.

### GET `/api/news`

Fetches cybersecurity news articles from the GNews external API.

**Query Parameters:**
- `q` (optional) - Search keyword. Defaults to `"cybersecurity"` if not provided.

**Example Request:**
```
GET /api/news?q=ransomware
```

**Example Response:**
```json
{
  "totalArticles": 10,
  "articles": [
    {
      "title": "Article Title",
      "description": "Short description...",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "publishedAt": "2024-11-01T10:00:00Z",
      "source": {
        "name": "Example News",
        "url": "https://example.com"
      }
    }
  ]
}
```

---

### GET `/api/saved`

Retrieves all saved/bookmarked articles from the Supabase database.

**Example Request:**
```
GET /api/saved
```

**Example Response:**
```json
[
  {
    "id": "uuid-here",
    "title": "Article Title",
    "source": "Source Name",
    "description": "Description...",
    "url": "https://example.com/article",
    "published_at": "2024-11-01T10:00:00Z",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2024-11-02T12:00:00Z"
  }
]
```

---

### POST `/api/saved`

Saves a bookmarked article to the Supabase database.

**Request Body (JSON):**
```json
{
  "title": "Article Title",
  "source": "Source Name",
  "description": "Short description of the article",
  "url": "https://example.com/article",
  "published_at": "2024-11-01T10:00:00Z",
  "image_url": "https://example.com/image.jpg"
}
```

**Example Response:**
```json
[
  {
    "id": "uuid-here",
    "title": "Article Title",
    "source": "Source Name",
    ...
  }
]
```

---

### DELETE `/api/saved/:id`

Removes a saved article from the Supabase database by its ID.

**URL Parameter:**
- `id` - The UUID of the saved article to delete

**Example Request:**
```
DELETE /api/saved/abc123-uuid-here
```

**Example Response:**
```json
{
  "message": "Article removed successfully"
}
```

## Known Bugs and Issues

- **GNews free tier limit**: The GNews API free plan allows 100 requests per day. If the limit is exceeded, the news feed will stop loading and show an error.
- **Duplicate saves**: The application does not currently check if an article has already been saved before inserting it into the database. A user could save the same article multiple times.
- **Image loading errors**: Some article images from GNews return broken URLs. The `onerror` handler hides the broken image, but the card layout may appear differently without an image.
- **No user authentication**: All users share the same saved articles list because there is no login system. Any user can see and delete any saved article.

## Roadmap for Future Development

- **User authentication**: Add login functionality so each user has their own saved articles.
- **Duplicate detection**: Before saving, check if the article URL already exists in the database and prevent duplicate saves.
- **Search history**: Save user search queries to Supabase so users can quickly re-run past searches.
- **Pagination**: The GNews API supports pagination. Implement "Load More" or page controls to show more than 10 articles.
- **Email alerts**: Allow users to subscribe to email alerts for specific threat categories.
- **Dark/light mode toggle**: Add a toggle so users can switch between the current dark theme and a light mode.
- **Mobile optimization**: Improve the layout and usability for mobile devices.
