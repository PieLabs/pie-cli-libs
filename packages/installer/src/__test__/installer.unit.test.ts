// import { createInstallRequests } from '../installer';
import { setDefaultLevel, buildLogger } from 'log-factory';

const logger = buildLogger();

beforeAll(() => {
  setDefaultLevel('silly');
});

describe('createInstallRequests', () => {

  let mockFs;

  beforeAll(() => {
    mockFs = {
      pathExists: jest.fn(),
      stat: () => Promise.resolve({
        isFile: jest.fn(() => true)
      })
    }
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
        package: {
          name: '@scope/package',
          version: '1.0.0'
        },
        value: '..'
      }
    ]);
  });
});