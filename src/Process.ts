/// <reference path="./Tools.ts" />

/// <reference path="./ProcessSpec.ts" />

class  Process {
    private inputs_array: string[] = [];

    private progress: number = 1;
    
    private output_produced: number = 0;
    private output_produced_history: number[] = [];

    private output_element: any;
    private chart_output_quantity: Chart;
    private input_provided_elements: { [resource: string]: any } = {};
    private input_used_elements: { [resource: string]: any } = {};
    private resource_elements: { [resource: string]: any } = {};
    private progress_panel: any;

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
            this.inputs_required_map[resource] = (this.inputs_required_map[resource] || 0) + this.process_spec.consumes[resource];
        });
        
        // Create the array of all the inputs
        Object.keys(this.inputs_required_map).forEach(resource => {
            this.inputs_array.push(resource);
        });
    }

    public GetUI() {
        let panel = $('<div class="process" style="background-image:url(' + this.process_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.process_spec.name + '</h1></div>'));

        let control_panel = $('<div class="controls"></div>');
        panel.append(control_panel);

        // The output chart
        {
            this.output_element = $('<span></span>');
            control_panel.append(this.output_element);

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

        // The input details
        {
            let table = $('<table></table>');
            control_panel.append(table);

            this.inputs_array.forEach(resource => {
                let input_provided_element = $('<span></span>');
                let input_used_element = $('<span></span>');
                let resource_element = $('<span></span>');
                this.input_provided_elements[resource] = input_provided_element;
                this.input_used_elements[resource] = input_used_element;
                this.resource_elements[resource] = resource_element;

                resource_element.text(resource);

                let row = $('<tr></tr>');
                table.append(row);
                let c1 = $('<td></td>');
                row.append(c1);
                c1.append(input_used_element);
                let c2 = $('<td></td>');
                row.append(c2);
                c2.append(input_provided_element);
                let c3 = $('<td></td>');
                row.append(c3);
                c3.append(resource_element);
            });
        }

        {
            this.progress_panel = $('<div style=color:white;></div>');
            panel.append(this.progress_panel);
        }

        return panel;
    }

    public Step_Process(resource_manager: ResourceManager) {
        // How much have we been provided
        this.inputs_array.forEach(resource => {
            this.inputs_provided_map[resource] = resource_manager.Step_Release(resource, this.process_spec.name);
        });

        // Add to our progress
        let progress_provided = resource_manager.Step_Release('progress', this.process_spec.name);
        this.progress += progress_provided;

        // How many can be produced with the inputs
        this.inputs_array.forEach(resource => {
            this.output_possible_map[resource] = this.inputs_provided_map[resource] / this.inputs_required_map[resource];
        });
        this.output_produced = _.min(_.values(this.output_possible_map));
        
        // How much of each input was utilised by the production
        this.inputs_array.forEach(resource => {
            this.inputs_used_map[resource] = this.output_produced * this.inputs_required_map[resource];
        });

        // Replenish the employment bits
        Object.keys(this.process_spec.employs).forEach(resource => {
            var amount_consumed = 0;
            if (this.process_spec.consumes[resource]) {
                amount_consumed = this.output_produced * this.process_spec.consumes[resource];
            }

            var amount_returned = this.inputs_provided_map[resource] - amount_consumed;            
            resource_manager.Step_Produce(resource, amount_returned);
        });

        // Apply progress
        this.output_produced *= (1 + Math.log(this.progress));

        // Produce the output
        resource_manager.Step_Produce(this.process_spec.output, this.output_produced);

    }

    public Step_RecordHistory() {
        Tools.RecordQuantityHistory_SHORT(this.output_produced_history,this.output_produced);
    }

    public Step_RefreshUI(): void {
        this.output_element.text(this.output_produced.toFixed(3) + " " + this.process_spec.output);

        this.chart_output_quantity.update();

        {
            this.inputs_array.forEach(resource => {
                this.input_provided_elements[resource].text(this.inputs_provided_map[resource].toFixed(3));
                this.input_used_elements[resource].text(this.inputs_used_map[resource].toFixed(3));
                
                let resource_colour = (this.inputs_provided_map[resource] > this.inputs_used_map[resource])  ?  'green' : 'red';
                this.resource_elements[resource].css('color', resource_colour);
            });
        }

        this.progress_panel.text('Progress: ' + Math.log(this.progress).toFixed(3));
    }
}