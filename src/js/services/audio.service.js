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
                    audioContext.decodeAudioData(request.response, function(buffer) {
                        instrument.audioChannel = new AudioChannel(buffer, audioContext);
                        resolve();
                    }, function() { reject(instrument.musicPath); });
                };

                request.send();
            });
        });
    };
    return audioService;
}];