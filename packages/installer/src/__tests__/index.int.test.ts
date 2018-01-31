import { install } from '..';
import { setDefaultLevel, buildLogger } from 'log-factory';
// tslint:disable-next-line:no-implicit-dependencies
import * as temp from 'temp';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { writePackageJson } from '../installer';

const logger = buildLogger();

const mkLocalPackage = async (dir: string, name: string, pkg: any = {}) => {
  const path = join(dir, name);
  await ensureDir(path);

  const data = {
    dependencies: {},
    description: 'just a tester',
    license: 'MIT',
    name: `@scope/${name}`,
    version: '1.0.0',
    ...pkg
  };
  return writePackageJson(path, data);
};

const mkLocalPiePackage = async (dir: string, name: string) => {
  await mkLocalPackage(dir, name, { name: `@scope/${name}` });
  await mkLocalPackage(join(dir, name), 'controller', { name: `@scope/${name}-controller` });
  await mkLocalPackage(join(dir, name), 'configure', { name: `@scope/${name}-configure` });
};

const reporter = {
  info: (msg) => logger.silly('>>> ', msg),
  promise: (msg, p) => {
    logger.silly('>>>>>>>>>>>>>>>>>> msg: ', msg);
    return p;
  }
};

describe('installer', () => {

  let tmpPath = null;

  beforeAll((done) => {

    jest.setTimeout(30000);
    setDefaultLevel('debug');

    temp.mkdir('installer-', (err, path) => {
      tmpPath = path;
      done(err);
    });
  });

  describe('install', () => {

    it('installs remote package w/ set version', async () => {

      const dir = join(tmpPath, 'remote-pkg-test');
      await ensureDir(dir);

      const result = await install(
        dir,
        { 'element-one': '@pie-elements/text-entry@^0.2.2' },
        [{ element: 'element-one' }],
        reporter
      );

      expect(result.installed.length).toEqual(1);
      const [one] = result.installed;

      expect(one).toMatchObject({
        input: {
          element: 'element-one',
          value: '@pie-elements/text-entry@^0.2.2'
        },
        pie: {
          configure: {
            moduleId: '@pie-elements/text-entry-configure'
          },
          controller: {
            moduleId: '@pie-elements/text-entry-controller'
          }
        },
        postInstall: {
          moduleId: '@pie-elements/text-entry'
        },
      });
    });

    it('installs local package', async () => {
      const dir = join(tmpPath, 'local-pkg-test');
      await ensureDir(dir);
      await mkLocalPackage(tmpPath, 'local-pkg');
      const result = await install(
        dir,
        { 'element-one': '../local-pkg' },
        [{ element: 'element-one' }],
        reporter
      );

      logger.info('result: ', result);
      expect(result.installed.length).toEqual(1);

      const [r] = result.installed;
      logger.info('result >>>>> ', result);
      expect(r).toMatchObject({
        postInstall: {
          moduleId: '@scope/local-pkg'
        }
      });
      expect(r).toMatchObject({ pie: undefined });
    });

    it('installs local pie package', async () => {
      const dir = join(tmpPath, 'local-pkg-test');
      await ensureDir(dir);
      await mkLocalPiePackage(tmpPath, 'local-pkg');
      const result = await install(
        dir,
        { 'element-one': '../local-pkg' },
        [{ element: 'element-one' }],
        reporter
      );

      logger.info('result: ', JSON.stringify(result, null, '  '));
      expect(result.installed.length).toEqual(1);
      const [r] = result.installed;
      expect(r).toMatchObject({
        pie: {
          hasConfigurePackage: true
        },
        postInstall: {
          moduleId: '@scope/local-pkg'
        },
      });
    });
  });
});
