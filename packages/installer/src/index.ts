import RootInstaller, {
  ElementMap,
  Model,
  InstalledElement,
  findInstallationResult,
  writePackageJson,
  PreInstallRequest,
  PostInstall,
  PieInfo,
  Input,
  PackageType,
  Dirs
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

export async function install(
  dir: string,
  elements: ElementMap,
  models: Model[],
  reporter: Reporter): Promise<{ dirs: Dirs, installed: InstalledElement[] }> {

  logger.silly('dir:', dir);

  const installer = new RootInstaller(dir, reporter);
  const installed = await installer.install(elements, models);

  logger.silly('installed: ', JSON.stringify(installed));

  await reporter.promise(
    'installing controllers',
    installControllers(installed.dir, installed.elements));

  await reporter.promise(
    'installing configure',
    installConfigure(installed.dir, installed.elements));

  const dirs: Dirs = {
    configure: join(installer.installationDir, '.configure'),
    controllers: join(installer.installationDir, '.controller'),
    root: installer.installationDir
  };

  return {
    dirs,
    installed: installed.elements
  };
}

async function installConfigure(dir: string, result: InstalledElement[]): Promise<any> {
  const pies = result.filter(r => r.pie !== undefined);
  return installPieSubPackage(dir, pies, 'configure', join(dir, '.configure'));
}

async function installControllers(dir: string, result: InstalledElement[]): Promise<any> {
  const pies = result.filter(r => r.pie !== undefined);
  return installPieSubPackage(dir, pies, 'controller', join(dir, '.controllers'));
}

async function installPieSubPackage(
  rootDir: string,
  installed: InstalledElement[],
  packageName: 'controller' | 'configure',
  installDir: string): Promise<any> {

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
    if (!p.postInstall) {
      throw new Error('we expect an npm install object for a pie');
    }
    const { postInstall } = p;
    const installPath = join(rootDir, 'node_modules', postInstall.moduleId, packageName);
    const rp = relative(installDir, installPath);
    logger.silly('installPath: ', installPath, 'intallDir:', installDir, 'relative: ', rp);
    return { moduleId: postInstall.moduleId, path: rp };
  });

  const installResult = await yarnInstall(installDir, relativeDependencies.map(r => r.path));

  logger.silly('[installPieSubPackage] installResult', installResult);

  installed.forEach(p => {
    if (p.pie) {

      const rd = relativeDependencies.find(d => d.moduleId === p.postInstall.moduleId);

      logger.silly('relative dependency: ', rd);
      const ir = findInstallationResult(true, rd.path, installResult);
      logger.silly('install result: ', ir);

      p.pie[packageName] = {
        dir: installDir,
        moduleId: ir && ir.moduleId
      };
    }
  });
  logger.silly('[installPieSubPackage]: ', JSON.stringify(installResult, null, '  '));
  return installResult;
}
