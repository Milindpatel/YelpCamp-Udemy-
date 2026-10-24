const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();

router.get('/', (req, res) => res.render('landing'));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 8) {
    req.flash('error', 'Choose a username and a password of at least 8 characters');
    return res.redirect('/register');
  }
  let user;
  try {
    user = await User.register(new User({ username }), password);
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/register');
  }
  req.login(user, (err) => {
    if (err) return next(err);
    req.flash('success', `Welcome to YelpCamp ${user.username}`);
    return res.redirect('/campgrounds');
  });
});

router.get('/login', (req, res) => res.render('login'));

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: 'Invalid username or password',
  }),
);

// POST so other sites can't log users out with a link or image.
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged you out!');
    return res.redirect('/campgrounds');
  });
});

module.exports = router;
