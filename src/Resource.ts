class Resource {
    private static HISTORY = 10*360;

    private quantity: number;
    private quantity_history: number[];
    private quantity_history_label: string[];

    private allocations: any;

    private chart_quantity: Chart;


    constructor(private resource_spec: ResourceSpec, process_specs: ProcessSpec[]) {
        this.quantity = 0;
        this.quantity_history = [];
        this.quantity_history_label = [];

        this.allocations = {};
        process_specs.forEach(process_spec => {
            process_spec.inputs.forEach(input => {
                if (input == this.resource_spec.name) {
                    this.allocations[process_spec.name] = 0;
                }
            })
        });

    }

    public GetUI() {
        let panel = $('<div class="resource" style="background-image:url(' + this.resource_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.resource_spec.name + '</h1></div>'));

        let control_panel = $('<div class="controls"></div>');
        panel.append(control_panel);

        {
            let canvas_chart_quantity = <HTMLCanvasElement>($('<canvas />')[0]);

            var ctx = canvas_chart_quantity.getContext('2d');

            var config = {
                type: 'line',
                data: {
                    labels: this.quantity_history_label,
                    datasets: [{
                        pointRadius: 1,
                        data: this.quantity_history,
                        lineTension: 0,
                    }]
                },
                options: {
                    legend: {
                        display: false
                    },
                    tooltips: {						
						enabled: false
					},
                    responsive: true,
                    elements: {
						point: {
							//pointStyle: 'none',
						}
					},
                    scales: {
                        yAxes: [{
                            ticks: {
                                min: 0,
                            }
                        }]
                    }
                }
            };

            this.chart_quantity = new Chart(ctx, config);
            control_panel.append(canvas_chart_quantity);
        }


        // And the allocations
        {
            var slider_elements = {};

            // Create the sliders
            Object.keys(this.allocations).forEach(key => {
                let slider_element = $('<input type="range" min="0" max="100" value="0" />');
                slider_elements[key] = slider_element;
                
                control_panel.append(slider_element);
                control_panel.append(' : ');
                control_panel.append(key);
                control_panel.append('<br />');
            });

            // Tie the sliders
            var processing_change = false;
            Object.keys(this.allocations).forEach(key => {
                let slider_element = slider_elements[key];
                slider_element.change(() => {
                    if (processing_change) return;
                    processing_change = true;

                    let key_value = parseInt(slider_element.val());
                    this.allocations[key] = key_value;

                    // Sum up the weights
                    let sum = 0;
                    Object.keys(this.allocations).forEach(key_other => {
                        sum += this.allocations[key_other];
                    });

                    // Scale if necessary
                    if (100 < sum) {
                        let scale = (100 - key_value) / (sum - key_value);
                        Object.keys(this.allocations).forEach(key_other => {
                            if (key != key_other) {
                                let key_other_value = Math.floor(scale * this.allocations[key_other]);
                                this.allocations[key_other] = key_other_value;
                                slider_elements[key_other].val(key_other_value);
                            }
                        });
                    }

                    processing_change = false;
                });
            });
        }

        return panel;
    }

    public Dump(): void {
        console.log(this.resource_spec.name + '\t' + this.quantity);
    }



    public Step_Release(process: string): number {
        let allocation = this.allocations[process] || 0;
        
        let release_amount = this.quantity * allocation / 100 / 360;
        if (this.resource_spec.verbose) console.log(this.resource_spec.name + ' : ' + ' release ' + release_amount);
        this.quantity -= release_amount;
        
        return release_amount;
    }

    public Step_Produce(n: number) {
        this.quantity += n;
    }

    public Step_Regenerate(): void {        
        var decay_amount = this.quantity * this.resource_spec.decay / 360;
        if (this.resource_spec.verbose) console.log(this.resource_spec.name + ' : ' + ' decay ' + decay_amount);
        this.quantity -= decay_amount;

        if (this.resource_spec.baseline > this.quantity) {
            var baseline_amount = (this.resource_spec.baseline - this.quantity) / 360;
            if (this.resource_spec.verbose) console.log(this.resource_spec.name + ' : ' + ' baseline ' + baseline_amount);
            this.quantity += baseline_amount;
        }
    }

    public Step_RecordHistory(i: string) {
        this.quantity_history.push(this.quantity);
        this.quantity_history_label.push(i);

        while (this.quantity_history.length > Resource.HISTORY) {
            this.quantity_history.splice(0, 1);
        }
        while (this.quantity_history_label.length > Resource.HISTORY) {
            this.quantity_history_label.splice(0, 1);
        }
    }

    public Step_RefreshUI() {
        this.chart_quantity.update();
    }

    
}