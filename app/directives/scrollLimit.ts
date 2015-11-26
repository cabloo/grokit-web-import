module gwi {
    class Scroller {
        $scope: ng.IScope;
        i: number;
        element: any;
        limitedVarName: string;
        unlimitedVarName: string;

        constructor(element, $scope: ng.IScope, unlimitedVarName, limitedVarName) {
            this.i = 0;
            this.$scope = $scope;
            this.element = element;
            this.limitedVarName = limitedVarName;
            this.unlimitedVarName = unlimitedVarName;
        }

        data() {
            return this.$scope.$eval(this.unlimitedVarName);
        }

        recalculate() {
            var data = this.data();
            if (!_.isArray(data))
                return;

            var currPos = this.element[0].scrollTop;
            var countRows = data.length;
            var countRowsInViewPort = 30; // TODO
            var containerHeight = 0; // TODO
            var heightPerRow = 37; // TODO
            var height = countRows * heightPerRow;
            var start = Math.round(countRows * currPos/(height-containerHeight));
            var end = start + countRowsInViewPort;
            this.element.children().eq(0).css({
                'padding-top': currPos + 'px',
                'box-sizing': 'border-box',
                'height':  height + 'px',
            });
            setTimeout(() => {
                this.$scope.$apply(() => {
                    this.$scope[this.limitedVarName] = data.slice(start, end);
                });
                this.i--;
            }, this.i++);
        }

        binding() {
            return this.recalculate.bind(this);
        }
    }

    function link($scope: ng.IScope, element, attrs) {
        var [limitedVarName, unlimitedVarName] = attrs.scrollLimit.split(' in ');
        if (!limitedVarName
        ||  !unlimitedVarName
        ||  limitedVarName == unlimitedVarName
        ) {
            console.error("Invalid syntax for scroll-limit: expected '<newVarName> in <oldVarName>'");
        }
        var scroller = new Scroller(element, $scope, unlimitedVarName, limitedVarName);
        var recalculate = scroller.binding();
        $scope.$watch(unlimitedVarName, recalculate);
        element.on('scroll', recalculate);
    }

    app.directive('scrollLimit', [function() {
        return {
            restrict: 'A',
            priority: 1001,
            link: link,
            scope: true,
        };
    }]);
}
