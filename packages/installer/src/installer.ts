import * as _ from 'lodash';
import * as semver from 'semver';
import { install } from './yarn';

import { ensureDirSync, stat, pathExists, readJson, writeJson, pathExistsSync } from 'fs-extra';
import { join, resolve } from 'path';
import { loadPkg } from './utils';
import { buildLogger } from 'log-factory';
import { Reporter } from './reporter';
import { Pkg, PackageType, Package, ElementMap, Model, Input, PreInstallRequest, PostInstall } from './types';
import { controller, configure } from './pkg-builder';

const logger = buildLogger();

/**
 * Root installer - installs main packages.
 */
export default class RootInstaller {

  public readonly installationDir: string;

  constructor(private cwd: string, private reporter: Reporter) {

    if (!pathExistsSync(cwd)) {
      throw new Error(`cwd does not exist: ${cwd}`);
    }

    this.installationDir = join(cwd, '.pie');
    ensureDirSync(this.installationDir);
  }

  public async install(elements: ElementMap,
    models: Model[]): Promise<{ dir: string, pkgs: Pkg[] }> {

    logger.silly('[install]', elements);

    const inputs: Input[] = _.map(elements, (value, element) => ({ element, value }));
    const requests: PreInstallRequest[] = await createInstallRequests(this.cwd, inputs, models);

    const mappedRequests = requests.map(r => {
      if (r.local) {
        return { ...r, value: `../${r.value}` };
      } else {
        return r;
      }
    });

    const packages = mappedRequests.filter(r => r.type === 'package');
    logger.debug('writing package.json..');
    await this.reporter.promise('writing package.json', writePackageJson(this.installationDir));
    logger.debug('writing package.json..done');

    /**
     * TODO:
     * - if the pkg is local and depends on other locals for configure/element/controller,
     * we need to pass that information out so that a watch can be set up pointing from the src dir
     * to the install dir.
     * ../pkg -> ../foo =
     *   { src: ../foo moduleId: foo-name, isInternalPkg: false, isLocalPkg: true}
     *   //path is relative to the install dir.
     */
    const lockData = await install(this.installationDir, packages.map(r => r.value));

    logger.debug('lockData: ', lockData);

    const pkgs = _.zipWith(inputs, mappedRequests, async (input, r: PreInstallRequest) => {
      const result = findInstallationResult(r.local, r.value, lockData);
      return toPkg(this.installationDir, input, lockData, result, r);
    });

    return Promise.all(pkgs)
      .then(p => ({ dir: this.installationDir, pkgs: p }));
  }
}

export async function toPkg(
  dir: string,
  input: Input,
  yarn: any,
  result: PostInstall,
  preInstall: PreInstallRequest): Promise<Pkg> {

  const installPath = join(dir, 'node_modules', result.moduleId);

  const pkg = await loadPkg(installPath);

  const pieDef = (pkg && pkg.pie) || {};

  const out: Pkg = {
    dir,
    element: {
      moduleId: (pieDef.element) ? pieDef.element : result.moduleId,
      tag: input.element
    },
    input,
    isLocal: preInstall.local,
    rootModuleId: result.moduleId,
    type: preInstall.type,
  };

  out.controller = await controller(pieDef, dir, yarn, input, installPath);
  out.configure = await configure(pieDef, dir, yarn, input, installPath);

  return out;
}

export function findInstallationResult(
  local: boolean,
  path: string,
  installationResult: { [key: string]: PostInstall }): PostInstall {

  const findKey = (s: string) => {
    if (local) {
      return s.endsWith(`@${path}`);
    } else {
      return path === s;
    }
  };

  const getModuleId = (s: string) => {
    if (!s) {
      return;
    }

    if (local) {
      return s.replace(`@${path}`, '');
    } else {
      return s.substr(0, s.lastIndexOf('@'));
    }
  };

  const k = Object.keys(installationResult).find(findKey);
  const moduleId = getModuleId(k);
  return { ...installationResult[k], moduleId };
}

export async function writePackageJson(dir: string, data: {} = {}, opts = {
  force: false
}): Promise<string> {

  logger.silly('[writePackageJson]: dir: ', dir);

  const pkgPath = join(dir, 'package.json');

  if (await pathExists(pkgPath)) {
    return Promise.resolve(pkgPath);
  } else {
    const info = {
      description: 'auto generated package.json',
      license: 'MIT',
      name: 'x',
      private: true,
      version: '0.0.1',
      ...data
    };
    return writeJson(join(dir, 'package.json'), info, { spaces: 2 })
      .then(() => pkgPath);
  }
}

export async function readPackage(dir: string): Promise<Package> {
  const pkgPath = join(dir, 'package.json');
  if (pathExists(pkgPath)) {
    const raw = await readJson(pkgPath);
    return {
      name: raw.name,
      version: raw.version
    };
  }
}

/**
 * add information about the package to install.
 * @param cwd
 * @param elements
 * @param models
 */
export async function createInstallRequests(
  cwd: string,
  elements: Input[],
  models: Model[]): Promise<PreInstallRequest[]> {
  const mapped = elements.map(async ({ element, value }) => {
    const resolvedPath = resolve(cwd, value);

    logger.silly('resolvedPath: ', resolvedPath);

    const e = await pathExists(resolvedPath);
    logger.silly('path exists: ', e);

    const hasModel = _.some(models, m => m.element === element);

    if (e) {
      const statInfo = await stat(resolvedPath);
      return {
        element,
        hasModel,
        local: true,
        type: statInfo.isFile() ? PackageType.FILE : PackageType.PACKAGE,
        value
      };
    } else {
      const v = semver.validRange(value) ? `${element}@${value}` : value;
      return {
        element,
        hasModel,
        local: false,
        type: PackageType.PACKAGE,
        value: v
      };
    }
  });
  return Promise.all(mapped);
}
