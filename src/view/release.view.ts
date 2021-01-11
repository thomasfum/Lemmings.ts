module Lemmings {
    export enum GameState {  //0=welcome,1=target,2=playing,3=results good;4=result bad
        GameSelect,
        Welcome,
        Objective,
        Playing,
        ResultGood,
        ResultBad
      }

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
        private MusicLevel: number=2;
        private DifficultyLevel: number=0;

        private stage: Stage = null;
        private GamePalette: ColorPalette=null;
        private nbgroup: number=4;

    
        public elementSoundNumber: HTMLElement = null;
        public elementTrackNumber: HTMLElement = null;
        public elementLevelNumber: HTMLElement = null;
        public elementSelectedGame: HTMLSelectElement = null;
        public elementSelectLevelGroup: HTMLSelectElement = null;
        public elementLevelName: HTMLElement = null;
        public elementGameState: HTMLElement = null;

        private gameSpeedFactor = 1;

        private gameState: GameState =GameState.GameSelect;

        public constructor() {
            /// split the hash of the url in parts + reverse
            let hashParts = window.location.hash.substr(1).split(",", 3).reverse();
      
            this.levelIndex = this.strToNum(hashParts[0]);
            this.levelGroupIndex = this.strToNum(hashParts[1]);
            this.gameID= this.strToNum(hashParts[2]) ;
            this.gameState=GameState.GameSelect;

            this.SelectPalette(0);

            this.log.log("selected level: "+this.gameID +" : "+ this.levelIndex + " / "+ this.levelGroupIndex);
        }


        private SelectPalette(ID:number)
        {
            
            this.GamePalette = new ColorPalette();
            if(ID==0)//standard
            {
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
            this.GamePalette.setColorRGB(14, 64, 80, 176);//  Blue   <---------
            this.GamePalette.setColorRGB(15, 224, 128, 144);//  Pink 
            }
            else//christmas
            {
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
                this.GamePalette.setColorRGB(14, 203, 16, 16);//  Red    <---------
                this.GamePalette.setColorRGB(15, 224, 128, 144);//  Pink 
            }
            if(this.stage!=null)
                this.stage.setGamePalette(this.GamePalette);
        }

        public set gameCanvas(el:HTMLCanvasElement){
            this.stage = new Stage(el,  this.GamePalette);
             
            window.addEventListener("onContextMenu", (e: KeyboardEvent) => {
                return false;
            });
            //el.addEventListener("keydown", this.manageKeyboard);
            window.addEventListener("keydown", (e: KeyboardEvent) => {
                console.log(" Key: "+e.code +", "+this.gameState );

                if( this.gameState==GameState.GameSelect)
                {
                    let noStr: string ="-1";
                    if(e.code.startsWith("Digit"))
                    {
                        noStr= e.code.substring(5,6);
                        console.log("NO:"+noStr);
                    }
                    if(e.code.startsWith("Numpad"))
                    {
                        noStr= e.code.substring(6,7);
                        console.log("NO:"+noStr);
                    }
                    let no=parseInt(noStr);
                    this.gameFactory.getConfigs( ).then((GameConfigs) => { 
                        let ID=GameConfigs[no-1].gameID;
                        this.nbgroup=GameConfigs[no-1].level.groups.length;
                        this.selectGameType(ID,GameConfigs[no-1].gamePaletteID);
                        this.gameState=GameState.Welcome;
                    });

                }else if( this.gameState==GameState.Welcome)
                {
                    if(e.code=="F1")//play
                    {
                        this.gameState=GameState.Objective;
                        this.loadLevel();
                    }
                    if(e.code=="F3")//music
                    {
                        this.MusicLevel++;
                        if(this.MusicLevel>2)
                            this.MusicLevel=0;
                        this.RenderWelcomePage();
                    }
                    if(e.code=="ArrowDown")//
                    {
                        this.DifficultyLevel--;
                        if(this.DifficultyLevel<0)
                            this.DifficultyLevel=this.nbgroup-1;
                        this.RenderWelcomePage();
                        this.levelGroupIndex= this.DifficultyLevel;
                    }
                    if(e.code=="ArrowUp")//
                    {
                        this.DifficultyLevel++;
                        if(this.DifficultyLevel>=this.nbgroup)
                            this.DifficultyLevel=0;
                        this.RenderWelcomePage();
                        this.levelGroupIndex= this.DifficultyLevel;
                    }
                    if(e.code=="Escape")//
                    {
                        this.gameState=GameState.GameSelect;
                        this.RenderSelectpage();
                    }
                }

                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            
            el.addEventListener("mouseup", (e: MouseEvent) => {
                if( this.gameState==GameState.GameSelect)
                {
                    console.log(" GameSelect -> Welcome");
                    this.gameState=GameState.Welcome;
                    this.RenderWelcomePage();
                } else

                if( this.gameState==GameState.Welcome)
                {
                    console.log(" Welcome -> Objective");
                    this.gameState=GameState.Objective;
                    this.loadLevel();
                } else if( this.gameState==GameState.Objective)
                {
                    console.log(" Objective ->playing ");
                    this.StartActualGame();
                }
                else if (this.gameState == GameState.ResultGood) {//good

                    if (e.button == 0)//left
                    {
                        /// move to next level
                        console.log("good => next");
                        this.gameState = GameState.Objective;
                        this.continue();
                        this.moveToLevel(1);
                    }
                    if (e.button == 2)//right
                    {
                        console.log("back to menu");
                        this.gameState=GameState.Welcome;
                        this.RenderWelcomePage();//back to menu
                    }
                } else if (this.gameState == GameState.ResultBad) {//bad
                    /// redo this level
                    if (e.button == 0)//left
                    {
                        console.log("bad => redo");
                        this.gameState = GameState.Objective;
                        this.continue();
                        this.moveToLevel(0);
                    }
                    if (e.button == 2)//right
                    {
                        console.log("back to menu");
                        this.gameState=GameState.Welcome;
                        this.RenderWelcomePage();//back to menu
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

                    //this.changeHtmlText(this.elementGameState, GameStateTypes.toString(GameStateTypes.RUNNING));

                    

                    this.game = game;
                });
        }


        private onGameEnd(gameResult : GameResult) {
            //this.changeHtmlText(this.elementGameState, GameStateTypes.toString(gameResult.state));
            this.stage.startFadeOut();

            console.dir(gameResult);

            console.log("Level end");
            
            window.setTimeout(() => {
                this.suspend();
                //----------------------------
                if (gameResult.state == GameStateTypes.SUCCEEDED) {
                    this.gameState = GameState.ResultGood;//results good
                }
                else {
                    this.gameState = GameState.ResultBad;//results bad
                }
                let gameDisplay = this.stage.getGameDisplay();
                gameDisplay.clear();
                gameDisplay.redraw();
                this.stage.resetFade();
              
                let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette, this.nbgroup).then((pagspr) => {
                    let FullPage = this.stage.getFullPageDisplay();
                    FullPage.clear();
                    this.stage.clear();
                    
                    this.currentLevel.RenderStart(FullPage, this.gameState, pagspr, this.game.getVictoryCondition().getSurvivorPercentage());
                    this.stage.redrawFullpage();
                });
       
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

            //this.changeHtmlText(this.elementTrackNumber, this.musicIndex.toString());

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

            //this.changeHtmlText(this.elementSoundNumber, this.soundIndex.toString());


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
                //this.changeHtmlText(this.elementLevelNumber, (this.levelIndex + 1).toString());
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

        /** switch the selected level group */
        public selectLevelGroup(newLevelGroupIndex: number) {
            this.levelGroupIndex = newLevelGroupIndex;

            this.loadLevel();
        }



        
        public InitGame() {
            console.log("Init Game");
            this.gameID = 0;
            this.gameState==GameState.GameSelect;
            this.gameFactory.getGameResources(this.gameID)
            .then((newGameResources) => {

                this.gameResources = newGameResources;
                this.levelGroupIndex = 0;
                this.RenderSelectpage();
            });
        }



        public selectGameType(gameTypeId: number,gamePaletteId: number) {
            console.log("selectGameType");
            if (gameTypeId == null) gameTypeId = 0;

            this.gameID = gameTypeId;
            this.levelGroupIndex = 0;
            this.levelIndex=0;
            
            this.gameFactory.getGameResources(this.gameID)
            .then((newGameResources) => {
                this.SelectPalette(gamePaletteId);
                this.gameResources = newGameResources;
                this.levelGroupIndex = 0;
                this.RenderWelcomePage();
            });
        }


        private RenderWelcomePage()
        {
            //ici charger les ressources pour les fontes
            let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette, this.nbgroup).then((pagspr) => {//or this.GamePalette or level.colorPalette
                if (this.stage != null){

                    let gameDisplay = this.stage.getGameDisplay();
                    gameDisplay.clear();
                    gameDisplay.redraw();
                    //fullpage
                    let FullPage =this.stage.getFullPageDisplay();
                
                    FullPage.clear();
                    this.stage.redrawFullpage();
                    this.stage.resetFade();
                    let level= new Level(0,0);
                    level.RenderWelcome(FullPage,  pagspr, this.MusicLevel, this.DifficultyLevel, this.nbgroup);
                    this.stage.redrawFullpage();
                }
            });
        }
        private RenderSelectpage()
        {

            
            this.gameFactory.getConfigs( ).then((GameConfigs) => { 
            //ici charger les ressources pour les fontes
            let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette, this.nbgroup).then((pagspr) => {//or this.GamePalette or level.colorPalette
                if (this.stage != null){

                    let gameDisplay = this.stage.getGameDisplay();
                    gameDisplay.clear();
                    gameDisplay.redraw();
                    //fullpage
                    let FullPage =this.stage.getFullPageDisplay();
                
                    FullPage.clear();
                    this.stage.redrawFullpage();
                    this.stage.resetFade();
                    let level= new Level(0,0);
                    level.RenderSelectpage(FullPage,  pagspr, GameConfigs);
                    this.stage.redrawFullpage();
                }
            })
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
            this.gameState=GameState.Playing;//palying
            this.start();
        
        }

        /** load a level and render it to the display */
        private loadLevel() {
            if (this.gameResources == null) return;
            if (this.game != null) {
                this.game.stop();
                this.game = null;
            }
           // this.changeHtmlText(this.elementGameState, GameStateTypes.toString(GameStateTypes.UNKNOWN));

            this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then((level) => {
                    if (level == null) return;
                    this.gameState=GameState.Objective;//targets
                    this.currentLevel=level;
                    //this.changeHtmlText(this.elementLevelName, level.name);

                    //ici charger les ressources pour les fontes
                    let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette, this.nbgroup).then((pagspr) => {//or this.GamePalette or level.colorPalette
                        if (this.stage != null){

                            let gameDisplay = this.stage.getGameDisplay();
                            gameDisplay.clear();
                            gameDisplay.redraw();
                            //fullpage
                            let FullPage =this.stage.getFullPageDisplay();
                           
                            FullPage.clear();
                            this.stage.redrawFullpage();
                            this.stage.resetFade();
                            level.RenderStart(FullPage, this.gameState, pagspr,0);
                            
                            this.stage.redrawFullpage();
                   
                        }

                    });
                    window.location.hash = this.buildLevelIndexHash();
                    console.dir(level);
                });

        }

    }
}