var gwi;
(function (gwi) {
    gwi.app = angular.module('gwi', [
        'ngRoute', 'angular-json-tree', 'ui.bootstrap', 'toastr'
    ]);
})(gwi || (gwi = {}));

var gwi;
(function (gwi) {
    gwi.app.config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                controller: 'gwi.MainController',
                templateUrl: 'views/main.html',
                controllerAs: 'page'
            })
                .when('/import', {
                controller: 'gwi.ImportController',
                templateUrl: 'views/import.html',
                controllerAs: 'page'
            });
        }]);
})(gwi || (gwi = {}));

var Data;
(function (Data) {
    var Type = (function () {
        function Type(name, grokitName) {
            this.name = name;
            this.grokitName = grokitName;
        }
        return Type;
    })();
    Data.Type = Type;
})(Data || (Data = {}));

/// <reference path="data.type.ts"/>
var Data;
(function (Data) {
    var Path = (function () {
        function Path(path) {
            this.path = path;
            this.stats = {
                min: 0,
                max: 0,
                rawType: Path.RAW_TYPE_INTEGER,
                count: 0,
                hasNull: false,
            };
        }
        Object.defineProperty(Path.prototype, "type", {
            get: function () {
                return this.stats.rawType;
            },
            set: function (type) {
                this.stats.rawType = type;
            },
            enumerable: true,
            configurable: true
        });
        Path.prototype.saveProperType = function (value) {
            if (value === null) {
                this.stats.hasNull = true;
                return value;
            }
            if (typeof value == 'string') {
                var valNumeric = parseFloat(value);
                var rounded = Math.round(valNumeric);
                if (isNaN(valNumeric)) {
                    this.type = Path.RAW_TYPE_STRING;
                    return value;
                }
                else if (rounded != valNumeric) {
                    this.type = Path.RAW_TYPE_FLOAT;
                    return valNumeric;
                }
                else {
                    return rounded;
                }
            }
            return value;
        };
        Path.prototype.numerics = function (value) {
            this.stats.min = Math.min(value, this.stats.min);
            this.stats.max = Math.max(value, this.stats.max);
        };
        Path.prototype.foundValue = function (value) {
            // increment count
            this.stats.count++;
            // increase cardinality
            //this.stats.map[value] = this.stats.hasOwnProperty(value) ? this.stats.map[value] + 1 : 1;
            // Calculate numeric-only properties
            if (this.type != Path.RAW_TYPE_STRING) {
                value = this.saveProperType(value);
                if (this.type != Path.RAW_TYPE_STRING) {
                    this.numerics(value);
                }
            }
        };
        Path.prototype.percentUnique = function () {
            return 100; //Object.keys(this.stats.map).length / this.stats.count * 100;
        };
        Path.RAW_TYPE_STRING = 0;
        Path.RAW_TYPE_INTEGER = 1;
        Path.RAW_TYPE_FLOAT = 2;
        return Path;
    })();
    Data.Path = Path;
})(Data || (Data = {}));

