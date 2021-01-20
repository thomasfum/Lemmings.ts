module Lemmings {

    export class Animation {
        public frames:Frame[] = [];
        public isRepeat :boolean = true;
        public firstFrameIndex: number = 0;
        public isDone: boolean = false;
        private frameInc: number = 0;
        private alreadyplayed:boolean=false;
        public reset() {
            this.frameInc = 0;
            this.isDone = false;
        }
        public reStart() {
            if (this.isDone == true) {
                this.frameInc =  this.firstFrameIndex;
                this.isDone = false;
            }
        }

        public getLastFrame(): Frame {
            if(this.alreadyplayed==true)
                return this.frames[0];
            else
                return this.frames[this.firstFrameIndex];
        }
        public getFrame(frameIndex:number):Frame {
            
            frameIndex = frameIndex + this.firstFrameIndex;
            this.alreadyplayed=true;
            let frame = 0;

            if (this.isRepeat) {
                frame = frameIndex % this.frames.length;
            }
            else {
                if (this.frameInc < this.frames.length) {
                    
                    frame = this.frameInc+this.firstFrameIndex;
                    if(frame>=this.frames.length)
                        frame=frame-this.frames.length;

                    console.log("frame"+this.frameInc +","+this.firstFrameIndex+"="+frame);
                    this.frameInc++;


                }
                /*
                if (frameIndex < this.frames.length) {
                    frame = frameIndex;
                }
                */
                else {
                    this.isDone = true;
                    frame = 0;//the last one
                }
            }

            return this.frames[frame];
        }

        /** load all images for this animation from a file */
        public loadFromFile(fr: BinaryReader, bitsPerPixle: number, width: number, height: number, frames: number, palette:ColorPalette, offsetX:number=null, offsetY:number=null) {

            for (let f = 0; f < frames; f++) {
                let paletteImg = new PaletteImage(width, height);
                paletteImg.processImage(fr, bitsPerPixle);
                paletteImg.processTransparentByColorIndex(0);

                this.frames.push(paletteImg.createFrame(palette, offsetX, offsetY));
            }

        }
    }
}
