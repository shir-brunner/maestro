const $ = require('jquery');
module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    $scope.audioState = 'loading';

    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        return { name: instrumentName, musicPath: `/src/music/${instrumentName}.mp3` };
    });

    let $curtain = $('#curtain');

    audioService.loadAudio($scope.instruments).then(() => {
        $scope.instruments[0].audioChannel.onEnded = () => $scope.audioState = 'paused';
        $scope.audioState = 'waitingUser';
    });

    $scope.percentLoaded = 0;
    audioService.onProgress = percentLoaded => {
        $scope.percentLoaded = percentLoaded;
        if(percentLoaded === 100) {
            $scope.audioState = 'waitingUser';
        }

        $scope.$apply();
    };

    $scope.start = () => {
        if($scope.audioState !== 'waitingUser')
            return;

        $curtain.animate({ top: $curtain.height() * -1 }, 3500, () => $scope.play());
        $interval(() => {}, 1);
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
            if($scope.audioState !== 'playing')
                instrument.audioChannel.play();
        });
        $scope.audioState = 'playing';
    };
}];