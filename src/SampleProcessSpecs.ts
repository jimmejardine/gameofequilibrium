class SampleProcessSpecs {

    public static SPECS = [
        {
            name: 'housing',
            img: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5',
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
            img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30',
            inputs: ['humans', 'water' ],
            outputs: ['food', 'humans'],
            compute: (X: any) => {
                var supported_by_water = X.water / 36;
                var supported_by_humans = X.humans * 15;

                return {
                    humans: X.humans,
                    food: Math.min(supported_by_water, supported_by_humans),
                };
            },
        },

        {
            name: 'mining',
            img: 'https://images.unsplash.com/photo-1523416074908-e541a411fbf5',
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
