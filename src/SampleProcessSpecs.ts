class SampleProcessSpecs {

    public static SPECS = [
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
                'humans': 1/15,
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
                'humans': 1/10,
            },

            consumes: {            
            },
        },
    ];

}
