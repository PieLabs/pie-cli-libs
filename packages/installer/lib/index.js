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
const types_1 = require("./types");
exports.PackageType = types_1.PackageType;
const log_factory_1 = require("log-factory");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const yarn_1 = require("./yarn");
const logger = log_factory_1.getLogger('pie-cli-libs/installer');
function install(dir, elements, models, reporter) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.silly('dir:', dir);
        const installer = new installer_1.default(dir, reporter);
        reporter.info('installing root...');
        const installed = yield installer.install(elements, models);
        logger.silly('installed: ', JSON.stringify(installed));
        reporter.info('installing controllers...');
        yield installControllers(installed.dir, installed.pkgs);
        reporter.info('installing configure...');
        yield installConfigure(installed.dir, installed.pkgs);
        const dirs = {
            configure: path_1.join(installer.installationDir, '.configure'),
            controllers: path_1.join(installer.installationDir, '.controllers'),
            root: installer.installationDir
        };
        return {
            dirs,
            pkgs: installed.pkgs
        };
    });
}
exports.install = install;
function installConfigure(dir, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pies = result.filter(r => r.configure && r.configure.isChild);
        return installPieSubPackage(dir, pies, 'configure', path_1.join(dir, '.configure'));
    });
}
function installControllers(dir, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pies = result.filter(r => r.controller && r.controller.isChild);
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
            name: `${packageName}-generated-pkg`,
            private: true
        });
        const relativeDependencies = exports.toDependencies(rootDir, packageName, installDir, installed);
        yield yarn_1.install(installDir, relativeDependencies);
        return installDir;
    });
}
exports.toDependencies = (rootDir, packageName, installDir, installed) => {
    const relativeDependencies = installed.map(p => {
        logger.silly('[installPieSubPackage] p: ', p);
        const installPath = path_1.join(rootDir, 'node_modules', p.rootModuleId, packageName);
        const rp = path_1.relative(installDir, installPath);
        logger.silly('installPath: ', installPath, 'intallDir:', installDir, 'relative: ', rp);
        return { moduleId: p.rootModuleId, path: rp };
    });
    return relativeDependencies.map(r => `file:${r.path}`);
};
//# sourceMappingURL=index.js.map