import { ok } from 'assert';
import { resolve, join } from 'path';

describe('pkg-builder', () => {
  let yarn;
  let input;
  let rootPkgPath;

  const init = () => {
    jest.resetModules();

    const loadPkgMock = path => Promise.resolve(undefined);

    const utils = {
      loadPkg: jest.fn(loadPkgMock)
    };

    const fsExtra = {
      pathExists: jest.fn().mockReturnValue(Promise.resolve(true))
    };

    yarn = {
      'configure@../../path/to/configure': {},
      'controller@../../path/to/controller': {}
    };

    input = {
      element: 'el-one',
      value: 'value'
    };

    rootPkgPath = 'dir/node_modules/value';

    jest.mock('../utils', () => utils);
    jest.mock('fs-extra', () => fsExtra);
    const mod = require('../pkg-builder');

    return { mod, utils, fsExtra };
  };

  describe('configure', () => {

    it('returns a local pkg', async () => {
      const { mod } = init();
      const result = await mod.configure({
        configure: 'configure'
      }, 'dir', yarn, input, rootPkgPath);
      expect(result).toMatchObject({
        dir: resolve('../path/to/configure'),
        isChild: false,
        isLocalPkg: true,
        moduleId: 'configure',
        tag: 'el-one-configure'
      });
    });

    it('returns a child pkg', async () => {
      const { mod, utils } = init();

      utils.loadPkg = jest.fn(path => {
        if (path === `${rootPkgPath}/configure`) {
          return Promise.resolve({
            name: 'child-configure'
          });
        }
      });

      const result = await mod.configure({}, 'dir', yarn, input, rootPkgPath);

      expect(result).toMatchObject({
        dir: undefined,
        isChild: true,
        isLocalPkg: false,
        moduleId: 'child-configure',
        tag: 'el-one-configure'
      });
    });
  });

  describe('controller', () => {

    it('returns local pkg info', async () => {

      const { mod } = init();
      const result = await mod.controller({
        controller: 'controller'
      }, 'dir', yarn, input, rootPkgPath);

      return expect(result).toMatchObject({
        dir: resolve('../path/to/controller'),
        isChild: false,
        isLocalPkg: true,
        key: 'el-one-controller',
        moduleId: 'controller'
      });
    });

    it('returns child pkg info', async () => {

      const { mod, utils } = init();

      utils.loadPkg = jest.fn(path => {
        if (path === `${rootPkgPath}/controller`) {
          return Promise.resolve({
            name: 'child-controller'
          });
        }
      });

      const result = await mod.controller({}, 'dir', yarn, input, rootPkgPath);

      return expect(result).toMatchObject({
        dir: undefined,
        isChild: true,
        isLocalPkg: false,
        key: 'el-one-controller',
        moduleId: 'child-controller'
      });
    });

    it('gets an error of controller.name is undefined', () => {
      const { mod, utils } = init();
      utils.loadPkg = jest.fn(path => {
        if (path === `${rootPkgPath}/controller`) {
          return Promise.resolve({});
        }
      });

      return mod.controller({}, 'dir', yarn, input, rootPkgPath)
        .then(r => fail(new Error('should have failed')))
        .catch(e => {
          ok(true);
        });
    });

    describe('passthrough', () => {

      it('returns passthrough controller', async () => {
        const { mod } = init();
        const result = await mod.controller({}, 'dir', yarn, input, rootPkgPath);
        expect(result.moduleId).toEqual(mod.PASSTHROUGH);
      });

    });
  });
});
