const crypto = require('node:crypto');
const mongoose = require('mongoose');
const { MongoStore } = require('connect-mongo');
const { createApp } = require('./app');

const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/yelp_camp_v10';
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? null : crypto.randomBytes(32).toString('hex'));

if (!sessionSecret) {
  console.error('SESSION_SECRET must be set in production');
  process.exit(1);
}

async function main() {
  await mongoose.connect(dbUrl);
  const app = createApp({
    sessionSecret,
    sessionStore: MongoStore.create({ client: mongoose.connection.getClient() }),
    secureCookies: isProduction,
  });
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, process.env.IP, () => console.log(`YelpCamp listening on http://localhost:${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
