declare module 'nanobench'{
    interface B {
        start(): void
        end(): void
    }
    function nanobench(name: string, run: (b:B)=> void): void
    export = nanobench
}
