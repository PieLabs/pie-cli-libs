import { PieController, Input, PieConfigure, PiePackageConfig, PostInstall, Element } from './types';
export declare const PASSTHROUGH = "pie-controller/lib/passthrough";
export declare function controller(pieDef: PiePackageConfig, rootDir: string, yarn: any, input: Input, rootPkgPath: string, passthrough?: string): Promise<PieController | undefined>;
export declare function configure(pieDef: PiePackageConfig, rootDir: string, yarn: any, input: Input, rootPkgPath: string): Promise<PieConfigure | undefined>;
export declare function element(pieDef: PiePackageConfig, rootDir: string, yarn: any, input: Input, rootPkgPath: string, result: PostInstall): Promise<Element>;
