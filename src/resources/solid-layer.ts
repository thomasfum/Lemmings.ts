
module Lemmings {

    /** Handels a mask of points for the level background
     *   that defines the solid points of the level */
    export class SolidLayer {

        /** the background mask 0=noGround / 1=ground*/
        private groundMask: Int8Array;

        public width = 0;
        public height = 0;


        /** check if a point is solid */
        public hasGroundAt(x: number, y: number): boolean {
            if ((x < 0) || (x >= this.width)) return false;
            if ((y < 0) || (y >= this.height)) return false;

            return (this.groundMask[x + y * this.width] != 0);
        }

        /** clear a point  */
        public clearGroundAt(x: number, y: number) {
            let index = x + y * this.width;

            this.groundMask[index] = 0;
        }

        /** clear a point  */
        public setGroundAt(x: number, y: number) {
            let index = x + y * this.width;

            this.groundMask[index] = 1;
        }
        
        
        public  getMiniMap():Frame {
            let f: Frame;
            f = new  Frame(480,80);//TODO: TBD
            let stepx=16;
            let stepy=9;
            //TODO: average pixels.... is probably better
            for (let x = 0; x <this.width; x=x+stepx) {
                for (let y = 0; y <this.height; y=y+stepy) {
                    let index = x + y * this.width;
                    let c=this.groundMask[index];
                    if(c!=0)
                        f.setPixel(x/stepx,y/stepy,Lemmings.ColorPalette.colorFromRGB(255,255,125));//TODO: To be checked.
                    else
                        f.setPixel(x/stepx,y/stepy,Lemmings.ColorPalette.colorFromRGB(0,0,0));
                }
            }
            return f;
        }

        constructor(width: number, height: number, mask: Int8Array=null) {
            this.width = width;
            this.height = height;

            if (mask != null) {
                this.groundMask = mask;
            }

        }

    }

}
