const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

// Input and output paths
const scssPath = path.join(__dirname, 'scss', 'style.scss'); // Change to your main SCSS file
const cssOutDir = path.join(__dirname, 'Styles');
const cssOutPath = path.join(cssOutDir, 'style.css');

// Compile SASS to CSS
sass.render(
  {
    file: scssPath,
    outFile: cssOutPath,
    outputStyle: 'expanded'
  },
  (err, result) => {
    if (err) {
      console.error('SASS Error:', err);
      return;
    }

    // Process CSS with Autoprefixer
    postcss([autoprefixer])
      .process(result.css, { from: undefined })
      .then(postcssResult => {
        // Ensure output directory exists
        if (!fs.existsSync(cssOutDir)) {
          fs.mkdirSync(cssOutDir);
        }
        // Write the autoprefixed CSS
        fs.writeFileSync(cssOutPath, postcssResult.css, 'utf8');
        console.log('SASS compiled and autoprefixed to Styles/style.css');
      })
      .catch(postcssErr => {
        console.error('PostCSS Error:', postcssErr);
      });
  }
);