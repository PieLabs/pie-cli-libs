import { Element, Pkg, Input, PackageType, Dirs, ElementMap, Model, PieConfigure, PieController } from './types';
import { Reporter } from './reporter';
export { Element, Dirs, Input, Reporter, PackageType, Pkg, PieConfigure, PieController };
export declare type InstallResult = {
    dirs: Dirs;
    pkgs: Pkg[];
};
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<{
    dirs: Dirs;
    pkgs: Pkg[];
}>;
