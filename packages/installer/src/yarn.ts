import * as findUp from 'find-up';
import { join } from 'path';
import { buildLogger } from 'log-factory';
import * as spawn from 'cross-spawn';
import * as lockfile from '@yarnpkg/lockfile';
import { readFile, readJson } from 'fs-extra';

const logger = buildLogger();

const findYarnCmd = () => {
  return findUp('node_modules', {
    cwd: __dirname
  })
    .then(np => {
      return join(np, '.bin', 'yarn');
    });
};

async function yarnInstall(cwd: string): Promise<void> {
  const yarnCmd = findYarnCmd();
  return new Promise<void>((resolve, reject) => {
    spawn(yarnCmd, ['install'], { cwd, stdio: 'inherit' })
      .on('error', reject)
      .on('close', async (code, err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

async function yarnAdd(cwd: string, keys: string[]): Promise<void> {

  const yarnCmd = findYarnCmd();

  if (!keys || keys.length === 0) {
    return Promise.resolve();
  } else {
    const args = ['add', ...keys];

    logger.silly('args: ', args);
    return new Promise<void>((resolve, reject) => {
      spawn(yarnCmd, args, { cwd, stdio: 'inherit' })
        .on('error', reject)
        .on('close', (code, err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
  }
}

export async function install(cwd: string, keys: string[]): Promise<{}> {
  const yarnCmd = await findYarnCmd();
  logger.info('using yarn cmd: ', yarnCmd);

  logger.info('cwd: ', cwd);

  const pkg = await readJson(join(cwd, 'package.json'));
  const outstandingKeys = removeKeysThatAreInPackage(keys, pkg);

  // if there are any keys not in the package.json add them.
  await yarnAdd(cwd, outstandingKeys);
  // always run an install...
  await yarnInstall(cwd);
  const file = await readFile(join(cwd, 'yarn.lock'), 'utf8');
  const json = lockfile.parse(file);
  return json.object;
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
