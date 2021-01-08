
module Lemmings {

    /** Level Data */
    export class Level {

        /** the background image */
        private groundImage: Uint8ClampedArray;

        /** the background mask 0=noGround / 1=ground*/
        public groundMask: SolidLayer = null;

        /** objects on the map: entrance/exit/traps */
        public objects: MapObject[] = [];

        public entrances: LevelElement[] = [];

        public triggers: Trigger[] = [];


        public gameID: number;
        public levelMode: number;
        public levelModeText: string;
        public levelIndex: number;

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

        public RenderStart(pageDisplay: DisplayImage, gameState: number, brownFrame: Frame,sprites: pagesSprites)
        {
            if(gameState==1)//target
            {
               
                console.log("Level "+this.levelIndex+1);
                console.log("Name "+this.name);
                console.log("Number of Lemmings "+this.releaseCount);
                console.log(Math.round(this.needCount*100/this.releaseCount)+ "% To Be Saved");
                console.log("Release Rate "+this.releaseRate);
                console.log("Time "+this.timeLimit +" Minutes");
                console.log("Rating "+this.levelModeText);// +" ( " +this.levelMode+" )");

                pageDisplay.drawFrame(brownFrame, 0, 0);
                pageDisplay.drawFrame(brownFrame, 0, 104);
                pageDisplay.drawFrame(brownFrame, 320, 0);
                pageDisplay.drawFrame(brownFrame, 320, 104);
                pageDisplay.drawFrame(brownFrame, 0, 208);
                pageDisplay.drawFrame(brownFrame, 0, 312);
                pageDisplay.drawFrame(brownFrame, 320, 208);
                pageDisplay.drawFrame(brownFrame, 320, 312);

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
