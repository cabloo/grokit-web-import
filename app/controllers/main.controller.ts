'use strict';

interface Tree {
    root: {};
    current: {};
    view: {};
}

interface NodeScope extends ng.IScope {
    key: string,
    value: any
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

module gwi {
    class MainController {
        $scope: {
            tree: Tree,
            $watch: Function,
            columns: Array<String>,
            parentChosen: Boolean,
            chooseNode: Function,
            chooseParentNode: Function,
            parentNodeChoices: Array<String>
        };
        parentNodeChoices = [];

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
        }

        get current(): Object {
            return this.tree.current;
        }

        get columns(): Array<String> {
            return this.$scope.columns;
        }

        static $inject = ['$scope'];
        constructor($scope) {
            this.$scope = $scope;
            this.$scope.tree = {
                root: {},
                current: {},
                view: null
            };
            this.$scope.columns = [];
            this.$scope.parentChosen = false;

            this.current = this.root = {
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

            this.$scope.parentNodeChoices = this.nodeChoices();
            this.$scope.chooseParentNode = this.chooseParentNode.bind(this);
            this.$scope.chooseNode = this.chooseParentNode.bind(this);
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
            var name = this.parentNodeChoices[i];
            this.$scope.parentChosen = true;

            this.current = _.get(this.root, name);
        }

        chooseNode($event) {
            var scope = <NodeScope>{};
            _.extend(scope, angular.element($event.target).scope());
            var isLeaf = !_.isArray(scope.value) && !_.isObject(scope.value);
            if (!this.$scope.parentChosen || !scope.$id || !isLeaf) {
                return;
            }

            this.columns.push(scope.key);
        }

        wrap(obj: Object) {
            return map(obj, "");
        }
    }

    app.controller('gwi.MainController', MainController);
}
