const fs = require('fs');
const glob = require('glob');

const voidTags = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

// Patterns to match both root and src HTML files
const patterns = ['*.html', 'src/**/*.html'];

patterns.forEach(pattern => {
  glob(pattern, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      voidTags.forEach(tag => {
        // Replace <tag ... /> with <tag ...>
        const regex = new RegExp(`<${tag}([^>]*)\\s*/>`, 'gi');
        content = content.replace(regex, `<${tag}$1>`);
      });
      fs.writeFileSync(file, content, 'utf8');
    });
  });
});