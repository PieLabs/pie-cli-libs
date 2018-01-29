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
const semver = require("semver");
const yarn_1 = require("./yarn");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const log_factory_1 = require("log-factory");
var PackageType;
(function (PackageType) {
    PackageType["FILE"] = "file";
    PackageType["PACKAGE"] = "package";
})(PackageType = exports.PackageType || (exports.PackageType = {}));
const logger = log_factory_1.buildLogger();
class RootInstaller {
    constructor(cwd, reporter) {
        this.cwd = cwd;
        this.reporter = reporter;
        if (!fs_extra_1.existsSync(cwd)) {
            throw new Error(`cwd does not exist: ${cwd}`);
        }
        this.installationDir = path_1.join(cwd, '.pie');
        fs_extra_1.ensureDirSync(this.installationDir);
    }
    install(elements, models) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.silly('[install]', elements);
            const inputs = _.map(elements, (value, element) => ({ element, value }));
            const requests = yield createInstallRequests(this.cwd, inputs, models);
            const mapped = requests.map(r => {
                if (r.local) {
                    return Object.assign({}, r, { value: `../${r.value}` });
                }
                else {
                    return r;
                }
            });
            const packages = mapped.filter(r => r.type === 'package');
            logger.debug('writing package.json..');
            yield writePackageJson(this.installationDir);
            logger.debug('writing package.json..done');
            const installationResult = yield yarn_1.install(this.installationDir, packages.map(r => r.value));
            const out = _.zipWith(inputs, mapped, (input, preInstall) => __awaiter(this, void 0, void 0, function* () {
                const postInstall = findInstallationResult(preInstall.local, preInstall.value, installationResult);
                return {
                    element: input.element,
                    input,
                    postInstall,
                    preInstall,
                    pie: yield addPieInfo(this.installationDir, postInstall)
                };
            }));
            logger.silly('out', out);
            return Promise.all(out)
                .then(elements => ({ dir: this.installationDir, elements }));
        });
    }
}
exports.default = RootInstaller;
function addPieInfo(dir, postInstall) {
    return __awaiter(this, void 0, void 0, function* () {
        if (postInstall) {
            const installedPath = path_1.join(dir, 'node_modules', postInstall.moduleId);
            const hasController = (yield fs_extra_1.pathExists(path_1.join(installedPath, 'controller'))) &&
                (yield fs_extra_1.pathExists(path_1.join(installedPath, 'controller', 'package.json')));
            if (hasController) {
                const hasConfigurePackage = (yield fs_extra_1.pathExists(path_1.join(installedPath, 'configure'))) &&
                    (yield fs_extra_1.pathExists(path_1.join(installedPath, 'configure', 'package.json')));
                return { hasConfigurePackage };
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    });
}
exports.addPieInfo = addPieInfo;
function findInstallationResult(local, path, installationResult) {
    const findKey = (k) => {
        if (local) {
            return k.endsWith(`@${path}`);
        }
        else {
            return path === k;
        }
    };
    const k = Object.keys(installationResult).find(findKey);
    const moduleId = k.replace(`@${path}`, '');
    return Object.assign({}, installationResult[k], { moduleId });
}
exports.findInstallationResult = findInstallationResult;
function writePackageJson(dir, data = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = Object.assign({ name: 'x', description: 'auto generated package.json', private: true, version: '0.0.1' }, data);
        return yield fs_extra_1.writeJson(path_1.join(dir, 'package.json'), info);
    });
}
exports.writePackageJson = writePackageJson;
function readPackage(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgPath = path_1.join(dir, 'package.json');
        if (fs_extra_1.pathExists(pkgPath)) {
            const raw = yield fs_extra_1.readJson(pkgPath);
            return {
                name: raw.name,
                version: raw.version
            };
        }
    });
}
exports.readPackage = readPackage;
function createInstallRequests(cwd, elements, models) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapped = elements.map(({ element, value }) => __awaiter(this, void 0, void 0, function* () {
            const resolvedPath = path_1.resolve(cwd, value);
            logger.silly('resolvedPath: ', resolvedPath);
            const e = yield fs_extra_1.pathExists(resolvedPath);
            logger.silly('path exists: ', e);
            if (e) {
                const statInfo = yield fs_extra_1.stat(resolvedPath);
                const hasModel = _.some(models, m => m.element === element);
                return {
                    element,
                    hasModel,
                    local: true,
                    type: statInfo.isFile() ? PackageType.FILE : PackageType.PACKAGE,
                    value
                };
            }
            else {
                const v = semver.validRange(value) ? `${element}@${value}` : value;
                return {
                    element,
                    hasModel: _.some(models, m => m.element === element),
                    local: false,
                    type: PackageType.PACKAGE,
                    value: v
                };
            }
        }));
        return Promise.all(mapped);
    });
}
exports.createInstallRequests = createInstallRequests;
//# sourceMappingURL=installer.js.map