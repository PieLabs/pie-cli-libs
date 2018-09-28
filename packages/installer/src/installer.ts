import * as _ from "lodash";
import * as semver from "semver";
import { install } from "./yarn";

import {
  ensureDirSync,
  stat,
  pathExists,
  readJson,
  writeJson,
  pathExistsSync
} from "fs-extra";
import { join, resolve } from "path";
import { loadPkg, versionFromValue } from "./utils";
import { buildLogger } from "log-factory";
import { Reporter } from "./reporter";
import {
  Pkg,
  PackageType,
  PackageJson,
  ElementMap,
  Model,
  Input,
  PreInstallRequest,
  PostInstall
} from "./types";
import { controller, configure, element } from "./pkg-builder";
import invariant from "invariant";

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

    this.installationDir = join(cwd, ".pie");
    ensureDirSync(this.installationDir);
  }

  public async install(
    elements: ElementMap,
    models: Model[]
  ): Promise<{ dir: string; pkgs: Pkg[]; lock: any }> {
    logger.silly("[install]", elements);

    // tslint:disable-next-line:no-shadowed-variable
    const inputs: Input[] = _.map(elements, (value, element) => ({
      element,
      value,
      version: versionFromValue(value)
    }));
    const requests: PreInstallRequest[] = await createInstallRequests(
      this.cwd,
      inputs,
      models
    );

    const mappedRequests = requests.map(r => {
      if (r.local) {
        return { ...r, value: `../${r.value}` };
      } else {
        return r;
      }
    });

    const packages = mappedRequests.filter(r => r.type === "package");
    logger.debug("writing package.json..");
    await this.reporter.promise(
      "writing package.json",
      writePackageJson(this.installationDir)
    );
    logger.debug("writing package.json..done");

    const lockData = await install(
      this.installationDir,
      packages.map(r => r.value)
    );

    const pkgs = _.zipWith(
      inputs,
      mappedRequests,
      async (input, r: PreInstallRequest) => {
        const result = findInstallationResult(r.local, r.value, lockData);
        return toPkg(this.installationDir, input, lockData, result, r);
      }
    );

    return Promise.all(pkgs).then(p => ({
      dir: this.installationDir,
      lock: lockData,
      pkgs: p
    }));
  }
}

export async function toPkg(
  dir: string,
  input: Input,
  yarn: any,
  result: PostInstall,
  preInstall: PreInstallRequest
): Promise<Pkg> {
  logger.silly("[toPkg] dir: ", dir);
  logger.silly("[toPkg] result: ", result);

  invariant(
    typeof result.moduleId === "string",
    `result.moduleId must be a string got: ${result.moduleId}`
  );
  invariant(typeof dir === "string", `dir must be a string got: ${dir}`);

  const installPath = join(dir, "node_modules", result.moduleId);

  const pkg = await loadPkg(installPath);

  const pieDef = (pkg && pkg.pie) || {};

  const out: Pkg = {
    dir,
    element: await element(pieDef, dir, yarn, input, installPath, result),
    input,
    isLocal: preInstall.local,
    rootModuleId: result.moduleId,
    type: preInstall.type
  };

  out.controller = await controller(pieDef, dir, yarn, input, installPath);
  out.configure = await configure(pieDef, dir, yarn, input, installPath);

  return out;
}

export function findInstallationResult(
  local: boolean,
  path: string,
  installationResult: { [key: string]: PostInstall }
): PostInstall {
  logger.debug("[findInstallationResult] path: ", path, "local: ", local);
  logger.silly(
    "[findInstallationResult] installationResult: ",
    installationResult
  );

  const findKey = (s: string) => path === s || s.endsWith(`@${path}`);

  const getModuleId = (s: string) => {
    if (!s) {
      return;
    }

    const suffix = `@${path}`;

    if (s.endsWith(suffix)) {
      return s.replace(suffix, "");
    } else {
      return s.substr(0, s.lastIndexOf("@"));
    }
  };

  const k = Object.keys(installationResult).find(findKey);
  const moduleId = getModuleId(k);
  return { ...installationResult[k], moduleId };
}

export async function writePackageJson(
  dir: string,
  data: {} = {},
  opts = {
    force: false
  }
): Promise<string> {
  logger.silly("[writePackageJson]: dir: ", dir);

  const pkgPath = join(dir, "package.json");

  if (await pathExists(pkgPath)) {
    return Promise.resolve(pkgPath);
  } else {
    const info = {
      description: "auto generated package.json",
      license: "MIT",
      name: "x",
      private: true,
      version: "0.0.1",
      ...data
    };
    return writeJson(join(dir, "package.json"), info, { spaces: 2 }).then(
      () => pkgPath
    );
  }
}

export async function readPackage(dir: string): Promise<PackageJson> {
  const pkgPath = join(dir, "package.json");
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
  models: Model[]
): Promise<PreInstallRequest[]> {
  // tslint:disable-next-line:no-shadowed-variable
  const mapped = elements.map(async ({ element, value }) => {
    const resolvedPath = resolve(cwd, value);

    logger.silly("resolvedPath: ", resolvedPath);

    const e = await pathExists(resolvedPath);
    logger.silly("path exists: ", e);

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
