interface Toastr {
    warning: Function,
    success: Function,
    error: Function,
    info: Function
}

module gwi {
    export class ImportService {
        static JSON = 1;
        static YAML = 2;
        static XML = 3;

        object: Object;
        toastr: Toastr;
        $scope: ng.IScope;
        $location: ng.ILocationService;
        reader: FileReader;

        static $inject = ['$location', '$rootScope', 'toastr'];
        constructor($location: ng.ILocationService, $rootScope: ng.IScope, toastr: Toastr) {
            this.$location = $location;
            this.$scope = $rootScope;
            this.toastr = toastr;
            this.object = {
                "test": "useless data",
                "test2": ["more useless data", "junk"],
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

            this.setupReader();
        }

        setupReader() {
            this.reader = new FileReader();
            this.reader.onload = (onLoadEvent: FileReaderLoadEvent) => {
                this.view(onLoadEvent.target.result);
            };
        }

        /**
         * Transfer to the view object page with the given JS object.
         *
         * @param  {Object} obj
         *
         * @return {void}
         */
        viewObject(obj: Object) {
            if (!obj) return;

            this.object = obj;
            setTimeout(() => {
                this.$scope.$apply(() => {
                    this.$location.path('/');
                });
            }, 0);
        }

        /**
         * Convert a JSON string to a JS object.
         *
         * @param  {string} str
         *
         * @return {Object}
         *
         * @throws JSON Exception
         */
        getJson(str: string) {
            return JSON.parse(str);
        }

        /**
         * Convert an XML string to a JS object.
         *
         * @param  {string} str
         *
         * @return {Object}
         *
         * @throws XML Exception
         */
        getXml(str: string) {
            // TODO
            return JSON.parse(str);
        }

        /**
         * Convert a YAML string to a JS object.
         *
         * @param  {string} str
         *
         * @return {Object}
         *
         * @throws YAML Exception
         */
        getYaml(str: string) {
            return jsyaml.load(str);
        }

        /**
         * Intelligently determine the type of the string given.
         *
         * @param  {string} str
         *
         * @return {int}
         */
        getType(str: string) {
            switch (str[0]) {
                case '{':
                case '[':
                    return ImportService.JSON;
                case '<':
                    return ImportService.XML;
                default:
                    return ImportService.YAML;
            }
        }

        view(str: string) {
            try {
                switch (this.getType(str)) {
                    case ImportService.YAML:
                        this.viewObject(this.getYaml(str));
                        break;

                    case ImportService.JSON:
                        this.viewObject(this.getJson(str));
                        break;

                    case ImportService.XML:
                        this.viewObject(this.getXml(str));
                        break;
                }
            } catch (e) {
                this.toastr.error("Parse Error: " + e);
            }
        }

        fromFile(file: Blob) {
            this.reader.readAsText(file);
        }
    }

    app.service('gwi.ImportService', ImportService);
}
