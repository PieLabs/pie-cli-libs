import { join } from 'path';
import { readJson, pathExists } from 'fs-extra';

export async function loadPkg(dir: string): Promise<any | undefined> {
  const pkgPath = join(dir, 'package.json');
  if (await pathExists(pkgPath)) {
    return readJson(join(dir, 'package.json'));
  } else {
    return undefined;
  }
}
