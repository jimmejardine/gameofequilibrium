class Tools {

    public static CHART_HISTORY_LABELS_MAX = 10 * 360;
    public static CHART_HISTORY_LABELS: string[] = [];

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