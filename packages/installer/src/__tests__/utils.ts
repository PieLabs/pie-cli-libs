import { ensureDir, pathExists } from 'fs-extra';
import { join } from 'path';
import { writePackageJson, Pkg } from '../installer';

// tslint:disable-next-line:no-implicit-dependencies
import { mkdir } from 'temp';

export const mkdirAsync = (prefix: string): Promise<string> => {
  return new Promise((resolve, reject) => {

    mkdir(prefix, (err, p) => {
      if (err) {
        reject(err);
      } else {
        resolve(p);
      }
    });
  });
};

export const mkLocalPackage = async (dir: string, name: string, pkg: any = {}): Promise<string> => {
  const path = join(dir, name);
  await ensureDir(path);

  const data = {
    dependencies: {},
    description: 'just a tester',
    license: 'MIT',
    name: `@scope/${name}`,
    version: '1.0.0',
    ...pkg
  };
  return writePackageJson(path, data);
};

export const mkLocalPiePackage = async (dir: string, name: string) => {
  await mkLocalPackage(dir, name, { name: `@scope/${name}` });
  await mkLocalPackage(join(dir, name), 'controller', { name: `@scope/${name}-controller` });
  await mkLocalPackage(join(dir, name), 'configure', { name: `@scope/${name}-configure` });
};

export const mkReporter = (logger: any) => ({
  info: (msg) => logger.silly('>>> ', msg),
  promise: (msg, p) => {
    logger.silly('>>>>>>>>>>>>>>>>>> msg: ', msg);
    return p;
  }
});
