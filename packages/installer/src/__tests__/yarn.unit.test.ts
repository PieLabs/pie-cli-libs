import { removeKeysThatAreInPackage, inDependencies } from "../yarn";
import { setDefaultLevel } from "log-factory";

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
  const assertInOnly = _assert(true);

  assertIn({ moduleId: '../..' }, '../..', true);
  assertIn({ moduleId: '../..' }, '../../..', false);
  assertIn({ moduleId: '^1.0.0' }, 'moduleId@^1.0.0', true);
  assertIn({ moduleId: '^2.0.0' }, 'moduleId', true);
  assertIn({ moduleId: '*' }, 'moduleId@*', true);
  assertIn({ moduleId: '*' }, 'other@*', false);
  assertIn({ '@scope/pkg': '~2.0.1' }, '@scope/pkg@~2.0.1', true);

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
