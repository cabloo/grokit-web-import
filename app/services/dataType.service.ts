class Path {
    static TYPE_STRING = 0;
    static TYPE_INTEGER = 1;
    static TYPE_FLOAT = 2;

    path: string;
    stats: {
        min: number,
        max: number,
        type: number,
        count: number,
        // map key paths to their cardinalities
        map: Object,
    };

    get type(): number {
        return this.stats.type;
    }

    set type(type: number) {
        this.stats.type = type;
    }

    constructor(path: string) {
        this.path = path;
        this.stats = {
            min: 0,
            max: 0,
            type: Path.TYPE_INTEGER,
            count: 0,
            // map key paths to their cardinalities
            map: {},
        };
    }

    saveProperType(value: any) {
        if (typeof value == 'string') {
            var valNumeric = parseFloat(value);
            var rounded = Math.round(valNumeric);
            if (isNaN(valNumeric)) {
                this.type = Path.TYPE_STRING;
                return value;
            } else if (rounded != valNumeric) {
                this.type = Path.TYPE_FLOAT;
                return valNumeric;
            } else {
                return rounded;
            }
        }
        return value;
    }

    numerics(value: any) {
        this.stats.min = Math.min(value, this.stats.min);
        this.stats.max = Math.max(value, this.stats.max);
    }

    foundValue(value: any) {
        // increment count
        this.stats.count++;

        // increase cardinality
        this.stats.map[value] = this.stats.hasOwnProperty(value) ? this.stats.map[value] + 1 : 1;

        // Calculate numeric-only properties
        if (this.type != Path.TYPE_STRING) {
            value = this.saveProperType(value);

            if (this.type != Path.TYPE_STRING) {
                this.numerics(value);
            }
        }
    }

    percentUnique(): number {
        return Object.keys(this.stats.map).length / this.stats.count * 100;
    }
}

module gwi {
    export class DataTypeService {

        static $inject = [];
        constructor() {

        }

        getTypes(data: Array<Object>, xPaths: Array<string>) {
            var paths = _.map(xPaths, (path: string) => {
                return new Path(path);
            });

            _.each(data, (row: Object) => {
                _.each(paths, (path: Path) => {
                    var item = _.get(row, path.path);

                    path.foundValue(item);
                });
            });

            return _.map(paths, (path: Path) => {
                switch (path.type) {
                    case Path.TYPE_INTEGER:
                        var min = path.stats.min;
                        var max = path.stats.max;
                        if (min < 0) {
                            return (max > 32767 || min < -32768) ? 'int' : 'short int';
                        }

                        return max > 65535 ? 'unsigned int' : 'unsigned short int';
                    case Path.TYPE_FLOAT:
                        return 'long double';
                    case Path.TYPE_STRING:
                        if (path.percentUnique() < 21)
                            return 'factors';
                        return 'string';
                    default:
                        return 'empty';
                }
            });
        }
    }

    app.service('gwi.DataTypeService', DataTypeService);
}
