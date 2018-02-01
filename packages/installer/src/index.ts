import RootInstaller, {
  ElementMap,
  Model,
  InstalledElement,
  writePackageJson,
  PreInstallRequest,
  PostInstall,
  PieInfo,
  Input,
  PackageType,
  Dirs,
  Pkg
} from './installer';

import { Reporter } from './reporter';
import { getLogger } from 'log-factory';
import { join, relative } from 'path';
import { ensureDir } from 'fs-extra';
import { install as yarnInstall } from './yarn';

export {
  Dirs,
  InstalledElement,
  PreInstallRequest,
  PostInstall,
  Input,
  PieInfo,
  Reporter,
  PackageType
};

const logger = getLogger('@pie-cli-libs/installer');

export type InstallResult = {
  dirs: Dirs,
  pkgs: Pkg[]
};

export async function install(
  dir: string,
  elements: ElementMap,
  models: Model[],
  reporter: Reporter): Promise<{ dirs: Dirs, pkgs: Pkg[] }> {

  logger.silly('dir:', dir);

  const installer = new RootInstaller(dir, reporter);
  reporter.info('installing root...');
  const installed = await installer.install(elements, models);

  logger.silly('installed: ', JSON.stringify(installed));

  reporter.info('installing controllers...');
  await installControllers(installed.dir, installed.pkgs);

  reporter.info('installing configure...');
  await installConfigure(installed.dir, installed.pkgs);

  const dirs: Dirs = {
    configure: join(installer.installationDir, '.configure'),
    controllers: join(installer.installationDir, '.controllers'),
    root: installer.installationDir
  };

  return {
    dirs,
    pkgs: installed.pkgs
  };
}

async function installConfigure(dir: string, result: Pkg[]): Promise<string> {
  const pies = result.filter(r => r.configure && r.configure.isInternalPkg);
  return installPieSubPackage(dir, pies, 'configure', join(dir, '.configure'));
}

async function installControllers(dir: string, result: Pkg[]): Promise<string> {
  const pies = result.filter(r => r.controller && r.controller.isInternalPkg);
  return installPieSubPackage(dir, pies, 'controller', join(dir, '.controllers'));
}

async function installPieSubPackage(
  rootDir: string,
  installed: Pkg[],
  packageName: 'controller' | 'configure',
  installDir: string): Promise<string> {

  logger.silly('[installPieSubPackage] rootDir: ', rootDir, 'packageName: ', packageName, 'installDir: ', installDir);

  if (!installed || installed.length === 0) {
    return;
  }

  await ensureDir(installDir);

  await writePackageJson(installDir, {
    name: 'controllers-generated-pkg',
    private: true
  });

  const relativeDependencies = installed.map(p => {
    const { element } = p;
    const installPath = join(rootDir, 'node_modules', element.moduleId, packageName);
    const rp = relative(installDir, installPath);
    logger.silly('installPath: ', installPath, 'intallDir:', installDir, 'relative: ', rp);
    return { moduleId: element.moduleId, path: rp };
  });

  const installResult = await yarnInstall(installDir, relativeDependencies.map(r => r.path));

  logger.silly('[installPieSubPackage] installResult', installResult);
  return installDir;
}
