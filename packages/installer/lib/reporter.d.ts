export interface Reporter {
    promise<A>(msg: string, p: Promise<A>): Promise<A>;
}