/// <reference path="../contracts/data.type.ts"/>
/// <reference path="../contracts/data.path.ts"/>
var gwi;
(function (gwi) {
    function mapXPaths(xPaths) {
        return _.map(xPaths, function (path) {
            return new Data.Path(path);
        });
    }
    var DataTypeService = (function () {
        function DataTypeService($q, $timeout) {
            this.$q = $q;
            this.$timeout = $timeout;
        }
        DataTypeService.prototype.allowedTypes = function () {
            return DataTypeService.types;
        };
        DataTypeService.prototype.recursiveProcess = function (data, paths, interval, i) {
            var _this = this;
            i = i || data.length - 1;
            return this.$timeout(function () {
                var row;
                var min = Math.max(i - interval, -1);
                for (; i > min; i--) {
                    row = data[i];
                    _.each(paths, function (path) {
                        path.foundValue(_.get(row, path.path, null));
                    });
                }
                if (i > 0) {
                    return _this.recursiveProcess(data, paths, interval, i);
                }
                return _this.$q.when(paths);
            }, 70);
        };
        DataTypeService.prototype.getTypes = function (data, xPaths) {
            var types = this.allowedTypes();
            var mapPathToType = function (path) {
                switch (path.type) {
                    case Data.Path.RAW_TYPE_INTEGER:
                        var min = path.stats.min;
                        var max = path.stats.max;
                        if (min < 0) {
                            return (max > 32767 || min < -32768)
                                ? types[DataTypeService.TYPE_INT]
                                : types[DataTypeService.TYPE_SHORT_INT];
                        }
                        return max > 65535
                            ? types[DataTypeService.TYPE_UNS_INT]
                            : types[DataTypeService.TYPE_UNS_SHORT_INT];
                    case Data.Path.RAW_TYPE_FLOAT:
                        return types[DataTypeService.TYPE_FLOAT];
                    default:
                        if (path.percentUnique() < 21)
                            return types[DataTypeService.TYPE_ENUM];
                        return types[DataTypeService.TYPE_STRING];
                }
            };
            var mapGenericTypeToFresh = function (generic, key) {
                var path = paths[key];
                var type = new Data.Type(generic.name, generic.grokitName);
                type.nullable = path.stats.hasNull;
                return type;
            };
            var createTypes = function (paths) {
                console.log('hmm');
                return _(paths)
                    .map(mapPathToType)
                    .map(mapGenericTypeToFresh)
                    .value();
            };
            var paths = mapXPaths(xPaths);
            return this.recursiveProcess(data, paths, 4000)
                .then(createTypes);
        };
        DataTypeService.TYPE_UNS_SHORT_INT = 0;
        DataTypeService.TYPE_SHORT_INT = 1;
        DataTypeService.TYPE_UNS_INT = 2;
        DataTypeService.TYPE_INT = 3;
        DataTypeService.TYPE_ENUM = 4;
        DataTypeService.TYPE_FLOAT = 5;
        DataTypeService.TYPE_STRING = 6;
        DataTypeService.types = [
            new Data.Type('Unsigned Short Integer', 'unsigned short int'),
            new Data.Type('Short Integer', 'short int'),
            new Data.Type('Unsigned Integer', 'unsigned int'),
            new Data.Type('Integer', 'int'),
            new Data.Type('Factors', 'factor'),
            new Data.Type('Float', 'long double'),
            new Data.Type('String', 'string'),
        ];
        DataTypeService.$inject = ['$q', '$timeout'];
        return DataTypeService;
    })();
    gwi.DataTypeService = DataTypeService;
    gwi.app.service('gwi.DataTypeService', DataTypeService);
})(gwi || (gwi = {}));

/// <reference path="../services/dataType.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>
var gwi;
(function (gwi) {
    function xpath(path) {
        return path.replace(/\./g, '/');
    }
    var ExportModalController = (function () {
        function ExportModalController($scope, Overview, DataType) {
            this.$scope = $scope;
            this.Overview = Overview;
            this.DataType = DataType;
            this.setupScope();
        }
        ExportModalController.prototype.$applyDeferred = function () {
            _.defer(this.$scope.$apply.bind(this.$scope));
        };
        ExportModalController.prototype.setupScope = function () {
            this.$scope.loading = true;
            this.$scope.code = "Loading...";
            setTimeout(this.loadCode.bind(this), 50);
        };
        ExportModalController.prototype.colToType = function (column) {
            return column.name.split('.').pop() + "=" + column.type.grokitName;
            /* + " (" +
                (column.type.nullable ? 'nullable' : 'not nullable')
            + ")\n";*/
        };
        ExportModalController.prototype.colToPath = function (column) {
            return "'/" + xpath(column.name) + "'";
        };
        ExportModalController.prototype.loadCode = function () {
            var _this = this;
            this.Overview.getColsWithTypes()
                .then(function (columns) {
                var funcName = "Read" + _this.Overview.fileType;
                var rootPath = xpath(_this.Overview.getPathToRows());
                var colToType = _this.colToType.bind(_this);
                var colToPath = _this.colToPath.bind(_this);
                var args = [
                    "'<full path to data file>'",
                    'c(' + _.map(columns, colToType).join(',') + ')',
                    "'" + rootPath + "'",
                    'c(' + _.map(columns, colToPath).join(',') + ')',
                ];
                _this.$scope.code = funcName + "(" + args.join(',') + ")";
                _this.$applyDeferred();
            });
        };
        ExportModalController.$inject = ['$scope', 'gwi.OverviewService', 'gwi.DataTypeService'];
        return ExportModalController;
    })();
    gwi.app.controller('gwi.ExportModalController', ExportModalController);
})(gwi || (gwi = {}));



