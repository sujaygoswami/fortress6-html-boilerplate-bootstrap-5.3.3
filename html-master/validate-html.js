const { execSync } = require('child_process');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

function checkListTextContent(html, filename) {
    const errors = [];
    const lines = html.split('\n');
    
    // Check for direct text content in ul/ol
    let inList = false;
    let listStartLine = 0;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        
        // Check for list start
        if (/<ul[^>]*>/i.test(line)) {
            inList = true;
            listStartLine = lineNum;
            listType = 'ul';
        } else if (/<ol[^>]*>/i.test(line)) {
            inList = true;
            listStartLine = lineNum;
            listType = 'ol';
        }
        
        // Check for list end
        if (/<\/ul>/i.test(line) || /<\/ol>/i.test(line)) {
            inList = false;
        }
        
        // Check for text content when inside list
        if (inList) {
            const trimmedLine = line.trim();
            // Skip if it's a tag or empty/whitespace
            if (trimmedLine && 
                !trimmedLine.startsWith('<') && 
                !trimmedLine.startsWith('<!--') &&
                !/^\s*$/.test(trimmedLine)) {
                errors.push({
                    line: lineNum,
                    message: `Text content "${trimmedLine}" not allowed directly in <${listType}>. Wrap in <li> tags.`
                });
            }
        }
    }
    
    return errors;
}

function validateHTMLFiles() {
    const htmlFiles = glob.sync('*.html', { cwd: __dirname });
    
    if (htmlFiles.length === 0) {
        return;
    }
    
    console.log(`\n🔍 Validating ${htmlFiles.length} HTML files...`);
    
    let hasErrors = false;
    
    // Run validators
    for (const file of htmlFiles) {
        let fileHasErrors = false;
        let errors = [];
        
        // Read file for custom checks
        const filePath = path.join(__dirname, file);
        const html = fs.readFileSync(filePath, 'utf8');
        
        // Custom check for text in lists
        const listErrors = checkListTextContent(html, file);
        if (listErrors.length > 0) {
            fileHasErrors = true;
            const errorMsg = 'Custom W3C Best Practice Checks:\n' + 
                listErrors.map(e => `  ${file}:${e.line} - ${e.message}`).join('\n');
            errors.push(errorMsg);
        }
        
        // HTMLHint for basic checks
        try {
            execSync(`npx htmlhint "${file}"`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
        } catch (error) {
            if (error.stdout && !error.stdout.includes('0 errors')) {
                fileHasErrors = true;
                errors.push('HTMLHint:\n' + error.stdout);
            }
        }
        
        // HTML-Validate for W3C compliance
        try {
            execSync(`npx html-validate "${file}"`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
        } catch (error) {
            if (error.stdout) {
                fileHasErrors = true;
                errors.push('W3C Validation (html-validate):\n' + error.stdout);
            }
        }
        
        if (fileHasErrors) {
            console.log(`\n❌ ${file} has validation errors:`);
            errors.forEach(err => console.log(err));
            hasErrors = true;
        }
    }
    
    if (!hasErrors) {
        console.log('✅ All HTML files are valid!\n');
    } else {
        console.log('\n⚠️  Fix these validation errors for W3C compliant HTML.\n');
    }
}

validateHTMLFiles();