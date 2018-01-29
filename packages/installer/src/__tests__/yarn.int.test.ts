import { install } from '../yarn';
import { mkdir } from 'temp';
import { writePackageJson } from '../installer';
import { buildLogger, setDefaultLevel } from 'log-factory';

const logger = buildLogger();

beforeAll(() => {
  setDefaultLevel('silly');
});

describe('install', () => {

  let tmpPath;

  beforeEach(done => {
    jest.setTimeout(30000);
    logger.silly('mkdir');
    mkdir('yarn-install-', (e, p) => {
      logger.silly('got path: ', p);
      tmpPath = p;
      done(e);
    })
  });

  it('installs npm dependency', async () => {
    logger.info('tmpPath: ', tmpPath);
    await writePackageJson(tmpPath);
    const result = await install(tmpPath, ['@pie-elements/text-entry@^0.2.2']);
    expect(result.hasOwnProperty('@pie-elements/text-entry@^')).toEqual(true);
  });
});