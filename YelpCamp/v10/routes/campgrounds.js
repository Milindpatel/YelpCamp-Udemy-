const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const { pick } = require('../lib/http');

const router = express.Router();
const FIELDS = ['name', 'image', 'description'];

// INDEX
router.get('/', async (req, res) => {
  const campgrounds = await Campground.find({}).sort({ _id: -1 });
  res.render('campgrounds/index', { campgrounds });
});

// CREATE
router.post('/', middleware.isLoggedIn, async (req, res) => {
  const data = pick(req.body.campground || req.body, FIELDS);
  try {
    await Campground.create({ ...data, author: { id: req.user._id, username: req.user.username } });
  } catch (err) {
    if (!(err instanceof mongoose.Error.ValidationError)) throw err;
    req.flash('error', err.message);
    return res.redirect('/campgrounds/new');
  }
  req.flash('success', 'Campground created');
  res.redirect('/campgrounds');
});

// NEW
router.get('/new', middleware.isLoggedIn, (req, res) => res.render('campgrounds/new'));

// SHOW
router.get('/:id', async (req, res, next) => {
  const campground = mongoose.isValidObjectId(req.params.id)
    ? await Campground.findById(req.params.id).populate('comments')
    : null;
  if (!campground) return next();
  res.render('campgrounds/show', { campground });
});

// EDIT
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => res.render('campgrounds/edit'));

// UPDATE (only name/image/description can change; never the author)
router.put('/:id', middleware.checkCampgroundOwnership, async (req, res) => {
  const campground = res.locals.campground;
  campground.set(pick(req.body.campground, FIELDS));
  try {
    await campground.save();
  } catch (err) {
    if (!(err instanceof mongoose.Error.ValidationError)) throw err;
    req.flash('error', err.message);
    return res.redirect(`/campgrounds/${campground._id}/edit`);
  }
  res.redirect(`/campgrounds/${campground._id}`);
});

// DESTROY (also removes its comments)
router.delete('/:id', middleware.checkCampgroundOwnership, async (req, res) => {
  const campground = res.locals.campground;
  await Comment.deleteMany({ _id: { $in: campground.comments } });
  await campground.deleteOne();
  req.flash('success', 'Campground deleted');
  res.redirect('/campgrounds');
});

module.exports = router;
