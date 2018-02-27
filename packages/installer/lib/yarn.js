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
const installer_1 = require("./installer");
const lodash_1 = require("lodash");
const logger = log_factory_1.buildLogger();
const findYarnCmd = () => {
    const isWindows = process.platform === 'win32';
    logger.silly('[findYarnCmd] isWindows: ', isWindows);
    const cmd = isWindows ? 'yarn.cmd' : 'yarn';
    return findUp(path_1.join('node_modules', '.bin', cmd), {
        cwd: __dirname
    })
        .then(p => {
        logger.silly('[findYarnCmd] p: ', p);
        return p;
    });
};
const sp = (cwd, args) => __awaiter(this, void 0, void 0, function* () {
    const cmd = yield findYarnCmd();
    logger.silly('cmd: ', cmd);
    return new Promise((resolve, reject) => {
        const stdio = [
            process.stdin,
            process.stdout,
            process.stderr
        ];
        spawn(cmd, args, { cwd, stdio })
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
function yarnInstall(cwd) {
    return sp(cwd, ['install']);
}
function yarnAdd(cwd, keys) {
    if (!keys || keys.length === 0) {
        return Promise.resolve();
    }
    else {
        const args = ['add', ...keys];
        logger.silly('args: ', args);
        return sp(cwd, args);
    }
}
function install(cwd, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnCmd = yield findYarnCmd();
        logger.silly('using yarn cmd: ', yarnCmd);
        logger.silly('cwd: ', cwd);
        const outstandingKeys = yield removeKeysThatAreInLockFile(keys, cwd);
        logger.silly('outstandingKeys: ', outstandingKeys);
        yield yarnAdd(cwd, outstandingKeys);
        yield yarnInstall(cwd);
        return readYarnLock(cwd)
            .catch((e) => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield installer_1.readPackage(cwd);
            if (!pkg.dependencies || lodash_1.isEmpty(pkg.dependencies)) {
                return {};
            }
            else {
                logger.error('e:', e.message);
                throw e;
            }
        }));
    });
}
exports.install = install;
function readYarnLock(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnLockPath = path_1.join(cwd, 'yarn.lock');
        const exists = yield fs_extra_1.pathExists(yarnLockPath);
        logger.silly(yarnLockPath, 'exists? ', exists);
        if (exists) {
            const file = yield fs_extra_1.readFile(yarnLockPath, 'utf8');
            const cleaned = file.replace(/\r/g, '');
            logger.info('[readYarnLock] file: ', file.substring(0, 300));
            logger.info('[readYarnLock] begin parse...');
            const parsed = lockfile.parse(cleaned);
            logger.info('[readYarnLock] parsed: ', parsed);
            logger.info('[readYarnLock] parsed.object: ', parsed.object);
            return parsed.object;
        }
        else {
            return Promise.reject(new Error(`no yarn file: ${yarnLockPath}`));
        }
    });
}
exports.readYarnLock = readYarnLock;
function removeKeysThatAreInLockFile(keys, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const yarnLock = yield readYarnLock(cwd);
            return keys.filter(k => !inYarnLock(yarnLock, k));
        }
        catch (e) {
            logger.silly('[removeKeysThatAreInLockFile] got the error return []');
            return keys;
        }
    });
}
exports.removeKeysThatAreInLockFile = removeKeysThatAreInLockFile;
function inYarnLock(yarn, key) {
    const yarnKeys = Object.keys(yarn);
    const match = yarnKeys.find(yk => {
        return yk === key || yk.startsWith(`${key}@`) || yk.endsWith(`@${key}`);
    });
    return match !== undefined;
}
exports.inYarnLock = inYarnLock;
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