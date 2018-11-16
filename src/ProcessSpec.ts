interface ProcessSpec {
    name: string;
    img: string;
    
    inputs: string[];
    outputs: string[];
    
    
    compute: (ins: any) => any;
}