
module Lemmings {

    /** Handels a mask of points for the level background
     *   that defines the solid points of the level */
    export class SolidLayer {

        /** the background mask 0=noGround / 1=ground*/
        private groundMask: Int8Array;

        public width = 0;
        public height = 0;
        private view_X=0;
        private view_width=0;
        private lemmingManager:LemmingManager;



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
        
        public SetViewParam(x:number,width:number,lemmingManager:LemmingManager){
            this.view_X=x;
            this.view_width=width;
            this.lemmingManager=lemmingManager;
        }

        
        public  getMiniMap(_x:number, _width:number):Frame {
            let f: Frame;
            f = new  Frame(102,20);
            //console.log("posimage:"+_x+ " ; "+_width);

            if(_x!=-1)
                this.view_X=_x;
            if(_width!=-1)
                this.view_width=_width;
                
            f.clear();
            let stepx=16;//can be calulated by doing  this.view_width/102
            let stepy=9;
            
            //console.log("posimage:"+this.width/stepx+ " ; "+this.height/stepy);
            //TODO: average pixels.... is probably better
            for (let x = 0; x <=this.width; x=x+stepx) {
                for (let y = 0; y <this.height; y=y+stepy) {
                    let index = x + y * this.width;
                    let c=this.groundMask[index];
                    if(c!=0)
                        f.setPixel(Math.round(x/stepx) ,Math.round(y/stepy)+1,Lemmings.ColorPalette.colorFromRGB(211,211,146));
                        
                    else
                        f.setPixel(Math.round(x/stepx) ,Math.round(y/stepy)+1,Lemmings.ColorPalette.colorFromRGB(0,0,0));
                        
                }
            }
            

            //lemings:
            let toto=this.lemmingManager.getLemmingPosList();
            //console.log("Lem:"+toto);
            for (let i = 0; i < toto.length; i++) {
                f.setPixel(Math.round(toto[i].x/stepx) ,Math.round(toto[i].y/stepy)+1,Lemmings.ColorPalette.colorFromRGB(0,178,0));
            }


            //erase top and bottom line
            for (let x = 0; x <102; x=x+1 ){
                f.setPixel(x,0,Lemmings.ColorPalette.colorFromRGB(0,0,0));
                f.setPixel(x,19,Lemmings.ColorPalette.colorFromRGB(0,0,0));
            }
            //erase last column...
            for (let y = 0; y <19; y=y+1 ){
                f.setPixel(101,y,Lemmings.ColorPalette.colorFromRGB(0,0,0));
            }


            //draw viewport rect
            let dx=Math.trunc(this.view_X/stepx);
            //console.log("posimage:"+dx);

            for (let x = dx; x <=dx+21; x=x+1 ){
                f.setPixel(x,0,Lemmings.ColorPalette.colorFromRGB(255,255,255));
                f.setPixel(x,19,Lemmings.ColorPalette.colorFromRGB(255,255,255));
            }
            for (let y = 0; y <19; y=y+1 ){
                f.setPixel(dx,y,Lemmings.ColorPalette.colorFromRGB(255,255,255));
                f.setPixel(dx+21,y,Lemmings.ColorPalette.colorFromRGB(255,255,255));
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
