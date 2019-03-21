const config = require('../../config');

module.exports = class AudioChannel {
    constructor(buffer, audioContext) {
        this.buffer = buffer;
        this.audioContext = audioContext;
        this.sourceNode = null;
        this.gainNode = null;
        this.scriptProcessor = null;
        this.muted = true;
        this.audible = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentTime = 0;
        this.state = 'stopped';
    }

    play(currentTime = 0) {
        this.state = 'playing';
        if (this.sourceNode) {
            this.startTime += (Date.now() - this.pauseTime);
            this.audioContext.resume();
            return;
        }

        this.gainNode = this.audioContext.createGain();
        this.scriptProcessor = this.audioContext.createScriptProcessor(0, 1, 1);
        this.scriptProcessor.onaudioprocess = e => {
            if (this.state !== 'playing')
                return;

            let int = e.inputBuffer.getChannelData(0);

            let max = 0;
            for (let i = 0; i < int.length; i++) {
                max = int[i] > max ? int[i] : max;
            }

            let db = 20 * Math.log(Math.max(max, Math.pow(10, -72 / 20))) / Math.LN10;
            this.audible = db > -40;

            this.currentTime = (Date.now() - this.startTime) / 1000;
            if (this.muted && this.audible && !this.autoPlayed && this.currentTime <= config.autoplaySeconds) {
                this.setMuted(false);
                this.autoPlayed = true;
            }
        };

        this.sourceNode = this.audioContext.createBufferSource();

        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.sourceNode.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);

        this.sourceNode.buffer = this.buffer;
        this.sourceNode.onended = () => this._onEnded();
        this.setMuted(this.muted);

        this.sourceNode.start(0, currentTime);
        this.startTime = Date.now() - (currentTime * 1000);
    }

    pause() {
        this.state = 'paused';
        this.audioContext.suspend();
        this.audible = false;
        this.pauseTime = Date.now();
    }

    stop() {
        this.state = 'stopped';
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode.stop();
        }

        this.sourceNode = null;

        this.scriptProcessor && this.scriptProcessor.disconnect();
        this.scriptProcessor = null;

        this.gainNode && this.gainNode.disconnect();
        this.gainNode = null;
    }

    setMuted(bool) {
        this.muted = bool;

        if (this.gainNode && this.gainNode.gain)
            this.gainNode.gain.value = this.muted ? 0 : 1;
    }

    setCurrentTime(currentTime) {
        this.stop();
        this.play(currentTime);
    }

    _onEnded() {
        this.stop();
        this.currentTime = 0;
        this.onEnded && this.onEnded();
    }
};