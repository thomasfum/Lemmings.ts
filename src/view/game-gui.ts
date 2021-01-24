module Lemmings {

    /** handles the in-game-gui. e.g. the panel on the bottom of the game */
    export class GameGui {

        private gameTimeChanged: boolean = true;
        private skillsCountChangd: boolean = true;
        private skillSelectionChanged: boolean = true;
        private backgroundChanged: boolean = true;

        private dispaly: DisplayImage = null;
        private deltaReleaseRate: number = 0;
        private soundPlayer: AudioPlayer = null;

        private stage: Stage=null;

        constructor(private game: Game,
            private skillPanelSprites: SkillPanelSprites,
            private skills: GameSkills,
            private gameTimer: GameTimer,
            private gameVictoryCondition: GameVictoryCondition,
            private level: Level,
            private Resources:GameResources ) {
            
            this.soundPlayer = Resources.getSoundPlayerNew(SoundFxTypes.SKILL_SELECT);//TF sound
            
            gameTimer.onGameTick.on(() => {
                this.gameTimeChanged = true;
                this.doReleaseRateChanges();
            });

            skills.onCountChanged.on(() => {
                this.skillsCountChangd = true;
                this.backgroundChanged = true;
            });

            skills.onSelectionChanged.on(() => {
                this.skillSelectionChanged = true;
                this.backgroundChanged = true;
            })
        }

        private doReleaseRateChanges() {
            if (this.deltaReleaseRate == 0) {
                return;
            }

            if (this.deltaReleaseRate > 0) {
                this.game.queueCmmand(new CommandReleaseRateIncrease(this.deltaReleaseRate));
            }
            else {
                this.game.queueCmmand(new CommandReleaseRateDecrease(-this.deltaReleaseRate));
            }

        }

        /// handel click on the skills panel
        private handleSkillMouseDown(x: number) {
            let panelIndex = Math.trunc(x / 16);
          

            if (panelIndex == 0) {
                this.deltaReleaseRate = -3;
                this.doReleaseRateChanges();
                return;
            }
            if (panelIndex == 1) {

                this.deltaReleaseRate = 3;
                this.doReleaseRateChanges();
                return;
            }

            if (panelIndex == 10) {
                this.gameTimer.toggle();
                return;
            }

            let newSkill = this.getSkillByPanelIndex(panelIndex);
            if (newSkill == SkillTypes.UNKNOWN) return;


            
            if (this.soundPlayer != null)
                this.soundPlayer.play();

            this.game.queueCmmand(new CommandSelectSkill(newSkill));

            this.skillSelectionChanged = true;
        }


        public handleSkillDoubleClick(x: number) {
            let panelIndex = Math.trunc(x / 16);

            /// trigger the nuke for all lemmings
            if (panelIndex == 11) {
                this.game.queueCmmand(new CommandNuke());
            }
        }

        /** init the display */
        public setGuiDisplay(dispaly: DisplayImage, stage: Stage) {
            this.dispaly = dispaly;
            if(stage!=null)
            {
                this.stage=stage;
                this.stage.setLevel(this.level, this.game.getLemmingManager());
            }
            //console.log("**************************");
            this.dispaly.onMouseDown.dispose();
            this.dispaly.onMouseUp.dispose();
            this.dispaly.onDoubleClick.dispose();

            /// handle user input in gui
            this.dispaly.onMouseDown.on((e) => {
                this.deltaReleaseRate = 0;

                if (e.y > 15) {
                    this.handleSkillMouseDown(e.x);
                }
            });

            this.dispaly.onMouseUp.on((e) => {
                /// clear release rate change
                this.deltaReleaseRate = 0;
            })

            this.dispaly.onDoubleClick.on((e) => {
                /// clear release rate change
                this.deltaReleaseRate = 0;

                if (e.y > 15) {
                    this.handleSkillDoubleClick(e.x);
                }
                
            })


            this.gameTimeChanged = true;
            this.skillsCountChangd = true;
            this.skillSelectionChanged = true;
            this.backgroundChanged = true;
        }


        /** render the gui to the screen display */
        public render() {
            if (this.dispaly == null) return;
            let dispaly = this.dispaly;

            /// background
          //  if (this.backgroundChanged) {
                this.backgroundChanged = false;

                let panelImage = this.skillPanelSprites.getPanelSprite();
                dispaly.initSize(panelImage.width, panelImage.height);
                dispaly.setBackground(panelImage.getData());

                /// redraw everything
                this.gameTimeChanged = true;
                this.skillsCountChangd = true;
                this.skillSelectionChanged = true;
            //}

            /////////
            /// green text

            this.drawGreenString(dispaly, "Out " + this.gameVictoryCondition.getOutCount() + "  ", 112, 0);
            this.drawGreenString(dispaly, "In" + this.stringLeftPad(this.gameVictoryCondition.getSurvivorPercentage() + "", 3) + "%", 186, 0);
            this.drawGreenString(dispaly, this.stringRightPad(this.stage.GetLemAction(),13), 0, 0);
            
            if (this.gameTimeChanged) {
                this.gameTimeChanged = false;

                this.renderGameTime(dispaly, 248, 0);
            }

            /////////
            /// white skill numbers
            this.drawPanelNumber(dispaly, this.gameVictoryCondition.getMinReleaseRate(), 0);
            this.drawPanelNumber(dispaly, this.gameVictoryCondition.getCurrentReleaseRate(), 1);

            if (this.skillsCountChangd) {
                this.skillsCountChangd = false;

                for (let i = 1 /* jump over unknown */; i < SkillTypes.length(); i++) {
                    let count = this.skills.getSkill(i);
                    this.drawPanelNumber(dispaly, count, this.getPanelIndexBySkill(i));
                }
            }

            ////////
            /// selected skill
            if (this.skillSelectionChanged) {
                this.skillSelectionChanged = false;
                this.drawSelection(dispaly, this.getPanelIndexBySkill(this.skills.getSelectedSkill()));
            }

            //draw minimap
            dispaly.drawFrame(this.level.getGroundMaskLayer().getMiniMap(-1,-1),209,18);
           
        }

        /** left pad a string with spaces */
        private stringRightPad(str: string, length: number): string {
            if (str.length >= length) return str;

            return str+" ".repeat(length - str.length);
        }
        

        /** left pad a string with spaces */
        private stringLeftPad(str: string, length: number): string {
            if (str.length >= length) return str;

            return " ".repeat(length - str.length) + str;
        }

        /** return the skillType for an index */
        private getSkillByPanelIndex(panelIndex: number): SkillTypes {
            switch (Math.trunc(panelIndex)) {
                case 2: return SkillTypes.CLIMBER;
                case 3: return SkillTypes.FLOATER;
                case 4: return SkillTypes.BOMBER;
                case 5: return SkillTypes.BLOCKER;
                case 6: return SkillTypes.BUILDER;
                case 7: return SkillTypes.BASHER;
                case 8: return SkillTypes.MINER;
                case 9: return SkillTypes.DIGGER;
                default: return SkillTypes.UNKNOWN;
            }
        }

        /** return the index for a skillType */
        private getPanelIndexBySkill(skill: SkillTypes): number {
            switch (skill) {
                case SkillTypes.CLIMBER: return 2;
                case SkillTypes.FLOATER: return 3;
                case SkillTypes.BOMBER: return 4;
                case SkillTypes.BLOCKER: return 5;
                case SkillTypes.BUILDER: return 6;
                case SkillTypes.BASHER: return 7;
                case SkillTypes.MINER: return 8;
                case SkillTypes.DIGGER: return 9;
                default: return -1;
            }
        }

        /** draw a white rectangle border to the panel */
        private drawSelection(dispaly: DisplayImage, panelIndex: number) {
            dispaly.drawRect(16 * panelIndex, 16, 16, 23, 255, 255, 255);
        }

        /** draw the game time to the panel */
        private renderGameTime(dispaly: DisplayImage, x: number, y: number) {
            let gameTime = this.gameTimer.getGameLeftTimeString();

            this.drawGreenString(dispaly, "Time " + gameTime + "-00", x, y);
        }

        /** draw a white number to the skill-panel */
        private drawPanelNumber(dispaly: DisplayImage, number: number, panelIndex: number) {
            this.drawNumber(dispaly, number, 4 + 16 * panelIndex, 17);
        }

        /** draw a white number */
        private drawNumber(dispaly: DisplayImage, number: number, x: number, y: number): number {

            if (number > 0) {
                let num1Img = this.skillPanelSprites.getNumberSpriteLeft(Math.floor(number / 10));
                let num2Img = this.skillPanelSprites.getNumberSpriteRight(number % 10);

                dispaly.drawFrameCovered(num1Img, x, y, 0, 0, 0);
                dispaly.drawFrame(num2Img, x, y);
            }
            else {
                let numImg = this.skillPanelSprites.getNumberSpriteEmpty();
                dispaly.drawFrame(numImg, x, y);
            }


            return x + 8;
        }

        /** draw a text with green letters */
        private drawGreenString(dispaly: DisplayImage, text: string, x: number, y: number): number {

            for (let i = 0; i < text.length; i++) {

                let letterImg = this.skillPanelSprites.getLetterSprite(text[i]);

                if (letterImg != null) {
                    dispaly.drawFrameCovered(letterImg, x, y, 0, 0, 0);
                }

                x += 8;
            }

            return x;
        }
    }

}
