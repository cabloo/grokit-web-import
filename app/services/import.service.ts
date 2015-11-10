module gwi {
    class ImportService {
        object: Object;

        static $inject = [];
        constructor() {
            this.object = {
                "test": "useless data",
                "nested": {
                    "items": [
                        {
                            "test": "From Item 1",
                            "a": "a"
                        },
                        {
                            "test": "From Item 2",
                            "deeply": {
                                "nested": {
                                    "items": "work"
                                }
                            }
                        },
                        {
                            "test": "From Item 3",
                            "a": "b",
                            "c": "d"
                        }
                    ]
                }
            };
        }
    }

    app.service('gwi.ImportService', ImportService);
}
