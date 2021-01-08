module Lemmings {


    export class ReleaseView {
        private log : LogHandler = new LogHandler("ReleaseView");

        private levelIndex: number = 0;
        private levelGroupIndex: number = 0;
        private gameID: number;
        private musicIndex: number = 0;
        private soundIndex: number = 0;
        private gameResources: GameResources = null;
        private musicPlayer: AudioPlayer = null;
        private soundPlayer: AudioPlayer = null;
        private game : Game = null;
        private gameFactory = new GameFactory("./");
        private currentLevel:Level;

        private stage: Stage = null;
        private GamePalette: ColorPalette=null;

        private brownFrame : Frame;
        
        public elementSoundNumber: HTMLElement = null;
        public elementTrackNumber: HTMLElement = null;
        public elementLevelNumber: HTMLElement = null;
        public elementSelectedGame: HTMLSelectElement = null;
        public elementSelectLevelGroup: HTMLSelectElement = null;
        public elementLevelName: HTMLElement = null;
        public elementGameState: HTMLElement = null;

        private gameSpeedFactor = 1;

        private gameState: number=0;//0=welcome,1=target,2=playing,3=results good;4=result bad

        public constructor() {
            /// split the hash of the url in parts + reverse
            let hashParts = window.location.hash.substr(1).split(",", 3).reverse();
      
            this.levelIndex = this.strToNum(hashParts[0]);
            this.levelGroupIndex = this.strToNum(hashParts[1]);
            this.gameID= this.strToNum(hashParts[2]) ;

            
            this.GamePalette = new ColorPalette();
            this.GamePalette.setColorRGB(0, 0, 0, 0);//  Black 
            this.GamePalette.setColorRGB(1, 128, 64, 32);//  Browns 
            this.GamePalette.setColorRGB(2, 96, 48, 32);// 
            this.GamePalette.setColorRGB(3, 48, 0, 16);//
            this.GamePalette.setColorRGB(4, 32, 8, 124);//  Purples 
            this.GamePalette.setColorRGB(5, 64, 44, 144);//
            this.GamePalette.setColorRGB(6, 104, 88, 164);// 
            this.GamePalette.setColorRGB(7, 152, 140, 188);// 
            this.GamePalette.setColorRGB(8, 0, 80, 0);//  Greens
            this.GamePalette.setColorRGB(9, 0, 96, 16);//
            this.GamePalette.setColorRGB(10, 0, 112, 32);//
            this.GamePalette.setColorRGB(11, 0, 128, 64);//
            this.GamePalette.setColorRGB(12, 208, 208, 208);//  White 
            this.GamePalette.setColorRGB(13, 176, 176, 0);//  Yellow 
            this.GamePalette.setColorRGB(14, 64, 80, 176);//  Blue 
            this.GamePalette.setColorRGB(15, 224, 128, 144);//  Pink 

            

            this.log.log("selected level: "+this.gameID +" : "+ this.levelIndex + " / "+ this.levelGroupIndex);
        }

  
        public set gameCanvas(el:HTMLCanvasElement){
            this.stage = new Stage(el,  this.GamePalette);
            el.addEventListener("mouseup", (e: MouseEvent) => {
                if( this.gameState==1)
                {
                    console.log(" mouse up release ");
                    this.StartActualGame();
                }

                if (this.gameState == 3) {//good

                    if (e.button == 0)//left
                    {
                        /// move to next level
                        console.log("good => next");
                        this.gameState = 1
                        this.continue();
                        this.moveToLevel(1);
                        
                       

                    }
                    if (e.button == 2)//right
                    {
                        console.log("back to menu");
                     //   this.moveToLevel(0); //back to menu
                    }
                }

                if (this.gameState == 4) {//bad
                    /// redo this level
                    if (e.button == 0)//left
                    {
                        console.log("bad => redo");
                        this.gameState = 1
                        this.continue();
                        this.moveToLevel(0);
                        
                    }
                    if (e.button == 2)//right
                    {
                        console.log("back to menu");
                        //   this.moveToLevel(0); //back to menu
                    }
                }
                  

                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        }
        
        
        /** start or continue the game */
        public start(replayString?:string) {
            if (!this.gameFactory) return;

            /// is the game already running
            if (this.game != null) {
                this.continue();
                return;
            }

            /// create new game
            this.gameFactory.getGame(this.gameID)
                .then(game => game.loadLevel(this.levelGroupIndex, this.levelIndex))
                .then(game => {

                    if (replayString != null) {
                        game.getCommandManager().loadReplay(replayString);
                    }

                    game.setGameDispaly(this.stage.getGameDisplay(),this.stage);
                    game.setGuiDisplay(this.stage.getGuiDisplay(),this.stage);

                    game.getGameTimer().speedFactor = this.gameSpeedFactor;

                    game.start();
                    game.onGameEnd.on((state) => this.onGameEnd(state));

                    this.changeHtmlText(this.elementGameState, GameStateTypes.toString(GameStateTypes.RUNNING));

                    

                    this.game = game;
                });
        }


        private onGameEnd(gameResult : GameResult) {
            this.changeHtmlText(this.elementGameState, GameStateTypes.toString(gameResult.state));
            this.stage.startFadeOut();

            console.dir(gameResult);

            console.log("Level end");
            
            window.setTimeout(() => {
                this.suspend();
                //----------------------------
                if (gameResult.state == GameStateTypes.SUCCEEDED) {
                    this.gameState = 3;//results good
                }
                else {
                    this.gameState = 4;//results bad
                }
                let gameDisplay = this.stage.getGameDisplay();
                gameDisplay.clear();
                gameDisplay.redraw();
                this.stage.resetFade();
              
                let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette).then((pagspr) => {
                   
                    this.brownFrame = pagspr.getPanelSprite();
                    let FullPage = this.stage.getFullPageDisplay();
                    FullPage.clear();
                    this.stage.clear();
                    
                    this.currentLevel.RenderStart(FullPage, this.gameState, this.brownFrame, pagspr, this.game.getVictoryCondition().getSurvivorPercentage());
                    this.stage.redrawFullpage();
                });
                //----------------------------


                /*

                if (gameResult.state == GameStateTypes.SUCCEEDED) {
                    /// move to next level
                    this.moveToLevel(1);
                }
                else {
                    /// redo this level
                    this.moveToLevel(0);
                }
                */
                
            }, 2500);
        }

        /** load and run a replay */
        public loadReplay(replayString:string) {
            this.start(replayString);
        }

        /** pause the game */
        public cheat() {
            if (this.game == null) {
                return;
            }

            this.game.cheat();
        }

        /** pause the game */
        public suspend() {
            if (this.game == null) {
                return;
            }

            this.game.getGameTimer().suspend(); 
        }

        /** continue the game after pause/suspend */
        public continue() {
            if (this.game == null) {
                return;
            }
            
            this.game.getGameTimer().continue(); 
        }

        public nextFrame() {
            if (this.game == null) {
                return;
            }
            
            this.game.getGameTimer().tick();
        }

        public selectSpeedFactor(newSpeed: number) {
            if (this.game == null) {
                return;
            }

            this.gameSpeedFactor = newSpeed;
            this.game.getGameTimer().speedFactor = newSpeed;
        }


        public playMusic(moveInterval: number) {

            this.stopMusic();
            if (!this.gameResources) return;

            if (moveInterval == null) moveInterval = 0;
            this.musicIndex += moveInterval;
            this.musicIndex = (this.musicIndex < 0) ? 0 : this.musicIndex;

            this.changeHtmlText(this.elementTrackNumber, this.musicIndex.toString());

            this.gameResources.getMusicPlayer(this.musicIndex)
                .then((player) => {
                    this.musicPlayer = player;
                    this.musicPlayer.play();
                });
        }


        public stopMusic() {
            if (this.musicPlayer) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }


        public stopSound() {
            if (this.soundPlayer) {
                this.soundPlayer.stop();
                this.soundPlayer = null;
            }
        }

        public playSound(moveInterval: number) {
            this.stopSound();

            if (moveInterval == null) moveInterval = 0;

            this.soundIndex += moveInterval;

            this.soundIndex = (this.soundIndex < 0) ? 0 : this.soundIndex;

            this.changeHtmlText(this.elementSoundNumber, this.soundIndex.toString());


            this.gameResources.getSoundPlayer(this.soundIndex)
                .then((player) => {
                    this.soundPlayer = player;
                    this.soundPlayer.play();
                });
        }


        public enableDebug() {
            if (this.game == null) {
                return;
            }
            
            this.game.setDebugMode(true);
        }

        /** add/subtract one to the current levelIndex */
        public moveToLevel(moveInterval: number) {
            if (moveInterval == null) moveInterval = 0;
            this.levelIndex = (this.levelIndex + moveInterval)| 0;

            /// check if the levelIndex is out of bounds
            this.gameFactory.getConfig(this.gameID).then((config) => {

                /// jump to next level group?
                if (this.levelIndex >= config.level.getGroupLength(this.levelGroupIndex)) {
                    this.levelGroupIndex ++;
                    this.levelIndex = 0;
                }

                /// jump to previous level group?
                if ((this.levelIndex < 0) && (this.levelGroupIndex > 0)) {
                    this.levelGroupIndex --;
                    this.levelIndex = config.level.getGroupLength(this.levelGroupIndex) - 1;
                }

                /// update and load level
                this.changeHtmlText(this.elementLevelNumber, (this.levelIndex + 1).toString());
                this.loadLevel();
            });
        }


        /** return the url hash for the pressent game/group/level-index */
        private buildLevelIndexHash() : string {
            return this.gameID +","+ this.levelGroupIndex +","+ this.levelIndex;
        }

        /** convert a string to a number */
        private strToNum(str:string):number {
            return Number(str)|0;
        }

        /** change the the text of a html element */
        private changeHtmlText(htmlElement:HTMLElement, value:string) {
            if (htmlElement == null) {
                return
            }

            htmlElement.innerText = value;
        }

        /** remove items of a <select> */
        private clearHtmlList(htmlList: HTMLSelectElement) {
            while (htmlList.options.length) {
                htmlList.remove(0);
            }
        }

        /** add array elements to a <select> */
        private arrayToSelect(htmlList: HTMLSelectElement, list: string[]):void {

            this.clearHtmlList(htmlList);

            for (var i = 0; i < list.length; i++) {
                var opt = list[i];
                var el: HTMLOptionElement = document.createElement("option");
                el.textContent = opt;
                el.value = i.toString();
                htmlList.appendChild(el);
            }
        }


        /** switch the selected level group */
        public selectLevelGroup(newLevelGroupIndex: number) {
            this.levelGroupIndex = newLevelGroupIndex;

            this.loadLevel();
        }


        public selectGameType(gameTypeId: number) {

            if (gameTypeId == null) gameTypeId = 0;

            this.gameID = gameTypeId;

            this.gameFactory.getGameResources(this.gameID)
            .then((newGameResources) => {

                this.gameResources = newGameResources;

               // this.arrayToSelect(this.elementSelectLevelGroup, this.gameResources.getLevelGroups());
                this.levelGroupIndex = 0;

                this.loadLevel();
            });
        }

        private StartActualGame()
        {
            let FullPage =this.stage.getFullPageDisplay();
            FullPage.clear();
            FullPage.redraw();
            console.log("start actual game");
            let gameDisplay = this.stage.getGameDisplay();
            gameDisplay.clear();
            this.stage.resetFade();
            this.currentLevel.render(gameDisplay);
            gameDisplay.setScreenPosition(this.currentLevel.screenPositionX, 0);
            gameDisplay.redraw();
            this.gameState=2;//palying
            this.start();
        
        }

        /** load a level and render it to the display */
        private loadLevel() {
            if (this.gameResources == null) return;
            if (this.game != null) {
                this.game.stop();
                this.game = null;
            }

            

            this.changeHtmlText(this.elementGameState, GameStateTypes.toString(GameStateTypes.UNKNOWN));

            this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then((level) => {
                    if (level == null) return;
                    this.gameState=1;//targets
                    this.currentLevel=level;
                    this.changeHtmlText(this.elementLevelName, level.name);
                    

                    //ici charger les ressources pour les fontes
                    let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette).then((pagspr) => {//or this.GamePalette or level.colorPalette
                        this.brownFrame=pagspr.getPanelSprite();
                       // pagspr.getLetterSprite("a");


                        if (this.stage != null){

                            let gameDisplay = this.stage.getGameDisplay();
                            gameDisplay.clear();
                            gameDisplay.redraw();
                            //fullpage
                            let FullPage =this.stage.getFullPageDisplay();
                           
                            FullPage.clear();
                            this.stage.redrawFullpage();
                            this.stage.resetFade();
                            level.RenderStart(FullPage, this.gameState, this.brownFrame, pagspr,0);
                            
                            this.stage.redrawFullpage();
                                        
    /*
                            //game
                            let gameDisplay = this.stage.getGameDisplay();
                            gameDisplay.clear();
                            this.stage.resetFade();
                            level.render(gameDisplay);
                            gameDisplay.setScreenPosition(level.screenPositionX, 0);
                            gameDisplay.redraw();
      */                      
                        }

                    });
                    

                  

                    window.location.hash = this.buildLevelIndexHash();

                    console.dir(level);
                    //console.log('loaded');
                   // this.start();
                });

        }

    }
}