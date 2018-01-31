import { PieController, Input, PieConfigure, PiePackageConfig } from './types';
import { loadPkg } from './utils';
import { join, resolve } from 'path';
import * as invariant from 'invariant';
import { pathExists } from 'fs-extra';
import { buildLogger } from 'log-factory';

const logger = buildLogger();

const findRelativeDir = async (dir: string, yarn: any, name: string): Promise<string | undefined> => {

  logger.silly('[findRelativeDir] dir: ', dir, 'name: ', name);

  const key = Object.keys(yarn).find(pattern => pattern.startsWith(`${name}@`));

  logger.silly('[findRelativeDir] key: ', key);
  if (key) {
    const path = key.replace(`${name}@`, '').replace('file:', '');
    // const fullPath = join(dir, path);
    const resolved = resolve(dir, path);
    logger.silly('path: ', path, 'resolved: ', resolved);
    const exists = await pathExists(resolved);
    if (exists) {
      return path;
    }
  }
};

/** build controller data */
export async function controller(
  pieDef: PiePackageConfig,
  rootDir: string,
  yarn: any,
  input: Input,
  rootPkgPath: string): Promise<PieController | undefined> {

  const controllerPkg = await loadPkg(join(rootPkgPath, 'controller'));

  if (!controllerPkg && !pieDef.controller) {
    return undefined;
  }

  logger.silly('controllerPkg: ', controllerPkg);

  const key = `${input.element}-controller`;

  if (controllerPkg) {
    invariant(controllerPkg.name, 'The controller package must have a name defined');
    // Note: ignore what's in pieDef
    return {
      dir: undefined,
      isChild: true,
      isLocalPkg: false,
      key,
      moduleId: controllerPkg.name,
    };
  } else {

    const relativeDir = await findRelativeDir(rootDir, yarn, pieDef.controller);

    return {
      dir: relativeDir,
      isChild: false,
      isLocalPkg: !!relativeDir,
      key,
      moduleId: pieDef.controller
    };
  }
}

export async function configure(
  pieDef: PiePackageConfig,
  rootDir: string,
  yarn: any,
  input: Input,
  rootPkgPath: string
): Promise<PieConfigure | undefined> {

  const configurePkg = await loadPkg(join(rootPkgPath, 'configure'));

  if (!configurePkg && !pieDef.configure) {
    return undefined;
  }

  logger.silly('configurePkg: ', configurePkg);

  const tag = `${input.element}-configure`;

  if (configurePkg) {
    invariant(configurePkg.name, 'The controller package must have a name defined');
    // Note: ignore what's in pieDef
    return {
      dir: undefined,
      isChild: true,
      isLocalPkg: false,
      moduleId: configurePkg.name,
      tag
    };
  } else {

    const relativeDir = await findRelativeDir(rootDir, yarn, pieDef.configure);

    return {
      dir: relativeDir,
      isChild: false,
      isLocalPkg: !!relativeDir,
      moduleId: pieDef.configure,
      tag
    };
  }
}
