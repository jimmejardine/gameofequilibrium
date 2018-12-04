/// <reference path="./Tools.ts" />

/// <reference path="./ProcessSpec.ts" />

class  Process {
    private inputs_array: string[] = [];
    
    private output_produced: number = 0;
    private output_produced_history: number[] = [];

    private chart_output_quantity: Chart;

    private inputs_required_map: { [resource: string]: number } = {};
    private inputs_provided_map: { [resource: string]: number } = {};
    private output_possible_map: { [resource: string]: number } = {};
    private inputs_used_map: { [resource: string]: number } = {};

    constructor(private process_spec: ProcessSpec) {
        var self = this;

        // Create the map of all the inputs
        Object.keys(self.process_spec.employs).forEach(resource => {
            self.inputs_required_map[resource] = (self.inputs_required_map[resource] || 0) + self.process_spec.employs[resource];
        });
        Object.keys(self.process_spec.consumes).forEach(resource => {
            self.inputs_required_map[resource] = (self.inputs_required_map[resource] || 0) + self.process_spec.consumes[resource];
        });
        
        // Create the array of all the inputs
        Object.keys(self.inputs_required_map).forEach(resource => {
            self.inputs_array.push(resource);
        });
    }

    public GetUI() {
        let panel = $('<div class="process" style="background-image:url(' + this.process_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.process_spec.name + '</h1></div>'));

        let control_panel = $('<div class="controls"></div>');
        panel.append(control_panel);

        {
            let canvas_chart_output_quantity = <HTMLCanvasElement>($('<canvas />')[0]);

            var ctx = canvas_chart_output_quantity.getContext('2d');

            var config = {
                type: 'line',
                data: {
                    labels: Tools.CHART_HISTORY_LABELS_SHORT,
                    datasets: [{
                        pointRadius: 1,
                        data: this.output_produced_history,
                        lineTension: 0,
                    }]
                },
                options: Tools.Get_CHART_OPTIONS(
                    {
                        display: false,
                    },
                ),

            };

            this.chart_output_quantity = new Chart(ctx, config);
            control_panel.append(canvas_chart_output_quantity);
        }


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
        this.output_produced = _.min(_.values(this.output_possible_map));
        
        // How much of each input was utilised by the production
        this.inputs_array.forEach(resource => {
            this.inputs_used_map[resource] = this.output_produced * this.inputs_required_map[resource];
        });

        // Produce the output
        resource_manager.Step_Produce(this.process_spec.output, this.output_produced);

        // Replenish the employment bits
        Object.keys(this.process_spec.employs).forEach(resource => {
            var amount_consumed = 0;
            if (this.process_spec.consumes[resource]) {
                amount_consumed = this.output_produced * this.process_spec.consumes[resource];
            }

            var amount_returned = this.inputs_provided_map[resource] - amount_consumed;            
            resource_manager.Step_Produce(resource, amount_returned);
        });
    }

    public Step_RecordHistory() {
        Tools.RecordQuantityHistory_SHORT(this.output_produced_history,this.output_produced);
    }

    public Step_RefreshUI(): void {
        this.chart_output_quantity.update();
    }
}