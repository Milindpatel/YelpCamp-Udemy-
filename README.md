# YelpCamp

A campground review site built while following the Udemy "Web Developer Bootcamp" course. Users sign up, add campgrounds with a photo and description, and comment on each other's campgrounds.

![CI](https://github.com/Milindpatel/YelpCamp-Udemy-/actions/workflows/ci.yml/badge.svg)

## Versions

The `YelpCamp/` folder keeps every stage of the course:

| Folder | Stage |
| --- | --- |
| `v1`–`v9` | Course snapshots, kept as they were for reference (they use 2018-era packages) |
| **`v10`** | **The finished app, updated in 2026** – run this one |

## Running v10

Requires Node.js 20+ and MongoDB.

```bash
cd YelpCamp/v10
npm install
npm run seed     # optional: sample campgrounds
npm start        # http://localhost:3000
```

Environment variables:

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `mongodb://127.0.0.1:27017/yelp_camp_v10` | |
| `SESSION_SECRET` | random per start in development | **required** in production |
| `PORT` | `3000` | |

Sessions are stored in MongoDB, cookies are `httpOnly`/`SameSite=Lax` (and `secure` in production).

## Tech stack (v10)

Express 5, EJS 3, Mongoose 9, Passport 0.7 with passport-local-mongoose, connect-mongo, Bootstrap 5, Vitest + Supertest + mongodb-memory-server.

## Tests

```bash
cd YelpCamp/v10 && npm test
```
