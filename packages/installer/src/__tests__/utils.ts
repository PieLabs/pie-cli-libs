// tslint:disable-next-line:no-implicit-dependencies
import { mkdir } from 'temp';

export const mkdirAsync = (prefix: string): Promise<string> => {
  return new Promise((resolve, reject) => {

    mkdir(prefix, (err, p) => {
      if (err) {
        reject(err);
      } else {
        resolve(p);
      }
    });
  });
};
