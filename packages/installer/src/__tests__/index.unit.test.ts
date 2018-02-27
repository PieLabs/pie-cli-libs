import { toDependencies } from '../index';

describe('index', () => {

  describe('toDependencies', () => {

    it('returns file prefix', () => {

      const rootDir = 'root-dir';
      const packageName = 'package-name';
      const installDir = 'install-dir';
      const pkgs = [{
        rootModuleId: 'root-module'
      }];

      const deps = toDependencies(rootDir, packageName, installDir, pkgs as any);

      expect(deps).toEqual(['file:../root-dir/node_modules/root-module/package-name']);
    });
  });
});
