import * as findUp from 'find-up';
import { join } from 'path';
import { buildLogger } from 'log-factory';
import * as spawn from 'cross-spawn';
import * as lockfile from '@yarnpkg/lockfile';
import { readFile } from 'fs-extra';

const logger = buildLogger();

const findYarnCmd = () => {
  return findUp('node_modules')
    .then(np => {
      return join(np, '.bin', 'yarn');
    })
}

export async function install(cwd: string, keys: string[]): Promise<{}> {
  const yarnCmd = await findYarnCmd();
  logger.info('using yarn cmd: ', yarnCmd);

  const args = ['add', ...keys];

  logger.info('cwd: ', cwd);

  logger.silly('args: ', args);
  return new Promise((resolve, reject) => {
    spawn(yarnCmd, args, { cwd, stdio: 'inherit' })
      .on('error', reject)
      .on('close', async (code, err) => {
        if (err) {
          reject(err);
        } else {
          logger.info('success code: ', code, cwd);
          let file = await readFile(join(cwd, 'yarn.lock'), 'utf8');
          let json = lockfile.parse(file);
          resolve(json.object);
        }
      });
  });
}


/** 
 * Break out npm style 'id@target'
 * target could be 'latest', '*' '../../', '^0.1.1'
 */
export type IdAndTarget = {
  id: string,
  target: string
}

/**
 * 
 * @param k a yarn.lock key 'foo@bar'
 */
export const idAndTarget = (k: string): IdAndTarget => {
  const index = k.lastIndexOf('@');
  if (index === -1) {
    throw new Error('A yarn.lock identifer MUST contain @');
  }
  const id = k.substring(0, index);
  const target = k.substr(index + 1);
  return { id, target }
}