/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Resource.ts" />

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
            let step_auto = $('<input type="checkbox" />');
            step_auto.change(() => {
                self.auto_step = step_auto.prop("checked");
            });
            panel.append(step_auto);
        }


        {
            let step_1 = $('<button>Step</button>');
            step_1.click(() => {
                self.game.Step(1);
            });
            panel.append(step_1);
        }

        {
            let step_30 = $('<button>Step 30</button>');
            step_30.click(() => {
                self.game.Step(30);
            });
            panel.append(step_30);
        }

        {
            let step_360 = $('<button>Step 360</button>');
            step_360.click(() => {
                self.game.Step(360);
            });
            panel.append(step_360);
        }

        return panel;
    }

}