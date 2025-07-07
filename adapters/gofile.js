// 📁 multi-host-uploader/services/gofile.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { createProgressBar } from '../utils/createProgressBar.js';

export async function uploadToGoFile(filePath, fileName) {
  const fileSize = fs.statSync(filePath).size;
  const fileStream = fs.createReadStream(filePath);

  const form = new FormData();
  form.append('file', fileStream, fileName);

  const serverRes = await fetch('https://api.gofile.io/servers');
  const serverJson = await serverRes.json();
  const server = serverJson?.data?.servers?.[0]?.name;

  if (!server) {
    console.log('Gofile upload failed: could not get server');
    return null;
  }

  const uploadUrl = `https://${server}.gofile.io/uploadFile`;

  let uploadedBytes = 0;
  const startTime = Date.now();
  const bar = createProgressBar('Gofile', fileSize);

  fileStream.on('data', chunk => {
    uploadedBytes += chunk.length;
    const elapsed = (Date.now() - startTime) / 1000;
    const speed = (uploadedBytes / 1024 / 1024 / elapsed).toFixed(2);
    bar.tick(chunk.length, { speed });
  });

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  const result = await res.json();
  const link = result?.data?.downloadPage;

  if (link) {
    console.log(`Gofile upload complete: ${link}`);
    return link;
  } else {
    console.log('Gofile upload failed: invalid response');
    return null;
  }
}
 