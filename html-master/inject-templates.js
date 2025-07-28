const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname);
const templatesDir = path.join(__dirname, 'partials');

// Read template files
const header = fs.readFileSync(path.join(templatesDir, 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(templatesDir, 'footer.html'), 'utf8');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Process each HTML file in src
fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.html')) {
    let html = fs.readFileSync(path.join(srcDir, file), 'utf8');
    html = html.replace('<!-- inject:header -->', header);
    html = html.replace('<!-- inject:footer -->', footer);
    fs.writeFileSync(path.join(distDir, file), html, 'utf8');
    console.log(`Processed: ${file}`);
  }
});