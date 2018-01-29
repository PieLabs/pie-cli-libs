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
export interface InstalledElement {
    element: string;
    input: Input;
    preInstall: PreInstallRequest;
    postInstall?: PostInstall;
    pie?: PieInfo;
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
};
export declare type Models = Model[];
export default class RootInstaller {
    private cwd;
    private reporter;
    readonly installationDir: string;
    constructor(cwd: string, reporter: Reporter);
    install(elements: ElementMap, models: Model[]): Promise<{
        dir: string;
        elements: InstalledElement[];
    }>;
}
export declare function addPieInfo(dir: string, postInstall: PostInstall): Promise<PieInfo | undefined>;
export declare function findInstallationResult(local: boolean, path: string, installationResult: {
    [key: string]: PostInstall;
}): PostInstall;
export declare function writePackageJson(dir: string, data?: {}, opts?: {
    force: boolean;
}): Promise<void>;
export declare function readPackage(dir: string): Promise<Package>;
export declare function createInstallRequests(cwd: string, elements: Input[], models: Model[]): Promise<PreInstallRequest[]>;
