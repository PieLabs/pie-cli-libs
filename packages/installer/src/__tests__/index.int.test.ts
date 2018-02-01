import { install, InstallResult } from '..';
import { setDefaultLevel, buildLogger } from 'log-factory';
// tslint:disable-next-line:no-implicit-dependencies
import * as temp from 'temp';
import { ensureDir, pathExists } from 'fs-extra';
import { join } from 'path';
import { Pkg } from '../installer';
import { mkReporter, mkLocalPiePackage } from './utils';

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

  describe('install', () => {

    describe('remote package', () => {
      let result: InstallResult;
      beforeAll(async () => {
        const dir = join(tmpPath, 'remote-pkg-test');
        await ensureDir(dir);

        result = await install(
          dir,
          { 'element-one': '@pie-test-elements/element-with-internals@^0.2.1' },
          [{ element: 'element-one' }],
          reporter
        );
        return result;
      });

      it('installs remote package w/ set version', () => {
        logger.silly(`result ${JSON.stringify(result, null, '  ')}`);
        expect(result.pkgs.length).toEqual(1);
      });

      describe('result.one', () => {

        let one: Pkg;

        beforeEach(() => {
          one = result.pkgs[0];
        });

        it('returns element info', () => {
          expect(one.element).toMatchObject({
            moduleId: '@pie-test-elements/element-with-internals',
            tag: 'element-one'
          });
        });

        it('returns controller info', () => {
          expect(one.controller).toMatchObject({
            isInternalPkg: true,
            key: 'element-one-controller',
            moduleId: '@pie-test-elements/element-with-internals-controller',
          });
        });

        it('returns configure info', () => {
          expect(one.configure).toMatchObject({
            isInternalPkg: true,
            moduleId: '@pie-test-elements/element-with-internals-configure',
            tag: 'element-one-configure'
          });
        });

        it('configure package exists in installation dir.', () => {
          const p = join(result.dirs.configure, 'node_modules', one.configure.moduleId);
          return pathExists(p)
            .then(e => expect(e).toBeTruthy());
        });

        it('controller package exists in installation dir.', () => {
          logger.info('dirs:', result.dirs);
          const p = join(result.dirs.controllers, 'node_modules', one.controller.moduleId);
          logger.info('p:', p);
          return pathExists(p)
            .then(e => expect(e).toBeTruthy());
        });
      });
    });

    describe('local package', () => {

      let result: InstallResult;

      beforeAll(async () => {
        const dir = join(tmpPath, 'local-pkg-test');
        await ensureDir(dir);
        await mkLocalPiePackage(tmpPath, 'local-pkg');

        result = await install(
          dir,
          { 'element-one': '../local-pkg' },
          [{ element: 'element-one' }],
          reporter
        );
      });

      it('installs 1 local pie package', async () => {
        expect(result.pkgs.length).toEqual(1);
      });

      describe('one', () => {
        let one: Pkg;

        beforeAll(() => {
          one = result.pkgs[0];
        });

        it('has element result', () => {
          expect(one.element).toMatchObject({
            moduleId: '@scope/local-pkg',
            tag: 'element-one'
          });
        });
      });
    });
  });
});
