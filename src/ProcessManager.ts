/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Process.ts" />

class ProcessManager {    
    private processes_array: Process[];
    private processes_map: { [key: string]: Process };

    constructor(private resource_specs: ResourceSpec[], private process_specs: ProcessSpec[]) {
        this.processes_array = [];
        this.processes_map = {};
        this.process_specs.forEach(process_spec => {
            let process = new Process(process_spec);
            this.processes_array.push(process);
            this.processes_map[process_spec.name] = process;
        });
    }

    public GetUI() {
        let panel = $('<div id="process-manager"></div>');
        this.processes_array.forEach(process => {
            panel.append(process.GetUI());
        });
        return panel;
    }

    public Step_Process(resource_manager: ResourceManager): void {
        this.processes_array.forEach(process => {            
            process.Step_Process(resource_manager);
``        });
    }
    
    public Step_RecordHistory(): void {
        this.processes_array.forEach(process => {
            process.Step_RecordHistory();
        });
    }

    public Step_RefreshUI(): void {
        this.processes_array.forEach(process => {
            process.Step_RefreshUI();
        });
    }
}