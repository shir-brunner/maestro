module.exports = class AudioChannel {
    constructor(buffer, audioContext) {
        this.buffer = buffer;
        this.audioContext = audioContext;
        this.sourceNode = null;
        this.gainNode = null;
        this.analyser = null;
        this.isMuted = false;
        this.audible = false;
    }

    play() {
        let offset = this.pausedAt;
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
        };

        this.sourceNode = this.audioContext.createBufferSource();

        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.sourceNode.buffer = this.buffer;
        this.sourceNode.start(0, 1);

        this.startedAt = this.audioContext.currentTime - offset;

        this.sourceNode.onended = () => {};

        this.setIsMuted(this.isMuted);
    }

    pause() {
        let elapsed = this.audioContext.currentTime - this.startedAt;
        this.stop();
        this.pausedAt = elapsed;
    }

    stop() {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode.stop(0);
            this.sourceNode = null;
        }

        this.pausedAt = 0;
        this.startedAt = 0;
        this.isPlaying = false;
    }

    setIsMuted(bool) {
        this.isMuted = bool;

        if (this.gainNode && this.gainNode.gain) {
            this.gainNode.gain.value = this.isMuted ? 0 : 1;
        }
    }
}