var ResourceSpec = /** @class */ (function () {
    function ResourceSpec() {
    }
    return ResourceSpec;
}());
var Resource = /** @class */ (function () {
    function Resource(resource_spec, process_specs) {
        var _this = this;
        this.resource_spec = resource_spec;
        this.quantity = 0;
        this.quantity_history = [];
        this.allocations = {};
        process_specs.forEach(function (process_spec) {
            Object.keys(process_spec.employs).forEach(function (input) {
                if (input == _this.resource_spec.name) {
                    _this.allocations[process_spec.name] = 0;
                }
            });
            Object.keys(process_spec.consumes).forEach(function (input) {
                if (input == _this.resource_spec.name) {
                    _this.allocations[process_spec.name] = 0;
                }
            });
        });
    }
    Resource.prototype.GetUI = function () {
        var _this = this;
        var panel = $('<div class="resource" style="background-image:url(' + this.resource_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.resource_spec.name + '</h1></div>'));
        var control_panel = $('<div class="controls"></div>');
        panel.append(control_panel);
        {
            var canvas_chart_quantity = ($('<canvas />')[0]);
            var ctx = canvas_chart_quantity.getContext('2d');
            var config = {
                type: 'line',
                data: {
                    labels: Tools.CHART_HISTORY_LABELS,
                    datasets: [{
                            pointRadius: 1,
                            data: this.quantity_history,
                            lineTension: 0,
                        }]
                },
                options: Tools.Get_CHART_OPTIONS({
                    display: false,
                }),
            };
            this.chart_quantity = new Chart(ctx, config);
            control_panel.append(canvas_chart_quantity);
        }
        // And the allocations
        {
            var slider_elements = {};
            // Create the sliders
            Object.keys(this.allocations).forEach(function (key) {
                var slider_element = $('<input type="range" min="0" max="100" value="0" />');
                slider_elements[key] = slider_element;
                control_panel.append(slider_element);
                control_panel.append(' : ');
                control_panel.append(key);
                control_panel.append('<br />');
            });
            // Tie the sliders
            var processing_change = false;
            Object.keys(this.allocations).forEach(function (key) {
                var slider_element = slider_elements[key];
                slider_element.change(function () {
                    if (processing_change)
                        return;
                    processing_change = true;
                    var key_value = parseInt(slider_element.val());
                    _this.allocations[key] = key_value;
                    // Sum up the weights
                    var sum = 0;
                    Object.keys(_this.allocations).forEach(function (key_other) {
                        sum += _this.allocations[key_other];
                    });
                    // Scale if necessary
                    if (100 < sum) {
                        var scale_1 = (100 - key_value) / (sum - key_value);
                        Object.keys(_this.allocations).forEach(function (key_other) {
                            if (key != key_other) {
                                var key_other_value = Math.floor(scale_1 * _this.allocations[key_other]);
                                _this.allocations[key_other] = key_other_value;
                                slider_elements[key_other].val(key_other_value);
                            }
                        });
                    }
                    processing_change = false;
                });
            });
        }
        return panel;
    };
    Resource.prototype.Dump = function () {
        console.log(this.resource_spec.name + '\t' + this.quantity);
    };
    Resource.prototype.Step_Release = function (process) {
        var allocation = this.allocations[process] || 0;
        var release_amount = this.quantity * allocation / 100 / 360;
        if (this.resource_spec.verbose)
            console.log(this.resource_spec.name + ' : ' + ' release ' + release_amount);
        this.quantity -= release_amount;
        return release_amount;
    };
    Resource.prototype.Step_Produce = function (n) {
        this.quantity += n;
    };
    Resource.prototype.Step_Regenerate = function () {
        var decay_amount = this.quantity * this.resource_spec.decay / 360;
        if (this.resource_spec.verbose)
            console.log(this.resource_spec.name + ' : ' + ' decay ' + decay_amount);
        this.quantity -= decay_amount;
        if (this.resource_spec.baseline > this.quantity) {
            var baseline_amount = (this.resource_spec.baseline - this.quantity) / 360;
            if (this.resource_spec.verbose)
                console.log(this.resource_spec.name + ' : ' + ' baseline ' + baseline_amount);
            this.quantity += baseline_amount;
        }
    };
    Resource.prototype.Step_RecordHistory = function () {
        this.quantity_history.push(this.quantity);
        while (this.quantity_history.length > Tools.CHART_HISTORY_LABELS_MAX) {
            this.quantity_history.splice(0, 1);
        }
    };
    Resource.prototype.Step_RefreshUI = function () {
        this.chart_quantity.update();
    };
    return Resource;
}());
/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Resource.ts" />
var ControlPanel = /** @class */ (function () {
    function ControlPanel(game) {
        this.game = game;
        var self = this;
        setInterval(function () {
            if (self.auto_step) {
                self.game.Step(1);
            }
        }, 500);
    }
    ControlPanel.prototype.GetUI = function () {
        var self = this;
        var panel = $('<div id="control-panel"></div>');
        {
            var step_auto_1 = $('<input type="checkbox" />');
            step_auto_1.change(function () {
                self.auto_step = step_auto_1.prop("checked");
            });
            panel.append(step_auto_1);
        }
        {
            var step_1 = $('<button>Step</button>');
            step_1.click(function () {
                self.game.Step(1);
            });
            panel.append(step_1);
        }
        {
            var step_30 = $('<button>Step 30</button>');
            step_30.click(function () {
                self.game.Step(30);
            });
            panel.append(step_30);
        }
        {
            var step_360 = $('<button>Step 360</button>');
            step_360.click(function () {
                self.game.Step(360);
            });
            panel.append(step_360);
        }
        return panel;
    };
    return ControlPanel;
}());
var Tools = /** @class */ (function () {
    function Tools() {
    }
    Tools.Get_CHART_OPTIONS = function (legend) {
        return {
            legend: legend,
            tooltips: {
                enabled: false,
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
        };
    };
    Tools.CHART_HISTORY_LABELS_MAX = 10 * 360;
    Tools.CHART_HISTORY_LABELS = [];
    return Tools;
}());
var SampleResourceSpecs = /** @class */ (function () {
    function SampleResourceSpecs() {
    }
    SampleResourceSpecs.SPECS = [
        {
            name: 'humans',
            baseline: 100,
            decay: 0.01,
            img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
        },
        {
            name: 'water',
            baseline: 1000,
            decay: 0,
            img: 'https://images.unsplash.com/photo-1500575351013-6b9af18d7722',
        },
        {
            name: 'food',
            baseline: 0,
            decay: 0.1,
            img: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
        },
        {
            name: 'stone',
            baseline: 0,
            decay: 0.1,
            img: 'https://images.unsplash.com/photo-1522140243784-a1df85e3c0f4',
        },
    ];
    return SampleResourceSpecs;
}());
var SampleProcessSpecs = /** @class */ (function () {
    function SampleProcessSpecs() {
    }
    SampleProcessSpecs.SPECS = [
        {
            name: 'housing',
            img: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5',
            output: 'humans',
            employs: {
                'humans': 2,
            },
            consumes: {
                'stone': 10,
                'food': 36,
            },
        },
        {
            name: 'farming',
            img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30',
            output: 'food',
            employs: {
                'humans': 1 / 15,
            },
            consumes: {
                'water': 1,
            },
        },
        {
            name: 'mining',
            img: 'https://images.unsplash.com/photo-1523416074908-e541a411fbf5',
            output: 'stone',
            employs: {
                'humans': 1 / 10,
            },
            consumes: {},
        },
    ];
    return SampleProcessSpecs;
}());
/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Resource.ts" />
var ResourceManager = /** @class */ (function () {
    function ResourceManager(resource_specs, process_specs) {
        var _this = this;
        this.resource_specs = resource_specs;
        this.process_specs = process_specs;
        this.resources_array = [];
        this.resources_map = {};
        this.resource_specs.forEach(function (resource_spec) {
            var resource = new Resource(resource_spec, process_specs);
            _this.resources_array.push(resource);
            _this.resources_map[resource_spec.name] = resource;
        });
    }
    ResourceManager.prototype.GetUI = function () {
        var panel = $('<div id="resource-manager"></div>');
        this.resources_array.forEach(function (resource) {
            panel.append(resource.GetUI());
        });
        return panel;
    };
    ResourceManager.prototype.Dump = function () {
        this.resources_array.forEach(function (resource) {
            resource.Dump();
        });
    };
    ResourceManager.prototype.Step_Release = function (resource, process) {
        //console.log('Step_Release ' + resource + ' : ' + process);
        return this.resources_map[resource].Step_Release(process);
    };
    ResourceManager.prototype.Step_Produce = function (resource, n) {
        //console.log('Step_Produce ' + resource + ' : ' + n);
        return this.resources_map[resource].Step_Produce(n);
    };
    ResourceManager.prototype.Step_Regenerate = function () {
        this.resources_array.forEach(function (resource) {
            resource.Step_Regenerate();
        });
    };
    ResourceManager.prototype.Step_RecordHistory = function () {
        this.resources_array.forEach(function (resource) {
            resource.Step_RecordHistory();
        });
    };
    ResourceManager.prototype.Step_RefreshUI = function () {
        this.resources_array.forEach(function (resource) {
            resource.Step_RefreshUI();
        });
    };
    return ResourceManager;
}());
/// <reference path="./Tools.ts" />
/// <reference path="./ProcessSpec.ts" />
var Process = /** @class */ (function () {
    function Process(process_spec) {
        var _this = this;
        this.process_spec = process_spec;
        this.inputs_array = [];
        this.inputs_required_map = {};
        this.inputs_provided_map = {};
        this.output_possible_map = {};
        this.inputs_used_map = {};
        // Create the map of all the inputs
        Object.keys(this.process_spec.employs).forEach(function (resource) {
            _this.inputs_required_map[resource] = (_this.inputs_required_map[resource] || 0) + _this.process_spec.employs[resource];
        });
        Object.keys(this.process_spec.consumes).forEach(function (resource) {
            _this.inputs_required_map[resource] = (_this.inputs_required_map[resource] || 0) + _this.process_spec.employs[resource];
        });
        // Create the array of all the inputs
        Object.keys(this.inputs_required_map).forEach(function (resource) {
            _this.inputs_array.push(resource);
        });
    }
    Process.prototype.GetUI = function () {
        var panel = $('<div class="process" style="background-image:url(' + this.process_spec.img + '?w=600&q=80);"></div>');
        panel.append($('<div style="text-align:center;"><h1>' + this.process_spec.name + '</h1></div>'));
        var control_panel = $('<div class="controls"></div>');
        panel.append(control_panel);
        {
            var canvas_chart_quantity = ($('<canvas />')[0]);
            var ctx = canvas_chart_quantity.getContext('2d');
            var config = {
                type: 'line',
                data: {
                    labels: Tools.CHART_HISTORY_LABELS,
                    datasets: [{
                            pointRadius: 1,
                            data: this.quantity_history,
                            lineTension: 0,
                        }]
                },
                options: Tools.Get_CHART_OPTIONS({
                    display: false,
                }),
            };
            this.chart_quantity = new Chart(ctx, config);
            control_panel.append(canvas_chart_quantity);
        }
        return panel;
    };
    Process.prototype.Step_Process = function (resource_manager) {
        var _this = this;
        // How much have we been provided
        this.inputs_array.forEach(function (resource) {
            _this.inputs_provided_map[resource] = resource_manager.Step_Release(resource, _this.process_spec.name);
        });
        // How many can be produced with the inputs
        this.inputs_array.forEach(function (resource) {
            _this.output_possible_map[resource] = _this.inputs_provided_map[resource] / _this.inputs_required_map[resource];
        });
        var output_possible = _.min(_.values(this.output_possible_map));
        // How much of each input was utilised by the production
        this.inputs_array.forEach(function (resource) {
            _this.inputs_used_map[resource] = output_possible * _this.inputs_required_map[resource];
        });
        // Produce the output
        resource_manager.Step_Produce(this.process_spec.output, output_possible);
        // Replenish the employment bits
        Object.keys(this.process_spec.employs).forEach(function (resource) {
            var amount_consumed = 0;
            if (_this.process_spec.consumes[resource]) {
                amount_consumed = output_possible * _this.process_spec.consumes[resource];
            }
            var amount_returned = _this.inputs_provided_map[resource] - amount_consumed;
            resource_manager.Step_Produce(resource, amount_returned);
        });
    };
    Process.prototype.Step_RefreshUI = function () {
    };
    return Process;
}());
/// <reference path="./ResourceSpec.ts" />
/// <reference path="./ProcessSpec.ts" />
/// <reference path="./Process.ts" />
var ProcessManager = /** @class */ (function () {
    function ProcessManager(resource_specs, process_specs) {
        var _this = this;
        this.resource_specs = resource_specs;
        this.process_specs = process_specs;
        this.processes_array = [];
        this.processes_map = {};
        this.process_specs.forEach(function (process_spec) {
            var process = new Process(process_spec);
            _this.processes_array.push(process);
            _this.processes_map[process_spec.name] = process;
        });
    }
    ProcessManager.prototype.GetUI = function () {
        var panel = $('<div id="process-manager"></div>');
        this.processes_array.forEach(function (process) {
            panel.append(process.GetUI());
        });
        return panel;
    };
    ProcessManager.prototype.Step_Process = function (resource_manager) {
        this.processes_array.forEach(function (process) {
            process.Step_Process(resource_manager);
        });
    };
    ProcessManager.prototype.Step_RefreshUI = function () {
        this.processes_array.forEach(function (process) {
            process.Step_RefreshUI();
        });
    };
    return ProcessManager;
}());
/// <reference path="./Tools.ts" />
/// <reference path="./SampleResourceSpecs.ts" />
/// <reference path="./SampleProcessSpecs.ts" />
/// <reference path="./ResourceManager.ts" />
/// <reference path="./ProcessManager.ts" />
/// <reference path="./ControlPanel.ts" />
var Game = /** @class */ (function () {
    function Game() {
        this.step = 0;
    }
    Game.prototype.Initialise = function () {
        console.log('Game initialising');
        this.resource_specs = SampleResourceSpecs.SPECS;
        this.process_specs = SampleProcessSpecs.SPECS;
        this.resource_manager = new ResourceManager(this.resource_specs, this.process_specs);
        $('body').append(this.resource_manager.GetUI());
        this.process_manager = new ProcessManager(this.resource_specs, this.process_specs);
        $('body').append(this.process_manager.GetUI());
        this.control_panel = new ControlPanel(this);
        $('body').append(this.control_panel.GetUI());
    };
    Game.prototype.Step = function (step_n) {
        console.log('Game step ' + step_n);
        for (var i = 0; i < step_n; ++i) {
            ++this.step;
            Tools.CHART_HISTORY_LABELS.push('' + this.step);
            while (Tools.CHART_HISTORY_LABELS.length > Tools.CHART_HISTORY_LABELS_MAX) {
                Tools.CHART_HISTORY_LABELS.splice(0, 1);
            }
            // Run each process
            this.process_manager.Step_Process(this.resource_manager);
            this.resource_manager.Step_Regenerate();
            this.resource_manager.Step_RecordHistory();
        }
        this.resource_manager.Step_RefreshUI();
        this.process_manager.Step_RefreshUI();
    };
    return Game;
}());
var game = new Game();
game.Initialise();
//# sourceMappingURL=app.js.map