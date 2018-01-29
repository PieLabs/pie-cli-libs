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
const _ = require("lodash");
const element_installer_1 = require("./element-installer");
const path_1 = require("path");
const code_gen_1 = require("../code-gen");
const npm_1 = require("../npm");
const common_1 = require("./common");
exports.PieTarget = common_1.PieTarget;
const log_factory_1 = require("log-factory");
const fs_extra_1 = require("fs-extra");
const report_1 = require("../cli/report");
const logger = log_factory_1.buildLogger();
exports.controllerTargets = (buildInfo) => toTargets('controller', buildInfo);
exports.configureDeclarations = (buildInfo) => {
    return buildInfo.filter(bi => bi.configure).map(bi => {
        return new code_gen_1.ElementDeclaration(`${bi.element}-configure`, bi.configure.moduleId);
    });
};
exports.pieToConfigureMap = (buildInfo) => {
    if (!buildInfo) {
        return {};
    }
    return buildInfo.reduce((acc, bi) => {
        acc[bi.element] = `${bi.element}-configure`;
        return acc;
    }, {});
};
exports.toDeclarations = (buildInfo) => {
    return buildInfo.map(bi => new code_gen_1.ElementDeclaration(bi.main.tag, bi.main.moduleId));
};
const toTargets = (key, buildInfo) => {
    return _(buildInfo)
        .filter(bi => bi[key])
        .map(bi => ({ pie: bi.element, target: bi[key].moduleId }))
        .value();
};
const toPieBuildInfo = (rootDir, ie) => {
    const isPackage = ie.preInstall.type === element_installer_1.PackageType.PACKAGE;
    logger.silly('[toPieBuildInfo] element: ', ie.element, JSON.stringify(ie, null, '  '));
    const out = {
        element: ie.element,
        isLocal: ie.preInstall.local,
        isPackage,
        main: {
            dir: isPackage && ie.npmInstall ? ie.npmInstall.dir : rootDir,
            moduleId: isPackage && ie.npmInstall ? ie.npmInstall.moduleId : ie.preInstall.value,
            tag: ie.element
        },
        src: ie.input.value,
    };
    if (ie.pie && ie.pie.controller) {
        out.controller = {
            dir: ie.pie.controller.dir,
            moduleId: ie.pie.controller.moduleId,
        };
    }
    if (ie.preInstall.hasModel && (!ie.pie || !ie.pie.controller)) {
        out.controller = {
            dir: '?',
            moduleId: 'pie-controller/lib/passthrough'
        };
    }
    if (ie.pie && ie.pie.configure) {
        out.configure = {
            dir: ie.pie.configure.dir,
            moduleId: ie.pie.configure.moduleId,
            tag: `${ie.element}-configure`,
        };
    }
    logger.silly('[toPieBuildInfo] out: ', ie.element, JSON.stringify(out, null, '  '));
    return out;
};
exports.findModuleId = (parentId, rd, deps) => {
    logger.silly('[findModuleId]:', parentId);
    const path = _.find(rd, d => d.moduleId === parentId).path;
    const zipped = _.map(deps, (o, moduleId) => ({ data: o, moduleId }));
    const out = _.find(zipped, ({ data, moduleId }) => {
        const eql = data.from === path;
        logger.silly('[findModuleId]:', parentId, 'data:', JSON.stringify(data));
        logger.silly('[findModuleId]:', parentId, 'path:', path, 'data:', data.from, 'eql:', eql);
        return eql;
    });
    logger.silly('[findModuleId]: out: ', out);
    return out.moduleId;
};
class Install {
    constructor(rootDir, config) {
        this.rootDir = rootDir;
        this.config = config;
        this.elementInstaller = new element_installer_1.default(this.rootDir);
        this.dir = this.elementInstaller.installationDir;
    }
    get dirs() {
        return {
            configure: path_1.resolve(path_1.join(this.dir, '.configure')),
            controllers: path_1.resolve(path_1.join(this.dir, '.controllers')),
            root: this.dir
        };
    }
    install(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield report_1.default.promise('installing root package', this.elementInstaller.install(this.config.elements, this.config.models));
            logger.info('[install] result:', result);
            const controllerResult = yield report_1.default.promise('installing controllers', this.installControllers(result));
            if (controllerResult instanceof Error) {
                throw controllerResult;
            }
            const configureResult = yield report_1.default.promise('installing configure', this.installConfigure(result));
            if (configureResult instanceof Error) {
                throw configureResult;
            }
            logger.silly('configureResult: ', configureResult, configureResult instanceof Error, typeof configureResult);
            logger.silly('updated result: ', JSON.stringify(result, null, ' '));
            return _.map(result, r => toPieBuildInfo(this.dirs.root, r));
        });
    }
    installConfigure(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const pies = result.filter(r => r.pie !== undefined && r.pie.hasConfigurePackage);
            return this.installPieSubPackage(pies, 'configure', this.dirs.configure);
        });
    }
    installControllers(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const pies = result.filter(r => r.pie !== undefined);
            return this.installPieSubPackage(pies, 'controller', this.dirs.controllers);
        });
    }
    installPieSubPackage(pies, packageName, installDir) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.silly('[installPieSubPackage] pies: ', pies);
            if (!pies || pies.length === 0) {
                return;
            }
            const relativeDependencies = pies.map(p => {
                if (!p.npmInstall) {
                    throw new Error('we expect an npm install object for a pie');
                }
                const postInstall = p.npmInstall;
                const installPath = path_1.join(postInstall.dir, 'node_modules', postInstall.moduleId, packageName);
                return { moduleId: postInstall.moduleId, path: path_1.relative(installDir, installPath) };
            });
            yield fs_extra_1.ensureDir(installDir);
            const npm = new npm_1.default(installDir);
            const installResult = yield npm.installIfNeeded(relativeDependencies.map(r => r.path));
            logger.silly('[installPieSubPackage] installResult', installResult);
            pies.forEach(p => {
                if (p.pie) {
                    p.pie[packageName] = {
                        dir: installDir,
                        moduleId: exports.findModuleId(p.npmInstall.moduleId, relativeDependencies, installResult)
                    };
                }
            });
            logger.silly('[installPieSubPackage]: ', JSON.stringify(installResult, null, '  '));
            return installResult;
        });
    }
}
exports.default = Install;
//# sourceMappingURL=old-installer.js.map