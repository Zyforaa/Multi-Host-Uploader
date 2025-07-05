// 📁 multi-host-uploader/cli/multiUploader.js
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { uploadToGoFile } from '../services/gofile.js';
import { uploadToBuzzHeavier } from '../services/buzzheavier.js';
import { uploadToPixeldrain } from '../services/pixeldrain.js';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(chalk.red('No file specified.'));
  process.exit(1);
}
const filePath = args[0];
const fileName = path.basename(filePath);

if (!fs.existsSync(filePath)) {
  console.log(chalk.red(`File not found: ${filePath}`));
  process.exit(1);
}

const terminalWidth = process.stdout.columns || 80;
const center = (text) => ' '.repeat(Math.max(0, Math.floor((terminalWidth - text.length) / 2))) + text;

console.clear();
console.log(chalk.bold.blue(center('Multi Host Uploader')));
console.log('');
console.log(chalk.gray(center('Current upload services -')));
console.log(center('Gofile     BuzzHeavier     Pixeldrain'));
console.log('');
console.log(chalk.yellow(`Uploading file: ${fileName}`));
console.log('');

(async () => {
  try {
    const [gofileLink, buzzLink, pixelLink] = await Promise.all([
      uploadToGoFile(filePath, fileName),
      uploadToBuzzHeavier(filePath, fileName),
      uploadToPixeldrain(filePath, fileName)
    ]);

    if (gofileLink) console.log(chalk.greenBright(`Gofile Link: ${chalk.underline(gofileLink)}`));
    if (buzzLink) console.log(chalk.greenBright(`BuzzHeavier Link: ${chalk.underline(buzzLink)}`));
    if (pixelLink) console.log(chalk.greenBright(`Pixeldrain Link: ${chalk.underline(pixelLink)}`));

    console.log(chalk.blueBright('All uploads completed.'));
  } catch (err) {
    console.error(chalk.red('Some uploads failed.'));
  }
})();
