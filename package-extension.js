// Script to package the extension for download
// This script creates a zip file of the extension folder and places it in the public folder

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import archiver from 'archiver';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths
const extensionDir = path.join(__dirname, 'extension');
const outputPath = path.join(__dirname, 'public', 'extension.zip');

// Create the output directory if it doesn't exist
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a file to stream archive data to
const output = createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Extension packaged successfully: ${outputPath}`);
  console.log(`Total size: ${archive.pointer()} bytes`);
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the extension directory to the archive
archive.directory(extensionDir, false);

// Finalize the archive
archive.finalize();
