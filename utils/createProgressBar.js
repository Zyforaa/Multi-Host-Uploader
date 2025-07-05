// multi-uploader/services/utils.js
import ProgressBar from 'progress';

export function createProgressBar(label, total) {
  return new ProgressBar(`${label.padEnd(12)} [:bar] :percent :etas :speed MB/s`, {
    total,
    width: 30,
    complete: '=',
    incomplete: '-',
  });
}
