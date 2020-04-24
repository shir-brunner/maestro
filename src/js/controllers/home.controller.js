const $ = require('jquery');
const _ = require('lodash');
const $window = $(window).on('resize', onWindowResize);
const $content = $('#content').hide();

module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    $scope.audioState = 'loading';
    $scope.currentTimeFormatted = '00:00';

    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        let musicPath = `/maestro/dist/src/music/${instrumentName}.mp3`;
        if (process.env.ENV === 'dev')
            musicPath = musicPath.replace('/maestro/dist', '');

        return { name: instrumentName, musicPath: musicPath };
    });

    loadImages().then(() => {
        $content.show();
        onWindowResize();
        audioService.loadAudio($scope.instruments).then(() => {
            $scope.instruments[0].audioChannel.onEnded = () => $scope.audioState = 'paused';
            $scope.audioState = 'waitingUser';
            $scope.$apply();
        });
    });

    $scope.percentLoaded = 0;
    audioService.onProgress = percentLoaded => {
        $scope.percentLoaded = percentLoaded;
        $scope.$apply();
    };

    let curtainAnimating = false;
    $scope.start = () => {
        if ($scope.audioState !== 'waitingUser' || curtainAnimating)
            return;

        curtainAnimating = true;
        let $curtain = $('#curtain');
        $('#fake-play-button').addClass('pause-button').removeClass('play-button');
        $curtain.animate({ top: $curtain.height() * -1 }, 3500, async () => {
            $curtain.hide();
            await $scope.instruments[0].audioChannel.audioContext.resume();
            $scope.play();
        });
        $interval(() => {
            if ($scope.instruments[0].audioChannel)
                $scope.currentTimeFormatted = formatCurrentTime($scope.audioState, $scope.instruments[0].audioChannel.currentTime);
        }, 1);
    };

    $scope.toggleMuted = instrument => instrument.audioChannel.setMuted(!instrument.audioChannel.muted);
    $scope.play = () => {
        if ($scope.audioState === 'playing')
            return;

        $scope.instruments.forEach(instrument => instrument.audioChannel.play());
        $scope.audioState = 'playing';
    };

    $scope.pause = () => {
        if ($scope.audioState === 'paused')
            return;

        $scope.instruments.forEach(instrument => instrument.audioChannel.pause());
        $scope.audioState = 'paused';
    };

    $scope.togglePlayPause = () => $scope.audioState === 'playing' ? $scope.pause() : $scope.play();
    $scope.onTimelineChange = percent => {
        if ($scope.audioState === 'loading' || $scope.audioState === 'waitingUser')
            return;

        let currentTime = $scope.instruments[0].audioChannel.buffer.duration / 100 * percent;
        $scope.instruments.forEach(instrument => {
            instrument.audioChannel.play(); // this is important because timeline mousedown set the state to PAUSED
            instrument.audioChannel.setCurrentTime(currentTime);
        });
        $scope.audioState = 'playing';

        $scope.currentTimeFormatted = formatCurrentTime($scope.audioState, currentTime);
        $scope.seekCurrentTime = null;
        $('#hover-time').hide();
    };

    $scope.onTimelineSeek = percent => {
        $scope.seekCurrentTime = formatCurrentTime($scope.audioState, $scope.instruments[0].audioChannel.buffer.duration / 100 * percent);
        setHoverTime($scope, percent);
    };

    $scope.onTimelineHover = percent => setHoverTime($scope, percent);
    $scope.onTimelineMouseLeave = () => $('#hover-time').hide();
}];

function formatCurrentTime(audioState, currentTime) {
    if (audioState === 'loading' || audioState === 'waitingUser' || currentTime <= 0)
        return '00:00';

    let seconds = Math.round(currentTime);
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return `${_.padStart(minutes, 2, '0')}:${_.padStart(seconds, 2, '0')}`;
}

function setHoverTime($scope, percent) {
    let currentTime = formatCurrentTime($scope.audioState, $scope.instruments[0].audioChannel.buffer.duration / 100 * percent);
    let $hoverTime = $('#hover-time');

    $hoverTime
        .html(currentTime)
        .css('left', 'calc(' + percent + '% - ' + ($hoverTime.width() / 2) + 'px)')
        .show();
}

function loadImages() {
    let $elements = $('#content, #curtain, .play-button, .pause-button, .timeline, .progress, .instrument, .marker');
    let urls = $elements.map(function () {
        let url = $(this).css('background-image');
        return _.trimEnd(_.trimStart(url, 'url("'), '")');
    }).get();
    let moreUrls = $('img').map(function () {
        return $(this).attr('src');
    }).get();
    urls.push(...moreUrls);
    return Promise.all(urls.map(url => loadImage(url)));
}

function loadImage(url) {
    return new Promise(resolve => {
        let image = new Image();
        image.src = url;
        image.onload = () => resolve();
    });
}

function onWindowResize() {
    let ratio = 1920 / 970;
    let $content = $('#content');
    let windowWidth = $window.width();
    let windowHeight = $window.height();

    $content.css('height', $window.width() / ratio);
    let contentHeight = $content.height();
    if (contentHeight > windowHeight) { // landscape
        contentHeight = windowHeight;
        $content.css('height', contentHeight);
        $content.css('width', contentHeight * ratio);
    } else { // portrait
        $content.css('width', '100%');
    }

    $content.css('margin-top', (windowHeight - contentHeight) / 2);
    $content.css('margin-left', (windowWidth - $content.width()) / 2);

    let contentWidth = $content.width();
    let scaleX = contentWidth / 1920;
    let scaleY = contentHeight / 970;

    $('.instrument-container').each(function () {
        fixPosition($(this), scaleX, scaleY);
    });

    fixPosition($('#controls'), scaleX, scaleY);
}

function fixPosition($element, scaleX, scaleY) {
    let originalX = $element.data('originalX');
    if (!originalX) {
        originalX = parseInt($element.css('left'));
        $element.data('originalX', originalX);
    }
    let originalY = $element.data('originalY');
    if (!originalY) {
        originalY = parseInt($element.css('top'));
        $element.data('originalY', originalY);
    }

    $element.css({
        'transform': `scale(${scaleX}, ${scaleY})`,
        'left': (originalX * scaleX) + 'px',
        'top': (originalY * scaleY) + 'px'
    });
}