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
const __1 = require("..");
const log_factory_1 = require("log-factory");
const temp = require("temp");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const installer_1 = require("../installer");
const logger = log_factory_1.buildLogger();
const mkLocalPackage = (dir, name, pkg = {}) => __awaiter(this, void 0, void 0, function* () {
    const path = path_1.join(dir, name);
    yield fs_extra_1.ensureDir(path);
    const data = Object.assign({ name: `@scope/${name}`, version: '1.0.0', description: 'just a tester', license: 'MIT', dependencies: {} }, pkg);
    return yield installer_1.writePackageJson(path, data);
});
const mkLocalPiePackage = (dir, name) => __awaiter(this, void 0, void 0, function* () {
    yield mkLocalPackage(dir, name, { name: `@scope/${name}` });
    yield mkLocalPackage(path_1.join(dir, name), 'controller', { name: `@scope/${name}-controller` });
    yield mkLocalPackage(path_1.join(dir, name), 'configure', { name: `@scope/${name}-configure` });
});
const reporter = {
    promise: (msg, p) => {
        logger.silly('msg: ', msg);
        return p;
    }
};
describe('installer', () => {
    let tmpPath = null;
    beforeAll((done) => {
        jest.setTimeout(30000);
        log_factory_1.setDefaultLevel('silly');
        temp.mkdir('installer-', (err, path) => {
            tmpPath = path;
            done(err);
        });
    });
    describe('install', () => {
        it('installs remote package w/ set verision', () => __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(tmpPath, 'remote-pkg-test');
            yield fs_extra_1.ensureDir(dir);
            const result = yield __1.install(dir, { 'element-one': '@pie-elements/text-entry@^0.2.2' }, [{ element: 'element-one' }], reporter);
            expect(result.length).toEqual(1);
            const [one] = result;
            expect(one).toMatchObject({
                input: {
                    element: 'element-one',
                    value: '@pie-elements/text-entry@^0.2.2'
                },
                postInstall: {
                    moduleId: '@pie-elements/text-entry'
                }
            });
        }));
        it('installs local package', () => __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(tmpPath, 'local-pkg-test');
            yield fs_extra_1.ensureDir(dir);
            yield mkLocalPackage(tmpPath, 'local-pkg');
            const result = yield __1.install(dir, { 'element-one': '../local-pkg' }, [{ element: 'element-one' }], reporter);
            logger.info('result: ', result);
            expect(result.length).toEqual(1);
            const [r] = result;
            expect(r).toMatchObject({
                postInstall: {
                    moduleId: '@scope/pkg'
                }
            });
            expect(r).toMatchObject({ pieInfo: undefined });
        }));
        it.only('installs local pie package', () => __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(tmpPath, 'local-pkg-test');
            yield fs_extra_1.ensureDir(dir);
            yield mkLocalPiePackage(tmpPath, 'local-pkg');
            const result = yield __1.install(dir, { 'element-one': '../local-pkg' }, [{ element: 'element-one' }], reporter);
            logger.info('result: ', result);
            expect(result).toEqual(1);
            const [r] = result;
            expect(r).toMatchObject({
                postInstall: {
                    moduleId: '@scope/local-pkg'
                },
                pieInfo: {
                    hasConfigurePackage: true
                }
            });
        }));
    });
});
//# sourceMappingURL=index.int.test.js.map