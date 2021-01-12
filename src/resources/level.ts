
module Lemmings {

    
    /** Level Data */
    export class Level {

        /** the background image */
        private groundImage: Uint8ClampedArray;

        private codeGen: CodeGenerator=null;

        /** the background mask 0=noGround / 1=ground*/
        public groundMask: SolidLayer = null;

        /** objects on the map: entrance/exit/traps */
        public objects: MapObject[] = [];

        public entrances: LevelElement[] = [];

        public triggers: Trigger[] = [];


        public gameID: number;
        public levelMode: number;//Fun	Tricky	Taxing	Mayhem
        public levelModeText: string;//Fun	Tricky	Taxing	Mayhem
        public levelIndex: number;//0,1,2,3

        public name: string = "";
        public width = 0;
        public height = 0;
        public releaseRate = 0;
        public releaseCount = 0;
        public needCount = 0;
        public timeLimit = 0;
        public skills: SkillTypes[] = new Array(SkillTypes.length());
        public screenPositionX = 0;

        public isSuperLemming = false;
        public accessCodeKey: string = "";
        public gamePaletteID: number =0;
        

        public colorPalette: ColorPalette;
        public groundPalette: ColorPalette;
        public previewPalette: ColorPalette;



        /** set the map objects of this level and update trigger */
        public setMapObjects(objects: LevelElement[], objectImg: ObjectImageInfo[]): void {
            this.entrances = [];
            this.triggers = [];
            this.objects = [];

            /// process all objects
            for (let i = 0; i < objects.length; i++) {
                let ob = objects[i];
                let objectInfo = objectImg[ob.id];

                /// add object
                let newMapObject = new MapObject(ob, objectInfo);
                this.objects.push(newMapObject);

                /// add entrances
                if (ob.id == 1) this.entrances.push(ob);

                /// add triggers
                if (objectInfo.trigger_effect_id != 0) {
                    let x1 = ob.x + objectInfo.trigger_left;
                    let y1 = ob.y + objectInfo.trigger_top;

                    let x2 = x1 + objectInfo.trigger_width;
                    let y2 = y1 + objectInfo.trigger_height;

                    let newTrigger = new Trigger(objectInfo.trigger_effect_id, x1, y1, x2, y2, 0, objectInfo.trap_sound_effect_id);

                    this.triggers.push(newTrigger);
                }

            }
        }

        /** check if a y-position is out of the level */
        public isOutOfLevel(y: number): boolean {
            return ((y >= this.height) || (y <= 0));
        }

        /** return the layer that defines if a pixel in the level is solid */
        public getGroundMaskLayer(): SolidLayer {
            if (this.groundMask == null) {
                this.groundMask = new SolidLayer(this.width, this.height);
            }

            return this.groundMask;
        }


        /** set the GroundMaskLayer */
        public setGroundMaskLayer(solidLayer: SolidLayer): void {
            this.groundMask = solidLayer;
        }

        /** clear with mask  */
        public clearGroundWithMask(mask: Mask, x: number, y: number) {
            x += mask.offsetX;
            y += mask.offsetY;

            for (let d_y = 0; d_y < mask.height; d_y++) {
                for (let d_x = 0; d_x < mask.width; d_x++) {
                    if (!mask.at(d_x, d_y)) {
                        this.clearGroundAt(x + d_x, y + d_y);
                    }
                }
            }

        }

        /** set a point in the map to solid ground  */
        public setGroundAt(x: number, y: number, palletIndex: number) {

            this.groundMask.setGroundAt(x, y);

            let index = (y * this.width + x) * 4;
            this.groundImage[index + 0] = this.colorPalette.getR(palletIndex);
            this.groundImage[index + 1] = this.colorPalette.getG(palletIndex);
            this.groundImage[index + 2] = this.colorPalette.getB(palletIndex);
        }

        /** checks if a point is solid ground  */
        public hasGroundAt(x: number, y: number): boolean {
            return this.groundMask.hasGroundAt(x, y);
        }


        /** clear a point  */
        public clearGroundAt(x: number, y: number) {

            this.groundMask.clearGroundAt(x, y);

            let index = (y * this.width + x) * 4;

            this.groundImage[index + 0] = 0; // R
            this.groundImage[index + 1] = 0; // G
            this.groundImage[index + 2] = 0; // B
        }


        public setGroundImage(img: Uint8ClampedArray) {
            this.groundImage = new Uint8ClampedArray(img);
        }

        /** set the color palettes for this level */
        public setPalettes(colorPalette: ColorPalette, groundPalette: ColorPalette) {
            this.colorPalette = colorPalette;
            this.groundPalette = groundPalette;
        }


        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
        }

