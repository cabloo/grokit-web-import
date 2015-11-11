/// <reference path="../services/import.service.ts"/>

interface Tree {
    root: {};
    current: {};
    view: {};
}

interface NodeScope extends ng.IScope {
    key: string,
    value: any
}

interface PageScope extends ng.IScope {
    tree: Tree,
    rows: Array<Object>,
    columns: Array<String>,
    parentChosen: Boolean,
    chooseNode: Function,
    chooseParentNode: Function,
    removeColumn: Function,
    editColumn: Function,
    exportCode: Function,
    parentNodeChoices: Array<string>,
    getRowItem: Function
}

interface NodeClickEvent extends ng.IAngularEvent {
    target: HTMLScriptElement
}

interface PossibleNodeScope extends ng.IScope {
    key?: string
}

interface ExportModalScope extends ng.IScope {
    code: string
}

function isLeaf(value: any) {
    return !_.isArray(value) && !_.isObject(value)
}

function stringOf(value: any) {
    return "" + value;
};

function map(value: any, key: string) {
    var hasChildren = _.isArray(value) || _.isObject(value);
    return {
        data: {
            title: key + ": " + stringOf(value)
        },
        attr: {

        },
        children: hasChildren ? _.map(value, map) : []
    };
};

function getRowItem(row, col) {
    return _.get(row, col);
}

module gwi {
    class MainController {
        $scope: PageScope;
        $modal: {
            open: Function
        };
        Import: ImportService;

        get tree(): Tree {
            return this.$scope.tree;
        }

        set root(tree: Object) {
            this.tree.root = tree;
            this.tree.current = tree;
        }

        get root(): Object {
            return this.tree.root;
        }

        set current(val: Object) {
            this.tree.current = val;
            this.tree.view = this.wrap(this.tree.current);
            this.$scope.rows = _.isArray(val) ? <Array<Object>>val : [];
        }

        get current(): Object {
            return this.tree.current;
        }

        get columns(): Array<String> {
            return this.$scope.columns;
        }

        static $inject = ['$scope', '$uibModal', 'gwi.ImportService'];
        constructor($scope: PageScope, $modal, Import: ImportService) {
            this.$modal = $modal;
            this.$scope = $scope;
            this.Import = Import;

            this.setupScope();
        }

        setupScope() {
            this.$scope.tree = {
                root: {},
                current: {},
                view: null
            };
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
        }

        /**
         * Look through the tree for arrays.
         *
         * @return {array}
         */
        nodeChoices(tree?, root = "") {
            var map = (value: any, key: string) => {
                var name = root == "" ? key : root + '.' + key;

                if (_.isArray(value)) {
                    return name;
                }

                if (_.isObject(value) && value) {
                    return this.nodeChoices(value, name);
                }
            };

            return _.flatten(_.filter(_.map(tree || this.root, map)));
        }

        chooseParentNode(i: number) {
            var name = this.$scope.parentNodeChoices[i];
            this.$scope.parentChosen = true;

            this.current = _.get(this.root, name);
        }

        chooseNode($event: NodeClickEvent) {
            var nodeScope = <NodeScope>angular.element($event.target).scope();
            if (!this.$scope.parentChosen || !nodeScope.$id || !isLeaf(nodeScope.value))
                return;

            var keys = [],
                currScope: PossibleNodeScope = nodeScope;

            // Figure out key by traversing up the Tree.
            while (currScope != this.$scope) {
                if (currScope.hasOwnProperty('key')) {
                    keys.unshift(currScope.key);
                }
                currScope = currScope.$parent;
            }

            // Remove the first two keys (array and index of the array)
            keys.shift();
            keys.shift();

            var key = keys.join('.');
            if (_.indexOf(this.columns, key) != -1)
                return;

            this.columns.push(key);
        }

        removeColumn(key: number) {
            this.$scope.columns.splice(key, 1);
        }

        editColumn(key: number) {
            this.$modal.open({
                templateUrl: 'views/edit-column.html'
            });
        }

        exportCode() {
            var scope = <ExportModalScope>this.$scope.$new();
            scope.code = "Sample R Export code";
            this.$modal.open({
                templateUrl: 'views/modal-export-code.html',
                scope: scope
            });
        }

        wrap(obj: Object) {
            return map(obj, "");
        }
    }

    app.controller('gwi.MainController', MainController);
}
