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
        this.autoMuted = false;
    }

    play() {
        if(this.sourceNode) {
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

            if(this.audioContext.currentTime <= config.autoplaySeconds && this.muted && this.audible && !this.autoMuted) {
                this.setMuted(false);
                this.autoMuted = true;
            }
        };

        this.sourceNode = this.audioContext.createBufferSource();

        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.sourceNode.buffer = this.buffer;
        this.sourceNode.start(0, 1);

        this.sourceNode.onended = () => {};
        this.setMuted(this.muted);
    }

    pause() {
        this.audioContext.suspend();
        this.audible = false;
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