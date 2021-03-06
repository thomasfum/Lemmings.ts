module Lemmings {

    /** stores a rectangle range */
    export class Range {

        public x:number = 0;
        public y:number = 0;
        public width:number = 0;
        public height:number = 0;


        public draw(gameDisplay: DisplayImage) {
          //  console.warn("debug Steel: x=" + this.x + ", y=" + this.y + ", dx=" + this.width + ", dy=" + this.height);
            gameDisplay.drawRect(
                this.x, this.y,
                this.width, this.height,
                0, 255, 0);
        }
        public isPointIn(x: number, y: number): boolean {
            if ((x >= this.x) && (y >= this.y) && (x <= this.x + this.width) && (y <= this.y + this.height))
                return true;
            return false;
            }

    }

}
