module Lemmings {


    /** handel the display / output of game, gui, ... */
    export class Stage {

        private stageCav: HTMLCanvasElement;
        private gameImgProps : StageImageProperties;
        private guiImgProps : StageImageProperties;

        private controller : UserInputManager = null;
        private lemmingManager : LemmingManager = null;
        private lastMousePos: Position2D = null;
        private level:Level;
        private CurrentLemmingState: string ="";
        
        constructor(canvasForOutput: HTMLCanvasElement) {
            this.controller = new UserInputManager(canvasForOutput);

            this.handleOnMouseUp();
            this.handleOnMouseDown();
            this.handleOnMouseMove();
            this.handleOnDoubleClick();
            this.handelOnZoom();

            this.stageCav = canvasForOutput;

            this.gameImgProps = new StageImageProperties();

            this.guiImgProps = new StageImageProperties();
            this.guiImgProps.viewPoint = new ViewPoint(0, 0, 2);
            
            this.updateStageSize();

            this.clear();
         

        }

        private calcPosition2D(stageImage:StageImageProperties, e:Position2D):Position2D {
            let x = (stageImage.viewPoint.getSceneX(e.x - stageImage.x));
            let y = (stageImage.viewPoint.getSceneY(e.y - stageImage.y));
            
            return new Position2D(x, y);
        }


        private handleOnDoubleClick(): void {

            this.controller.onDoubleClick.on((e) => {
     
                let stageImage = this.getStageImageAt(e.x, e.y);
                if ((stageImage == null) || (stageImage.display == null)) return;

                stageImage.display.onDoubleClick.trigger(this.calcPosition2D(stageImage, e));
            });
        }
        

        private handleOnMouseDown(): void {

            this.controller.onMouseDown.on((e) => {
     
                let stageImage = this.getStageImageAt(e.x, e.y);
                if ((stageImage == null) || (stageImage.display == null)) return;

                stageImage.display.onMouseDown.trigger(this.calcPosition2D(stageImage, e));
            });
        }


        private handleOnMouseUp(): void {

            this.controller.onMouseUp.on((e) => {
     
                let stageImage = this.getStageImageAt(e.x, e.y);
                if ((stageImage == null) || (stageImage.display == null)) return;

                let pos = this.calcPosition2D(stageImage, e);

                stageImage.display.onMouseUp.trigger(pos);
            });
        }


        private DrawCursor(gameImg: StageImageProperties,cross: boolean, pos: Position2D)
        {
            let cursorsize=10;
            if(cross==true)
            {
                gameImg.display.drawVerticalLine(pos.x,pos.y-cursorsize,pos.y+cursorsize,200,100,100);
                gameImg.display.drawHorizontalLine(pos.x-cursorsize,pos.y,pos.x+cursorsize,200,100,100);
            }
            else
            {
                gameImg.display.drawRect(pos.x-cursorsize,pos.y-cursorsize,cursorsize*2,cursorsize*2,200,100,100);
            }
        }
        
      
        public GetLemAction()
        {
            return this.CurrentLemmingState;
        }

      


        private displyCursor(p: Position2D)
        {
            if(this.lemmingManager==null)
             return;
            let lem = this.lemmingManager.getLemmingAt(p.x, p.y);
           if (lem==null)
             {
                //cross cursor
                this.DrawCursor(this.gameImgProps,true,this.calcPosition2D(this.gameImgProps, this.lastMousePos));
                this.DrawCursor(this.guiImgProps,true,this.calcPosition2D(this.guiImgProps, this.lastMousePos));
                this.CurrentLemmingState="";
             }
             else
             {
                if (lem!=null)
                {
                    //square cursor
                    if(lem.isRemoved()==false)
                    {
                        this.DrawCursor(this.gameImgProps,false,this.calcPosition2D(this.gameImgProps, this.lastMousePos));
                        this.DrawCursor(this.guiImgProps,true,this.calcPosition2D(this.guiImgProps, this.lastMousePos));
                        this.CurrentLemmingState=lem.GetCurrentSkill()+" "+ (lem.id+1);
                    }
                }

             }
        }
   
