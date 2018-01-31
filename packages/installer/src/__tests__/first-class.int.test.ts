import { install } from '../index';
import { setDefaultLevel, buildLogger } from 'log-factory';
import { mkdirAsync } from './utils';
setDefaultLevel('silly');

const logger = buildLogger();

const reporter = {
  info: () => { /**/ },
  promise: p => p
};

describe('first-class', () => {
  it('installs', async () => {

    const dir = await mkdirAsync('first-class');

    const elements = {
      'first-class': '@pie-test-elements/first-class-pie@0.1.2'
    };

    const models = [
      {
        element: 'first-class'
      }
    ];
    logger.info('run install...');
    const result = await install(dir, elements, models, reporter);
    logger.info(JSON.stringify(result, null, '  '));

    expect(result.installed.length).toEqual(1);
    const [one] = result.installed;

    // <first-class> maps to @pie-test-elements/element
    expect(one).toMatchObject({
      element: 'first-class',
      pie: {
        moduleId: '@pie-test-elements/element'
      }
    });
  });
});
