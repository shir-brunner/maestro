module.exports = ['$scope', 'audioService', '$interval', function ($scope, audioService, $interval) {
    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    $scope.instruments = instruments.map(instrumentName => {
        return { name: instrumentName, musicPath: `/src/music/${instrumentName}.mp3` };
    });

    audioService.loadAudio($scope.instruments).then(() => {
        $scope.instruments.forEach(x => x.audioChannel.play());
        $interval(() => {}, 1);
    });
}];