import { ElementMap, Model, InstalledElement, PreInstallRequest, PostInstall, PieInfo, Input, PackageType, Dirs, Pkg } from './installer';
import { Reporter } from './reporter';
export { Dirs, InstalledElement, PreInstallRequest, PostInstall, Input, PieInfo, Reporter, PackageType };
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<{
    dirs: Dirs;
    pkgs: Pkg[];
}>;
