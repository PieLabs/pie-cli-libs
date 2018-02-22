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
const utils_1 = require("./utils");
const path_1 = require("path");
const invariant = require("invariant");
const fs_extra_1 = require("fs-extra");
const log_factory_1 = require("log-factory");
const logger = log_factory_1.buildLogger();
exports.PASSTHROUGH = 'pie-controller/lib/passthrough';
const findDir = (dir, yarn, name) => __awaiter(this, void 0, void 0, function* () {
    logger.silly('[findDir] dir: ', dir, 'name: ', name);
    const key = Object.keys(yarn).find(pattern => pattern.startsWith(`${name}@`));
    logger.silly('[findDir] key: ', key);
    if (key) {
        const path = key.replace(`${name}@`, '').replace('file:', '');
        const resolved = path_1.resolve(dir, path);
        logger.silly('path: ', path, 'resolved: ', resolved);
        const exists = yield fs_extra_1.pathExists(resolved);
        if (exists) {
            return resolved;
        }
    }
});
function controller(pieDef, rootDir, yarn, input, rootPkgPath, passthrough = exports.PASSTHROUGH) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `${input.element}-controller`;
        const controllerPkg = yield utils_1.loadPkg(path_1.join(rootPkgPath, 'controller'));
        if (!controllerPkg && !pieDef.controller) {
            return {
                dir: undefined,
                isChild: false,
                isLocalPkg: false,
                key,
                moduleId: passthrough
            };
        }
        logger.silly('controllerPkg: ', controllerPkg);
        if (controllerPkg) {
            invariant(controllerPkg.name, 'The controller package must have a name defined');
            return {
                dir: undefined,
                isChild: true,
                isLocalPkg: false,
                key,
                moduleId: controllerPkg.name,
            };
        }
        else {
            const relativeDir = yield findDir(rootDir, yarn, pieDef.controller);
            return {
                dir: relativeDir,
                isChild: false,
                isLocalPkg: !!relativeDir,
                key,
                moduleId: pieDef.controller
            };
        }
    });
}
exports.controller = controller;
function configure(pieDef, rootDir, yarn, input, rootPkgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const configurePkg = yield utils_1.loadPkg(path_1.join(rootPkgPath, 'configure'));
        if (!configurePkg && !pieDef.configure) {
            return undefined;
        }
        logger.silly('configurePkg: ', configurePkg);
        const tag = `${input.element}-configure`;
        if (configurePkg) {
            invariant(configurePkg.name, 'The configure package must have a name defined');
            return {
                dir: undefined,
                isChild: true,
                isLocalPkg: false,
                moduleId: configurePkg.name,
                tag
            };
        }
        else {
            const relativeDir = yield findDir(rootDir, yarn, pieDef.configure);
            return {
                dir: relativeDir,
                isChild: false,
                isLocalPkg: !!relativeDir,
                moduleId: pieDef.configure,
                tag
            };
        }
    });
}
exports.configure = configure;
function element(pieDef, rootDir, yarn, input, rootPkgPath, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = yield findDir(rootDir, yarn, pieDef.element);
        return {
            dir,
            isLocalPkg: !!dir,
            isRootPkg: !pieDef.element,
            moduleId: pieDef.element ? pieDef.element : result.moduleId,
            tag: input.element,
        };
    });
}
exports.element = element;
//# sourceMappingURL=pkg-builder.js.map