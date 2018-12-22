module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    $scope.audioState = 'loading';
    $scope.curtainLoaded = false;

    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        return { name: instrumentName, musicPath: `/src/music/${instrumentName}.mp3` };
    });

    audioService.onProgress = percent => {
        $scope.curtainTop = (970 / 100 * percent) * -1;
        $scope.$apply();
    };

    let curtainImage = new Image();
    curtainImage.src = '/distsrc/img/curtain.png';
    curtainImage.onload = () => {
        $scope.curtainLoaded = true;
        let loadedCount = 0;
        $scope.instruments.forEach(instrument => {
            let tempImage = new Image();
            tempImage.src = `/distsrc/img/${instrument.name}.png`;
            tempImage.onload = () => {
                if(++loadedCount >= $scope.instruments.length) {
                    audioService.loadAudio($scope.instruments).then(() => {
                        instrument.audioChannel.onEnded = () => $scope.audioState = 'paused';
                        $scope.play();
                        $interval(() => {
                        }, 1);
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
        $scope.instruments.forEach(instrument => instrument.audioChannel.setCurrentTime(currentTime));
    };
}];