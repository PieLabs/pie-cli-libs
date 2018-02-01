import { install, InstallResult } from '..';
import { setDefaultLevel, buildLogger } from 'log-factory';
// tslint:disable-next-line:no-implicit-dependencies
import * as temp from 'temp';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { mkLocalPackage, mkReporter } from './utils';

setDefaultLevel('silly');

const logger = buildLogger();

const reporter = mkReporter(logger);

describe('installer', () => {

  let tmpPath = null;

  beforeAll((done) => {

    jest.setTimeout(30000);

    temp.mkdir('installer-', (err, path) => {
      tmpPath = path;
      done(err);
    });
  });

  describe('local pkg with redirects', () => {

    let testDir;

    async function mkLocalPiePackageWithRedirects(dir: string, name: string): Promise<void> {

      await mkLocalPackage(dir, `scope-el`, { name: `@scope/el` });
      await mkLocalPackage(dir, `scope-controller`, { name: `@scope/controller` });
      await mkLocalPackage(dir, `scope-configure`, { name: `@scope/configure` });

      await mkLocalPackage(
        dir,
        name,
        {
          dependencies: {
            '@scope/configure': '../scope-configure',
            '@scope/controller': '../scope-controller',
            '@scope/el': '../scope-el'
          },
          name: `@scope/${name}`,
          pie: {
            configure: '@scope/configure',
            controller: '@scope/controller',
            element: '@scope/el',
          }
        });
    }

    let result: InstallResult;

    beforeAll(async () => {
      testDir = join(tmpPath, 'redirect');
      await ensureDir(testDir);
      const dir = join(testDir, 'local-redirect-test');
      await ensureDir(dir);
      await mkLocalPiePackageWithRedirects(testDir, 'local-redirect');
      result = await install(
        dir,
        { 'element-one': '../local-redirect' },
        [{ element: 'element-one' }],
        reporter
      );
      return result;
    });

    it('has 1 result', () => {
      expect(result.pkgs.length).toEqual(1);
    });

  });
});
