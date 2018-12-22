const Promise = require('bluebird');
const AudioChannel = require('./audio_channel');

module.exports = [function () {
    let audioService = {};
    audioService.loadAudio = instruments => {
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();

        return Promise.map(instruments, instrument => {
            return new Promise(function(resolve, reject) {
                let request = new XMLHttpRequest();
                request.open('GET', instrument.musicPath, true);
                request.responseType = 'arraybuffer';

                request.onload = function() {
                    let st = Date.now();
                    audioContext.decodeAudioData(request.response, function(buffer) {
                        alert(Date.now() - st);
                        instrument.audioChannel = new AudioChannel(buffer, audioContext);
                        resolve();
                    }, function() { reject(instrument.musicPath); });
                };

                request.onprogress = progress => {
                    instrument.percentLoaded = progress.loaded / progress.total * 100;
                    audioService.onProgress && audioService.onProgress(instruments.reduce((percent, instrument) => {
                        return percent + ((instrument.percentLoaded || 0) / instruments.length);
                    }, 0));
                };

                request.send();
            });
        });
    };
    return audioService;
}];