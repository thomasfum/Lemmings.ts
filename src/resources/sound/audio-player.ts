module Lemmings {
    export class AudioPlayer {

        private log = new LogHandler("AudioPlayer");

        public audioCtx: AudioContext;
        public source: AudioBufferSourceNode;
        public processor: ScriptProcessorNode;

        private SoundBuffer = null;
        private isSound: boolean = false;

        private opl: IOpl3;
        
        private soundImagePlayer: SoundImagePlayer;

        private samplesPerTick: number;


        /** is the sound playing at the moment */
        private isPlaying: boolean = false;


        public setEmulatorType(emulatorType: OplEmulatorType) {
            /// create opl interpreter
            if (emulatorType == OplEmulatorType.Dosbox) {
                this.opl = new DBOPL.OPL(this.audioCtx.sampleRate, 2);
            } 
            else {
                /// emulator only supports 49700 Hz
                this.opl = new Cozendey.OPL3();
            }
        }

        constructor(src: SoundImagePlayer, emulatorType: OplEmulatorType, isSound: boolean) {
            /// setup audio context
            this.audioCtx = new AudioContext();
            if (!this.audioCtx) {
                this.log.debug('Uanbel to create AudioContext!');
                return;
            }
            this.soundImagePlayer = src;
            this.isSound = isSound;

            this.log.debug("debug: " + this.soundImagePlayer.sampleRateFactor.toString(16));
            this.log.debug("Sound image sample rate factor: "+ this.soundImagePlayer.sampleRateFactor + " --> "+ this.soundImagePlayer.getSamplingInterval());
            this.log.debug('Audio sample rate ' + this.audioCtx.sampleRate);
            this.samplesPerTick = Math.round(this.audioCtx.sampleRate / (this.soundImagePlayer.getSamplingInterval()));
            if (this.isSound == false)//music
            {
                this.source = this.audioCtx.createBufferSource();
                this.processor = this.audioCtx.createScriptProcessor(8192, 2, 2);
                // When the buffer source stops playing, disconnect everything
                this.source.onended = () => {
                    console.log('source.onended()');
                    this.source.disconnect(this.processor);
                    this.processor.disconnect(this.audioCtx.destination);
                    this.processor = null;
                    this.source = null;
                }
            }
            this.setEmulatorType(emulatorType);


            if (this.isSound == true)//sound
            {
                //for sound store in a buffer what to play
                let a: AudioProcessingEvent;
                let time = null;
                let input: AudioBuffer;
                let output: AudioBuffer;
                input = new AudioBuffer({ length: 8192*2, numberOfChannels: 2, sampleRate: this.audioCtx.sampleRate });
                output = new AudioBuffer({ length: 8192*2, numberOfChannels: 2, sampleRate: this.audioCtx.sampleRate});
                a = new AudioProcessingEvent('proc', {
                    inputBuffer: input,
                    outputBuffer: output,
                    playbackTime: time
                });
                this.audioScriptProcessor(a);
                this.SoundBuffer = a.outputBuffer;
                //this.log.debug("myBuff:" + this.SoundBuffer.length);
            }
            else {

                /// setup Web-Audio
                this.processor.onaudioprocess = (e: AudioProcessingEvent) => this.audioScriptProcessor(e);
                this.processor.connect(this.audioCtx.destination);
                this.source.connect(this.processor);

                this.source.start();
                this.play();
            }

        }
        /** Start playback of the song/sound */
        public play() {
            if (this.isSound == false) {//music
                this.audioCtx.resume();
                this.isPlaying = true;
            }
            else {//sound
                this.log.debug("play new");
                let source1 = this.audioCtx.createBufferSource();
                source1.buffer = this.SoundBuffer;
                source1.connect(this.audioCtx.destination);
                source1.start(0);
            }
        }


        /** processor task for generating sample */
        private lenGen: number = 0;
        public audioScriptProcessor(e: AudioProcessingEvent) {

            var b = e.outputBuffer;

            var c0 = b.getChannelData(0);
            var c1 = b.getChannelData(1);

            let lenFill = b.length;
            let posFill = 0;

            while (posFill < lenFill) {
                // Fill any leftover delay from the last buffer-fill event first
                while (this.lenGen > 0) {
                    if (lenFill - posFill < 2) {
                        // No more space in buffer
                        return;
                    }
                    let lenNow = Math.max(2, Math.min(512, this.lenGen, lenFill - posFill));

                    const samples = this.opl.generate(lenNow);

                    for (let i = 0; i < lenNow; i++) {
                        c0[posFill] = samples[i * 2 + 0] / 32768.0;
                        c1[posFill] = samples[i * 2 + 1] / 32768.0;
                        posFill++;
                    }

                    this.lenGen -= lenNow;
                }


                /// read on music-state from source file
                this.soundImagePlayer.read((reg: number, value: number) => {

                    /// write Adlib-Commands
                    this.opl.write(reg, value);
                });


                this.lenGen += this.samplesPerTick;
            }
            e.outputBuffer
        }

        /** pause palying */
        public suspend() {
            if (!this.audioCtx) {
                return;
            }

            this.audioCtx.suspend();
        }

        /** stop playing and close */
        public stop() {

            if (this.isPlaying) {
                this.isPlaying = false;
            }

            try {
                this.audioCtx.close();
            } catch (ex) { }

            if (this.processor) {
                this.processor.onaudioprocess = null;
            }

            try {
                this.source.disconnect(this.processor);
            } catch (ex) { }


            this.audioCtx = null;
            this.source = null;
            this.processor = null;

            this.opl = null;
            this.soundImagePlayer = null;

        }

    }
}