// import { createInstallRequests } from '../installer';
import { setDefaultLevel, buildLogger } from 'log-factory';

const logger = buildLogger();

beforeAll(() => {
  setDefaultLevel('silly');
  logger.info('set to silly');
});

describe('createInstallRequests', () => {

  let mockFs;

  beforeAll(() => {
    mockFs = {
      pathExists: jest.fn(),
      stat: () => Promise.resolve({
        isFile: jest.fn(() => true)
      })
    };
    jest.mock('fs-extra', () => mockFs);
  });

  it('returns remote package', async () => {
    mockFs.pathExists.mockReturnValue(Promise.resolve(false));

    const { createInstallRequests } = require('../installer');
    const result = await createInstallRequests(
      'dir',
      [{ element: 'element-one', value: '..' }],
      [{ element: 'element-one' }]
    );
    expect(result).toEqual([
      {
        element: 'element-one',
        hasModel: true,
        local: false,
        type: 'package',
        value: '..'
      }
    ]);
  });

  it('returns local package', async () => {
    mockFs.pathExists.mockReturnValue(Promise.resolve(true));
    mockFs.stat = () => Promise.resolve({ isFile: () => false });

    const { createInstallRequests } = require('../installer');

    const result = await createInstallRequests(
      'dir',
      [{ element: 'element-one', value: '..' }],
      [{ element: 'element-one' }]
    );
    expect(result).toEqual([
      {
        element: 'element-one',
        hasModel: true,
        local: true,
        type: 'package',
        value: '..'
      }
    ]);
  });
});

describe('findInstallationResult', () => {

  let findInstallationResult;
  beforeEach(() => {
    findInstallationResult = require('../installer').findInstallationResult;
  });

  it('finds remote', () => {
    const out = findInstallationResult(false, '@scope/pkg@^0.2.2', {
      '@scope/pkg@^0.2.2': {
        version: '0.2.3'
      }
    });
    expect(out).toEqual({ version: '0.2.3', moduleId: '@scope/pkg' });
  });

  it('finds local', () => {
    const out = findInstallationResult(true, 'path', {
      '@scope/pkg@path': {
        version: '1.0.0'
      }
    });
    expect(out).toEqual({ version: '1.0.0', moduleId: '@scope/pkg' });
  });
});
