/// <reference path="./ProcessSpec.ts" />

class  Process {
    private inputs_array: string[] = [];
    
    private inputs_required_map: { [resource: string]: number } = {};
    private inputs_provided_map: { [resource: string]: number } = {};
    private output_possible_map: { [resource: string]: number } = {};
    private inputs_used_map: { [resource: string]: number } = {};
    

    constructor(private process_spec: ProcessSpec) {
        // Create the map of all the inputs
        Object.keys(this.process_spec.employs).forEach(resource => {
            this.inputs_required_map[resource] = (this.inputs_required_map[resource] || 0) + this.process_spec.employs[resource];
        });
        Object.keys(this.process_spec.consumes).forEach(resource => {
            this.inputs_required_map[resource] = (this.inputs_required_map[resource] || 0) + this.process_spec.employs[resource];
        });
        
        // Create the array of all the inputs
        Object.keys(this.inputs_required_map).forEach(resource => {
            this.inputs_array.push(resource);
        });
    }

    public GetUI() {
        let panel = $('<div class="process" style="background-image:url(' + this.process_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.process_spec.name + '</h1></div>'));

        return panel;
    }

    public Step_Process(resource_manager: ResourceManager) {
        // How much have we been provided
        this.inputs_array.forEach(resource => {
            this.inputs_provided_map[resource] = resource_manager.Step_Release(resource, this.process_spec.name);
        });

        // How many can be produced with the inputs
        this.inputs_array.forEach(resource => {
            this.output_possible_map[resource] = this.inputs_provided_map[resource] / this.inputs_required_map[resource];
        });
        var output_possible = _.min(_.values(this.output_possible_map));
        
        // How much of each input was utilised by the production
        this.inputs_array.forEach(resource => {
            this.inputs_used_map[resource] = output_possible * this.inputs_required_map[resource];
        });        

        // Produce the output
        resource_manager.Step_Produce(this.process_spec.output, output_possible);

        // Replenish the employment bits
        Object.keys(this.process_spec.employs).forEach(resource => {
            var amount_consumed = 0;
            if (this.process_spec.consumes[resource]) {
                amount_consumed = output_possible * this.process_spec.consumes[resource];
            }

            var amount_returned = this.inputs_provided_map[resource] - amount_consumed;            
            resource_manager.Step_Produce(resource, amount_returned);
        });
        

    }
    public Step_RefreshUI(): void {
    }
}