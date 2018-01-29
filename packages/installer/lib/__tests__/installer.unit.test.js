"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_factory_1 = require("log-factory");
const logger = log_factory_1.buildLogger();
beforeAll(() => {
    log_factory_1.setDefaultLevel('silly');
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
    it('returns remote package', () => __awaiter(this, void 0, void 0, function* () {
        mockFs.pathExists.mockReturnValue(Promise.resolve(false));
        const { createInstallRequests } = require('../installer');
        const result = yield createInstallRequests('dir', [{ element: 'element-one', value: '..' }], [{ element: 'element-one' }]);
        expect(result).toEqual([
            {
                element: 'element-one',
                hasModel: true,
                local: false,
                type: 'package',
                value: '..'
            }
        ]);
    }));
    it('returns local package', () => __awaiter(this, void 0, void 0, function* () {
        mockFs.pathExists.mockReturnValue(Promise.resolve(true));
        mockFs.stat = () => Promise.resolve({ isFile: () => false });
        const { createInstallRequests } = require('../installer');
        const result = yield createInstallRequests('dir', [{ element: 'element-one', value: '..' }], [{ element: 'element-one' }]);
        expect(result).toEqual([
            {
                element: 'element-one',
                hasModel: true,
                local: true,
                type: 'package',
                value: '..'
            }
        ]);
    }));
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
//# sourceMappingURL=installer.unit.test.js.map