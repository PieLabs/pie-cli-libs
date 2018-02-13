import { Reporter } from './reporter';
export declare enum PackageType {
    FILE = "file",
    PACKAGE = "package",
}
export declare type Dirs = {
    configure: string;
    controllers: string;
    root: string;
};
export declare type Input = {
    element: string;
    value: string;
};
export declare type PreInstallRequest = {
    element: string;
    value: string;
    local: boolean;
    type: PackageType;
    hasModel: boolean;
    package?: {
        name: string;
    };
};
export declare type PostInstall = {
    dir: string;
    moduleId: string;
    version: string;
    resolved: string;
    dependencies: {
        [key: string]: string;
    };
};
export declare type PieInfo = {
    hasConfigurePackage: boolean;
    controller?: {
        dir: string;
        moduleId: string;
    };
    configure?: {
        dir: string;
        moduleId: string;
    };
};
export interface CustomElementToModuleId {
    tag: string;
    moduleId: string;
    dir: string;
}
export interface KeyToModuleId {
    key: string;
    moduleId: string;
}
export interface Mapping {
    element: string;
    configure?: string;
    controller?: string;
}
export interface Element {
    tag: string;
    moduleId: string;
}
export interface PieController {
    key: string;
    moduleId: string;
    isInternalPkg: boolean;
}
export interface PieConfigure {
    tag: string;
    moduleId: string;
    isInternalPkg: boolean;
}
export interface Pkg {
    input: Input;
    dir: string;
    isLocal: boolean;
    type: PackageType;
    element: Element;
    controller?: PieController;
    configure?: PieConfigure;
}
export declare type ElementMap = {
    [key: string]: string;
};
export declare type Model = {
    element: string;
};
export declare type Package = {
    name: string;
    version: string;
    dependencies?: {
        [key: string]: string;
    };
};
export default class RootInstaller {
    private cwd;
    private reporter;
    readonly installationDir: string;
    constructor(cwd: string, reporter: Reporter);
    install(elements: ElementMap, models: Model[]): Promise<{
        dir: string;
        pkgs: Pkg[];
    }>;
}
export declare function loadPkg(dir: string): Promise<any | undefined>;
export declare function toPkg(dir: string, input: Input, result: PostInstall, preInstall: PreInstallRequest): Promise<Pkg>;
export declare function findInstallationResult(local: boolean, path: string, installationResult: {
    [key: string]: PostInstall;
}): PostInstall;
export declare function writePackageJson(dir: string, data?: {}, opts?: {
    force: boolean;
}): Promise<string>;
export declare function readPackage(dir: string): Promise<Package>;
export declare function createInstallRequests(cwd: string, elements: Input[], models: Model[]): Promise<PreInstallRequest[]>;
