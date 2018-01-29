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
function yarnInstall(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnCmd = yield findYarnCmd();
        return new Promise((resolve, reject) => {
            spawn(yarnCmd, ['install'], { cwd, stdio: 'inherit' })
                .on('error', reject)
                .on('close', (code, err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            }));
        });
    });
}
function yarnAdd(cwd, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnCmd = yield findYarnCmd();
        if (!keys || keys.length === 0) {
            return Promise.resolve();
        }
        else {
            const args = ['add', ...keys];
            logger.silly('args: ', args);
            return new Promise((resolve, reject) => {
                spawn(yarnCmd, args, { cwd, stdio: 'inherit' })
                    .on('error', reject)
                    .on('close', (code, err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
    });
}
function install(cwd, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnCmd = yield findYarnCmd();
        logger.info('using yarn cmd: ', yarnCmd);
        logger.info('cwd: ', cwd);
        const pkg = yield fs_extra_1.readJson(path_1.join(cwd, 'package.json'));
        const outstandingKeys = removeKeysThatAreInPackage(keys, pkg);
        yield yarnAdd(cwd, outstandingKeys);
        yield yarnInstall(cwd);
        const file = yield fs_extra_1.readFile(path_1.join(cwd, 'yarn.lock'), 'utf8');
        const json = lockfile.parse(file);
        return json.object;
    });
}
exports.install = install;
function removeKeysThatAreInPackage(keys, pkg) {
    return keys.filter(k => {
        const defined = exports.inDependencies(pkg.dependencies, k);
        return !defined;
    });
}
exports.removeKeysThatAreInPackage = removeKeysThatAreInPackage;
exports.asId = (raw) => {
    const lastIndexOf = raw.lastIndexOf('@');
    if (lastIndexOf > 0) {
        return raw.substring(0, lastIndexOf);
    }
    else {
        return raw;
    }
};
exports.inDependencies = (dependencies, input) => {
    logger.silly('[inDependencies] dependencies: ', JSON.stringify(dependencies), 'input: ', input);
    if (!dependencies) {
        return false;
    }
    const depKeys = Object.keys(dependencies);
    const match = depKeys.find(dk => {
        const inputToCheck = exports.asId(input);
        const value = dependencies[dk];
        return value === inputToCheck || dk === inputToCheck;
    });
    logger.silly('match: ', match);
    return match !== undefined;
};
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