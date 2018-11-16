/// <reference path="./SampleResourceSpecs.ts" />
/// <reference path="./SampleProcessSpecs.ts" />

/// <reference path="./ResourceManager.ts" />
/// <reference path="./ProcessManager.ts" />
/// <reference path="./ControlPanel.ts" />

class Game {

    private resource_specs: ResourceSpec[];
    private process_specs: ProcessSpec[];
    private resource_manager: ResourceManager;
    private process_manager: ProcessManager;
    private control_panel: ControlPanel;

    constructor() {
    }

    public Initialise(): void {
        console.log('Game initialising');

        this.resource_specs = SampleResourceSpecs.SPECS;
        this.process_specs = SampleProcessSpecs.SPECS;

        this.resource_manager = new ResourceManager(this.resource_specs, this.process_specs);
        $('body').append(this.resource_manager.GetUI());

        this.process_manager = new ProcessManager(this.resource_specs, this.process_specs);
        $('body').append(this.process_manager.GetUI());

        this.control_panel = new ControlPanel(this);
        $('body').append(this.control_panel.GetUI());
    }

    private step = 0;
    public Step(step_n: number): void {
        console.log('Game step ' + step_n);

        

        for (var i = 0; i < step_n; ++i) {
            ++this.step;

            // Run each process
            this.process_specs.forEach(process_spec => {
                var inputs = {};
                process_spec.inputs.forEach(input => {
                    inputs[input] = this.resource_manager.Step_Release(input, process_spec.name);
                });

                let outputs = process_spec.compute(inputs);

                Object.keys(outputs).forEach(output => {
                    this.resource_manager.Step_Produce(output, outputs[output]);
                });
            });
            
            this.resource_manager.Step_Regenerate();

            this.resource_manager.Step_RecordHistory('' + this.step);
        }

        this.resource_manager.Step_RefreshUI();
    }
}





let game: Game = new Game();
game.Initialise();

