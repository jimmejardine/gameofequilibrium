class Tools {
    public static RecordQuantityHistory_SHORT(quantity_history: number[], quantity: number): any {
        Tools.RecordQuantityHistory_XXX(Tools.CHART_HISTORY_LABELS_SHORT_MAX, quantity_history, quantity);
    }

    public static RecordQuantityHistory_LONG(quantity_history: number[], quantity: number): any {
        Tools.RecordQuantityHistory_XXX(Tools.CHART_HISTORY_LABELS_LONG_MAX, quantity_history, quantity);
    }

    private static RecordQuantityHistory_XXX(MAX: number, quantity_history: number[], quantity: number): any {
        quantity_history.push(quantity);
        
        while (quantity_history.length > MAX) {
            quantity_history.splice(0, 1);
        }
    }

    public static CHART_HISTORY_LABELS_SHORT_MAX = 1 * 360;
    public static CHART_HISTORY_LABELS_LONG_MAX = 5 * 360;
    public static CHART_HISTORY_LABELS_SHORT: string[] = [];
    public static CHART_HISTORY_LABELS_LONG: string[] = [];

    public static Get_CHART_OPTIONS(legend: any) {
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
    }
}