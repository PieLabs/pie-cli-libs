import * as findUp from 'find-up';
import { join } from 'path';
import { buildLogger } from 'log-factory';
import * as spawn from 'cross-spawn';
import * as lockfile from '@yarnpkg/lockfile';
import { readFile, pathExists } from 'fs-extra';
import { readPackage } from './installer';
import { isEmpty } from 'lodash';

const logger = buildLogger();

const findYarnCmd = () => {

  const isWindows = process.platform === 'win32';
  logger.info('[findYarnCmd] isWindows: ', isWindows);

  const cmd = isWindows ? 'yarn.cmd' : 'yarn';

  return findUp(`.bin/${cmd}`, {
    cwd: __dirname
  })
    .then(p => {
      return p;
    });
};

const sp = async (cwd: string, args: string[]): Promise<void> => {
  const cmd = await findYarnCmd();
  logger.silly('cmd: ', cmd);
  return new Promise<void>((resolve, reject) => {

    // aka inherit
    const stdio = [
      process.stdin,
      process.stdout,
      process.stderr
    ];

    spawn(cmd, args, { cwd, stdio })
      .on('error', reject)
      .on('close', async (code, err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });

};

function yarnInstall(cwd: string): Promise<void> {
  return sp(cwd, ['install']);
}

function yarnAdd(cwd: string, keys: string[]): Promise<void> {
  if (!keys || keys.length === 0) {
    return Promise.resolve();
  } else {
    const args = ['add', ...keys];
    logger.silly('args: ', args);
    return sp(cwd, args);
  }
}

export async function install(cwd: string, keys: string[]): Promise<{}> {
  const yarnCmd = await findYarnCmd();
  logger.silly('using yarn cmd: ', yarnCmd);
  logger.silly('cwd: ', cwd);

  /**
   * cant use package.json because the
   * module and id may not match the install path.
   * const outstandingKeys = removeKeysThatAreInPackage(keys, pkg);
   */
  const outstandingKeys = await removeKeysThatAreInLockFile(keys, cwd);
  logger.silly('outstandingKeys: ', outstandingKeys);
  // if there are any keys not in the package.json add them.
  await yarnAdd(cwd, outstandingKeys);
  // always run an install...
  await yarnInstall(cwd);

  /**
   * If a package has no dependencies no yarn.lock is present.
   * Handle this.
   */
  return readYarnLock(cwd)
    .catch(async e => {
      const pkg = await readPackage(cwd);
      if (!pkg.dependencies || isEmpty(pkg.dependencies)) {
        return {};
      } else {
        throw e;
      }
    });
}

export async function readYarnLock(cwd: string): Promise<{}> {

  const yarnLockPath = join(cwd, 'yarn.lock');
  const exists = await pathExists(yarnLockPath);

  logger.silly(yarnLockPath, 'exists? ', exists);

  if (exists) {
    const file = await readFile(yarnLockPath, 'utf8');
    const parsed = lockfile.parse(file);
    return parsed.object;
  } else {
    return Promise.reject(new Error(`no yarn file: ${yarnLockPath}`));
  }
}

export async function removeKeysThatAreInLockFile(keys: string[], cwd: string): Promise<string[]> {
  try {
    const yarnLock = await readYarnLock(cwd);
    return keys.filter(k => !inYarnLock(yarnLock, k));
  } catch (e) {
    logger.silly('[removeKeysThatAreInLockFile] got the error return []');
    return keys;
  }
}

export function inYarnLock(yarn: any, key: string): boolean {

  const yarnKeys = Object.keys(yarn);

  const match = yarnKeys.find(yk => {
    return yk === key || yk.startsWith(`${key}@`) || yk.endsWith(`@${key}`);
  });

  return match !== undefined;
}

export function removeKeysThatAreInPackage(keys: string[], pkg: {
  dependencies: {
    [d: string]: string
  }
}): string[] {
  return keys.filter(k => {
    const defined = inDependencies(pkg.dependencies, k);
    return !defined;
  });
}

export const asId = (raw: string): string => {
  const lastIndexOf = raw.lastIndexOf('@');
  if (lastIndexOf > 0) {
    return raw.substring(0, lastIndexOf);
  } else {
    return raw;
  }
};

export const inDependencies = (dependencies: { [d: string]: string }, input: string): boolean => {

  logger.silly('[inDependencies] dependencies: ', JSON.stringify(dependencies), 'input: ', input);
  if (!dependencies) {
    return false;
  }

  const depKeys = Object.keys(dependencies);

  const match = depKeys.find(dk => {
    const inputToCheck = asId(input);
    const value = dependencies[dk];
    return value === inputToCheck || dk === inputToCheck;
  });

  logger.silly('match: ', match);
  return match !== undefined;
};

/**
 * Break out npm style 'id@target'
 * target could be 'latest', '*' '../../', '^0.1.1'
 */
export type IdAndTarget = {
  id: string,
  target: string
};

/**
 * @param k a yarn.lock key 'foo@bar'
 */
export const idAndTarget = (k: string): IdAndTarget => {
  const index = k.lastIndexOf('@');
  if (index === -1) {
    throw new Error('A yarn.lock identifer MUST contain @');
  }
  const id = k.substring(0, index);
  const target = k.substr(index + 1);
  return { id, target };
};
