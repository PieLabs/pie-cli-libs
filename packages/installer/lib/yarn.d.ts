export declare function install(cwd: string, keys: string[]): Promise<{}>;
export declare function removeKeysThatAreInPackage(keys: string[], pkg: {
    dependencies: {
        [d: string]: string;
    };
}): string[];
export declare type IdAndTarget = {
    id: string;
    target: string;
};
export declare const idAndTarget: (k: string) => IdAndTarget;
