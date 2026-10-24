import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import Campground from '../models/campground';

let mongo;
try {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongo = await MongoMemoryServer.create();
} catch (err) {
  if (process.env.CI) throw err;
  console.warn(`Skipping database tests: ${err.message}`);
}

describe.skipIf(!mongo)('YelpCamp flows', () => {
  let app;

  beforeAll(async () => {
    await mongoose.connect(mongo.getUri());
    app = createApp({ sessionSecret: 'test' });
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  async function signUp(username) {
    const agent = request.agent(app);
    const res = await agent.post('/register').type('form').send({ username, password: 'password123' });
    expect(res.headers.location).toBe('/campgrounds');
    return agent;
  }

  async function createCampground(agent, extra = {}) {
    await agent.post('/campgrounds').type('form').send({
      'campground[name]': 'Lake View',
      'campground[image]': 'https://example.com/lake.jpg',
      'campground[description]': 'Nice <b>lake</b>',
      ...extra,
    });
    return Campground.findOne({ name: 'Lake View' });
  }

  it('signs up, logs out and logs back in', async () => {
    const agent = await signUp('alice');
    expect((await agent.get('/campgrounds')).text).toContain('Signed in as alice');
    await agent.post('/logout');
    expect((await agent.get('/campgrounds')).text).not.toContain('Signed in as');
    const login = await agent.post('/login').type('form').send({ username: 'alice', password: 'password123' });
    expect(login.headers.location).toBe('/campgrounds');
  });

  it('rejects short passwords and wrong logins', async () => {
    const res = await request(app).post('/register').type('form').send({ username: 'bob', password: 'short' });
    expect(res.headers.location).toBe('/register');
    const login = await request(app).post('/login').type('form').send({ username: 'nobody', password: 'x' });
    expect(login.headers.location).toBe('/login');
  });

  it('creates a campground owned by the user and escapes HTML', async () => {
    const agent = await signUp('alice');
    const camp = await createCampground(agent, { 'campground[author][username]': 'mallory' });
    expect(camp.author.username).toBe('alice');
    const page = await agent.get(`/campgrounds/${camp._id}`);
    expect(page.text).toContain('Nice &lt;b&gt;lake&lt;/b&gt;');
  });

  it('rejects javascript: image URLs', async () => {
    const agent = await signUp('alice');
    const camp = await createCampground(agent, { 'campground[image]': 'javascript:alert(1)' });
    expect(camp).toBeNull();
  });

  it('only the owner can edit or delete, and the author cannot be changed', async () => {
    const alice = await signUp('alice');
    const mallory = await signUp('mallory');
    const camp = await createCampground(alice);

    await mallory.put(`/campgrounds/${camp._id}`).type('form').send({ 'campground[name]': 'Hacked' });
    await mallory.delete(`/campgrounds/${camp._id}`);
    expect((await Campground.findById(camp._id)).name).toBe('Lake View');

    await alice
      .put(`/campgrounds/${camp._id}`)
      .type('form')
      .send({ 'campground[name]': 'Lake View 2', 'campground[author][username]': 'mallory' });
    const updated = await Campground.findById(camp._id);
    expect(updated.name).toBe('Lake View 2');
    expect(updated.author.username).toBe('alice');

    await alice.delete(`/campgrounds/${camp._id}`);
    expect(await Campground.findById(camp._id)).toBeNull();
  });

  it('adds, edits and deletes comments with ownership checks', async () => {
    const alice = await signUp('alice');
    const bob = await signUp('bob');
    const camp = await createCampground(alice);

    await bob.post(`/campgrounds/${camp._id}/comments`).type('form').send({ 'comment[text]': 'Lovely spot' });
    const withComment = await Campground.findById(camp._id).populate('comments');
    const comment = withComment.comments[0];
    expect(comment.author.username).toBe('bob');

    await alice.put(`/campgrounds/${camp._id}/comments/${comment._id}`).type('form').send({ 'comment[text]': 'edited by alice' });
    expect((await mongoose.model('Comment').findById(comment._id)).text).toBe('Lovely spot');

    await bob.delete(`/campgrounds/${camp._id}/comments/${comment._id}`);
    expect((await Campground.findById(camp._id)).comments).toHaveLength(0);
  });

  it('shows 404 for unknown or malformed ids instead of crashing', async () => {
    const agent = await signUp('alice');
    expect((await agent.get('/campgrounds/not-an-id')).status).toBe(404);
    expect((await agent.get(`/campgrounds/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
    const edit = await agent.get(`/campgrounds/${new mongoose.Types.ObjectId()}/edit`);
    expect(edit.status).toBe(302);
  });
});
