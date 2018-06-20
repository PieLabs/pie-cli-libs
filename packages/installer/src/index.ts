import RootInstaller, { writePackageJson } from "./installer";

import {
  Element,
  Pkg,
  Input,
  PackageType,
  Dirs,
  ElementMap,
  Model,
  PieConfigure,
  PieController
} from "./types";

import { Reporter } from "./reporter";
import { getLogger } from "log-factory";
import { join, relative } from "path";
import { ensureDir } from "fs-extra";
import { install as yarnInstall } from "./yarn";

export {
  Element,
  Dirs,
  Input,
  Reporter,
  PackageType,
  Pkg,
  PieConfigure,
  PieController
};

const logger = getLogger("pie-cli-libs/installer");

export type InstallResult = {
  dirs: Dirs;
  pkgs: Pkg[];
  lockFiles: {
    root: any;
  };
};

export async function install(
  dir: string,
  elements: ElementMap,
  models: Model[],
  reporter: Reporter
): Promise<InstallResult> {
  logger.silly("dir:", dir);

  const installer = new RootInstaller(dir, reporter);
  reporter.info("installing root...");
  const installed = await installer.install(elements, models);

  logger.silly("installed: ", JSON.stringify(installed));

  reporter.info("installing controllers...");
  await installControllers(installed.dir, installed.pkgs);

  reporter.info("installing configure...");
  await installConfigure(installed.dir, installed.pkgs);

  const dirs: Dirs = {
    configure: join(installer.installationDir, ".configure"),
    controllers: join(installer.installationDir, ".controllers"),
    root: installer.installationDir
  };

  return {
    dirs,
    lockFiles: {
      root: installed.lock
    },
    pkgs: installed.pkgs
  };
}

async function installConfigure(dir: string, result: Pkg[]): Promise<string> {
  const pies = result.filter(r => r.configure && r.configure.isChild);
  return installPieSubPackage(dir, pies, "configure", join(dir, ".configure"));
}

async function installControllers(dir: string, result: Pkg[]): Promise<string> {
  const pies = result.filter(r => r.controller && r.controller.isChild);
  return installPieSubPackage(
    dir,
    pies,
    "controller",
    join(dir, ".controllers")
  );
}

async function installPieSubPackage(
  rootDir: string,
  installed: Pkg[],
  packageName: "controller" | "configure",
  installDir: string
): Promise<string> {
  logger.silly(
    "[installPieSubPackage] rootDir: ",
    rootDir,
    "packageName: ",
    packageName,
    "installDir: ",
    installDir
  );

  if (!installed || installed.length === 0) {
    return;
  }

  await ensureDir(installDir);

  await writePackageJson(installDir, {
    name: `${packageName}-generated-pkg`,
    private: true
  });

  const relativeDependencies = toDependencies(
    rootDir,
    packageName,
    installDir,
    installed
  );

  await yarnInstall(installDir, relativeDependencies);

  return installDir;
}

export const toDependencies = (
  rootDir: string,
  packageName: string,
  installDir: string,
  installed: Pkg[]
): string[] => {
  const relativeDependencies = installed.map(p => {
    logger.silly("[installPieSubPackage] p: ", p);
    const installPath = join(
      rootDir,
      "node_modules",
      p.rootModuleId,
      packageName
    );
    const rp = relative(installDir, installPath);
    logger.silly(
      "installPath: ",
      installPath,
      "intallDir:",
      installDir,
      "relative: ",
      rp
    );
    return { moduleId: p.rootModuleId, path: rp };
  });

  /**
   * Note: yarn on windows requires 'file:' prefix for local installs.
   */
  return relativeDependencies.map(r => `file:${r.path}`);
};