/// <reference path="../contracts/import.target.ts"/>
var gwi;
(function (gwi) {
    function parseXml(xml, arrayTags) {
        var dom = null;
        if (window.hasOwnProperty("DOMParser")) {
            dom = (new DOMParser()).parseFromString(xml, "text/xml");
        }
        else if (window.hasOwnProperty("ActiveXObject")) {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) {
                throw dom.parseError.reason + " " + dom.parseError.srcText;
            }
        }
        else {
            throw "cannot parse xml string!";
        }
        function isArray(o) {
            return _.isArray(o);
        }
        function parseNode(xmlNode, result) {
            if (xmlNode.nodeName == "#text" && xmlNode.nodeValue.trim() == "") {
                return;
            }
            var jsonNode = xmlNode.nodeName == "#text" ? xmlNode.nodeValue.trim() : {};
            var existing = result[xmlNode.nodeName];
            if (existing) {
                if (!isArray(existing)) {
                    result[xmlNode.nodeName] = [existing, jsonNode];
                }
                else {
                    result[xmlNode.nodeName].push(jsonNode);
                }
            }
            else {
                if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) {
                    result[xmlNode.nodeName] = [jsonNode];
                }
                else {
                    result[xmlNode.nodeName] = jsonNode;
                }
            }
            if (xmlNode.attributes) {
                var length = xmlNode.attributes.length;
                for (var i = 0; i < length; i++) {
                    var attribute = xmlNode.attributes[i];
                    jsonNode[attribute.nodeName] = attribute.nodeValue;
                }
            }
            var length = xmlNode.childNodes.length;
            for (var i = 0; i < length; i++) {
                parseNode(xmlNode.childNodes[i], jsonNode);
            }
        }
        var result = {};
        if (dom.childNodes.length) {
            parseNode(dom.childNodes[0], result);
        }
        return result;
    }
    var ImportService = (function () {
        function ImportService($location, $rootScope, toastr) {
            this.$location = $location;
            this.$scope = $rootScope;
            this.toastr = toastr;
            this.object = {};
            this.fileType = "";
            this.setupReader();
            this.cb = function () { };
        }
        ImportService.prototype.setupReader = function () {
            var _this = this;
            this.reader = new FileReader();
            this.reader.onload = function (onLoadEvent) {
                _this.view(onLoadEvent.target);
                _this.cb(onLoadEvent);
            };
        };
        /**
         * Transfer to the view object page with the given JS object.
         *
         * @param  {Object} obj
         *
         * @return {void}
         */
        ImportService.prototype.viewObject = function (obj) {
            var _this = this;
            if (!obj)
                return;
            this.object = obj;
            setTimeout(function () {
                _this.$scope.$apply(function () {
                    _this.$location.path('/');
                });
            }, 0);
        };
        /**
         * Convert a JSON string to a JS object.
         *
         * @param  {Import.Target} target
         *
         * @return {Object}
         *
         * @throws JSON Exception
         */
        ImportService.prototype.getJson = function (target) {
            this.fileType = 'JSON';
            return JSON.parse(target.result);
        };
        /**
         * Convert an XML string to a JS object.
         *
         * @param  {Import.Target} target
         *
         * @return {Object}
         *
         * @throws XML Exception
         */
        ImportService.prototype.getXml = function (target) {
            this.fileType = 'XML';
            return parseXml(target.result);
        };
        /**
         * Convert a YAML string to a JS object.
         *
         * @param  {Import.Target} target
         *
         * @return {Object}
         *
         * @throws YAML Exception
         */
        ImportService.prototype.getYaml = function (target) {
            this.fileType = 'YAML';
            return jsyaml.load(target.result);
        };
        /**
         * Intelligently determine the type of the string given.
         *
         * @param  {Import.Target} target
         *
         * @return {int}
         */
        ImportService.prototype.getType = function (target) {
            switch (target.result[0]) {
                case '{':
                case '[':
                    return ImportService.JSON;
                case '<':
                    return ImportService.XML;
                default:
                    return ImportService.YAML;
            }
        };
        ImportService.prototype.view = function (target) {
            try {
                switch (this.getType(target)) {
                    case ImportService.YAML:
                        this.viewObject(this.getYaml(target));
                        break;
                    case ImportService.JSON:
                        this.viewObject(this.getJson(target));
                        break;
                    case ImportService.XML:
                        this.viewObject(this.getXml(target));
                        break;
                }
            }
            catch (e) {
                this.toastr.error("Parse Error: " + e);
            }
        };
        ImportService.prototype.fromFile = function (file, cb) {
            this.reader.readAsText(file);
            this.cb = cb;
        };
        ImportService.JSON = 1;
        ImportService.YAML = 2;
        ImportService.XML = 3;
        ImportService.$inject = ['$location', '$rootScope', 'toastr'];
        return ImportService;
    })();
    gwi.ImportService = ImportService;
    gwi.app.service('gwi.ImportService', ImportService);
})(gwi || (gwi = {}));

