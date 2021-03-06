module Lemmings {

    /** provides an game object to controle the game */
    export class Game {

        private log: LogHandler = new LogHandler("Game");
        private gameResources: GameResources = null;
        private levelGroupIndex: number;
        private levelIndex: number;
        private level: Level;
        private triggerManager: TriggerManager;
        private lemmingManager: LemmingManager;
        private objectManager: ObjectManager;

        private gameVictoryCondition: GameVictoryCondition;

        private gameGui: GameGui;
        private guiDispaly: DisplayImage = null;


        private dispaly: DisplayImage = null;
        private gameDispaly: GameDisplay = null;
        private gameTimer: GameTimer = null;
        private commandManager: CommandManager = null;

        private skills: GameSkills;
        private showDebug : boolean = false;

        public onGameEnd = new EventHandler<GameResult>();

        private soundPlayer1: AudioPlayer = null;
        private soundPlayer2: AudioPlayer = null;
        private musicPlayer: AudioPlayer = null;
        private musicIndex: number=5;

        private finalGameState:GameStateTypes = GameStateTypes.UNKNOWN;

   

        constructor(gameResources: GameResources) {
            this.gameResources = gameResources;
        }

        public setGameDispaly(dispaly: DisplayImage, stage: Stage) {
            this.dispaly = dispaly;

            if (this.gameDispaly != null) {
                this.gameDispaly.setGuiDisplay(dispaly, stage);
                this.dispaly.setScreenPosition(this.level.screenPositionX, 0);
            }
        }

        public setGuiDisplay(dispaly: DisplayImage, stage: Stage) {
            this.guiDispaly = dispaly;
            if (this.gameGui != null) {
                this.gameGui.setGuiDisplay(dispaly,stage);
            }
        }

        /** load a new game/level */
        public loadLevel(levelGroupIndex: number, levelIndex: number, musicLevel:number, musicIndex:number): Promise<Game> {

            this.levelGroupIndex = levelGroupIndex;
            this.levelIndex = levelIndex;
            this.musicIndex=musicIndex;
            if (musicLevel > 0)
                this.gameResources.soundEnable = true;
            else
                this.gameResources.soundEnable = false;


            if (musicLevel == 2)
                this.gameResources.musicEnable = true;
            else
                this.gameResources.musicEnable = false;

            this.gameResources.getAllSounds(18);

            //console.log("this.MusicLevel=" + this.gameResources.soundEnable);

            return new Promise<Game>((resolve, reject) => {

                this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                    .then(level => {

                        this.gameTimer = new GameTimer(level);
                        this.gameTimer.onGameTick.on(() => {
                            this.onGameTimerTick()
                        });
                        this.gameTimer.onGameSuspendedTick.on(() => {
                            this.onGameTimerSuspendedTick()
                        });

                        this.commandManager = new CommandManager(this, this.gameTimer);

                        this.skills = new GameSkills(level);

                        this.level = level;

                        this.gameVictoryCondition = new GameVictoryCondition(level);

                        this.triggerManager = new TriggerManager(this.gameTimer);
                        this.triggerManager.addRange(level.triggers);

                        /// request next resources
                        let maskPromis = this.gameResources.getMasks();
                        let lemPromis = this.gameResources.getLemmingsSprite(this.level.colorPalette);
                        

                        return Promise.all([maskPromis, lemPromis]);
                    })
                    .then(results => {
                        
                        let masks = results[0];
                        let lemSprite = results[1];
                        let particleTable = new ParticleTable(this.level.colorPalette);
                        
                        /// setup Lemmings
                        this.lemmingManager = new LemmingManager(this.level, lemSprite, this.triggerManager, this.gameVictoryCondition, masks, particleTable,this.gameResources);

                        return this.gameResources.getSkillPanelSprite(this.level.colorPalette);//TF ICI

                    })
                    .then(skillPanelSprites => {

                        this.soundPlayer1 = this.gameResources.getSoundPlayerNew(SoundFxTypes.ENTRANCE_OPENING);//TF sound
                        this.soundPlayer2 = this.gameResources.getSoundPlayerNew(SoundFxTypes.LETS_GO);//TF sound
                        
                        /// setup gui
                        this.gameGui = new GameGui(this, skillPanelSprites, this.skills, this.gameTimer, this.gameVictoryCondition,this.level, this.gameResources);

                        if (this.guiDispaly != null) {
                            this.gameGui.setGuiDisplay(this.guiDispaly,null);
                        }

                        this.objectManager = new ObjectManager(this.gameTimer);
                        this.objectManager.addRange(this.level.objects);

                        this.gameDispaly = new GameDisplay(this, this.level, this.lemmingManager, this.objectManager, this.triggerManager, this.gameResources);
                        if (this.dispaly != null) {
                            this.gameDispaly.setGuiDisplay(this.dispaly,null);
                        }

                        /// let's start!
                        resolve(this);
                    });

            });
        }


       
        /** run the game */
        public start() {
            this.gameTimer.continue();
        }

        /** end the game */
        public stop() {
            this.gameTimer.stop();
            this.gameTimer = null;

            this.onGameEnd.dispose();
            this.onGameEnd = null;
            this.stopMusic() ;
            
        

        }
        public stopMusic() {
            if (this.musicPlayer) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }

        /** return the game Timer for this game */
        public getGameTimer(): GameTimer {
            return this.gameTimer;
        }

        /** increase the amount of skills */
        public cheat() {
            this.skills.cheat();
        }

        public getGameSkills() : GameSkills {
            return this.skills;
        }

        public getLemmingManager():LemmingManager {
            return this.lemmingManager;
        }

        public getVictoryCondition() : GameVictoryCondition {
            return this.gameVictoryCondition;
        }

        public getCommandManager(): CommandManager {
            return this.commandManager;
        }

        public queueCmmand(newCommand:ICommand) {
            this.commandManager.queueCommand(newCommand);
        }

        /** enables / disables the display of debug information */
        public setDebugMode(vale:boolean) {
            this.showDebug = vale;
        }


        private onGameTimerSuspendedTick() {
                this.render();
        }
        /** run one step in game time and render the result */
        private onGameTimerTick() {

            let tick = this.gameTimer.getGameTicks();
            
            if (tick == 1) {
                if (this.soundPlayer2 != null)
                    this.soundPlayer2.play();
            }
            

            if (tick == 50) {
                this.objectManager.openDoor()
                if (this.soundPlayer1 != null)
                    this.soundPlayer1.play();

                if(this.gameResources.musicEnable == true)
                {
                    this.gameResources.getMusicPlayer(this.musicIndex)
                    .then((player) => {
                        this.musicPlayer = player;
                        this.musicPlayer.play();
                    });
                }
            }



            /// run game logic
            if (tick >50) 
                this.runGameLogic();

            this.checkForGameOver();
            this.render();
        }

        /** return the current state of the game */
        public getGameState():GameStateTypes {

            /// if the game has finised return it's saved state
            if (this.finalGameState != GameStateTypes.UNKNOWN) {
                return this.finalGameState;
            }

            let hasWon = this.gameVictoryCondition.getSurvivorsCount() >= this.gameVictoryCondition.getNeedCount();

            /// are there any lemmings alive?
            if ((this.gameVictoryCondition.getLeftCount() <= 0) && (this.gameVictoryCondition.getOutCount() <= 0)) {
                if (hasWon) {
                    return GameStateTypes.SUCCEEDED;
                }
                else {
                    return GameStateTypes.FAILED_LESS_LEMMINGS;
                }
            }

            /// is the game out of time?
            if (this.gameTimer.getGameLeftTime() <= 0) {
                if (hasWon) {
                    return GameStateTypes.SUCCEEDED;
                }
                else {
                    return GameStateTypes.FAILED_OUT_OF_TIME;
                }
          
            }

            return GameStateTypes.RUNNING;

        }
        public finish() {
            console.log("Finishing game");
            this.finalGameState = GameStateTypes.CANCELED;
            this.gameVictoryCondition.doFinalize();
            this.stopMusic();
            this.onGameEnd.trigger(new GameResult(this));
        }
        /** check if the game  */
        private checkForGameOver() {
            if (this.finalGameState != GameStateTypes.UNKNOWN) {
                return;
            }

            let state = this.getGameState();

            if ((state != GameStateTypes.RUNNING) && (state != GameStateTypes.UNKNOWN)) {
                this.gameVictoryCondition.doFinalize();
                this.finalGameState = state;
                this.stopMusic();
                this.onGameEnd.trigger(new GameResult(this));
            }
        }

        /** run the game logic one step in time */
        private runGameLogic() {
            if (this.level == null) {
                this.log.log("level not loaded!");
                return;
            }

            this.lemmingManager.tick();
        }

        public renderSub(display: DisplayImage) {
            //this.gameDispaly.renderSub(display);
            this.render();
        }
        /** refresh display */
        private render() {
            if (this.gameDispaly) {
                this.gameDispaly.render();

                if (this.showDebug) {
                    this.gameDispaly.renderDebug();
                }
            }

            if (this.guiDispaly) {
                this.gameGui.render();
            }

            this.guiDispaly.redraw();
        }

    }

}