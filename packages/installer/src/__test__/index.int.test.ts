import { install } from '..';

describe('install', () => {

  it('installs', () => {
    const dir = '';
    return install(dir, { 'element-one': '@pie-elements/text-entry' })
      .then((result) => {
        expect(result).toEqual({});
      })
  });
});