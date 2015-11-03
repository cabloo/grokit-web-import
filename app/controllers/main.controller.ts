interface Tree {
    root: {};
    current: {};
    view: {};
}

module gwi {
    'use strict';

    class MainController {
        $scope: { tree: Tree, $watch: Function, parentChosen: Boolean };
        parentNodeChoices = [];
        columns = [];

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

        static $inject = ['$scope'];
        constructor($scope) {
            this.$scope = $scope;
            this.$scope.tree = {
                root: {},
                current: {},
                view: null
            };
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

            this.$scope.$watch('tree.view', (val) => {
                console.log(val);
            });

            this.parentNodeChoices = this.nodeChoices();
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
            var scope = angular.element($event.target).scope();
            console.log(scope);
        }

        wrap(obj: Object) {
            var stringOf = (value: any) => {
                return "" + value;
            };

            var map = (value: any, key: string) => {
                return {
                    data: {
                        title: key + stringOf(value)
                    },
                    attr: {

                    },
                    children: _.isArray(value) || _.isObject(value) ? _.map(value, map) : []
                };
            };

            return map(obj, "");
        }
    }

    app.controller('gwi.MainController', MainController);
}
