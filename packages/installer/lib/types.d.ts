export declare enum PackageType {
    FILE = "file",
    PACKAGE = "package",
}
export declare type PiePackageConfig = {
    element?: string;
    controller?: string;
    configure?: string;
};
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
export interface Element {
    tag: string;
    moduleId: string;
    isRootPkg: boolean;
    isLocalPkg: boolean;
    dir?: string;
}
export interface PieController {
    key: string;
    moduleId: string;
    isChild: boolean;
    isLocalPkg: boolean;
    dir?: string;
}
export interface PieConfigure {
    tag: string;
    moduleId: string;
    isChild: boolean;
    isLocalPkg: boolean;
    dir: string;
}
export interface Pkg {
    input: Input;
    dir: string;
    isLocal: boolean;
    type: PackageType;
    rootModuleId: string;
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
export declare type PackageJson = {
    name: string;
    version: string;
    dependencies?: {
        [key: string]: string;
    };
};
