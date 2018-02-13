import { ElementMap, Model, PostInstall, Input, PackageType, Dirs, Pkg } from './installer';
import { Reporter } from './reporter';
export { Dirs, PostInstall, Input, Reporter, PackageType, Pkg };
export declare type InstallResult = {
    dirs: Dirs;
    pkgs: Pkg[];
};
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<{
    dirs: Dirs;
    pkgs: Pkg[];
}>;
