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
            })
                .when('/orders/:customerId', {
                controller: 'gwi.OrdersController',
                templateUrl: 'views/orders.html',
                controllerAs: 'page'
            });
        }]);
})(gwi || (gwi = {}));

function parseXml(xml, arrayTags) {
    var dom = null;
    if (window.hasOwnProperty("DOMParser")) {
        dom = (new DOMParser()).parseFromString(xml, "text/xml");
        console.log('tes1');
    }
    else if (window.hasOwnProperty("ActiveXObject")) {
        dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml)) {
            throw dom.parseError.reason + " " + dom.parseError.srcText;
        }
        console.log('tes2');
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
var gwi;
(function (gwi) {
    var ImportService = (function () {
        function ImportService($location, $rootScope, toastr) {
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
            this.cb = function () { };
        }
        ImportService.prototype.setupReader = function () {
            var _this = this;
            this.reader = new FileReader();
            this.reader.onload = function (onLoadEvent) {
                _this.view(onLoadEvent.target.result);
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
         * @param  {string} str
         *
         * @return {Object}
         *
         * @throws JSON Exception
         */
        ImportService.prototype.getJson = function (str) {
            return JSON.parse(str);
        };
        /**
         * Convert an XML string to a JS object.
         *
         * @param  {string} str
         *
         * @return {Object}
         *
         * @throws XML Exception
         */
        ImportService.prototype.getXml = function (str) {
            return parseXml(str);
        };
        /**
         * Convert a YAML string to a JS object.
         *
         * @param  {string} str
         *
         * @return {Object}
         *
         * @throws YAML Exception
         */
        ImportService.prototype.getYaml = function (str) {
            return jsyaml.load(str);
        };
        /**
         * Intelligently determine the type of the string given.
         *
         * @param  {string} str
         *
         * @return {int}
         */
        ImportService.prototype.getType = function (str) {
            switch (str[0]) {
                case '{':
                case '[':
                    return ImportService.JSON;
                case '<':
                    return ImportService.XML;
                default:
                    return ImportService.YAML;
            }
        };
        ImportService.prototype.view = function (str) {
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
            this.Import.view(this.$scope.pasted);
        };
        ImportController.$inject = ['$scope', 'gwi.ImportService'];
        return ImportController;
    })();
    gwi.app.controller('gwi.ImportController', ImportController);
})(gwi || (gwi = {}));

/// <reference path="../services/import.service.ts"/>
var Tree = (function () {
    function Tree() {
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
        },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.isArray = function () {
        return _.isArray(this._curr);
    };
    Tree.prototype.setCurrentRoot = function (name) {
        this._curr = name == "" ? this._root : _.get(this._root, name);
    };
    return Tree;
})();
function isLeaf(value) {
    return !_.isArray(value) && !_.isObject(value);
}
function stringOf(value) {
    return "" + value;
}
;
function map(value, key) {
    var hasChildren = _.isArray(value) || _.isObject(value);
    return {
        data: {
            title: key + ": " + stringOf(value)
        },
        attr: {},
        children: hasChildren ? _.map(value, map) : []
    };
}
;
function getRowItem(row, col) {
    return _.get(row, col);
}
var gwi;
(function (gwi) {
    var MainController = (function () {
        function MainController($scope, $modal, Import) {
            this.$modal = $modal;
            this.$scope = $scope;
            this.Import = Import;
            this.setupScope();
        }
        Object.defineProperty(MainController.prototype, "tree", {
            get: function () {
                return this.$scope.tree;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainController.prototype, "root", {
            get: function () {
                return this.tree.root;
            },
            set: function (tree) {
                this.tree.root = tree;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainController.prototype, "current", {
            get: function () {
                return this.tree.current;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainController.prototype, "columns", {
            get: function () {
                return this.$scope.columns;
            },
            enumerable: true,
            configurable: true
        });
        MainController.prototype.setupScope = function () {
            this.$scope.tree = new Tree;
            this.$scope.rows = [];
            this.$scope.columns = [];
            this.$scope.parentChosen = false;
            this.current = this.root = this.Import.object;
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
            tree = tree || this.root;
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
            this.$scope.parentChosen = true;
            this.tree.setCurrentRoot(name);
            this.$scope.rows = this.tree.isArray() ? this.current : [];
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
            var key = keys.join('.');
            if (_.indexOf(this.columns, key) != -1)
                return;
            this.$scope.columns.push(key);
        };
        MainController.prototype.removeColumn = function (key) {
            this.$scope.columns.splice(key, 1);
        };
        MainController.prototype.editColumn = function (key) {
            this.$modal.open({
                templateUrl: 'views/edit-column.html'
            });
        };
        MainController.prototype.exportCode = function () {
            var scope = this.$scope.$new();
            scope.code = "Sample R Export code";
            this.$modal.open({
                templateUrl: 'views/modal-export-code.html',
                scope: scope
            });
        };
        MainController.prototype.reset = function () {
            this.current = this.root;
            this.$scope.parentChosen = false;
            this.$scope.columns = [];
            this.$scope.parentNodeChoices = this.nodeChoices();
        };
        MainController.prototype.wrap = function (obj) {
            return map(obj, "");
        };
        MainController.$inject = ['$scope', '$uibModal', 'gwi.ImportService'];
        return MainController;
    })();
    gwi.app.controller('gwi.MainController', MainController);
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
        function Scroller(element, $scope, unlimitedVarName, limitedVarName) {
            this.i = 0;
            this.$scope = $scope;
            this.element = element;
            this.limitedVarName = limitedVarName;
            this.unlimitedVarName = unlimitedVarName;
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
            var countRowsInViewPort = 30; // TODO
            var containerHeight = 0; // TODO
            var heightPerRow = 37; // TODO
            var height = countRows * heightPerRow;
            var start = Math.round(countRows * currPos / (height - containerHeight));
            var end = start + countRowsInViewPort;
            this.element.children().eq(0).css({
                'padding-top': currPos + 'px',
                'box-sizing': 'border-box',
                'height': height + 'px',
            });
            setTimeout(function () {
                _this.$scope.$apply(function () {
                    _this.$scope[_this.limitedVarName] = data.slice(start, end);
                });
                _this.i--;
            }, this.i++);
        };
        Scroller.prototype.binding = function () {
            return this.recalculate.bind(this);
        };
        return Scroller;
    })();
    function link($scope, element, attrs) {
        var _a = attrs.scrollLimit.split(' in '), limitedVarName = _a[0], unlimitedVarName = _a[1];
        if (!limitedVarName
            || !unlimitedVarName
            || limitedVarName == unlimitedVarName) {
            console.error("Invalid syntax for scroll-limit: expected '<newVarName> in <oldVarName>'");
        }
        var scroller = new Scroller(element, $scope, unlimitedVarName, limitedVarName);
        var recalculate = scroller.binding();
        $scope.$watch(unlimitedVarName, recalculate);
        element.on('scroll', recalculate);
    }
    gwi.app.directive('scrollLimit', [function () {
            return {
                restrict: 'A',
                priority: 1001,
                link: link,
                scope: true,
            };
        }]);
})(gwi || (gwi = {}));

//# sourceMappingURL=app.js.map
