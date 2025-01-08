const slugify = (title) => {
  let slug = title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  return slug + '-' + Math.random().toString(36).substring(2, 6);
};

module.exports = { slugify };