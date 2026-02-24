// Cloudinary transform helpers

export function cloudinaryUrl(url, options) {
  if (!url) return "";
  if (url.indexOf("cloudinary.com") === -1) return url;

  var opts = options || {};
  var w = opts.width;
  var h = opts.height;
  var quality = opts.quality || "auto";
  var format = opts.format || "auto";
  var crop = opts.crop || "fill";
  var gravity = opts.gravity || "auto";

  var transforms = "f_" + format + ",q_" + quality;
  if (w) transforms += ",w_" + w;
  if (h) transforms += ",h_" + h;
  if (w || h) transforms += ",c_" + crop + ",g_" + gravity;

  return url.replace("/upload/", "/upload/" + transforms + "/");
}

export function thumbnail(url, size) {
  return cloudinaryUrl(url, { width: size || 200, height: size || 200, crop: "fill" });
}

export function optimized(url, width) {
  return cloudinaryUrl(url, { width: width || 800, quality: "auto" });
}

// Placeholder for missing images
export function placeholderUri(width, height, text) {
  var w = width || 400;
  var h = height || 400;
  var t = encodeURIComponent(text || w + "x" + h);
  return "https://placehold.co/" + w + "x" + h + "/1C1C20/5C5C66?text=" + t;
}

// Get aspect ratio from dimensions
export function aspectRatio(width, height) {
  if (!width || !height) return 1;
  return width / height;
}
