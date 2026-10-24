import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

// Pages that don't need a database.
const app = createApp({ sessionSecret: 'test' });

describe('static pages', () => {
  it.each(['/', '/login', '/register'])('renders %s', async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(res.text).toContain('YelpCamp');
  });

  it('redirects to login when creating a campground while logged out', async () => {
    const res = await request(app).get('/campgrounds/new');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('logout is POST only', async () => {
    expect((await request(app).get('/logout')).status).toBe(404);
  });

  it('renders a 404 page', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.text).toContain('Page not found');
  });
});
