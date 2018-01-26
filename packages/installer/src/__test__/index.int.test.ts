import { install } from '..';
import { setDefaultLevel, buildLogger } from 'log-factory';
import * as temp from 'temp';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { writePackageJson } from '../installer';

const logger = buildLogger();

const mkLocalPackage = async (dir: string, name: string, pkg: any = {}) => {
  const path = join(dir, name);
  await ensureDir(path);

  const data = {
    name: `@scope/${name}`,
    version: '1.0.0',
    description: 'just a tester',
    license: 'MIT',
    dependencies: {},
    ...pkg
  }
  return await writePackageJson(path, data);
}

const mkLocalPiePackage = async (dir: string, name: string) => {
  await mkLocalPackage(dir, name, { name: `@scope/${name}` });
  await mkLocalPackage(join(dir, name), 'controller', { name: `@scope/${name}-controller` });
  await mkLocalPackage(join(dir, name), 'configure', { name: `@scope/${name}-configure` });
}

const reporter = {
  promise: (msg, p) => {
    logger.silly('msg: ', msg);
    return p;
  }
}

describe('installer', () => {

  let tmpPath = null;

  beforeAll((done) => {

    jest.setTimeout(30000);
    setDefaultLevel('silly');

    temp.mkdir('installer-', (err, path) => {
      tmpPath = path;
      done(err);
    });
  });

  describe('install', () => {


    it('installs remote package w/ set verision', async () => {

      const dir = join(tmpPath, 'remote-pkg-test');
      await ensureDir(dir);
      const result = await install(
        dir,
        { 'element-one': '@pie-elements/text-entry@^0.2.2' },
        [{ element: 'element-one' }],
        reporter
      );
      expect(result.length).toEqual(1);
      const [one] = result;

      expect(one).toMatchObject({
        input: {
          element: 'element-one',
          value: '@pie-elements/text-entry@^0.2.2'
        },
        postInstall: {
          moduleId: '@pie-elements/text-entry'
        }
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
      expect(result.length).toEqual(1);

      const [r] = result;
      expect(r).toMatchObject({
        postInstall: {
          moduleId: '@scope/pkg'
        }
      });
      expect(r).toMatchObject({ pieInfo: undefined });
    });

    it.only('installs local pie package', async () => {
      const dir = join(tmpPath, 'local-pkg-test');
      await ensureDir(dir);
      await mkLocalPiePackage(tmpPath, 'local-pkg');
      const result = await install(
        dir,
        { 'element-one': '../local-pkg' },
        [{ element: 'element-one' }],
        reporter
      );

      logger.info('result: ', result);
      expect(result).toEqual(1);
      const [r] = result;
      expect(r).toMatchObject({
        postInstall: {
          moduleId: '@scope/local-pkg'
        },
        pieInfo: {
          hasConfigurePackage: true
        }
      });
    });
  });
});