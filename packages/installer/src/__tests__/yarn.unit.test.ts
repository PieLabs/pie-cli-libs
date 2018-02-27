import { removeKeysThatAreInPackage, inDependencies, inYarnLock, readYarnLock } from '../yarn';
import { setDefaultLevel } from 'log-factory';
import { readFile } from 'fs-extra';
import { parse } from '@yarnpkg/lockfile';

beforeAll(() => {
  setDefaultLevel('silly');
});

describe('inDependencies', () => {

  // tslint:disable-next-line:variable-name
  const _assert = only => (deps, input, expected) => {
    const fn = only ? it.only : it;
    const label = `returns ${expected} for ${input}`;
    fn(label, () => {
      const out = inDependencies(deps, input);
      expect(out).toEqual(expected);
    });
  };

  const assertIn = _assert(false);

  assertIn({ moduleId: '../..' }, '../..', true);
  assertIn({ moduleId: '../..' }, '../../..', false);
  assertIn({ moduleId: '^1.0.0' }, 'moduleId@^1.0.0', true);
  assertIn({ moduleId: '^2.0.0' }, 'moduleId', true);
  assertIn({ moduleId: '*' }, 'moduleId@*', true);
  assertIn({ moduleId: '*' }, 'other@*', false);
  assertIn({ '@scope/pkg': '~2.0.1' }, '@scope/pkg@~2.0.1', true);

});

describe('inYarnLock', () => {

  // tslint:disable-next-line:variable-name
  const _assert = only => (yarn, target, expected) => {
    const fn = only ? it.only : it;
    fn(`returns ${expected} for ${target} -> ${JSON.stringify(yarn)}`, () => {
      expect(inYarnLock(yarn, target)).toEqual(expected);
    });
  };

  const assertIn = _assert(false);
  assertIn({}, '../..', false);
  assertIn({ '@scope/pkg@../..': {} }, '../..', true);
  assertIn({ '@scope/pkg@^1.0.0': {} }, '@scope/pkg@^1.0.0', true);
  assertIn({ '@scope/pkg@^2.0.0': {} }, '@scope/pkg', true);
  assertIn({ 'log-factory@PieLabs/log-factory': {} }, 'PieLabs/log-factory', true);
});

describe('removeKeysThatAreInPackage', () => {
  it('strips remote installs', () => {

    const keys = removeKeysThatAreInPackage(
      ['@scope/pkg@~2.0.1', 'y'], {
        dependencies: {
          '@scope/pkg': '~2.0.1'
        }
      }
    );
    expect(keys).toEqual(['y']);
  });

  it('strips local installs', () => {

    const keys = removeKeysThatAreInPackage(
      ['../..', 'y'], {
        dependencies: {
          moduleId: '../..'
        }
      }
    );
    expect(keys).toEqual(['y']);
  });

});

describe('readYarnLock', () => {
  it('strips windows line endings', async () => {

    (readFile as any).mockReturnValue('windows \r string');
    await readYarnLock('path');

    expect(parse.mock.calls[0][0]).toEqual('windows  string');
  });
});