        public RenderSelectpage(pageDisplay: DisplayImage, sprites: pagesSprites, GC: GameConfig[])
        {
            let brownFrame=sprites.getPanelSprite();
            pageDisplay.clear();
            pageDisplay.drawFrame(brownFrame, 0, 0);
            pageDisplay.drawFrame(brownFrame, 0, 104);
            pageDisplay.drawFrame(brownFrame, 320, 0);
            pageDisplay.drawFrame(brownFrame, 320, 104);
            pageDisplay.drawFrame(brownFrame, 0, 208);
            pageDisplay.drawFrame(brownFrame, 0, 312);
            pageDisplay.drawFrame(brownFrame, 320, 208);
            pageDisplay.drawFrame(brownFrame, 320, 312);
            this.drawString(pageDisplay, "Select Game:", 0,  26, sprites);
            for (var i = 0; i < GC.length; i++) {
                this.drawString(pageDisplay, (i+1)+" : " + GC[i].name, 100,  26+ (30*(i+1)), sprites);
            }
         
        }
        public RenderEnterCodePage(pageDisplay: DisplayImage, sprites: pagesSprites, AccesscodeEntered: string, message1: string, message2: string ) {
            let brownFrame = sprites.getPanelSprite();
            pageDisplay.clear();

            pageDisplay.drawFrame(brownFrame, 0, 0);
            pageDisplay.drawFrame(brownFrame, 0, 104);
            pageDisplay.drawFrame(brownFrame, 320, 0);
            pageDisplay.drawFrame(brownFrame, 320, 104);
            pageDisplay.drawFrame(brownFrame, 0, 208);
            pageDisplay.drawFrame(brownFrame, 0, 312);
            pageDisplay.drawFrame(brownFrame, 320, 208);
            pageDisplay.drawFrame(brownFrame, 320, 312);

            for (let x = 258; x < 258 + (10*16); x++) 
                for (let y = 171; y < 171+16; y++) 
                    pageDisplay.setPixel(x,y,0,0,0);
            this.drawString(pageDisplay, "Enter Code", 258, 135, sprites);
            if(AccesscodeEntered.length<10)
            AccesscodeEntered+="_";
            this.drawString(pageDisplay, AccesscodeEntered.padEnd(10, '.'), 258, 171, sprites);
            if((message1!="")&&(message2!=""))//good
            {
                this.drawString(pageDisplay, message1, 187+8, 203, sprites);
                this.drawString(pageDisplay, message2, 222+8, 239, sprites);
            }
            if((message1!="")&&(message2==""))//bad
            this.drawString(pageDisplay, message1, 226, 205, sprites);
        }

        public RenderWelcomeDyn(pageDisplay: DisplayImage, sprites: pagesSprites) {
            let LeftLemmingWorkingScroller = sprites.getLeftLemmingWorkingScroller();
            let RighttLemmingWorkingScroller = sprites.getRightLemmingWorkingScroller();
            let Reel = sprites.getReel();


            for (let i = 0; i < 35; i++) {
                pageDisplay.drawFrame(Reel, 48 + (i * 16), 382 -20);
            }
            pageDisplay.drawFrame(LeftLemmingWorkingScroller[0], 0, 382 -20);
            pageDisplay.drawFrame(RighttLemmingWorkingScroller[0], 600, 382 -20);

        }
       
