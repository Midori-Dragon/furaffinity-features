const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const distPath = path.join(__dirname, '..', 'dist');
const outputFile = path.join(distPath, 'furaffinity-features-extension.zip');

async function packageExtension() {
    console.log(`${colors.cyan}Starting packaging process...${colors.reset}`);
    console.log(`${colors.blue}Target directory: ${colors.reset}${distPath}`);
    console.log(`${colors.blue}Output file: ${colors.reset}${outputFile}`);

    return new Promise((resolve, reject) => {
        // Create output stream
        const output = fs.createWriteStream(outputFile);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Listen for all archive data to be written
        output.on('close', () => {
            const size = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`${colors.green}✓ Extension packaged successfully!${colors.reset}`);
            console.log(`${colors.blue}Final size: ${colors.reset}${size} MB`);
            resolve();
        });

        // Handle warnings
        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.log(`${colors.yellow}Warning: ${err}${colors.reset}`);
            } else {
                reject(err);
            }
        });

        // Handle errors
        archive.on('error', (err) => {
            console.error(`${colors.red}Error: ${err}${colors.reset}`);
            reject(err);
        });

        // Pipe archive data to the output file
        archive.pipe(output);

        // Add all files from dist directory except the zip file itself
        archive.glob('**/*', {
            cwd: distPath,
            ignore: ['furaffinity-features-extension.zip'],
            dot: true
        });

        console.log(`${colors.cyan}Compressing files...${colors.reset}`);
        // Finalize the archive
        archive.finalize();
    });
}

// Main function
async function main() {
    try {
        await packageExtension();
    } catch (error) {
        console.error(`${colors.red}Failed to package extension: ${error}${colors.reset}`);
        process.exit(1);
    }
}

main();
