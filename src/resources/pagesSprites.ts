
module Lemmings {

    /** manage the sprites need for the game skill panel */
    export class pagesSprites {

        private panelSprite:Frame;
        private letterSprite: {[key:string]:Frame} = {};
        private logo:Frame;
        private F1:Frame;
        private F2:Frame;
        private F3:Frame;
        private LeveRating:Frame;
        private ExitToDOS:Frame;
        private F4:Frame;
        private MusicNote:Frame;
        private FX:Frame;
        private blink:Frame[][]=[];
        private leftLemmingWorkingScroller:Frame[]=[];
        private rightLemmingWorkingScroller:Frame[]=[];
        private Reel:Frame;
        

        private mayhemSign:Frame;
        private taxingSign:Frame;
        private trickySign:Frame;
        private funSign:Frame;
        private funSign2:Frame;


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
        public getF4() : Frame {
            return this.F4;
        }
        public getFX() : Frame {
            return this.FX;
        }
        public getExitDOS() : Frame {
            return this.ExitToDOS;
        }
        public getLeveRating() : Frame {
            return this.LeveRating;
        }
        public getMusicNote() : Frame {
            return this.MusicNote;
        }
        
        public getBlink(i: number) : Frame[] {
            return this.blink[i];
        }

        public getLeftLemmingWorkingScroller() : Frame[] {
            return this.leftLemmingWorkingScroller;
        }
        
        public getRightLemmingWorkingScroller() : Frame[] {
            return this.rightLemmingWorkingScroller;
        }
        public getReel() : Frame {
            return this.Reel;
        }
        public getMayhemSign() : Frame {
            return this.mayhemSign;
        }
        public getTaxingSign() : Frame {
            return this.taxingSign;
        }
        public getTrickySign() : Frame {
            return this.trickySign;
        }
        public getFunSign() : Frame {
            return this.funSign;
        }
        public getFunSign2() : Frame {
            return this.funSign2;
        }


        // return a purple letter 
        public getLetterSprite(letter:string) : Frame {
            return this.letterSprite[letter];
        }