        private handleOnMouseMove():void {
            this.controller.onMouseMove.on((e) => {
                if (e.button) {
                    let stageImage = this.getStageImageAt(e.mouseDownX, e.mouseDownY);
                    if (stageImage == null) return;

                    if (stageImage == this.gameImgProps) {
                        this.updateViewPoint(stageImage, e.deltaX, e.deltaY, 0);
                        stageImage.display.onMouseMove.trigger(this.calcPosition2D(stageImage, e));
                       
                    }
                }
                else {
                    let stageImage = this.getStageImageAt(e.x, e.y);
                    if (stageImage == null) return;
                    if (stageImage.display == null) return;

                    let x = e.x - stageImage.x;
                    let y = e.y - stageImage.y;    
                    
                    stageImage.display.onMouseMove.trigger(new Position2D(stageImage.viewPoint.getSceneX(x), stageImage.viewPoint.getSceneY(y)));
                }
                let stageImage = this.getStageImageAt(e.x, e.y);
                if (stageImage == null) return;
                if (stageImage.display == null) return;
                this.lastMousePos=e;
                this.displyCursor( this.calcPosition2D(stageImage, e));
                
                
            });
        }


        private handelOnZoom():void {
            /*
            this.controller.onZoom.on((e) => {
                let stageImage = this.getStageImageAt(e.x, e.y);
                if (stageImage == null) return;
                this.updateViewPoint(stageImage, 0, 0, e.deltaZoom);
            });
            */
        }

        public setLevel(level:Level, lemmingManager:LemmingManager)
        {
            this.level=level;
            this.lemmingManager=lemmingManager;
            this.level.getGroundMaskLayer().SetViewParam(this.gameImgProps.viewPoint.x,this.level.width,lemmingManager);
        }

        private updateViewPoint(stageImage:StageImageProperties, deltaX:number, deltaY:number, deletaZoom:number) {
            stageImage.viewPoint.scale += deletaZoom * 0.5;
            stageImage.viewPoint.scale = this.limitValue(0.5, stageImage.viewPoint.scale, 10);

            stageImage.viewPoint.x += deltaX / stageImage.viewPoint.scale;
            stageImage.viewPoint.y += deltaY / stageImage.viewPoint.scale;

            stageImage.viewPoint.x = this.limitValue(0, stageImage.viewPoint.x, stageImage.display.getWidth() - stageImage.width / stageImage.viewPoint.scale);
            stageImage.viewPoint.y = this.limitValue(0, stageImage.viewPoint.y, stageImage.display.getHeight() - stageImage.height / stageImage.viewPoint.scale);

            this.guiImgProps.display.drawFrame(this.level.getGroundMaskLayer().getMiniMap(stageImage.viewPoint.x,this.level.width),209,18);
           
            this.redraw();
    
        }

     

        private limitValue(minLimit:number, value:number, maxLimit:number) :number {

            let useMax = Math.max(minLimit, maxLimit);
            
            return Math.min(Math.max(minLimit, value), useMax);
        }

        public updateStageSize() {

            let ctx = this.stageCav.getContext("2d");
        
            let stageHeight = ctx.canvas.height;
            let stageWidth = ctx.canvas.width;
         
            this.gameImgProps.y = 0;
            this.gameImgProps.height = stageHeight - 80;
            this.gameImgProps.width = stageWidth;

            this.guiImgProps.y = stageHeight - 80;
            this.guiImgProps.height = 80;
            this.guiImgProps.width = stageWidth;

        }

        public getStageImageAt(x: number, y:number):StageImageProperties {
            if (this.isPositionInStageImage(this.gameImgProps, x, y)) return this.gameImgProps;
            if (this.isPositionInStageImage(this.guiImgProps, x, y)) return this.guiImgProps;
            return null;
        }

