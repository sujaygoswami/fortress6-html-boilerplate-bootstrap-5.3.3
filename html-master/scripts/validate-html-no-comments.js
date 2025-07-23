const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { execSync } = require('child_process');

// Directory for temporary cleaned files
const tempDir = '.temp_html_validate';

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Find all root HTML files
glob('*.html', (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Remove all HTML comments
    const cleaned = content.replace(/<!--[\s\S]*?-->/g, '');
    fs.writeFileSync(path.join(tempDir, file), cleaned, 'utf8');
  });

  // Run w3c-html-validator on cleaned files
  try {
    execSync(`npx w3c-html-validator ${tempDir}/*.html`, { stdio: 'inherit' });
  } catch (e) {
    process.exit(1); // Propagate validation errors
  } finally {
    // Clean up temp files
    files.forEach(file => {
      fs.unlinkSync(path.join(tempDir, file));
    });
    fs.rmdirSync(tempDir);
  }
});