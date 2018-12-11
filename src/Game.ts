/// <reference path="./Tools.ts" />

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

    constructor(public a_resource_specs: ResourceSpec[], public a_process_specs: ProcessSpec[]) {    
        this.resource_specs = a_resource_specs
        this.process_specs = a_process_specs;

        $('body').empty();

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

            // Bump along the history labels
            var step_label = '' + this.step;
            Tools.CHART_HISTORY_LABELS_SHORT.push(step_label);
            Tools.CHART_HISTORY_LABELS_LONG.push(step_label);
            while (Tools.CHART_HISTORY_LABELS_SHORT.length > Tools.CHART_HISTORY_LABELS_SHORT_MAX) {
                Tools.CHART_HISTORY_LABELS_SHORT.splice(0, 1);
            }
            while (Tools.CHART_HISTORY_LABELS_LONG.length > Tools.CHART_HISTORY_LABELS_LONG_MAX) {
                Tools.CHART_HISTORY_LABELS_LONG.splice(0, 1);
            }

            // Run each process
            this.process_manager.Step_Process(this.resource_manager);
            
            this.resource_manager.Step_Regenerate();

            this.resource_manager.Step_RecordHistory();
            this.process_manager.Step_RecordHistory();
        }

        this.resource_manager.Step_RefreshUI();
        this.process_manager.Step_RefreshUI();
    }

    public static Restart(a_resource_specs: ResourceSpec[], a_process_specs: ProcessSpec[]): void {
        let game: Game = new Game(a_resource_specs, a_process_specs);
    }
}



Game.Restart(SampleResourceSpecs.SPECS, SampleProcessSpecs.SPECS);
