const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

const router = express.Router({ mergeParams: true });

async function findCampground(req) {
  return mongoose.isValidObjectId(req.params.id) ? Campground.findById(req.params.id) : null;
}

// NEW
router.get('/new', middleware.isLoggedIn, async (req, res, next) => {
  const campground = await findCampground(req);
  if (!campground) return next();
  res.render('comments/new', { campground });
});

// CREATE
router.post('/', middleware.isLoggedIn, async (req, res, next) => {
  const campground = await findCampground(req);
  if (!campground) return next();

  const text = typeof req.body.comment?.text === 'string' ? req.body.comment.text : '';
  try {
    const comment = await Comment.create({ text, author: { id: req.user._id, username: req.user.username } });
    campground.comments.push(comment);
    await campground.save();
  } catch (err) {
    if (!(err instanceof mongoose.Error.ValidationError)) throw err;
    req.flash('error', 'Please write a comment');
    return res.redirect(`/campgrounds/${campground._id}/comments/new`);
  }
  req.flash('success', 'Successfully added comment');
  res.redirect(`/campgrounds/${campground._id}`);
});

// EDIT
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) =>
  res.render('comments/edit', { campground_id: req.params.id }),
);

// UPDATE
router.put('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
  const comment = res.locals.comment;
  if (typeof req.body.comment?.text === 'string') comment.text = req.body.comment.text;
  try {
    await comment.save();
  } catch (err) {
    if (!(err instanceof mongoose.Error.ValidationError)) throw err;
    req.flash('error', 'Comment cannot be empty');
  }
  res.redirect(`/campgrounds/${req.params.id}`);
});

// DESTROY
router.delete('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
  const comment = res.locals.comment;
  await Campground.updateOne({ _id: req.params.id }, { $pull: { comments: comment._id } });
  await comment.deleteOne();
  req.flash('success', 'Comment deleted');
  res.redirect(`/campgrounds/${req.params.id}`);
});

module.exports = router;
