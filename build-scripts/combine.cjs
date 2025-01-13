const fs = require('fs');
const path = require('path');

// Root directory of your project
const rootDir = path.resolve(__dirname, '..');

// Output directory and file
const combinedFile = path.resolve(__dirname, '..', 'dist', 'bundle.user.js');
// Delete the existing combined file if it exists
if (fs.existsSync(combinedFile)) {
    fs.unlinkSync(combinedFile);
}

// Regex to extract the banner and retrieve `@name` and `@version`
const bannerRegex = /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/;
const nameRegex = /@name\s+(.+)/;
const versionRegex = /@version\s+(.+)/;

// Recursively find all `bundle.user.js` files
function findBundleFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findBundleFiles(filePath, fileList); // Recurse into subdirectories
        } else if (file === 'bundle.user.js') {
            fileList.push(filePath); // Add the file to the list
        }
    });

    return fileList;
}

// Process a single file to extract the name, version, and content without the banner
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const bannerMatch = content.match(bannerRegex);

    if (!bannerMatch) {
        console.warn(`No banner found in ${filePath}`);
        return { name: 'Unknown', version: '0.0.0', content };
    }

    const banner = bannerMatch[0];
    const nameMatch = banner.match(nameRegex);
    const versionMatch = banner.match(versionRegex);

    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
    const version = versionMatch ? versionMatch[1].trim() : '0.0.0';

    // Remove the banner from the content
    const cleanedContent = content.replace(bannerRegex, '').trim();

    return { name, version, content: cleanedContent };
}

// Combine the files
(async function combineFiles() {
    try {
        console.log('Searching for `bundle.user.js` files...');

        // Find all `bundle.user.js` files in the project
        const bundleFiles = findBundleFiles(rootDir).filter((file) =>
            file.endsWith('bundle.user.js')
        );

        console.log(`Found ${bundleFiles.length} files:`);
        bundleFiles.forEach((file) => console.log(`- ${file}`));

        const combinedContent = bundleFiles
            .map((file) => {
                const { name, version, content } = processFile(file);
                return `// ${name} v${version}\n${content}`;
            })
            .join('\n\n');

        // Write the combined content to the output file
        fs.writeFileSync(combinedFile, combinedContent, 'utf-8');
        console.log(`Combined file created at: ${combinedFile}`);
    } catch (error) {
        console.error('Error combining files:', error);
    }
})();
