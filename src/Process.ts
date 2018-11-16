interface IProcess {
    name: string;
    inputs: string[];
    outputs: string[];
    compute: (X: any) => any;
}