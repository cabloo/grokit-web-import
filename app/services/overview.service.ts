/// <reference path="../services/import.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>

module gwi {
    interface Modal {
        open: Function
    }

    class Tree {
        _root: Object;
        _curr: Array<Object>;

        get current(): Array<Object> {
            return this._curr;
        }

        set root(tree: Object) {
            this._root = tree;
            this._curr = _.isArray(this._root) ? <Array<Object>>this._root : [];
        }

        get root(): Object {
            return this._root;
        }

        constructor(_root: Object) {
            this._root = _root;
        }

        setCurrentRoot(name: string) {
            this._curr = <Array<Object>>
                (name == "" ? this._root : _.get(this._root, name));
        }
    }

    export class OverviewService {
        _tree: Tree;
        $scope: ng.IScope;
        $modal: Modal;
        Import: gwi.ImportService;
        DataType: gwi.DataTypeService;
        types: {
            [xpath: string]: Data.Type;
        };
        editing: string;

        get root(): Object {
            return this._tree.root;
        }

        get current(): Array<Object> {
            return this._tree.current;
        }

        get tree(): Tree {
            return this._tree;
        }

        static $inject = ['$rootScope', '$uibModal', 'gwi.ImportService', 'gwi.DataTypeService'];
        constructor($scope: ng.IScope, $modal: Modal, Import: gwi.ImportService, DataType: gwi.DataTypeService) {
            this.$scope = $scope;
            this.$modal = $modal;
            this.Import = Import;
            this.DataType = DataType;
            this.editing = "";
            this.types = {};
            this.importLatest();
        }

        importLatest() {
            this._tree = new Tree(this.Import.object);
        }

        setCurrentRoot(name: string) {
            this.tree.setCurrentRoot(name);
        }

        editColumn(val: string) {
            this.editing = val;
            this.$modal.open({
                controller: 'gwi.ViewColumnModalController',
                templateUrl: 'views/edit-column.html',
            });
        }

        exportCode() {
            this.$modal.open({
                controller: 'gwi.ExportModalController',
                templateUrl: 'views/modal-export-code.html',
            });
        }

        colBeingEdited(): string {
            return this.editing;
        }

        allowedTypes(): Array<Data.Type> {
            return this.DataType.allowedTypes();
        }

        typeBeingEdited(cb?: Function): Data.Type {
            var col = this.colBeingEdited();

            if (this.types.hasOwnProperty(col)) {
                _.defer(cb, this.types[col]);
                return this.types[col];
            }

            var type = this.types[col] = new Data.Type("Loading...", "Loading");
            setTimeout(() => {
                cb(_.extend(type, this.DataType.getTypes(this.current, [col])[0]));
            }, 50);
            return type;
        }
    }

    app.service('gwi.OverviewService', OverviewService);
}
