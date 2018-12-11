/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Resource.ts" />

declare var JSONEditor: any;

class ControlPanel {
    private auto_step;

    constructor(private game: Game) {
        var self = this;

        setInterval(
            () => {
                if (self.auto_step) {
                    self.game.Step(1);
                }
            },
            500
        );
    }

    public GetUI() {
        var self = this;

        let panel = $('<div id="control-panel"></div>');

        {
            let toolbar = $('<div id="toolbar"></div>');
            panel.append(toolbar);

            {
                let step_auto = $('<input type="checkbox" />');
                toolbar.append(step_auto);
                step_auto.change(() => {
                    self.auto_step = step_auto.prop("checked");
                });

                toolbar.append('Auto-step');
                toolbar.append(' ');
            }


            {
                let step_1 = $('<button>Step</button>');
                toolbar.append(step_1);
                step_1.click(() => {
                    self.game.Step(1);
                });
            }

            {
                let step_30 = $('<button>Step 30</button>');
                toolbar.append(step_30);
                step_30.click(() => {
                    self.game.Step(30);
                });
            }

            {
                let step_360 = $('<button>Step 360</button>');
                toolbar.append(step_360);
                step_360.click(() => {
                    self.game.Step(360);
                });
            }
        }

        // The rules
        {
            var json_editor_options = {
                history: true,
                modes: ['tree','text',],
            };

            let rulebar = $('<div id="rulebar"></div>');
            panel.append(rulebar);

            let resource_rules_text = $('<div class="json_editor_holder" />');
            rulebar.append(resource_rules_text);
            let resource_rules_editor = new JSONEditor(resource_rules_text[0], json_editor_options, SampleResourceSpecs.SPECS);

            let process_rules_text = $('<div class="json_editor_holder" />');
            rulebar.append(process_rules_text);
            let process_rules_editor = new JSONEditor(process_rules_text[0], json_editor_options, SampleProcessSpecs.SPECS);

            rulebar.append('<br/>');

            let submit = $('<button>Use these rules</button>');
            rulebar.append(submit);

            submit.click(() => {

                try {
                    let a_resource_specs: ResourceSpec[] = resource_rules_editor.get();
                    let a_process_specs: ProcessSpec[] = process_rules_editor.get();
                    Game.Restart(a_resource_specs, a_process_specs);
                }

                catch (err) {
                    alert(err);
                }
            });

        }

        return panel;
    }

}