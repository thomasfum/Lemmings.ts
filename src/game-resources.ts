

module Lemmings {

    /** reprecent access to the resources of a Lemmings Game */
    export class GameResources {

        private musicPlayer: AudioPlayer;
        private soundPlayer: AudioPlayer;
        private soundImage: Promise<SoundImageManager>;
        private mainDat: Promise<FileContainer> = null;
        public soundEnable = false;
        private soundPlayerArray: AudioPlayer[] = [];

        constructor(private fileProvider: FileProvider, private config: GameConfig) {

        }

        /** free resources */
        public dispose() {
            this.stopMusic();
            this.stopSound();
            this.soundImage = null;
        }

        /** return the main.dat file container */
        public getMainDat():Promise<FileContainer> {
            if (this.mainDat != null) return this.mainDat;

            this.mainDat = new Promise<FileContainer>((resolve, reject) => {

                this.fileProvider.loadBinary(this.config.path, "MAIN.DAT")
                .then(data => {

                    /// split the file in it's parts
                    let mainParts = new FileContainer(data);

                    resolve(mainParts);
                });
            });

            return this.mainDat;
        }


        /** return the Lemmings animations */
        public getLemmingsSprite(colorPalette:ColorPalette): Promise<LemmingsSprite> {

            return new Promise<LemmingsSprite>((resolve, reject) => {

                this.getMainDat().then(container => {
                    
                    let sprite = new LemmingsSprite(container.getPart(0), colorPalette);

                    resolve(sprite);
                });
            });
        }


        //pagesSprites

        public getPagesSprite(colorPalette:ColorPalette, nbGroup:number): Promise<pagesSprites> {
            return new Promise<pagesSprites>((resolve, reject) => {

                this.getMainDat().then(container => {

                    resolve(new pagesSprites(container.getPart(3), container.getPart(4), colorPalette,nbGroup));
                });
            });
        }

        public getSkillPanelSprite(colorPalette:ColorPalette): Promise<SkillPanelSprites> {
            return new Promise<SkillPanelSprites>((resolve, reject) => {

                this.getMainDat().then(container => {

                    resolve(new SkillPanelSprites(container.getPart(2), container.getPart(6), colorPalette));
                });
            });
        }

        public getMasks(): Promise<MaskProvider> {
            return new Promise<MaskProvider>((resolve, reject) => {

                this.getMainDat().then(container => {

                    resolve(new MaskProvider(container.getPart(1)));
                });
            });
        }

        /** return the Level Data for a given Level-Index */
        public getLevel(levelMode: number, levelIndex: number): Promise<Level> {

            let levelReader = new LevelLoader(this.fileProvider, this.config);
            return levelReader.getLevel(levelMode, levelIndex);
        }


        /** return the level group names for this game */
        public getLevelGroups(): string[] {
            return this.config.level.groups;
        }


        private initSoundImage() {
            if (this.soundImage) return this.soundImage;

            this.soundImage = new Promise<SoundImageManager>((resolve, reject) => {

                /// load the adlib file
                this.fileProvider.loadBinary(this.config.path, "ADLIB.DAT")
                    .then((data: BinaryReader) => {

                        /// unpack the file
                        var container = new FileContainer(data);

                        /// create Sound Image
                        var soundImage = new SoundImageManager(container.getPart(0), this.config.audioConfig);

                        resolve(soundImage);
                    });
            });

            return this.soundImage;
        }


        /** stop playback of the music song */
        public stopMusic() {
            if (this.musicPlayer != null) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }

        /** return a palyer to playback a music song */
        public getMusicPlayer(songIndex: number): Promise<AudioPlayer> {
            this.stopMusic();

            return new Promise<AudioPlayer>((resolve, reject) => {

                this.initSoundImage().then(soundImage => {

                    /// get track
                    var adlibSrc: SoundImagePlayer = soundImage.getMusicTrack(songIndex);

                    /// play
                    this.musicPlayer = new AudioPlayer(adlibSrc, OplEmulatorType.Dosbox,false);

                    /// return
                    resolve(this.musicPlayer);
                });
            });
        }


        /** stop playback of the music song */
        public stopSound() {
            if (this.soundPlayer != null) {
                this.soundPlayer.stop();
                this.soundPlayer = null;
            }
        }


        /** save all sound effects */
        public getAllSounds(nbSound: number) {
                this.initSoundImage().then(soundImage => {
                    for (let i = 0; i < nbSound; i++) {
                        /// get track
                        var adlibSrc: SoundImagePlayer = soundImage.getSoundTrack(i);
                        this.soundPlayerArray[i]= new AudioPlayer(adlibSrc, OplEmulatorType.Dosbox, true);
                    }
         });
        }


        public soundPlay(soundIndex: number, offeset: number = 0) {
            if (this.soundEnable == true) {
                if (this.soundPlayerArray[soundIndex-1] != undefined)
                    if (this.soundPlayerArray[soundIndex-1] != null)
                        this.soundPlayerArray[soundIndex-1].play(offeset);
            }
        }
        /** return a palyer to playback a sound effect */
        public getSoundPlayerNew(soundIndex: number) {
            if (this.soundEnable == true)
                return this.soundPlayerArray[soundIndex-1];
            else
                return null;
        }
        /** return a palyer to playback a sound effect */
        public getSoundPlayer(soundIndex: number) {

            this.stopSound();

            return new Promise<AudioPlayer>((resolve, reject) => {

                this.initSoundImage().then(soundImage => {

                    /// get track
                    var adlibSrc: SoundImagePlayer = soundImage.getSoundTrack(soundIndex);

                    /// play
                    this.soundPlayer = new AudioPlayer(adlibSrc, OplEmulatorType.Dosbox,true);

                    /// return
                    resolve(this.soundPlayer);
                });
            });
        }


    }

}