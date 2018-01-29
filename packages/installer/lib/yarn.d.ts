export declare function install(cwd: string, keys: string[]): Promise<{}>;
export declare function removeKeysThatAreInPackage(keys: string[], pkg: {
    dependencies: {
        [d: string]: string;
    };
}): string[];
export declare const asId: (raw: string) => string;
export declare const inDependencies: (dependencies: {
    [d: string]: string;
}, input: string) => boolean;
export declare type IdAndTarget = {
    id: string;
    target: string;
};
export declare const idAndTarget: (k: string) => IdAndTarget;
