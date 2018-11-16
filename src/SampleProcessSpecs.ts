class SampleProcessSpecs {
    public static SPECS = [
        {
            name: 'housing',
            inputs: ['stone', 'food', 'humans'],
            outputs: ['humans'],
            compute: (X: any) => {
                var supported_by_stone = X.stone / 10;
                var supported_by_food = X.food / 36;
                var supported_by_humans = X.humans / 2;
                return { humans: X.humans + Math.min(supported_by_stone, supported_by_food, supported_by_humans) };
            },
        },

        {
            name: 'farming',
            inputs: ['humans'],
            outputs: ['food', 'humans'],
            compute: (X: any) => {
                return {
                    humans: X.humans,
                    food: 15 * X.humans,
                };
            },
        },

        {
            name: 'mining',
            inputs: ['humans'],
            outputs: ['stone', 'humans'],
            compute: (X: any) => {
                return {
                    humans: X.humans,
                    stone: 10 * X.humans,
                };
            },
        },
    ];

}
