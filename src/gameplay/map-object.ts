module Lemmings {



    /** represent a object (e.g. Exit, Entry, Trap, ...) */
    export class MapObject {
        public animation: Animation;
        public x: number;
        public y: number;
        public drawProperties: DrawProperties;
        public trigger_effect_id: number;
        public isTrigerred:boolean = false;

        constructor(ob: LevelElement, objectImg: ObjectImageInfo) {
            this.x = ob.x;
            this.y = ob.y;
            this.trigger_effect_id=objectImg.trigger_effect_id;
            this.drawProperties = ob.drawProperties;
            if (ob.id == 1)//entrance
                this.isTrigerred = true;



            this.animation = new Animation();

            this.animation.isRepeat = objectImg.animationLoop;
            this.animation.firstFrameIndex = objectImg.firstFrameIndex;

            for (let i = 0; i < objectImg.frames.length; i++) {
                let newFrame = new Frame(objectImg.width, objectImg.height);

                //newFrame.clear();
                newFrame.drawPaletteImage(objectImg.frames[i], objectImg.width, objectImg.height, objectImg.palette, 0, 0);

                this.animation.frames.push(newFrame);
            }
        }
    }

}