
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

        public RenderStart(pageDisplay: DisplayImage, gameState: number, brownFrame: Frame,sprites: pagesSprites,survivorPercent:number)
        {

            pageDisplay.clear();

            pageDisplay.drawFrame(brownFrame, 0, 0);
            pageDisplay.drawFrame(brownFrame, 0, 104);
            pageDisplay.drawFrame(brownFrame, 320, 0);
            pageDisplay.drawFrame(brownFrame, 320, 104);
            pageDisplay.drawFrame(brownFrame, 0, 208);
            pageDisplay.drawFrame(brownFrame, 0, 312);
            pageDisplay.drawFrame(brownFrame, 320, 208);
            pageDisplay.drawFrame(brownFrame, 320, 312);

            if(gameState==1)//target
            {
                console.log("Level "+this.levelIndex+1);
                console.log("Name "+this.name);
                console.log("Number of Lemmings "+this.releaseCount);
                console.log(Math.round(this.needCount*100/this.releaseCount)+ "% To Be Saved");
                console.log("Release Rate "+this.releaseRate);
                console.log("Time "+this.timeLimit +" Minutes");
                console.log("Rating " + this.levelModeText);// +" ( " +this.levelMode+" )");
              

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
            if ((gameState == 3) || (gameState == 4))//result ok
            {
                pageDisplay.clear();
                this.drawString(pageDisplay, "All lemmings accounted for.", 113, 20, sprites);

                this.drawString(pageDisplay, "You rescued " + Math.round(this.needCount * 100 / this.releaseCount) + "%", 224, 57, sprites);
                this.drawString(pageDisplay, "You needed  " + survivorPercent + "%", 224, 77, sprites);

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

                if (gameState == 3)//result good
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
                if (gameState == 4)//result bad
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
