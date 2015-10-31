module gwi {
    'use strict';

    class MainController {
        tree = {
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

        parentNode = null;
        parentNodeChoices = [];
        columns = [];

        static $inject = [];
        constructor() {
            this.parentNodeChoices = this.nodeChoices();
        }

        /**
         * Look through the tree for arrays.
         *
         * @return {array}
         */
        nodeChoices(tree?, root = "") {
            tree = tree || this.tree;
            console.log(tree, root);
            var choices = [];

            choices = _.flatten(_.map(tree, (value, key: string) => {
                var name = root == "" ? key : root + '.' + key;

                if (_.isArray(value)) {
                    return name;
                }

                if (_.isObject(value) && value) {
                    return this.nodeChoices(value, name);
                }
            }));

            return choices;
        }
    }

    app.controller('gwi.MainController', MainController);
}
