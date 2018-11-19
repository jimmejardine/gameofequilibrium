interface ProcessSpec {
    name: string;
    img: string;

    output: string;
    
    employs: { [ resource: string ]: number };
    consumes: { [ resource: string ]: number };
}
