import { ElementMap, Model, InstalledElement, PreInstallRequest, PostInstall, PieInfo, Input } from './installer';
import { Reporter } from './reporter';
export { InstalledElement, PreInstallRequest, PostInstall, Input, PieInfo, Reporter };
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<InstalledElement[]>;
