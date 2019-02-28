const $ = require('jquery');
module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    $scope.audioState = 'loading';
    $scope.curtainLoaded = false;

    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        return { name: instrumentName, musicPath: `/src/music/${instrumentName}.mp3` };
    });

    let $curtain = $('#curtain');
    let counter = 0;
    audioService.onProgress = percent => {
        if (percent < 40 && counter === 0) {
            counter = 1;
            $curtain.animate({ top: -200 }, 1000);
        } else if(percent < 95 && counter === 1) {
            counter = 2;
            $curtain.animate({ top: -500 }, 1000);
        }
    };

    let curtainImage = new Image();
    curtainImage.src = '/src/img/curtain.png';
    curtainImage.onload = () => {
        $scope.curtainLoaded = true;
        $scope.$apply();
        let loadedCount = 0;
        $scope.instruments.forEach(instrument => {
            let tempImage = new Image();
            tempImage.src = `/src/img/${instrument.name}.png`;
            tempImage.onload = () => {
                if (++loadedCount >= $scope.instruments.length) {
                    audioService.loadAudio($scope.instruments).then(() => {
                        instrument.audioChannel.onEnded = () => $scope.audioState = 'paused';
                        $curtain.animate({ top: $curtain.height() * -1 }, 1000);
                        $interval(() => {}, 1);
                        $scope.play();
                    });
                }
            };
        });
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