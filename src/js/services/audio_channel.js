const VolumeMeter = require('volume-meter');
const config = require('../../config');

module.exports = class AudioChannel {
    constructor(buffer, audioContext) {
        this.buffer = buffer;
        this.audioContext = audioContext;
        this.gainNode = audioContext.createGain();
        this.gainNode.connect(audioContext.destination);

        this.muted = true;
        this.audible = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentTime = 0;
        this.state = 'stopped';
        this.volumeMeter = new VolumeMeter(audioContext, { tweenIn: 2, tweenOut: 6 }, volume => {
            if (this.state !== 'playing')
                return;

            this.audible = volume > 1;

            this.currentTime = (Date.now() - this.startTime) / 1000;
            if (this.muted && this.audible && !this.autoPlayed && this.currentTime <= config.autoplaySeconds) {
                this.setMuted(false);
                this.autoPlayed = true;
            }
        });
    }

    play(offset = 0) {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.startTime += (Date.now() - this.pauseTime);
            this.audioContext.resume();
            return;
        }

        this.state = 'playing';

        this.bufferSource = this.audioContext.createBufferSource();
        this.bufferSource.buffer = this.buffer;
        this.bufferSource.connect(this.gainNode);
        this.bufferSource.connect(this.volumeMeter);
        this.bufferSource.onended = () => this._onEnded();
        this.bufferSource.start(0, offset);
        this.startTime = Date.now() - (offset * 1000);
    }

    setCurrentTime(currentTime) {
        if (this.bufferSource) {
            this.bufferSource.onended = null; // very important as it wil be called once STOP is called
            // TODO: probably need to clean up old bufferSource here, not sure how
            this.bufferSource.stop();
        }

        this.play(currentTime);
        this.currentTime = currentTime;
    }

    pause() {
        this.state = 'paused';
        this.audioContext.suspend();
        this.audible = false;
        this.pauseTime = Date.now();
    }

    stop() {
        this.state = 'stopped';

        if (this.bufferSource) {
            this.bufferSource.disconnect();
            this.bufferSource.stop();
        }

        this.bufferSource = null;
    }

    setMuted(bool) {
        this.muted = bool;

        if (this.gainNode && this.gainNode.gain)
            this.gainNode.gain.value = this.muted ? 0 : 1;
    }

    _onEnded() {
        this.stop();
        this.currentTime = 0;
        this.onEnded && this.onEnded();
    }
};