module gwi {
    'use strict';

    class MainController {
        tree = {
            test: 'hi',
            nested: {
                items: [
                    {
                        test: 'work'
                    },
                    {
                        test: 'well'
                    },
                    {
                        test: 'too'
                    }
                ]

            }
        };

        static $inject = [];
        constructor() {

        }
    }

    app.controller('gwi.MainController', MainController);
}
