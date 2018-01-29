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
const installer_1 = require("./installer");
const log_factory_1 = require("log-factory");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const yarn_1 = require("./yarn");
const logger = log_factory_1.getLogger('@pie-cli-libs/installer');
function install(dir, elements, models, reporter) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.silly('dir:', dir);
        const installer = new installer_1.default(dir, reporter);
        const installed = yield installer.install(elements, models);
        logger.silly('installed: ', JSON.stringify(installed));
        const controllerResult = yield reporter.promise('installing controllers', installControllers(installed.dir, installed.elements));
        return installed.elements;
    });
}
exports.install = install;
function installControllers(dir, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pies = result.filter(r => r.pie !== undefined);
        return installPieSubPackage(dir, pies, 'controller', path_1.join(dir, '.controllers'));
    });
}
function installPieSubPackage(rootDir, installed, packageName, installDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.silly('[installPieSubPackage] rootDir: ', rootDir, 'packageName: ', packageName, 'installDir: ', installDir);
        if (!installed || installed.length === 0) {
            return;
        }
        yield fs_extra_1.ensureDir(installDir);
        yield installer_1.writePackageJson(installDir, {
            name: 'controllers-generated-pkg',
            private: true
        });
        const relativeDependencies = installed.map(p => {
            if (!p.postInstall) {
                throw new Error('we expect an npm install object for a pie');
            }
            const { postInstall } = p;
            const installPath = path_1.join(rootDir, 'node_modules', postInstall.moduleId, packageName);
            const rp = path_1.relative(installDir, installPath);
            logger.silly('installPath: ', installPath, 'intallDir:', installDir, 'relative: ', rp);
            return { moduleId: postInstall.moduleId, path: rp };
        });
        const installResult = yield yarn_1.install(installDir, relativeDependencies.map(r => r.path));
        logger.silly('[installPieSubPackage] installResult', installResult);
        installed.forEach(p => {
            if (p.pie) {
                const rd = relativeDependencies.find(rd => rd.moduleId === p.postInstall.moduleId);
                logger.silly('relative dependency: ', rd);
                const ir = installer_1.findInstallationResult(true, rd.path, installResult);
                logger.silly('install result: ', ir);
                p.pie[packageName] = {
                    dir: installDir,
                    moduleId: ir && ir.moduleId
                };
            }
        });
        logger.silly('[installPieSubPackage]: ', JSON.stringify(installResult, null, '  '));
        return installResult;
    });
}
//# sourceMappingURL=index.js.map