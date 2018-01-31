import { Pkg, Input, PackageType, Dirs, ElementMap, Model } from './types';
import { Reporter } from './reporter';
export { Dirs, Input, Reporter, PackageType, Pkg };
export declare type InstallResult = {
    dirs: Dirs;
    pkgs: Pkg[];
};
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<{
    dirs: Dirs;
    pkgs: Pkg[];
}>;
