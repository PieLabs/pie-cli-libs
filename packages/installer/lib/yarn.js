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
const findUp = require("find-up");
const path_1 = require("path");
const log_factory_1 = require("log-factory");
const spawn = require("cross-spawn");
const lockfile = require("@yarnpkg/lockfile");
const fs_extra_1 = require("fs-extra");
const logger = log_factory_1.buildLogger();
const findYarnCmd = () => {
    return findUp('node_modules', {
        cwd: __dirname
    })
        .then(np => {
        return path_1.join(np, '.bin', 'yarn');
    });
};
function install(cwd, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnCmd = yield findYarnCmd();
        logger.info('using yarn cmd: ', yarnCmd);
        logger.info('cwd: ', cwd);
        const notInPkg = (deps) => (key) => {
            const keyList = Object.keys(deps);
            keyList.find(k => {
                const value = deps[k];
                if (key === value) {
                    return true;
                }
                else {
                    const lastAtIndex = key.lastIndexOf('@');
                    if (lastAtIndex > 0) {
                        const v = k.substring(lastAtIndex);
                    }
                }
            });
            if (deps) {
            }
            return true;
        };
        const pkg = yield fs_extra_1.readJson(path_1.join(cwd, 'package.json'));
        const outstandingKeys = keys.filter(k => notInPkg(pkg.dependencies));
        const o = yield yarnInstall();
        if (outstandingKeys.length > 0) {
            const args = ['add', ...outstandingKeys];
            logger.silly('args: ', args);
            return new Promise((resolve, reject) => {
                spawn(yarnCmd, args, { cwd, stdio: 'inherit' })
                    .on('error', reject)
                    .on('close', (code, err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                    }
                    else {
                        logger.info('success code: ', code, cwd);
                        let file = yield fs_extra_1.readFile(path_1.join(cwd, 'yarn.lock'), 'utf8');
                        let json = lockfile.parse(file);
                        resolve(json.object);
                    }
                }));
            });
        }
        else {
            return {};
        }
    });
}
exports.install = install;
function removeKeysThatAreInPackage(keys, pkg) {
    return [];
}
exports.removeKeysThatAreInPackage = removeKeysThatAreInPackage;
exports.idAndTarget = (k) => {
    const index = k.lastIndexOf('@');
    if (index === -1) {
        throw new Error('A yarn.lock identifer MUST contain @');
    }
    const id = k.substring(0, index);
    const target = k.substr(index + 1);
    return { id, target };
};
//# sourceMappingURL=yarn.js.map