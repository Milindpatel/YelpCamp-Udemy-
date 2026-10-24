const mongoose = require('mongoose');
const passportLocalMongooseModule = require('passport-local-mongoose');

// v9 is an ES module; support both default and CommonJS shapes.
const passportLocalMongoose = passportLocalMongooseModule.default || passportLocalMongooseModule;

const userSchema = new mongoose.Schema({});

// Adds username, salted pbkdf2 hash, register() and authenticate().
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
