import * as _ from 'lodash';
import * as semver from 'semver';
import { install } from './yarn';

import { ensureDirSync, stat, pathExists, readJson, writeJson, pathExistsSync } from 'fs-extra';
import { join, resolve } from 'path';

import { buildLogger } from 'log-factory';
import { Reporter } from './reporter';

export enum PackageType {
  FILE = 'file',
  PACKAGE = 'package'
}

export type Dirs = {
  configure: string,
  controllers: string,
  root: string
};

export type Input = {
  element: string,
  value: string
};

export type PreInstallRequest = {
  element: string,
  value: string,
  local: boolean,
  type: PackageType,
  hasModel: boolean,
  package?: { name: string }
};

export type PostInstall = {
  dir: string,
  moduleId: string,
  version: string,
  resolved: string,
  dependencies: { [key: string]: string }
};

export type PieInfo = {
  hasConfigurePackage: boolean,
  controller?: { dir: string, moduleId: string },
  configure?: { dir: string, moduleId: string }
};

export interface InstalledElement {
  element: string;
  input: Input;
  preInstall: PreInstallRequest;
  postInstall?: PostInstall;
  pie?: PieInfo;
}

export interface CustomElementToModuleId {
  /** valid custom element name */
  tag: string;
  /** the require path that containes the element as a default export */
  moduleId: string;

  /** the dir in which to resolve the `moduleId` */
  dir: string;
}

export interface KeyToModuleId {
  key: string;
  moduleId: string;
}

/** a mapping for each part of a pie */
export interface Mapping {
  element: string;
  configure?: string;
  controller?: string;
}

export interface Element {
  tag: string;
  moduleId: string;
}

export interface PieController {
  key: string;
  moduleId: string;
  isInternalPkg: boolean;
}

export interface PieConfigure {
  tag: string;
  moduleId: string;
  isInternalPkg: boolean;
}

export interface Pkg {
  input: Input;
  dir: string;
  element: Element;
  controller?: PieController;
  configure?: PieConfigure;
}

export interface NewInstalledElement {
  input: Input;

  /** The main pie element mapping  */
  element: CustomElementToModuleId;
  /** The controller mapping  */
  controller?: KeyToModuleId;
  /** The configure mapping  */
  configure?: CustomElementToModuleId;
}

const logger = buildLogger();

export type ElementMap = {
  [key: string]: string
};

export type Model = {
  element: string
};

export type Package = {
  name: string,
  version: string,
  dependencies?: { [key: string]: string }
};

export type Models = Model[];

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
    const installationResult = await install(this.installationDir, packages.map(r => r.value));

    const pkgs = _.zipWith(inputs, mappedRequests, async (input, r: PreInstallRequest) => {
      const result = findInstallationResult(r.local, r.value, installationResult);
      return toPkg(this.installationDir, input, result);
    });

    return Promise.all(pkgs)
      .then(p => ({ dir: this.installationDir, pkgs: p }));
  }
}

export async function loadPkg(dir: string): Promise<any | undefined> {
  const pkgPath = join(dir, 'package.json');
  if (await pathExists(pkgPath)) {
    return readJson(join(dir, 'package.json'));
  } else {
    return undefined;
  }
}

export async function toPkg(dir: string, input: Input, result: PostInstall): Promise<Pkg> {

  const installPath = join(dir, 'node_modules', result.moduleId);

  const pkg = await loadPkg(installPath);
  const controllerPkg = await loadPkg(join(installPath, 'controller'));
  const configurePkg = await loadPkg(join(installPath, 'configure'));

  const pieDef = (pkg && pkg.pie) || {};

  const out: Pkg = {
    dir,
    element: {
      moduleId: (pieDef.element) ? pieDef.element : result.moduleId,
      tag: input.element
    },
    input
  };

  const controllerId = controllerPkg ? controllerPkg.name : (pieDef.controller ? pieDef.controller : undefined);

  if (controllerId) {
    out.controller = {
      isInternalPkg: !!controllerPkg,
      key: `${input.element}-controller`,
      moduleId: controllerId,
    };
  }

  const configureId = configurePkg ? configurePkg.name : (pieDef.configure ? pieDef.configure : undefined);

  if (configureId) {
    out.configure = {
      isInternalPkg: !!configurePkg,
      moduleId: configureId,
      tag: `${input.element}-configure`
    };
  }

  return out;
}

/**
 * Add stub pie information - hasController
 * @param dir
 * @param postInstall
 */
export async function addPieInfo(dir: string, postInstall: PostInstall): Promise<PieInfo | undefined> {

  if (postInstall) {
    const installedPath = join(dir, 'node_modules', postInstall.moduleId);
    const hasController = await pathExists(join(installedPath, 'controller')) &&
      await pathExists(join(installedPath, 'controller', 'package.json'));
    if (hasController) {
      const hasConfigurePackage =
        await pathExists(join(installedPath, 'configure')) &&
        await pathExists(join(installedPath, 'configure', 'package.json'));
      return { hasConfigurePackage };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

/**
 * TODO: need to check if the yarn key ends with the
 * install target eg
 * name@target // -> ends with @target then use the name.
 * instead of trying to split @ cos there could be multiple in the key.
 * @param local T
 * @param path
 * @param installationResult
 */

export async function findElementPkg(
  dir: string,
  local: boolean,
  path: string,
  installationResult: { [key: string]: PostInstall }): Promise<string> {

  const result = findInstallationResult(local, path, installationResult);

  return readJson(join(dir, 'node_modules', result.moduleId));
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

    if (e) {
      const statInfo = await stat(resolvedPath);
      const hasModel = _.some(models, m => m.element === element);
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
        hasModel: _.some(models, m => m.element === element),
        local: false,
        type: PackageType.PACKAGE,
        value: v
      };
    }
  });

  return Promise.all(mapped);
}