       public RenderWelcome(pageDisplay: DisplayImage, sprites: pagesSprites,MusicLevel:number, DifficultyLevel: number, nbgroup: number)
        {
    
            let brownFrame=sprites.getPanelSprite();
            let logo=sprites.getLogo();
            let F1=sprites.getF1();
            let F2=sprites.getF2();
            let F3=sprites.getF3();
            let F4=sprites.getF4();
            let FX=sprites.getFX();
            let ExitDos=sprites.getExitDOS();
            let LevelRating=sprites.getLeveRating();
            let MusicNote=sprites.getMusicNote();

            let LeftLemmingWorkingScroller=sprites.getLeftLemmingWorkingScroller();
            let RighttLemmingWorkingScroller=sprites.getRightLemmingWorkingScroller();
            let Reel=sprites.getReel();

            let mayhemSign=sprites.getMayhemSign();
            let taxingSign=sprites.getTaxingSign();
            let trickySign=sprites.getTrickySign();
            let funSign=sprites.getFunSign();
            let funSign2=sprites.getFunSign2();
                


            pageDisplay.clear();

            pageDisplay.drawFrame(brownFrame, 0, 0);
            pageDisplay.drawFrame(brownFrame, 0, 104);
            pageDisplay.drawFrame(brownFrame, 320, 0);
            pageDisplay.drawFrame(brownFrame, 320, 104);
            pageDisplay.drawFrame(brownFrame, 0, 208);
            pageDisplay.drawFrame(brownFrame, 0, 312);
            pageDisplay.drawFrame(brownFrame, 320, 208);
            pageDisplay.drawFrame(brownFrame, 320, 312);

            pageDisplay.drawFrame(logo, 10, 0);
            pageDisplay.drawFrame(F1, 80-10, 110);
            pageDisplay.drawFrame(F2, 210-10, 110);
            pageDisplay.drawFrame(F3, 340-10, 110);

            if(MusicLevel==1)
                pageDisplay.drawFrame(FX, 340-10+25+2, 110+25);
            if(MusicLevel==2)
                pageDisplay.drawFrame(MusicNote, 340-10+25+2, 110+25);
                
                      


           pageDisplay.drawFrame(LevelRating, 470 - 10, 110);
           console.log("NB group=" + nbgroup);
           if ((nbgroup > 1)&& (nbgroup <=4))
            {
                if(DifficultyLevel==0)
                    pageDisplay.drawFrame(funSign, 470-10+25+8, 110+25);
                if(DifficultyLevel==1)
                    pageDisplay.drawFrame(trickySign, 470-10+25+8, 110+25);
                if(DifficultyLevel==2)
                    pageDisplay.drawFrame(taxingSign, 470-10+25+8, 110+25);
                if(DifficultyLevel==3)
                    pageDisplay.drawFrame(mayhemSign, 470-10+25+8, 110+25);
                
           }
           if (nbgroup == 5) {
               if (DifficultyLevel == 0)
                   pageDisplay.drawFrame(funSign2, 470 - 10 + 25 + 8, 110 + 25);
               if (DifficultyLevel == 1)
                   pageDisplay.drawFrame(funSign, 470 - 10 + 25 + 8, 110 + 25);
               if (DifficultyLevel == 2)
                   pageDisplay.drawFrame(trickySign, 470 - 10 + 25 + 8, 110 + 25);
               if (DifficultyLevel == 3)
                   pageDisplay.drawFrame(taxingSign, 470 - 10 + 25 + 8, 110 + 25);
               if (DifficultyLevel == 4)
                   pageDisplay.drawFrame(mayhemSign, 470 - 10 + 25 + 8, 110 + 25);
           }

            pageDisplay.drawFrame(ExitDos, 210-10, 220);
            pageDisplay.drawFrame(F4, 340-10, 220);
            

            this.drawString(pageDisplay, "(c) MCMXCI, Psygnosis Ltd", 120,  300, sprites);
            this.drawString(pageDisplay, "    A DMA Design Game", 120,  320, sprites);

           
            for(let i=0; i<35;i++)
            {
                pageDisplay.drawFrame(Reel, 48+ (i*16), 382);
            }
            pageDisplay.drawFrame(LeftLemmingWorkingScroller[0], 0, 382);
            pageDisplay.drawFrame(RighttLemmingWorkingScroller[0], 600, 382);


        }
     

