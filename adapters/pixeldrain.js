// 📁 multi-host-uploader/services/pixeldrain.js
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createProgressBar } from '../utils/createProgressBar.js';

const PIXELDRAIN_API_KEY = 'aa44c859-5c52-4b09-97ea-c551e0b8026c';

export function uploadToPixeldrain(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileSize = fs.statSync(filePath).size;
    let uploadedBytes = 0;
    const startTime = Date.now();
    const uploadUrl = `https://pixeldrain.com/api/file/${encodeURIComponent(fileName)}`;

    const bar = createProgressBar('Pixeldrain', fileSize);

    const curl = spawn('curl', [
      '-s',
      '-u', `:${PIXELDRAIN_API_KEY}`,
      '-T', filePath,
      uploadUrl
    ]);

    const readStream = fs.createReadStream(filePath);
    readStream.on('data', chunk => {
      uploadedBytes += chunk.length;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = (uploadedBytes / 1024 / 1024 / elapsed).toFixed(2);
      bar.tick(chunk.length, { speed });
    });

    let responseData = '';
    curl.stdout.on('data', data => {
      responseData += data.toString();
    });

    curl.on('close', code => {
      try {
        const json = JSON.parse(responseData);
        if (json?.id) {
          const link = `https://pixeldrain.com/u/${json.id}`;
          console.log(`Pixeldrain upload complete: ${link}`);
          resolve(link);
        } else {
          console.log('Pixeldrain upload failed: invalid response');
          reject();
        }
      } catch (err) {
        console.log('Pixeldrain upload failed: could not parse response');
        reject();
      }
    });

    curl.on('error', err => {
      console.log('Pixeldrain upload failed: process error');
      reject();
    });
  });
}
