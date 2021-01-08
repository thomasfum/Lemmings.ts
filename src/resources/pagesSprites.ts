
module Lemmings {

    /** manage the sprites need for the game skill panel */
    export class pagesSprites {

        private panelSprite:Frame;
        private letterSprite: {[key:string]:Frame} = {};
/*
        private numberSpriteLeft: Frame[] = [];
        private numberSpriteRight: Frame[] = [];
        private emptyNumberSprite : Frame;
*/
        // return the sprite for the skill panel 
        public getPanelSprite() : Frame {
            return this.panelSprite;
        }

        // return a purple letter 
        public getLetterSprite(letter:string) : Frame {
            return this.letterSprite[letter];
        }
/*
        // return a number letter 
        public getNumberSpriteLeft(number:number) : Frame {
            return this.numberSpriteLeft[number];
        }

        // return a number letter
        public getNumberSpriteRight(number:number) : Frame {
            return this.numberSpriteRight[number];
        }

        public getNumberSpriteEmpty() : Frame {
            return this.emptyNumberSprite;
        }
        */
        constructor(fr3:BinaryReader, fr4:BinaryReader,colorPalette:ColorPalette) {

            
            /// read  brown background
            let paletteImg = new PaletteImage(320, 104);
            paletteImg.processImage(fr3, 2);
            this.panelSprite = paletteImg.createFrame(colorPalette);

            /// read green panel letters
            let letters:string[] = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~"];

            fr4.setOffset(0x69B0);
            for (let l = 0; l < letters.length; l++) {
                let paletteImg = new PaletteImage(16, 16);
                paletteImg.processImage(fr4, 3);
                paletteImg.processTransparentByColorIndex(0);
                this.letterSprite[letters[l]] = paletteImg.createFrame(colorPalette);
            }
            /*
            /// add space
            let emptyFrame = new Frame(16, 16);
            emptyFrame.fill(0, 0, 0);
            emptyFrame.processTransparentByColorIndex(0);
            this.letterSprite[" "] = emptyFrame;
            */
/*
            let blackAndWithPalette = new ColorPalette();
            blackAndWithPalette.setColorRGB(1, 255, 255, 255);

            /// read panel skill-count number letters
            fr2.setOffset(0x1900);
            for (let i = 0; i < 10; i++) {
                let paletteImgRight = new PaletteImage(8, 8);
                paletteImgRight.processImage(fr2, 1);
                paletteImgRight.processTransparentByColorIndex(0);
                this.numberSpriteRight.push(paletteImgRight.createFrame(blackAndWithPalette));

                let paletteImgLeft = new PaletteImage(8, 8);
                paletteImgLeft.processImage(fr2, 1);
                paletteImgLeft.processTransparentByColorIndex(0);
                this.numberSpriteLeft.push(paletteImgLeft.createFrame(blackAndWithPalette));
            }

            /// add space
            this.emptyNumberSprite = new Frame(9, 8);
            this.emptyNumberSprite.fill(255, 255, 255);
            */
        }

    }

}