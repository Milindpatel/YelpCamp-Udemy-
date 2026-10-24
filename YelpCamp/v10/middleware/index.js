const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const { redirectBack } = require('../lib/http');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You need to be logged in to do that');
  return res.redirect('/login');
}

/** Loads a document by id into res.locals[key] and checks the logged-in user owns it. */
function checkOwnership(Model, param, key) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error', 'You need to be logged in to do that');
      return res.redirect('/login');
    }
    const id = req.params[param];
    const doc = mongoose.isValidObjectId(id) ? await Model.findById(id) : null;
    if (!doc) {
      req.flash('error', 'Not found');
      return redirectBack(req, res);
    }
    if (!doc.author.id || !doc.author.id.equals(req.user._id)) {
      req.flash('error', "You don't have permission to do that");
      return redirectBack(req, res);
    }
    res.locals[key] = doc;
    return next();
  };
}

module.exports = {
  isLoggedIn,
  checkCampgroundOwnership: checkOwnership(Campground, 'id', 'campground'),
  checkCommentOwnership: checkOwnership(Comment, 'comment_id', 'comment'),
};
