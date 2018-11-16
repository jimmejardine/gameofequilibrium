/// <reference path="./ProcessSpec.ts" />

class  Process {
    constructor(private process_spec: ProcessSpec) {
    }

    public GetUI() {
        let panel = $('<div class="process" style="background-image:url(' + this.process_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.process_spec.name + '</h1></div>'));

        return panel;
    }

    public Step_RefreshUI(): void {
    }
}