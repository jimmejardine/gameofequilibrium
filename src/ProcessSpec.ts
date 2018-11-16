interface IProcess {
    name: string;
    inputs: string[];
    outputs: string[];
    compute: (ins: any) => any;
}