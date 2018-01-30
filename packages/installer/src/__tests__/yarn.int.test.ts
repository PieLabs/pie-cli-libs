import { install } from '../yarn';
// tslint:disable-next-line:no-implicit-dependencies
import { mkdir } from 'temp';
import { writePackageJson } from '../installer';
import { buildLogger, setDefaultLevel } from 'log-factory';

setDefaultLevel('info');

const logger = buildLogger();

const mkdirAsync = (prefix: string): Promise<string> => {
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

describe('install', () => {

  let tmpPath;
  let target;
  let result;

  beforeAll(async () => {
    jest.setTimeout(30000);
    target = '@pie-elements/text-entry@^0.2.2';
    logger.info('tmpPath: ', tmpPath);
    tmpPath = await mkdirAsync('yarn-install-');
    await writePackageJson(tmpPath);
    return install(tmpPath, [target])
      .then(r => {
        result = r;
      });
  });

  it('installs npm dependency', () => {
    expect(result[target]).toBeDefined();
  });

  it('2nd install is faster', async () => {
    let duration: number;
    const start = new Date();
    return install(tmpPath, [target])
      .then(r => {
        duration = new Date().getTime() - start.getTime();
        expect(duration).toBeLessThan(2000);
      });
  });
});
