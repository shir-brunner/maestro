const config = require('../../config');

module.exports = class AudioChannel {
    constructor(buffer, audioContext) {
        this.buffer = buffer;
        this.audioContext = audioContext;
        this.sourceNode = null;
        this.gainNode = null;
        this.analyser = null;
        this.muted = true;
        this.audible = false;
        this.startTime = 0;
        this.pauseTime = 0;
    }

    play() {
        if (this.sourceNode) {
            this.startTime += (Date.now() - this.pauseTime);
            this.audioContext.resume();
            return;
        }

        this.gainNode = this.audioContext.createGain();
        this.analyser = this.audioContext.createScriptProcessor(0, 1, 1);
        this.analyser.onaudioprocess = e => {
            let int = e.inputBuffer.getChannelData(0);

            let max = 0;

            for (let i = 0; i < int.length; i++) {
                max = int[i] > max ? int[i] : max;
            }

            let db = 20 * Math.log(Math.max(max, Math.pow(10, -72 / 20))) / Math.LN10;
            this.audible = db > -40;

            this.currentTime = (Date.now() - this.startTime) / 1000;
            if (this.muted && this.audible && !this.autoPlayed && this.currentTime < config.autoplaySeconds) {
                this.setMuted(false);
                this.autoPlayed = true;
            }
        };

        this.sourceNode = this.audioContext.createBufferSource();

        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.sourceNode.buffer = this.buffer;
        this.sourceNode.onended = () => {};
        this.setMuted(this.muted);

        this.sourceNode.start();
        this.startTime = Date.now();
    }

    pause() {
        this.audioContext.suspend();
        this.audible = false;
        this.pauseTime = Date.now();
    }

    stop() {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode.stop(0);
            this.sourceNode = null;
        }
    }

    setMuted(bool) {
        this.muted = bool;

        if (this.gainNode && this.gainNode.gain)
            this.gainNode.gain.value = this.muted ? 0 : 1;
    }
}