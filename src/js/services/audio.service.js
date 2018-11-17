const Promise = require('bluebird');
const AudioChannel = require('./audio_channel');

module.exports = [function () {
    let audioService = {};
    audioService.loadAudio = channels => {
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();

        return Promise.map(channels, channel => {
            return new Promise(function(resolve, reject) {
                let request = new XMLHttpRequest();
                request.open('GET', channel.musicPath, true);
                request.responseType = 'arraybuffer';

                request.onload = function() {
                    audioContext.decodeAudioData(request.response, function(buffer) {
                        resolve(new AudioChannel(channel.name, buffer, audioContext));
                    }, function() { reject(channel.musicPath); });
                };

                request.send();
            });
        });
    };
    return audioService;
}];