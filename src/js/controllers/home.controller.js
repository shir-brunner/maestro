module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    $scope.audioState = 'loading';

    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        return { name: instrumentName, musicPath: `/src/music/${instrumentName}.mp3` };
    });

    audioService.loadAudio($scope.instruments).then(() => {
        $scope.play();
        $interval(() => {
        }, 1);
    });

    $scope.toggleMuted = instrument => instrument.audioChannel.setMuted(!instrument.audioChannel.muted);
    $scope.play = () => {
        $scope.instruments.forEach(x => x.audioChannel.play());
        $scope.audioState = 'playing';
    };

    $scope.pause = () => {
        $scope.instruments.forEach(x => x.audioChannel.pause());
        $scope.audioState = 'paused';
    };

    $scope.togglePlayPause = () => $scope.audioState === 'playing' ? $scope.pause() : $scope.play();
}];