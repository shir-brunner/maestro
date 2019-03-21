const $ = require('jquery');

module.exports = function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            let $timeline = $(element);
            let $progress = $timeline.find('.progress');
            let dragging = false;

            $timeline.on('mousedown', e => {
                dragging = true;
                scope.pause();
                $progress.css('width', e.offsetX + 'px');
            }).on('mouseup', e => {
                if(!dragging)
                    return;

                scope.onTimelineChange(e.offsetX / $timeline.width() * 100);
                dragging = false;
            });

            $(document).on('mousemove', e => {
                if (!dragging)
                    return;

                $progress.css('width', getProgressWidthPercent($progress, $timeline, e) + '%');
            }).on('mouseup', e => {
                if (!dragging)
                    return;

                let percent = getProgressWidthPercent($progress, $timeline, e);
                $progress.css('width', percent + '%');

                scope.onTimelineChange(percent);
                dragging = false;
            });
        }
    };
};

function getProgressWidthPercent($progress, $timeline, e) {
    let x = e.clientX - $timeline.position().left;
    let width = $timeline[0].getBoundingClientRect().width;
    let percent = Math.min((x / width) * 100, 100);
    return percent < 0 ? 0 : percent;
}