        constructor(fr3:BinaryReader, fr4:BinaryReader,colorPalette:ColorPalette, nbGroup:number) {

            let cinq=false;
            if(nbGroup==5)
                cinq=true;

            /*
                offset (hex)  description              # of frames  width x height  bpp
                ------------  -----------------------  -----------  --------------  ---
                [0x0000]     brown background              1          320x104       2
                [0x2080]     Lemmings logo                 1          632x94        4 
                [0x9488]     F1 sign                       1          120x61        4 
                [0xA2D4]     F2 sign                       1          120x61        4
                [0xB120]     F3 sign                       1          120x61        4
                [0xBF6C]     Level Rating sign             1          120x61        4 
                [0xCDB8]     Exit to DOS sign              1          120x61        4 
                [0xDC04]     F4 sign                       1          120x61        4
                [0xEA50]     music note icon               1           64x31        4
                [0xEE30]     "FX" icon                     1           64x31        4
            */
           
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

            //read Level Rating sign
            let LeveRatingImg = new PaletteImage(120, 61);
            LeveRatingImg.processImage(fr3, 4);
            LeveRatingImg.processTransparentByColorIndex(0);
            this.LeveRating = LeveRatingImg.createFrame(colorPalette);
            //read Level Rating sign
            let ExitToDOSSignImg = new PaletteImage(120, 61);
            ExitToDOSSignImg.processImage(fr3, 4);
            ExitToDOSSignImg.processTransparentByColorIndex(0);
            this.ExitToDOS = ExitToDOSSignImg.createFrame(colorPalette);
            //read F4
            let F4Img = new PaletteImage(120, 61);
            F4Img.processImage(fr3, 4);
            F4Img.processTransparentByColorIndex(0);
            this.F4 = F4Img.createFrame(colorPalette);

            //read music note icon
            let musicNoteIconImg = new PaletteImage(64, 31);
            musicNoteIconImg.processImage(fr3, 4);
            //musicNoteIconImg.processTransparentByColorIndex(0);
            this.MusicNote = musicNoteIconImg.createFrame(colorPalette);

            //read "FX" icon
            let FXIconImg = new PaletteImage(64, 31);
            FXIconImg.processImage(fr3, 4);
            //FXIconImg.processTransparentByColorIndex(0);
            this.FX = FXIconImg.createFrame(colorPalette);




            /*
            offset (hex)  description                   # of frames  width x height  bpp
            ------------  -----------------------       -----------  --------------  ---
            [0x0000]     blink1                               8           32x12        4
            [0x0600]     blink2                               8           32x12        4
            [0x0C00]     blink3                               8           32x12        4
            [0x1200]     blink4                               8           32x12        4
            [0x1800]     blink5                               8           32x12        4
            [0x1E00]     blink6                               8           32x12        4
            [0x2400]     blink7                               8           32x12        4
            [0x2A00]     left Lemming working scroller       16           48x16        4
            [0x4200]     right Lemming working scroller      16           48x16        4
            [0x5A00]     reel                                 1           16x16        4
            [0x5A80]     mayhem sign                          1           72x27        4
            [0x5E4C]     taxing sign                          1           72x27        4
            [0x6218]     tricky sign                          1           72x27        4
            [0x65E4]     fun sign                             1           72x27        4
            [0x69B0]     "!"                                  1           16x16        3
            */


            for(let i=0; i<7;i++)
            {
                this.blink[i]= [];
                for(let j=0; j<8;j++)
                {
                    //read "blink1" icon
                    let blinkImg = new PaletteImage(32, 12);
                    blinkImg.processImage(fr4, 4);
                    //blink1Img.processTransparentByColorIndex(0);
                    this.blink[i].push( blinkImg.createFrame(colorPalette));
                }
            }

            for(let i=0; i<16;i++)
            {
                    let leftLemmingWorkingScrollerImg = new PaletteImage(48, 16);
                    leftLemmingWorkingScrollerImg.processImage(fr4, 4);
                    //blink1Img.processTransparentByColorIndex(0);
                    this.leftLemmingWorkingScroller.push( leftLemmingWorkingScrollerImg.createFrame(colorPalette));
            }
            for(let i=0; i<16;i++)
            {
                    let rightLemmingWorkingScrollerImg = new PaletteImage(48, 16);
                    rightLemmingWorkingScrollerImg.processImage(fr4, 4);
                    //blink1Img.processTransparentByColorIndex(0);
                    this.rightLemmingWorkingScroller.push( rightLemmingWorkingScrollerImg.createFrame(colorPalette));
                
            }

            //read "reel" icon
            let ReelImg = new PaletteImage(16, 16);
            ReelImg.processImage(fr4, 4);
            //FXIconImg.processTransparentByColorIndex(0);
            this.Reel = ReelImg.createFrame(colorPalette);

            //read "mayhem sign" 
            let mayhemImg = new PaletteImage(72, 27);
            mayhemImg.processImage(fr4, 4);
            //mayhemImg.processTransparentByColorIndex(0);
            this.mayhemSign = mayhemImg.createFrame(colorPalette);

            //read "taxing sign" 
            let taxingImg = new PaletteImage(72, 27);
            taxingImg.processImage(fr4, 4);
            //taxingImg.processTransparentByColorIndex(0);
            this.taxingSign = taxingImg.createFrame(colorPalette);

            //read "tricky sign" 
            let trickyImg = new PaletteImage(72, 27);
            trickyImg.processImage(fr4, 4);
            //trickyImg.processTransparentByColorIndex(0);
            this.trickySign = trickyImg.createFrame(colorPalette);

            //read "fun sign" 
            let funImg = new PaletteImage(72, 27);
            funImg.processImage(fr4, 4);
            //funImg.processTransparentByColorIndex(0);
            this.funSign = funImg.createFrame(colorPalette);
            if(cinq)
            {
                //read "fun sign" 
                let funImg2 = new PaletteImage(72, 27);
                funImg2.processImage(fr4, 4);
                //funImg.processTransparentByColorIndex(0);
                this.funSign2 = funImg2.createFrame(colorPalette);
            }


            /// read green panel letters
            let letters:string[] = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~"];
            if(cinq)
                fr4.setOffset(0x6D7C); //72x*72=5184 = 0x1440
            else
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