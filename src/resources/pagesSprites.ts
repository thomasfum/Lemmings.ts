
module Lemmings {

    /** manage the sprites need for the game skill panel */
    export class pagesSprites {

        private panelSprite:Frame;
        private letterSprite: {[key:string]:Frame} = {};
        private logo:Frame;
        private F1:Frame;
        private F2:Frame;
        private F3:Frame;
        
/*
        private numberSpriteLeft: Frame[] = [];
        private numberSpriteRight: Frame[] = [];
        private emptyNumberSprite : Frame;
*/
        // return the sprite for the skill panel 
        public getPanelSprite() : Frame {
            return this.panelSprite;
        }
        public getLogo() : Frame {
            return this.logo;
        }
        public getF1() : Frame {
            return this.F1;
        }
        public getF2() : Frame {
            return this.F2;
        }
        public getF3() : Frame {
            return this.F3;
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

            //read logo
            let LogoImg = new PaletteImage(632, 94);
            LogoImg.processImage(fr3, 4);
            LogoImg.processTransparentByColorIndex(0);
            this.logo = LogoImg.createFrame(colorPalette);

            //read F1
            let F1Img = new PaletteImage(120, 61);
            F1Img.processImage(fr3, 4);
            F1Img.processTransparentByColorIndex(0);
            this.F1 = F1Img.createFrame(colorPalette);

            //read F2
            let F2Img = new PaletteImage(120, 61);
            F2Img.processImage(fr3, 4);
            F2Img.processTransparentByColorIndex(0);
            this.F2 = F2Img.createFrame(colorPalette);

            //read F3
            let F3Img = new PaletteImage(120, 61);
            F3Img.processImage(fr3, 4);
            F3Img.processTransparentByColorIndex(0);
            this.F3 = F3Img.createFrame(colorPalette);


/*
    [0x9488]     F1 sign                       1          120x61        4 
    [0xA2D4]     F2 sign                       1          120x61        4
    [0xB120]     F3 sign                       1          120x61        4
    [0xBF6C]     Level Rating sign             1          120x61        4 
    [0xCDB8]     Exit to DOS sign              1          120x61        4 
    [0xDC04]     F4 sign                       1          120x61        4
    [0xEA50]     music note icon               1           64x31        4
    [0xEE30]     "FX" icon                     1           64x31        4


*/



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