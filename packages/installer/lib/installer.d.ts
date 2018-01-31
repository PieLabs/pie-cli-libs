import { Reporter } from './reporter';
import { Pkg, Package, ElementMap, Model, Input, PreInstallRequest, PostInstall } from './types';
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
export declare function toPkg(dir: string, input: Input, yarn: any, result: PostInstall, preInstall: PreInstallRequest): Promise<Pkg>;
export declare function findInstallationResult(local: boolean, path: string, installationResult: {
    [key: string]: PostInstall;
}): PostInstall;
export declare function writePackageJson(dir: string, data?: {}, opts?: {
    force: boolean;
}): Promise<string>;
export declare function readPackage(dir: string): Promise<Package>;
export declare function createInstallRequests(cwd: string, elements: Input[], models: Model[]): Promise<PreInstallRequest[]>;
