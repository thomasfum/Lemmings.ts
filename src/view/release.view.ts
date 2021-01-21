module Lemmings {
    export enum GameState {  //0=welcome,1=target,2=playing,3=results good;4=result bad
        GameSelect,
        Welcome,
        EnterCode,
        Objective,
        Playing,
        ResultGood,
        ResultBad
    }

    export class ReleaseView {
        private log: LogHandler = new LogHandler("ReleaseView");

        private levelIndex: number = 0;
        private levelGroupIndex: number = 0;
        private gameID: number;
        private musicIndex: number = 0;
        private soundIndex: number = 0;
        private gameResources: GameResources = null;
        private musicPlayer: AudioPlayer = null;
        private soundPlayer: AudioPlayer = null;
        private game: Game = null;
        private gameFactory = new GameFactory("./");
        private currentLevel: Level;
        private MusicLevel: number = 2;

        private stage: Stage = null;
        private GamePalette: ColorPalette = null;
        private nbgroup: number = 4;

        private gameSpeedFactor = 1;
        private gameState: GameState = GameState.GameSelect;
        private AccesscodeEntered: string = "";

        private WelcomePageTimer: number;
        private WelcomePageTick: number;
        private WelcomePageSprire: pagesSprites;


        //touch
        public  longtouch:boolean= false ;
        private timeOutEvent  = 0;

        public constructor() {
            /// split the hash of the url in parts + reverse
            let hashParts = window.location.hash.substr(1).split(",", 3).reverse();

            this.levelIndex = this.strToNum(hashParts[0]);
            this.levelGroupIndex = this.strToNum(hashParts[1]);
            this.gameID = this.strToNum(hashParts[2]);
            this.gameState = GameState.GameSelect;

            this.SelectPalette(0);

            this.log.log("selected level: " + this.gameID + " : " + this.levelIndex + " / " + this.levelGroupIndex);
        }


        private SelectPalette(ID: number) {

            this.GamePalette = new ColorPalette();
            if (ID == 0)//standard
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
            if (this.stage != null)
                this.stage.setGamePalette(this.GamePalette);
        }

        public set gameCanvas(el: HTMLCanvasElement) {
            this.stage = new Stage(el, this.GamePalette);

            window.addEventListener("onContextMenu", (e: KeyboardEvent) => {
                return false;
            });



            window.addEventListener("keydown", (e: KeyboardEvent) => {
                //console.log(" Key down: " + e.code + ", " + e.key + ", " + e.keyCode + ", " + this.gameState);


                if (this.gameState == GameState.EnterCode) {
                    //Backspace
                    /*
                    if (((e.key >= 'a') && (e.key <= 'z')) || ((e.key >= 'A') && (e.key <= 'Z'))) {
                        this.AccesscodeEntered += e.key.toUpperCase();
                        this.RenderEnterCodePage();//ici
                    }
                    */
                    if ((e.keyCode >= 65) && (e.keyCode <= 90)) {
                        this.AccesscodeEntered += e.key.toUpperCase();
                        this.RenderEnterCodePage("", "");//ici
                    }
                    if (e.key == "Backspace") {
                        this.AccesscodeEntered = this.AccesscodeEntered.substring(0, this.AccesscodeEntered.length - 1);
                        this.RenderEnterCodePage("", "");//ici
                    }
                    if (e.key == "Enter") {

                        const bar = { levelValue: 0, persentValue: 0, supriseValue: 0, failValue: 0, gameID: 0 };
                        //https://www.camanis.net/lemmings/codes.php
                        //CAJJLDLBCS  =fun1=>0  LCANNMFPDM=tricky1  => 30 GAJJMDMJIW=mayen 15  =>104 3*30+15
                        this.gameFactory.getConfig(this.gameID).then((config) => {
                            let codeGen = new CodeGenerator();
                            let ret = codeGen.reverseCodeSub(this.AccesscodeEntered, config.accessCodeKey, bar);
                            //console.log("Result: "+ret);
                            //console.dir(bar);
                            if (ret == 0) {
                                let total = 0;
                                let targetGroup = 0;
                                let targetLevel = 0;
                                for (var i = 0; i < this.nbgroup; i++) {
                                    let currentGroupLevelNumber = config.level.getGroupLength(i);
                                    total += currentGroupLevelNumber;
                                    if (total > bar.levelValue + 1) {
                                        targetGroup = i;
                                        targetLevel = bar.levelValue - (total - currentGroupLevelNumber);
                                        break;
                                    }
                                }
                                this.levelGroupIndex = targetGroup;
                                this.levelIndex = targetLevel;
                                this.RenderEnterCodePage("Code for Level " + (targetLevel + 1), "Rating  " + config.level.groups[targetGroup]);
                            }
                            else {
                                this.RenderEnterCodePage("Incorrect Code", "");
                            }
                            window.setTimeout(() => {
                                this.gameState = GameState.Welcome;
                                this.RenderWelcomePage();
                            }, 2500);


                        });
                    }
                    //
                } else if (this.gameState == GameState.GameSelect) {
                    let noStr: string = "-1";
                    if (e.code.startsWith("Digit")) {
                        noStr = e.code.substring(5, 6);
                        console.log("NO:" + noStr);
                    }
                    if (e.code.startsWith("Numpad")) {
                        noStr = e.code.substring(6, 7);
                        console.log("NO:" + noStr);
                    }
                    let no = parseInt(noStr);
                    this.gameFactory.getConfigs().then((GameConfigs) => {
                        let ID = GameConfigs[no - 1].gameID;
                        this.nbgroup = GameConfigs[no - 1].level.groups.length;
                        this.selectGameType(ID, GameConfigs[no - 1].gamePaletteID);
                        this.gameState = GameState.Welcome;
                    });

                } else if (this.gameState == GameState.Welcome) {
                    if (e.code == "F1")//play
                    {
                        this.StopDynamicRenderWelcomePage();
                        this.gameState = GameState.Objective;
                        this.loadLevel();
                    }
                    if (e.code == "F2")//EnterCode
                    {
                        this.StopDynamicRenderWelcomePage();
                        this.gameState = GameState.EnterCode;
                        this.AccesscodeEntered = "";
                        this.RenderEnterCodePage("", "");
                    }

                    if (e.code == "F3")//music
                    {
                        this.MusicLevel++;
                        if (this.MusicLevel > 2)
                            this.MusicLevel = 0;
                        this.RenderWelcomePage();
                    }
                    if (e.code == "ArrowDown")//
                    {
                        this.levelGroupIndex--;
                        if (this.levelGroupIndex < 0)
                            this.levelGroupIndex = this.nbgroup - 1;
                        this.RenderWelcomePage();

                    }
                    if (e.code == "ArrowUp")//
                    {
                        this.levelGroupIndex++;
                        if (this.levelGroupIndex >= this.nbgroup)
                            this.levelGroupIndex = 0;
                        this.RenderWelcomePage();
                    }
                    if (e.code == "Escape")//
                    {
                        this.gameState = GameState.GameSelect;
                        this.StopDynamicRenderWelcomePage();
                        this.RenderSelectpage();

                    }
                }

                e.stopPropagation();
                e.preventDefault();
                return false;
            });


            el.addEventListener("touchstart", (e: TouchEvent) => {
                console.log("touchstart");
                
                
                // Long press event trigger
                var self = this;
                this.timeOutEvent = setTimeout(function() {
                    this.timeOutEvent = 0;
                    console.log("long touch timeout");
                    self.longtouch=true;
                    self.Managemouse(e.touches[0].clientX, e.touches[0].clientY, 2);//left by default, to be managed (2==right click)
                }, 500); //Long press 500 milliseconds


                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            el.addEventListener("touchend", (e: TouchEvent) => {
                console.log("touchEnd");
                if (this.longtouch=== false) {
                    // double click event
                   // this.handleMouseDoubleClick(relativePos);
                   this.Managemouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY, 0);//left by default, to be managed (2==right click)
                } 
                this.longtouch=false;
                clearTimeout(this.timeOutEvent);
                this.timeOutEvent = 0;
                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            


            el.addEventListener("mouseup", (e: MouseEvent) => {

                this.Managemouse(e.clientX, e.clientY, e.button);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        }

        private Managemouse(clientX: number, clientY: number, Button: number ){
            if(this.gameState == GameState.EnterCode) {
                console.log(" EnterCode -> Welcome");
                this.gameState = GameState.Welcome;
                this.RenderWelcomePage();
            }
            else if (this.gameState == GameState.GameSelect) {
                console.log("y=" + clientY);
                let no = Math.trunc((clientY - 26) / 30);
                console.log("no=" + no);

                this.gameFactory.getConfigs().then((GameConfigs) => {
                    let ID = GameConfigs[no - 1].gameID;
                    this.nbgroup = GameConfigs[no - 1].level.groups.length;
                    this.selectGameType(ID, GameConfigs[no - 1].gamePaletteID);
                    this.gameState = GameState.Welcome;
                });
            } else if (this.gameState == GameState.Welcome) {
                //F1
                if ((clientX >= 70) && (clientX <= 70 + 120) && (clientY >= 110) && (clientY <= 110 + 61)) {
                    this.StopDynamicRenderWelcomePage();
                    console.log(" Welcome -> Objective");
                    this.gameState = GameState.Objective;
                    this.loadLevel();
                }
                //F2
                if ((clientX >= 200) && (clientX <= 200 + 120) && (clientY >= 110) && (clientY <= 110 + 61)) {
                    this.StopDynamicRenderWelcomePage();
                    this.gameState = GameState.EnterCode;
                    this.AccesscodeEntered = "";
                    this.RenderEnterCodePage("", "");
                }
                //F3 Music
                if ((clientX >= 330) && (clientX <= 330 + 120) && (clientY >= 110) && (clientY <= 110 + 61)) {
                    this.MusicLevel++;
                    if (this.MusicLevel > 2)
                        this.MusicLevel = 0;
                    this.RenderWelcomePage();
                }
                // level group
                if ((clientX >= 460) && (clientX <= 460 + 120) && (clientY >= 110) && (clientY <= 110 + 61)) {
                    this.levelGroupIndex++;
                    if (this.levelGroupIndex >= this.nbgroup)
                        this.levelGroupIndex = 0;
                    this.RenderWelcomePage();
                }
                // exit to dos
                if ((clientX >= 200) && (clientX <= 200 + 120) && (clientY >= 220) && (clientY <= 220 + 61)) {
                    this.gameState = GameState.GameSelect;
                    this.StopDynamicRenderWelcomePage();
                    this.RenderSelectpage();
                }
            } else if (this.gameState == GameState.Objective) {
                if (Button == 0)//left
                {
                    this.stage.showCursor(false);
                    console.log(" Objective ->playing ");
                    this.StartActualGame();
                }
            }
            else if (this.gameState == GameState.ResultGood) {//good

                if (Button == 0)//left
                {
                    /// move to next level
                    console.log("good => next");
                    this.gameState = GameState.Objective;
                    this.continue();
                    this.moveToLevel(1);
                }
                if (Button == 2)//right
                {
                    console.log("back to menu");
                    this.gameState = GameState.Welcome;
                    this.RenderWelcomePage();//back to menu
                }
            } else if (this.gameState == GameState.ResultBad) {//bad
                /// redo this level
                if (Button == 0)//left
                {
                    console.log("bad => redo");
                    this.gameState = GameState.Objective;
                    this.continue();
                    this.moveToLevel(0);
                }
                if (Button == 2)//right
                {
                    console.log("back to menu");
                    this.gameState = GameState.Welcome;
                    this.RenderWelcomePage();//back to menu
                }
            }
        }
        //---
        /** start or continue the game */
        public start(replayString?:string) {
            if (!this.gameFactory) return;

            /// is the game already running
            if (this.game != null) {
                this.continue();
                return;
            }
       
        }


        private onGameEnd(gameResult : GameResult) {
            this.stage.startFadeOut();
            console.dir(gameResult);
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
                    this.currentLevel.RenderStart(FullPage, this.gameState, pagspr, this.game.getVictoryCondition().getSurvivorPercentage(),null);
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
                this.WelcomePageTick = 0;
                this.RenderWelcomePage();
            });
        }

        private RenderEnterCodePage(message1:string,message2:string) {

            //ici charger les ressources pour les fontes
            let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette, this.nbgroup).then((pagspr) => {//or this.GamePalette or level.colorPalette
                if (this.stage != null) {

                    let gameDisplay = this.stage.getGameDisplay();
                    gameDisplay.clear();
                    gameDisplay.redraw();
                    //fullpage
                    let FullPage = this.stage.getFullPageDisplay();

                    FullPage.clear();
                    this.stage.redrawFullpage();
                    this.stage.resetFade();
                    let level = new Level(0, 0);
                    level.RenderEnterCodePage(FullPage, pagspr, this.AccesscodeEntered, message1,message2);
                    this.stage.redrawFullpage();
                }
            });

        }

        private RenderWelcomePage()
        {
            //ici charger les ressources pour les fontes
            let PagesPromis = this.gameResources.getPagesSprite(this.GamePalette, this.nbgroup).then((pagspr) => {//or this.GamePalette or level.colorPalette
                if (this.stage != null){
                    this.stage.showCursor(true);
                    this.WelcomePageSprire = pagspr;
                    let gameDisplay = this.stage.getGameDisplay();
                    gameDisplay.clear();
                    gameDisplay.redraw();
                    //fullpage
                    let FullPage =this.stage.getFullPageDisplay();
                
                    FullPage.clear();
                    this.stage.redrawFullpage();
                    this.stage.resetFade();
                    let level= new Level(0,0);
                    level.RenderWelcome(FullPage, pagspr, this.MusicLevel, this.levelGroupIndex, this.nbgroup, this.WelcomePageTick);
                    this.stage.redrawFullpage();
                    clearInterval(this.WelcomePageTimer);
                    this.WelcomePageTimer = setInterval(() =>{
                        let FullPage = this.stage.getFullPageDisplay();
                        let level = new Level(0, 0);
                        this.WelcomePageTick++;
                        level.RenderWelcomeDyn(FullPage, this.WelcomePageSprire, this.WelcomePageTick);
                        this.stage.redrawFullpage();
                    }, 50);
                }
            });
        }
        private StopDynamicRenderWelcomePage() {
            clearInterval(this.WelcomePageTimer);
            console.log("timer: Stopped");
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
            this.gameState = GameState.Playing;//palying
            this.start();
         

        
        }

        /** load a level and render it to the display */
        private loadLevel() {
            if (this.gameResources == null) return;
            if (this.game != null) {
                this.game.stop();
                this.game = null;
            }
          
            this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then((level) => {
                    if (level == null) return;
                    this.gameState=GameState.Objective;//targets
                    this.currentLevel=level;

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


                            /// create new game
                            this.gameFactory.getGame(this.gameID)
                                .then(game => game.loadLevel(this.levelGroupIndex, this.levelIndex, this.MusicLevel))
                                .then(game => {


                                    game.setGameDispaly(this.stage.getGameDisplay(), this.stage);
                                    game.setGuiDisplay(this.stage.getGuiDisplay(), this.stage);

                                    game.getGameTimer().speedFactor = this.gameSpeedFactor;

//                                    game.start();
                                    game.onGameEnd.on((state) => this.onGameEnd(state));

                                    this.game = game;

                          

                                    //FullPage.clear();

                                    //this.stage.redrawSub();
                                    //let map = new DisplayImage(this.stage);
                                    //console.log(map);
                                    this.game.renderSub(null);
                                    level.RenderStart(FullPage, this.gameState, pagspr, 0, this.stage.getGameDisplay());
                                    


                                    this.stage.redrawFullpage();
                                });



                            
                   
                        }

                    });
                    window.location.hash = this.buildLevelIndexHash();
                    console.dir(level);
                });

        }

    }
}

/*
click menu: 0                   =>OK    
ouvertur porte 2 puis 1
new action on lem: 3            =>OK
expolison cuicui 4 puis 11      =>OK


tomner part terre 14            =>OK
dans la sortie 15               =>OK
tomber dans l'eau:16            =>OK
les trois dernieres marches: 17 =>OK

//TF sound
objets: trap_sound_effect_id
https://www.html5rocks.com/en/tutorials/webaudio/intro/

soundsystem


remove sound-system.ts et le repertoir Sounds


*/