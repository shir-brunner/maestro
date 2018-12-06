const $ = require('jquery');

module.exports = function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            let $timeline = $(element);
            $timeline.on('click', e => scope.onTimelineChange(e.offsetX / $timeline.width() * 100));
        }
    };
};