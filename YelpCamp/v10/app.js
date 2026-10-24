const path = require('node:path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const indexRoutes = require('./routes/index');
const campgroundRoutes = require('./routes/campgrounds');
const commentRoutes = require('./routes/comments');

/**
 * Builds the Express app. `sessionStore` is optional (memory store when omitted,
 * which is only suitable for development and tests).
 */
function createApp({ sessionSecret, sessionStore, secureCookies = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  if (secureCookies) app.set('trust proxy', 1);

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));
  app.use(
    session({
      secret: sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', secure: secureCookies, maxAge: 7 * 24 * 60 * 60 * 1000 },
    }),
  );
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
  });

  app.use('/', indexRoutes);
  app.use('/campgrounds', campgroundRoutes);
  app.use('/campgrounds/:id/comments', commentRoutes);

  app.use((req, res) => res.status(404).render('error', { message: 'Page not found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Something went wrong' });
  });

  return app;
}

module.exports = { createApp };
