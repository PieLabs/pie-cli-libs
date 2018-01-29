import { ElementMap, Model, InstalledElement } from './installer';
import { Reporter } from './reporter';
export declare function install(dir: string, elements: ElementMap, models: Model[], reporter: Reporter): Promise<InstalledElement[]>;
