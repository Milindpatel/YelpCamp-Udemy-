// Replaces all campgrounds and comments with sample data: `npm run seed`.
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const data = [
  { name: "Cloud's Rest", image: 'https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg', description: lorem },
  { name: 'Desert Mesa', image: 'https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg', description: lorem },
  { name: 'Canyon Floor', image: 'https://farm1.staticflickr.com/189/493046463_841a18169e.jpg', description: lorem },
];

async function seedDB() {
  await Campground.deleteMany({});
  await Comment.deleteMany({});
  for (const seed of data) {
    const comment = await Comment.create({ text: 'This place is great, but I wish there was internet', author: { username: 'Homer' } });
    await Campground.create({ ...seed, comments: [comment._id] });
  }
  console.log(`Seeded ${data.length} campgrounds`);
}

module.exports = seedDB;

if (require.main === module) {
  mongoose
    .connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/yelp_camp_v10')
    .then(seedDB)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
