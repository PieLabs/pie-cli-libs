import { install } from '../yarn';
import { mkdirAsync } from './utils';
import { writePackageJson } from '../installer';
import { buildLogger, setDefaultLevel } from 'log-factory';

setDefaultLevel('info');

const logger = buildLogger();

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