        public RenderStart(pageDisplay: DisplayImage, gameState: GameState, sprites: pagesSprites,survivorPercent:number)
        {

            let brownFrame=sprites.getPanelSprite();
            pageDisplay.clear();
            pageDisplay.drawFrame(brownFrame, 0, 0);
            pageDisplay.drawFrame(brownFrame, 0, 104);
            pageDisplay.drawFrame(brownFrame, 320, 0);
            pageDisplay.drawFrame(brownFrame, 320, 104);
            pageDisplay.drawFrame(brownFrame, 0, 208);
            pageDisplay.drawFrame(brownFrame, 0, 312);
            pageDisplay.drawFrame(brownFrame, 320, 208);
            pageDisplay.drawFrame(brownFrame, 320, 312);


            if(gameState==GameState.Objective)//target
            {
                console.log("Level "+this.levelIndex+1);
                console.log("Name "+this.name);
                console.log("Number of Lemmings "+this.releaseCount);
                console.log(Math.round(this.needCount*100/this.releaseCount)+ "% To Be Saved");
                console.log("Release Rate "+this.releaseRate);
                console.log("Time "+this.timeLimit +" Minutes");
                console.log("Rating " + this.levelModeText);// +" ( " +this.levelMode+" )");
                pageDisplay.clear();

                let x = 160;
                let y = 70;
                this.drawString(pageDisplay, "Level " + (this.levelIndex + 1) + this.name, 0, y + 26, sprites);
                this.drawString(pageDisplay, "Number of Lemmings " + this.releaseCount, x, y +70, sprites);
                this.drawString(pageDisplay, Math.round(this.needCount * 100 / this.releaseCount) + "% To Be Saved", x, y +70+ 38, sprites);
                this.drawString(pageDisplay, "Release Rate " + this.releaseRate, x, y +70+ (2*38), sprites);
                this.drawString(pageDisplay, "Time " + this.timeLimit + " Minutes", x, y + 70 + (3 * 38), sprites);
                this.drawString(pageDisplay, "Rating  " + this.levelModeText, x, y+70 + (4 * 38), sprites);// +" ( " +this.levelMode+" )");
                this.drawString(pageDisplay, "Press mouse button to continue" , 80, y +280, sprites);// +" ( " +this.levelMode+" )");
                
            }
            if ((gameState == GameState.ResultGood) || (gameState == GameState.ResultBad))//result ok
            {
                pageDisplay.clear();
                this.drawString(pageDisplay, "All lemmings accounted for.", 113, 20, sprites);

                this.drawString(pageDisplay, "You rescued " + survivorPercent + "%", 224, 57, sprites);
                this.drawString(pageDisplay, "You needed  " + Math.round(this.needCount * 100 / this.releaseCount) + "%", 224, 77, sprites);

                //0%
                let line1 = "";
                let line2 = "";

                if (survivorPercent == 0) {
                    line1 = "ROCK BOTTOM! I hope for your sake";
                    line2 = "    that you nuked that level";
                }
                else
                    if (survivorPercent == 100)
                    {
                        line1 = "Superb! You rescued every lemmings on";
                        line2 = "that level. Can you do it again....?";
                    }
                    else
                    {
                            let diff = survivorPercent / Math.round(this.needCount * 100 / this.releaseCount);
                            console.log("Diff="+diff);
                            if (diff < 0.5) {
                                //2% / 50% -> 22% / 50%
                                line1 = "Better rethink your strategy  before";
                                line2 = "     you try this level again!";
                            }
                            if ((diff > 0.5)&&(diff <= 0.9))
                             {
                                //27/50%
                                line1 = "A little more practice on this level";
                                line2 = "     is definitely recommended";
                            }
                            if ((diff >=1)&&(diff <= 1.1))
                            { //46 / 50%
                                line1 = "RIGHT ON. You can't get much closer";
                                line2 = " than that. Let's try the next...";
                            }
                            if ((diff > 1.1)&&(diff <= 5)) {//20% / 10%
                                
                                line1 = "That level seemed no problem to you on";
                                line2 = "that attempt. Onto the next....";
                            }
                            if (diff > 5) {//70% /10%
                                line1 = "   You totally stormed that level!";
                                line2 = "Let's see if you can storm the next...";
                            }

                        
                    }

               

                this.drawString(pageDisplay, line1, 40, 130, sprites);
                this.drawString(pageDisplay, line2, 40, 150, sprites);

                if (gameState == GameState.ResultGood)//result good
                {

                    if(this.codeGen==null)
                        this.codeGen= new CodeGenerator();


                    let accessCode=this.codeGen.createCode(this.levelIndex,survivorPercent,this.accessCodeKey);
                    if (accessCode != "") {
                        this.drawString(pageDisplay, "Your Access Code for Level " + (this.levelIndex + 2), 78, 258, sprites);
                        this.drawString(pageDisplay, "is " + accessCode, 227, 278, sprites);
                    }

                    this.drawString(pageDisplay, "Press left mouse button for next level", 23, 332, sprites);
                }
                if (gameState == GameState.ResultBad)//result bad
                    this.drawString(pageDisplay, "Press left mouse button to retry level", 23, 332, sprites);
                this.drawString(pageDisplay, "Press right mouse button for menu", 58, 352, sprites);
            }
        }

         /** draw a text with green letters */
         private drawString(dispaly: DisplayImage, text: string, x: number, y: number,sprites: pagesSprites): number {

            for (let i = 0; i < text.length; i++) {
                let letterImg = sprites.getLetterSprite(text[i]);
                if (letterImg != null) {
                    dispaly.drawFrame(letterImg, x, y);
                }
                x += 16;
            }

            return x;
        }

        /** render ground to display */
        public render(gameDisplay: DisplayImage) {
            gameDisplay.initSize(this.width, this.height);

            gameDisplay.setBackground(this.groundImage, this.groundMask);
        }

    }

}
