/** Redirects to the previous page if it is on this site, otherwise to `fallback`. */
exports.redirectBack = (req, res, fallback = '/campgrounds') => {
  const referrer = req.get('Referrer');
  try {
    const url = new URL(referrer, `${req.protocol}://${req.get('host')}`);
    if (url.host === req.get('host')) return res.redirect(url.pathname + url.search);
  } catch {
    // fall through
  }
  return res.redirect(fallback);
};

/** Copies only the listed keys from a form object. */
exports.pick = (source, keys) =>
  Object.fromEntries(keys.filter((k) => source && typeof source[k] === 'string').map((k) => [k, source[k]]));
