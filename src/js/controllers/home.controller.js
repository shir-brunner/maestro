const Promise = require('bluebird');

module.exports = ['$scope', 'audioService', 'imageService', function ($scope, audioService, imageService) {
    $scope.loaded = false;
    let instruments = ['vocal1', 'vocal2', 'vocal3', 'acoustic_guitar', 'bass', 'drums', 'electric_guitar', 'strings', 'melodica'];
    let images = instruments.map(instrument => `/src/img/${instrument}.png`);
    let channels = instruments.map(instrument => {
        return { name: instrument, musicPath: `/src/music/${instrument}.mp3` };
    });

    imageService.loadImages(images).then(() => {
        audioService.loadAudio(channels).then(audioChannels => {
            audioChannels.forEach(x => x.play());
            $scope.loaded = true;
            $scope.$apply();
        });
    });
}];