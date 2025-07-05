// multi-host-uploader/services/buzzheavier.js
import fs from 'fs';
import { spawn } from 'child_process';
import { createProgressBar } from '../utils/createProgressBar.js';

export function uploadToBuzzHeavier(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileSize = fs.statSync(filePath).size;
    let uploadedBytes = 0;
    const startTime = Date.now();
    const uploadUrl = `https://w.buzzheavier.com/${encodeURIComponent(fileName)}`;

    const bar = createProgressBar('BuzzHeavier', fileSize);

    const readStream = fs.createReadStream(filePath);
    const curl = spawn('curl', ['-s', '-T', '-', uploadUrl]);

    readStream.on('data', chunk => {
      uploadedBytes += chunk.length;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = (uploadedBytes / 1024 / 1024 / elapsed).toFixed(2);
      bar.tick(chunk.length, { speed });
    });

    readStream.pipe(curl.stdin);

    let responseData = '';
    curl.stdout.on('data', data => {
      responseData += data.toString();
    });

    curl.on('close', code => {
      try {
        const json = JSON.parse(responseData);
        if (json?.code === 201 && json?.data?.id) {
          const link = `https://buzzheavier.com/${json.data.id}`;
          console.log(`BuzzHeavier upload complete: ${link}`);
          resolve(link);
        } else {
          console.log('BuzzHeavier upload failed: invalid response');
          reject();
        }
      } catch (err) {
        console.log('BuzzHeavier upload failed: could not parse response');
        reject();
      }
    });

    curl.on('error', err => {
      console.log('BuzzHeavier upload failed: process error');
      reject();
    });
  });
}
// This function uploads a file to BuzzHeavier using curl and provides a progress bar.
// It returns a promise that resolves with the file link on success or rejects on failure.