const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

// Get list of files tracked by git (this automatically respects .gitignore)
const getGitTrackedFiles = () => {
    const output = execSync('git ls-files', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean);
};

async function emptyDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   ${colors.green}✓ Cleared '${path.basename(dir)}' folder${colors.reset}`);
}

async function createSourceZip(distPath, outputFile) {
    console.log(`${colors.cyan}Starting source code packaging process...${colors.reset}`);
    console.log(`${colors.blue}Target directory: ${colors.reset}${distPath}`);
    console.log(`${colors.blue}Output file: ${colors.reset}${outputFile}\n`);
    
    const rootDir = path.resolve(__dirname, '..');

    // Ensure dist directory exists
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        // Create write stream
        const output = fs.createWriteStream(outputFile);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Listen for all archive data to be written
        output.on('close', () => {
            const size = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`\n${colors.green}✓ Source code packaged successfully!${colors.reset}`);
            console.log(`${colors.blue}Final size: ${colors.reset}${size} MB\n`);
            resolve();
        });

        // Handle warnings
        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.log(`${colors.yellow}⚠ Warning: ${err}${colors.reset}`);
            } else {
                reject(err);
            }
        });

        // Handle errors
        archive.on('error', (err) => {
            console.error(`${colors.red}✗ Error: ${err}${colors.reset}`);
            reject(err);
        });

        // Pipe archive data to the output file
        archive.pipe(output);

        // Get all git tracked files
        const files = getGitTrackedFiles();
        console.log(`${colors.blue}Found ${colors.reset}${files.length}${colors.blue} files to package${colors.reset}`);

        // Add each file to the archive
        for (const file of files) {
            const filePath = path.join(rootDir, file);
            archive.file(filePath, { name: file });
        }

        // Finalize the archive
        archive.finalize();
    });
}

async function main() {
    try {
        const distPath = path.resolve(__dirname, '..', 'dist');
        const outputFile = path.join(distPath, 'furaffinity-features-source.zip');

        console.log(`${colors.cyan}Clearing dist Folder...${colors.reset}`);
        await emptyDir(distPath);
        console.log();
        await createSourceZip(distPath, outputFile);
    } catch (error) {
        console.error(`${colors.red}✗ Failed to package source: ${error}${colors.reset}`);
        process.exit(1);
    }
}

main();
