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
const yarn_1 = require("../yarn");
const temp_1 = require("temp");
const installer_1 = require("../installer");
const log_factory_1 = require("log-factory");
const logger = log_factory_1.buildLogger();
beforeAll(() => {
    log_factory_1.setDefaultLevel('silly');
});
describe('install', () => {
    let tmpPath;
    beforeEach(done => {
        jest.setTimeout(30000);
        logger.silly('mkdir');
        temp_1.mkdir('yarn-install-', (e, p) => {
            logger.silly('got path: ', p);
            tmpPath = p;
            done(e);
        });
    });
    it('installs npm dependency', () => __awaiter(this, void 0, void 0, function* () {
        logger.info('tmpPath: ', tmpPath);
        yield installer_1.writePackageJson(tmpPath);
        const result = yield yarn_1.install(tmpPath, ['@pie-elements/text-entry@^0.2.2']);
        expect(result.hasOwnProperty('@pie-elements/text-entry@^')).toEqual(true);
    }));
});
//# sourceMappingURL=yarn.int.test.js.map