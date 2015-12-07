/// <reference path="../contracts/data.type.ts"/>
/// <reference path="../contracts/data.path.ts"/>

module gwi {
    function mapXPaths(xPaths: Array<string>): Array<Data.Path> {
        return _.map(xPaths, (path: string) => {
            return new Data.Path(path);
        });
    }

    export class DataTypeService {
        static TYPE_UNS_SHORT_INT = 0;
        static TYPE_SHORT_INT = 1;
        static TYPE_UNS_INT = 2;
        static TYPE_INT = 3;
        static TYPE_ENUM = 4;
        static TYPE_FLOAT = 5;
        static TYPE_STRING = 6;

        static types = [
            new Data.Type('Unsigned Short Integer', 'unsigned short int'),
            new Data.Type('Short Integer', 'short int'),
            new Data.Type('Unsigned Integer', 'unsigned int'),
            new Data.Type('Integer', 'int'),
            new Data.Type('Factors', 'factor'),
            new Data.Type('Float', 'long double'),
            new Data.Type('String', 'string'),
        ];

        static $inject = [];
        constructor() {

        }

        allowedTypes(): Array<Data.Type> {
            return DataTypeService.types;
        }

        getTypes(data: Array<Object>, xPaths: Array<string>): Array<Data.Type> {
            var paths = mapXPaths(xPaths);

            _.each(data, (row: Object) => {
                _.each(paths, (path: Data.Path) => {
                    var item = _.get(row, path.path, null);

                    path.foundValue(item);
                });
            });

            var types = this.allowedTypes();
            return _(paths).map((path: Data.Path) => {
                switch (path.type) {
                    case Data.Path.RAW_TYPE_INTEGER:
                        var min = path.stats.min;
                        var max = path.stats.max;
                        if (min < 0) {
                            return (max > 32767 || min < -32768)
                                 ? types[DataTypeService.TYPE_INT]
                                 : types[DataTypeService.TYPE_SHORT_INT]
                                 ;
                        }

                        return max > 65535
                             ? types[DataTypeService.TYPE_UNS_INT]
                             : types[DataTypeService.TYPE_UNS_SHORT_INT]
                             ;
                    case Data.Path.RAW_TYPE_FLOAT:
                        return types[DataTypeService.TYPE_FLOAT];
                    default:
                        if (path.percentUnique() < 21)
                            return types[DataTypeService.TYPE_ENUM];
                        return types[DataTypeService.TYPE_STRING];
                }
            }).map((generic: Data.Type, key: number) => {
                var path = paths[key];
                var type = new Data.Type(generic.name, generic.grokitName);
                type.nullable = path.stats.hasNull;
                return type;
            }).value();
        }
    }

    app.service('gwi.DataTypeService', DataTypeService);
}
