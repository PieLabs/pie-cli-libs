<<<<<<< Updated upstream
import { ElementMap, Model, InstalledElement } from './installer';
import { Reporter } from './reporter';
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<InstalledElement[]>;
=======
import { ElementMap, Model, InstalledElement, PreInstallRequest, PostInstall, PieInfo, Input, PackageType, Dirs } from './installer';
import { Reporter } from './reporter';
export { Dirs, InstalledElement, PreInstallRequest, PostInstall, Input, PieInfo, Reporter, PackageType };
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<{
    dirs: Dirs;
    installed: InstalledElement[];
}>;
>>>>>>> Stashed changes
