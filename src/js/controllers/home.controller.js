const $ = require('jquery');
const _ = require('lodash');

module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    $scope.audioState = 'loading';
    $scope.imagesLoaded = false;

    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        let musicPath = `/maestro/dist/src/music/${instrumentName}.mp3`;
        if (process.env.ENV === 'dev')
            musicPath = musicPath.replace('/maestro/dist', '');

        return { name: instrumentName, musicPath: musicPath };
    });

    loadImages().then(() => {
        $scope.imagesLoaded = true;
        audioService.loadAudio($scope.instruments).then(() => {
            $scope.instruments[0].audioChannel.onEnded = () => $scope.audioState = 'paused';
            $scope.audioState = 'waitingUser';
        });
    });

    $scope.percentLoaded = 0;
    audioService.onProgress = percentLoaded => {
        $scope.percentLoaded = percentLoaded;
        if (percentLoaded >= 100) {
            $scope.audioState = 'waitingUser';
        }

        $scope.$apply();
    };

    $scope.start = () => {
        if ($scope.audioState !== 'waitingUser')
            return;

        let $curtain = $('#curtain');
        $curtain.animate({ top: $curtain.height() * -1 }, 3500, () => {
            $curtain.hide();
            $scope.play();
        });
        $interval(() => {
        }, 1);
    };

    $scope.toggleMuted = instrument => instrument.audioChannel.setMuted(!instrument.audioChannel.muted);
    $scope.play = () => {
        $scope.instruments.forEach(instrument => instrument.audioChannel.play());
        $scope.audioState = 'playing';
    };

    $scope.pause = () => {
        $scope.instruments.forEach(instrument => instrument.audioChannel.pause());
        $scope.audioState = 'paused';
    };

    $scope.togglePlayPause = () => $scope.audioState === 'playing' ? $scope.pause() : $scope.play();
    $scope.onTimelineChange = percent => {
        let currentTime = $scope.instruments[0].audioChannel.buffer.duration / 100 * percent;
        $scope.instruments.forEach(instrument => {
            instrument.audioChannel.setCurrentTime(currentTime);
            if ($scope.audioState !== 'playing')
                instrument.audioChannel.play();
        });
        $scope.audioState = 'playing';
    };
}];

function loadImages() {
    let $elements = $('#content, #curtain, .play-button, .pause-button, .timeline, .progress, .instrument');
    let urls = $elements.map(function() {
        let url = $(this).css('background-image');
        return _.trimEnd(_.trimStart(url, 'url("'), '")');
    }).get();
    let moreUrls = $('img').map(function() {
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