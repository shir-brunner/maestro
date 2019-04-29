const $ = require('jquery');

module.exports = function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            let $timeline = $(element);
            let $progress = $timeline.find('.progress');
            let $content = $('#content');
            let dragging = false;
            let lastTouchEvent = null;

            $timeline.on('touchstart', e => {
                dragging = true;
                scope.pause();
                let contentMarginLeft = parseInt($content.css('margin-left'));
                let offsetX = e.touches.item(0).clientX - $timeline.position().left - contentMarginLeft;
                let percent = offsetX / $timeline[0].getBoundingClientRect().width * 100;
                $progress.css('width', percent + '%');
                scope.onTimelineMove(percent);
                lastTouchEvent = e;
            }).on('touchend', e => {
                if (!dragging)
                    return;

                let percent = getProgressWidthPercent($progress, $timeline, lastTouchEvent, $content);
                $progress.css('width', percent + '%');

                scope.onTimelineChange(percent);
                dragging = false;
            });

            $timeline.on('mousedown', e => {
                dragging = true;
                scope.pause();
                $progress.css('width', e.offsetX + 'px');
                scope.onTimelineMove(e.offsetX / $timeline.width() * 100);
                lastTouchEvent = e;
            }).on('mouseup', e => {
                if (!dragging)
                    return;

                scope.onTimelineChange(e.offsetX / $timeline.width() * 100);
                dragging = false;
            });

            $(document).on('touchmove', e => {
                lastTouchEvent = e;
                if (!dragging)
                    return;

                let percent = getProgressWidthPercent($progress, $timeline, e, $content);
                $progress.css('width', percent + '%');
                scope.onTimelineMove(percent);
            });

            $(document).on('mousemove', e => {
                lastTouchEvent = e;
                if (!dragging)
                    return;

                let percent = getProgressWidthPercent($progress, $timeline, e, $content);
                $progress.css('width', percent + '%');
                scope.onTimelineMove(percent);
            }).on('mouseup', e => {
                if (!dragging)
                    return;

                let percent = getProgressWidthPercent($progress, $timeline, e, $content);
                $progress.css('width', percent + '%');

                scope.onTimelineChange(percent);
                dragging = false;
            });
        }
    };
};

function getProgressWidthPercent($progress, $timeline, e, $content) {
    let contentMarginLeft = parseInt($content.css('margin-left'));
    let clientX = _.get(e, 'touches[0].clientX', e.clientX);
    let x = clientX - $timeline.position().left - contentMarginLeft;
    let width = $timeline[0].getBoundingClientRect().width;
    let percent = Math.min((x / width) * 100, 100);
    return percent < 0 ? 0 : percent;
}