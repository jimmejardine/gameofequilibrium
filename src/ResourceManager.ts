/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Resource.ts" />

class ResourceManager {
    private resources_array: Resource[];
    private resources_map: { [key: string]: Resource };

    constructor(private resource_specs: ResourceSpec[], private process_specs: ProcessSpec[]) {
        this.resources_array = [];
        this.resources_map = {};
        this.resource_specs.forEach(resource_spec => {
            let resource = new Resource(resource_spec, process_specs);
            this.resources_array.push(resource);
            this.resources_map[resource_spec.name] = resource;
        });
    }

    public GetUI() {
        let panel = $('<div id="resource-manager"></div>');
        this.resources_array.forEach(resource => {
            panel.append(resource.GetUI());
        });
        return panel;
    }

    public Dump() {
        this.resources_array.forEach(resource => {
            resource.Dump();
        });
    }

    public Step_Release(resource: string, process: string): number {
        //console.log('Step_Release ' + resource + ' : ' + process);
        return this.resources_map[resource].Step_Release(process);
    }

    public Step_Produce(resource: string, n: number) {
        //console.log('Step_Produce ' + resource + ' : ' + n);
        return this.resources_map[resource].Step_Produce(n);
    }


    public Step_Regenerate(): void {
        this.resources_array.forEach(resource => {
            resource.Step_Regenerate();
        });
    }

    public Step_RecordHistory(): void {
        this.resources_array.forEach(resource => {
            resource.Step_RecordHistory();
        });
    }

    public Step_RefreshUI(): void {
        this.resources_array.forEach(resource => {
            resource.Step_RefreshUI();
        });
    }
}