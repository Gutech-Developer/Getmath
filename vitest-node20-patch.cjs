// Patch util.styleText to accept arrays (Node 20 only supports strings).
// Rolldown 1.x uses the array form which was added in Node 22.
const util = require("node:util");
const _orig = util.styleText.bind(util);
util.styleText = function styleText(format, text, opts) {
  if (Array.isArray(format)) {
    // Apply each style sequentially
    let result = text;
    for (const f of [...format].reverse()) {
      try {
        result = _orig(f, result, opts);
      } catch {
        /* skip unsupported */
      }
    }
    return result;
  }
  return _orig(format, text, opts);
};