/// <reference path="../services/import.service.ts"/>
/// <reference path="../contracts/import.target.ts"/>
var gwi;
(function (gwi) {
    var ImportController = (function () {
        function ImportController($scope, Import) {
            this.$scope = $scope;
            this.Import = Import;
            this.setupScope();
        }
        ImportController.prototype.setupScope = function () {
            var _this = this;
            this.$scope.pasted = "";
            this.$scope.submitPasted = this.submitPasted.bind(this);
            this.$scope.file = null;
            this.$scope.$watch('file', function (value) {
                //this.$scope.encoding = this.$scope.encoding || 'UTF-8';
                if (!value)
                    return;
                _this.$scope.loading = true;
                _this.Import.fromFile(value, function () {
                    _this.$scope.loading = false;
                });
            });
        };
        ImportController.prototype.submitPasted = function () {
            this.Import.view({
                result: this.$scope.pasted
            });
        };
        ImportController.$inject = ['$scope', 'gwi.ImportService'];
        return ImportController;
    })();
    gwi.ImportController = ImportController;
    gwi.app.controller('gwi.ImportController', ImportController);
})(gwi || (gwi = {}));

/// <reference path="data.type.ts"/>

/// <reference path="../services/import.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>
/// <reference path="../contracts/data.column.ts"/>
var gwi;
(function (gwi) {
    var Tree = (function () {
        function Tree(_root) {
            this._root = _root;
        }
        Object.defineProperty(Tree.prototype, "current", {
            get: function () {
                return this._curr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tree.prototype, "root", {
            get: function () {
                return this._root;
            },
            set: function (tree) {
                this._root = tree;
                this._curr = _.isArray(this._root) ? this._root : [];
                this.rootPath = "";
            },
            enumerable: true,
            configurable: true
        });
        Tree.prototype.setCurrentRoot = function (name) {
            this.rootPath = name;
            this._curr = (name == "" ? this._root : _.get(this._root, name));
        };
        return Tree;
    })();
    var OverviewService = (function () {
        function OverviewService($scope, $modal, $q, Import, DataType, $location) {
            this.$q = $q;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$location = $location;
            this.Import = Import;
            this.DataType = DataType;
            this.editing = null;
            this.types = {};
            this.columns = [];
            this.importLatest();
        }
        Object.defineProperty(OverviewService.prototype, "root", {
            get: function () {
                return this._tree.root;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverviewService.prototype, "current", {
            get: function () {
                return this._tree.current;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverviewService.prototype, "tree", {
            get: function () {
                return this._tree;
            },
            enumerable: true,
            configurable: true
        });
        OverviewService.prototype.importLatest = function () {
            this.fileType = this.Import.fileType;
            if (!this.fileType) {
                this.$location.path('/import');
            }
            this._tree = new Tree(this.Import.object);
        };
        OverviewService.prototype.setCurrentRoot = function (name) {
            this.tree.setCurrentRoot(name);
        };
        OverviewService.prototype.editColumn = function (key) {
            this.editing = this.columns[key];
            this.$modal.open({
                controller: 'gwi.ViewColumnModalController',
                templateUrl: 'views/edit-column.html',
            });
        };
        OverviewService.prototype.exportCode = function () {
            this.$modal.open({
                controller: 'gwi.ExportModalController',
                templateUrl: 'views/modal-export-code.html',
            });
        };
        OverviewService.prototype.resetColumns = function () {
            this.columns.splice(0, this.columns.length);
        };
        OverviewService.prototype.removeColumn = function (key) {
            this.columns.splice(key, 1);
        };
        OverviewService.prototype.findColumn = function (path) {
            return _.find(this.columns, function (column) {
                return column.name == path;
            });
        };
        OverviewService.prototype.addColumn = function (path) {
            if (this.findColumn(path))
                return;
            this.columns.push({
                name: path,
                type: new Data.Type(OverviewService.EmptyColumnTypeName, "Loading"),
            });
        };
        OverviewService.prototype.setColumnType = function (column, type) {
            _.extend(column.type, type);
        };
        OverviewService.prototype.allowedTypes = function () {
            return this.DataType.allowedTypes();
        };
        OverviewService.prototype.getColsWithTypes = function () {
            var _this = this;
            var neededCols = _(this.columns).map(function (column) {
                return column.type.name == OverviewService.EmptyColumnTypeName ? column.name : null;
            }).compact().value();
            return this.DataType.getTypes(this.current, neededCols)
                .then(function (types) {
                console.log('test2');
                _.each(types, function (type, key) {
                    var column = _this.findColumn(neededCols[key]);
                    _this.setColumnType(column, type);
                });
                setTimeout(_this.$scope.$apply.bind(_this.$scope), 10);
                return _this.columns;
            });
        };
        OverviewService.prototype.typeBeingEdited = function (cb) {
            var _this = this;
            var column = this.editing;
            if (column.type.name != OverviewService.EmptyColumnTypeName) {
                _.defer(cb);
                return column.type;
            }
            setTimeout(function () {
                var type = _this.DataType.getTypes(_this.current, [column.name])
                    .then(function (types) {
                    _this.setColumnType(column, types[0]);
                    cb();
                });
            }, 50);
            return column.type;
        };
        OverviewService.prototype.getPathToRows = function () {
            return this.tree.rootPath;
        };
        OverviewService.EmptyColumnTypeName = "Loading...";
        OverviewService.$inject = ['$rootScope', '$uibModal', '$q', 'gwi.ImportService', 'gwi.DataTypeService', '$location'];
        return OverviewService;
    })();
    gwi.OverviewService = OverviewService;
    gwi.app.service('gwi.OverviewService', OverviewService);
})(gwi || (gwi = {}));

/// <reference path="../services/overview.service.ts"/>
/// <reference path="../contracts/data.column.ts"/>
var gwi;
(function (gwi) {
    function isLeaf(value) {
        return !_.isArray(value) && !_.isObject(value);
    }
    function stringOf(value) {
        return "" + value;
    }
    ;
    function getRowItem(row, col) {
        return _.get(row, col);
    }
    var MainController = (function () {
        function MainController($scope, Overview) {
            this.$scope = $scope;
            this.Overview = Overview;
            this.setupScope();
        }
        MainController.prototype.setupScope = function () {
            this.Overview.importLatest();
            this.$scope.tree = this.Overview.tree;
            this.$scope.rows = [];
            this.$scope.columns = this.Overview.columns;
            this.$scope.parentChosen = false;
            this.$scope.parentNodeChoices = this.nodeChoices();
            this.$scope.chooseParentNode = this.chooseParentNode.bind(this);
            this.$scope.chooseNode = this.chooseNode.bind(this);
            this.$scope.removeColumn = this.removeColumn.bind(this);
            this.$scope.editColumn = this.editColumn.bind(this);
            this.$scope.exportCode = this.exportCode.bind(this);
            this.$scope.getRowItem = getRowItem;
            this.$scope.reset = this.reset.bind(this);
            // Scope listeners
            var processColumnSize = _.debounce(this.onColumnChange.bind(this), 30);
            this.$scope.$watchCollection('columns', processColumnSize);
            $(window).resize(processColumnSize);
            $('#table-scroller').scroll(processColumnSize);
        };
        MainController.prototype.onColumnChange = function () {
            var cols = $('#data-container tr:eq(0) td');
            $('#header-container').children().each(function (index) {
                $(this).width(function () {
                    return cols.eq(index).width() + (cols.length - 1 == index ? 0 : 1);
                });
            });
        };
        /**
         * Look through the tree for arrays.
         *
         * @return {array}
         */
        MainController.prototype.nodeChoices = function (tree, root) {
            var _this = this;
            if (root === void 0) { root = ""; }
            var map = function (value, key) {
                var name = root == "" ? key : root + '.' + key;
                if (_.isArray(value)) {
                    return name;
                }
                if (_.isObject(value) && value) {
                    return _this.nodeChoices(value, name);
                }
            };
            tree = tree || this.Overview.root;
            if (_.isArray(tree)) {
                this.setCurrentRoot("");
                return [];
            }
            return _.flatten(_.filter(_.map(tree, map)));
        };
        MainController.prototype.chooseParentNode = function (i) {
            var name = this.$scope.parentNodeChoices[i];
            this.setCurrentRoot(name);
        };
        MainController.prototype.setCurrentRoot = function (name) {
            this.$scope.parentChosen = name != "";
            this.Overview.setCurrentRoot(name);
            this.$scope.rows = this.Overview.current;
        };
        MainController.prototype.chooseNode = function ($event) {
            var nodeScope = angular.element($event.target).scope();
            if (!this.$scope.parentChosen || !nodeScope.$id || !isLeaf(nodeScope.value))
                return;
            var keys = [], currScope = nodeScope;
            // Figure out key by traversing up the Tree.
            while (currScope != this.$scope) {
                if (currScope.hasOwnProperty('key')) {
                    keys.unshift(currScope.key);
                }
                currScope = currScope.$parent;
            }
            // Remove the irrelevant keys
            keys.shift();
            var path = keys.join('.');
            if (path)
                this.Overview.addColumn(path);
        };
        MainController.prototype.removeColumn = function (key) {
            this.Overview.removeColumn(key);
        };
        MainController.prototype.editColumn = function (key) {
            this.Overview.editColumn(key);
        };
        MainController.prototype.exportCode = function () {
            this.Overview.exportCode();
        };
        MainController.prototype.reset = function () {
            this.setCurrentRoot("");
            this.$scope.parentChosen = false;
            this.Overview.resetColumns();
            this.$scope.parentNodeChoices = this.nodeChoices();
        };
        MainController.$inject = ['$scope', 'gwi.OverviewService'];
        return MainController;
    })();
    gwi.MainController = MainController;
    gwi.app.controller('gwi.MainController', MainController);
})(gwi || (gwi = {}));

/// <reference path="../services/dataType.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>
var gwi;
(function (gwi) {
    var ViewColumnModalController = (function () {
        function ViewColumnModalController($scope, Overview) {
            this.$scope = $scope;
            this.Overview = Overview;
            this.setupScope();
        }
        ViewColumnModalController.prototype.$applyDeferred = function () {
            _.defer(this.$scope.$apply.bind(this.$scope));
        };
        ViewColumnModalController.prototype.setupScope = function () {
            var _this = this;
            this.$scope.loading = true;
            this.$scope.types = this.Overview.allowedTypes();
            this.$scope.selectedTypeName = null;
            this.$scope.$watch('selectedTypeName', function (value) {
                var type = _.find(_this.$scope.types, 'name', value);
                var prev = _.extend(new Data.Type("", ""), _this.$scope.type);
                if (type && type.name != prev.name) {
                    _.extend(_this.$scope.type, type);
                    _this.$scope.type.nullable = prev.nullable;
                    _this.$applyDeferred();
                }
            });
            this.$scope.$watch('type.name', function (value) {
                _this.$scope.selectedTypeName = value;
                _this.$applyDeferred();
            });
            this.$scope.type = this.Overview.typeBeingEdited(function () {
                _this.$scope.loading = false;
                _this.$applyDeferred();
            });
        };
        ViewColumnModalController.$inject = ['$scope', 'gwi.OverviewService'];
        return ViewColumnModalController;
    })();
    gwi.app.controller('gwi.ViewColumnModalController', ViewColumnModalController);
})(gwi || (gwi = {}));

var gwi;
(function (gwi) {
    gwi.app.directive("fileInput", [function () {
            return {
                scope: {
                    fileInput: "="
                },
                link: function (scope, element, attributes) {
                    element.bind("change", function (changeEvent) {
                        scope.$apply(function () {
                            scope.fileInput = changeEvent.target.files[0];
                            // or all selected files:
                            // scope.fileread = changeEvent.target.files;
                        });
                    });
                }
            };
        }]);
})(gwi || (gwi = {}));

var gwi;
(function (gwi) {
    var Scroller = (function () {
        function Scroller(element, $scope, unlimitedVarName, limitedVarName, rowHeight) {
            this.i = 0;
            this.$scope = $scope;
            this.element = element;
            this.limitedVarName = limitedVarName;
            this.unlimitedVarName = unlimitedVarName;
            this.rowHeight = rowHeight;
        }
        Scroller.prototype.data = function () {
            return this.$scope.$eval(this.unlimitedVarName);
        };
        Scroller.prototype.recalculate = function () {
            var _this = this;
            var data = this.data();
            if (!_.isArray(data))
                return;
            var currPos = this.element[0].scrollTop;
            var countRows = data.length;
            var paddedRows = 15;
            var countRowsInViewPort = 30; // TODO
            var containerHeight = 0; // TODO
            var heightPerRow = this.rowHeight;
            var height = countRows * heightPerRow;
            var diffPadding = start;
            var start = countRows * currPos / height;
            start = Math.max(start - paddedRows, 0);
            diffPadding = (start - Math.floor(start)) * heightPerRow;
            start = Math.floor(start);
            var topPadding = Math.max(currPos - paddedRows * heightPerRow, 0) - diffPadding;
            var end = start + countRowsInViewPort + paddedRows;
            _.defer(function () {
                _this.$scope[_this.limitedVarName] = data.slice(start, end);
                _this.element.children().eq(0).css({
                    'padding-top': topPadding + 'px',
                    'box-sizing': 'border-box',
                    'height': height + 'px',
                });
                _this.$scope.$apply();
            });
        };
        Scroller.prototype.binding = function () {
            return _.debounce(this.recalculate.bind(this), 25, {
                leading: false,
                trailing: true,
                maxWait: 50,
            });
        };
        return Scroller;
    })();
    function link($scope, element, attrs) {
        var _a = attrs.scrollLimit.split(' in '), limitedVarName = _a[0], unlimitedVarName = _a[1];
        var rowHeight = parseInt($scope.$eval(attrs.rowHeight));
        if (!limitedVarName
            || !unlimitedVarName
            || limitedVarName == unlimitedVarName) {
            console.error("Invalid syntax for scroll-limit: expected '<newVarName> in <oldVarName>'");
        }
        if (!rowHeight || isNaN(rowHeight)) {
            console.error("Expected row-height=\"<pixel count>\" attribute on scroll-limit");
        }
        var scroller = new Scroller(element, $scope, unlimitedVarName, limitedVarName, rowHeight);
        var recalculate = scroller.binding();
        $scope.$watch(unlimitedVarName, recalculate);
        element.on('scroll', recalculate);
    }
    gwi.app.directive('scrollLimit', [function () {
            return {
                restrict: 'A',
                priority: 1001,
                link: link.bind(this),
                scope: true,
            };
        }]);
})(gwi || (gwi = {}));

//# sourceMappingURL=app.js.map