        private isPositionInStageImage(stageImage:StageImageProperties, x: number, y:number) {
            return ((stageImage.x <= x) && ((stageImage.x + stageImage.width) >= x)
             && (stageImage.y <= y) && ((stageImage.y + stageImage.height) >= y));
        }

        public getGameDisplay():DisplayImage {
            if (this.gameImgProps.display != null) return this.gameImgProps.display;
            this.gameImgProps.display = new DisplayImage(this);
            return this.gameImgProps.display;
        }

        public getGuiDisplay():DisplayImage {
            if (this.guiImgProps.display != null) return this.guiImgProps.display;
            this.guiImgProps.display = new DisplayImage(this);
            return this.guiImgProps.display;
        }

        /** set the position of the view point for the game dispaly */
        public setGameViewPointPosition(x: number, y:number):void {
            this.gameImgProps.viewPoint.x = x;
            this.gameImgProps.viewPoint.y = y;
            
            
        }

        /** redraw everything */
        public redraw() {
            
            if (this.gameImgProps.display != null) {
                if(this.lastMousePos!=null)
                    this.displyCursor( this.calcPosition2D(this.gameImgProps, this.lastMousePos));
                let gameImg = this.gameImgProps.display.getImageData();
                this.draw(this.gameImgProps, gameImg);
            };

            if (this.guiImgProps.display != null) {
                let guiImg = this.guiImgProps.display.getImageData();
                this.draw(this.guiImgProps, guiImg);
            };
        }


        public createImage(display:DisplayImage, width:number, height:number): ImageData {
            if (display == this.gameImgProps.display) {
                return this.gameImgProps.createImage(width, height);
            }
            else {
                return this.guiImgProps.createImage(width, height);
            }
        }

        /** clear the stage/display/output */
        public clear(stageImage?:StageImageProperties) {
            var ctx = this.stageCav.getContext("2d");
            ctx.fillStyle = "#000000";

            if (stageImage == null) {
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
            else {
                ctx.fillRect(stageImage.x, stageImage.y, stageImage.width, stageImage.height);
            }
        }

        private fadeTimer:number = 0;
        private fadeAlpha:number = 0;

        public resetFade() {
            this.fadeAlpha = 0;

            if (this.fadeTimer != 0) {
                clearInterval(this.fadeTimer);
                this.fadeTimer = 0;
            }
        }

        public startFadeOut() {

            this.resetFade();

            this.fadeTimer = setInterval(() => {
                this.fadeAlpha = Math.min(this.fadeAlpha + 0.02, 1);

                if (this.fadeAlpha <= 0) {
                    clearInterval(this.fadeTimer);
                }
            }, 40);
            
        }

        /** draw everything to the stage/display */
        private draw(display:StageImageProperties, img:ImageData) {
            
            if (display.ctx == null) return;

  

            /// write image to context
            display.ctx.putImageData(img, 0, 0);
            
            let ctx = this.stageCav.getContext("2d");


            //@ts-ignore
            ctx.mozImageSmoothingEnabled = false;
            //@ts-ignore
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            let outH = display.height;
            let outW = display.width;

            ctx.globalAlpha = 1;

            //- Display Layers
            var dW = img.width - display.viewPoint.x; //- display width
            if ((dW * display.viewPoint.scale) > outW) {
                dW = outW / display.viewPoint.scale;
            }

            var dH = img.height - display.viewPoint.y; //- display height
            if ((dH * display.viewPoint.scale) > outH) {
                dH = outH / display.viewPoint.scale;
            }

            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(display.cav, 
                display.viewPoint.x, display.viewPoint.y, dW, dH, 
                display.x, display.y, Math.trunc(dW * display.viewPoint.scale), Math.trunc(dH * display.viewPoint.scale));

            //- apply fading
            if (this.fadeAlpha != 0) {
                ctx.globalAlpha = this.fadeAlpha;
                ctx.fillStyle = "black";
                ctx.fillRect(display.x, display.y, Math.trunc(dW * display.viewPoint.scale), Math.trunc(dH * display.viewPoint.scale));
            }
            
        }
    }
}