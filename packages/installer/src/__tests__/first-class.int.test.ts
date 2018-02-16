import { install } from '../index';
import { setDefaultLevel, buildLogger } from 'log-factory';
import { mkdirAsync } from './utils';
import * as verdaccio from './verdaccio';

setDefaultLevel('silly');

const logger = buildLogger();

const reporter = {
  info: () => { /**/ },
  promise: p => p
};

describe('first-class', () => {

  beforeAll(done => {
    jest.setTimeout(30000);
    verdaccio.boot(done);
    setTimeout(() => done(), 500);
  });

  afterAll(done => {
    verdaccio.kill();
    setTimeout(() => done(), 500);
  });

  let result;
  beforeAll(async () => {
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
    result = await install(dir, elements, models, reporter);
    logger.info(JSON.stringify(result, null, '  '));
    return result;
  });

  it('result has 1 pkg', () => {
    expect(result.pkgs.length).toEqual(1);

  });

  it('1st pkg.element points to pie.element from package.json', () => {
    const [one] = result.pkgs;
    expect(one.element).toMatchObject({
      moduleId: '@pie-test-elements/element',
      tag: 'first-class'
    });
  });

  it('1st pkg.controller points to package.json', () => {
    const [one] = result.pkgs;
    expect(one.controller).toMatchObject({
      dir: undefined,
      isChild: false,
      isLocalPkg: false,
      key: 'first-class-controller',
      moduleId: '@pie-test-elements/element-controller'
    });
  });

  it('1st pkg.configure points to package.json', () => {
    const [one] = result.pkgs;
    expect(one.configure).toMatchObject({
      dir: undefined,
      isChild: false,
      isLocalPkg: false,
      moduleId: '@pie-test-elements/element-configure',
      tag: 'first-class-configure'
    });
  });

});
