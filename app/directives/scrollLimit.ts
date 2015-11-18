module gwi {
    app.directive('scrollLimit', [() => {
        return function($scope: ng.IScope, element, attrs) {
            var [limitedVarName, operation, unlimitedVarName] = attrs.scrollLimit.split(' ');
            if (operation != "in"
            || !limitedVarName
            || !unlimitedVarName
            || limitedVarName == unlimitedVarName
            ) {
                console.error("Invalid syntax for scroll-limit: expected '<newVarName> in <oldVarName>'");
            }
            var i = 0;

            var recalculate = _.throttle(function() {
                var currPos = element[0].scrollTop;
                var countRows = $scope[unlimitedVarName].length;
                var countRowsInViewPort = 30; // TODO
                var containerHeight = 0; // TODO
                var heightPerRow = 37; // TODO
                var height = countRows * heightPerRow;
                var start = Math.round(countRows * currPos/(height-containerHeight));
                var end = start + countRowsInViewPort;
                element.children().eq(0).css({
                    'padding-top': currPos + 'px',
                    'height':  height + 'px',
                    'box-sizing': 'border-box'
                });
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope[limitedVarName] = $scope[unlimitedVarName].slice(start, end);
                    });
                    i--;
                }, i++);
            }, 10);

            $scope.$watch(unlimitedVarName, recalculate);
            element.bind('scroll', recalculate);
        };
    }]);
}
