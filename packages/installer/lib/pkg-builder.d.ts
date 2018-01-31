import { PieController, Input, PieConfigure, PiePackageConfig } from './types';
export declare function controller(pieDef: PiePackageConfig, rootDir: string, yarn: any, input: Input, rootPkgPath: string): Promise<PieController | undefined>;
export declare function configure(pieDef: PiePackageConfig, rootDir: string, yarn: any, input: Input, rootPkgPath: string): Promise<PieConfigure | undefined>;
