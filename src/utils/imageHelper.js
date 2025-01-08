function getFormattedImagePath(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // URL eksternal
    return path;
  } else if (path.startsWith("/")) {
    // File lokal
    return `${process.env.APP_URL}/images${path}`;
  } else {
    return null; // Tidak valid
  }
}

module.exports = { getFormattedImagePath };
