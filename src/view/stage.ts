module Lemmings {


    /** handel the display / output of game, gui, ... */
    export class Stage {

        private stageCav: HTMLCanvasElement;
        private gameImgProps : StageImageProperties;
        private guiImgProps : StageImageProperties;
        private FullPageProps : StageImageProperties;

        private controller : UserInputManager = null;
        private lemmingManager : LemmingManager = null;
        private lastMousePos: Position2D = null;
        private level:Level;
        private CurrentLemmingState: string ="";
        private GamePalette: ColorPalette = null;
        private MoveStageDirection: number = 0;

                
        constructor(canvasForOutput: HTMLCanvasElement,GamePalette: ColorPalette ) {
            this.controller = new UserInputManager(canvasForOutput);

            this.handleOnMouseUp();
            this.handleOnMouseDown();
            this.handleOnMouseMove();
            this.handleOnDoubleClick();
            this.handelOnZoom();

            this.GamePalette= GamePalette;

            this.stageCav = canvasForOutput;

            this.gameImgProps = new StageImageProperties();

            this.guiImgProps = new StageImageProperties();
            this.guiImgProps.viewPoint = new ViewPoint(0, 0, 2);

            //ici
            this.FullPageProps = new StageImageProperties();
            this.FullPageProps.viewPoint.scale = 1;
          
            this.updateStageSize();

            this.clear();
        }

        public showCursor(show: boolean) {

            if (show==false)
                this.stageCav.style.cursor = 'none';
            else
                this.stageCav.style.cursor = 'auto';
        }

        public setGamePalette(GamePalette: ColorPalette )
        {
            this.GamePalette= GamePalette;
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

                if (stageImage == this.guiImgProps) {
                    //console.log("draging in GUI:" + e.x + ", " + e.y);
                    if ((e.x >= 410) && (e.x <= 630) && (e.y >= 350) && (e.y <= 480))// to be set dynamically
                    {
                       // this.updateViewPoint(this.gameImgProps, (0-e.deltaX)*16, 0, 0);
                       let newposx=Math.round(((e.x-410 -20 )/(630-410))*1600);
                       /*
                       if(newposx<0)
                            newposx=0;
                        if(newposx>this.level.width)
                            newposx=this.level.width;
                            */
                        this.gameImgProps.viewPoint.x=newposx;

                        this.gameImgProps.viewPoint.x = this.limitValue(0, this.gameImgProps.viewPoint.x, this.gameImgProps.display.getWidth() - this.gameImgProps.width / this.gameImgProps.viewPoint.scale);

                        console.log("Update game pos:" + e.x + "=> " + newposx+" - "+ this.gameImgProps.viewPoint.x);
                        //this.updateViewPoint(this.gameImgProps, (0-e.deltaX)*16, 0, 0);
                        //this.setGameViewPointPosition(newposx,0);
                       
                        if (this.guiImgProps.display!=null)
                            this.guiImgProps.display.drawFrame(this.level.getGroundMaskLayer().getMiniMap(this.gameImgProps.viewPoint.x,this.level.width,this.level.colorPalette),209,18);
                   
                        this.redraw();
                    }
                    
                }

                if ((stageImage == null) || (stageImage.display == null)) return;

                let pos = this.calcPosition2D(stageImage, e);

                stageImage.display.onMouseUp.trigger(pos);
            });
        }


        private DrawCursor(gameImg: StageImageProperties,cross: boolean, pos: Position2D)
        {
            //let cursorsize=10;
            if(cross==true)
            {

                //gameImg.display.drawVerticalLine(pos.x,pos.y-cursorsize,pos.y+cursorsize,200,100,100);
                //gameImg.display.drawHorizontalLine(pos.x-cursorsize,pos.y,pos.x+cursorsize,200,100,100);
                //center
                gameImg.display.setPixel(pos.x,pos.y,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x+1,pos.y+1,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x,pos.y+1,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x+1,pos.y,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                //up
                gameImg.display.setPixel(pos.x,pos.y-2,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+1,pos.y-2,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x,pos.y-4,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+1,pos.y-4,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x,pos.y-6,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+1,pos.y-6,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                //down
                gameImg.display.setPixel(pos.x,pos.y+3,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+1,pos.y+3,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x,pos.y+5,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+1,pos.y+5,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x,pos.y+7,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+1,pos.y+7,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                //left
                gameImg.display.setPixel(pos.x-2,pos.y,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x-2,pos.y+1,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-4,pos.y,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x-4,pos.y+1,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-6,pos.y,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x-6,pos.y+1,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                //right
                gameImg.display.setPixel(pos.x+3,pos.y,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+3,pos.y+1,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+5,pos.y,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+5,pos.y+1,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+7,pos.y,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+7,pos.y+1,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                

            }
            else
            {
               // gameImg.display.drawRect(pos.x-cursorsize,pos.y-cursorsize,cursorsize*2,cursorsize*2,200,100,100);

                //top    
                gameImg.display.setPixel(pos.x,pos.y -6,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x+1,pos.y-6 ,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                
                gameImg.display.setPixel(pos.x-3,pos.y -6,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-4,pos.y-6 ,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                
                gameImg.display.setPixel(pos.x+4,pos.y -6,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+5,pos.y-6 ,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                
                gameImg.display.setPixel(pos.x-5,pos.y -6,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x-6,pos.y-6 ,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));

                gameImg.display.setPixel(pos.x+6,pos.y -6,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+7,pos.y-6 ,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
  
                //bottom
                gameImg.display.setPixel(pos.x,pos.y +7,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x+1,pos.y +7 ,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x-3,pos.y +7,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-4,pos.y+7 ,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+4,pos.y +7,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+5,pos.y+7 ,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));

                gameImg.display.setPixel(pos.x-5,pos.y+7,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x-6,pos.y+7 ,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));

                gameImg.display.setPixel(pos.x+6,pos.y +7,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+7,pos.y+7 ,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));

                //left
                gameImg.display.setPixel(pos.x-6,pos.y -5,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x-6,pos.y-4,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-6,pos.y-3,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));

                gameImg.display.setPixel(pos.x-6,pos.y +0,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x-6,pos.y +1 ,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
               
                gameImg.display.setPixel(pos.x-6,pos.y+4,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-6,pos.y+5,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x-6,pos.y+6 ,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));

                //right
                gameImg.display.setPixel(pos.x+7,pos.y -5,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
                gameImg.display.setPixel(pos.x+7,pos.y-4,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+7,pos.y-3,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));

                gameImg.display.setPixel(pos.x+7,pos.y +0,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
                gameImg.display.setPixel(pos.x+7,pos.y +1 ,this.GamePalette.getR(14),this.GamePalette.getG(14),this.GamePalette.getB(14));
               
                gameImg.display.setPixel(pos.x+7,pos.y+4,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+7,pos.y+5,this.GamePalette.getR(12),this.GamePalette.getG(12),this.GamePalette.getB(12));
                gameImg.display.setPixel(pos.x+7,pos.y+6 ,this.GamePalette.getR(11),this.GamePalette.getG(11),this.GamePalette.getB(11));
  
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
                    if ((lem.isRemoved() == false) && (lem.isDisabled()==false)) {
                        this.DrawCursor(this.gameImgProps, false, this.calcPosition2D(this.gameImgProps, this.lastMousePos));
                        this.DrawCursor(this.guiImgProps, true, this.calcPosition2D(this.guiImgProps, this.lastMousePos));
                        this.CurrentLemmingState = lem.GetCurrentSkill() + " " + (lem.id + 1);
                    }
                    else {
                        //cross cursor
                        this.DrawCursor(this.gameImgProps, true, this.calcPosition2D(this.gameImgProps, this.lastMousePos));
                        this.DrawCursor(this.guiImgProps, true, this.calcPosition2D(this.guiImgProps, this.lastMousePos));
                        this.CurrentLemmingState = "";
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
                    if (stageImage == this.guiImgProps) {
                        //console.log("draging in GUI:" + e.x + ", " + e.y);
                        if ((e.x >= 410) && (e.x <= 630) && (e.y >= 350) && (e.y <= 480))// to be set dynamically
                        {
                            this.updateViewPoint(this.gameImgProps, (0-e.deltaX)*16, 0, 0);
                            //console.log("draging game:" + e.x + ", " + e.y);
                        }
                        
                    }
                }
                else {
                    let stageImage = this.getStageImageAt(e.x, e.y);
                    if (stageImage == null) return;
                    if (stageImage.display == null) return;

                    if (stageImage == this.gameImgProps) {
                        if (e.x > stageImage.width - 10)
                            this.MoveStageDirection = 1;
                        else if (e.x < 10)
                            this.MoveStageDirection = -1;
                        else
                            this.MoveStageDirection = 0;
                    }
                    else
                        this.MoveStageDirection = 0;

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

            if (this.guiImgProps.display!=null)
                this.guiImgProps.display.drawFrame(this.level.getGroundMaskLayer().getMiniMap(stageImage.viewPoint.x,this.level.width,this.level.colorPalette),209,18);
           
            this.redraw();
    
        }
        public UpdateAutoScroll() {
            
            if (this.MoveStageDirection == 0)
                return;
            //console.log(" this.MoveStageDirection=" + this.MoveStageDirection);
            this.updateViewPoint(this.gameImgProps, this.MoveStageDirection*10, 0, 0);
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

            this.FullPageProps.y=0;
            this.FullPageProps.height = stageHeight;
            this.FullPageProps.width = stageWidth;

            

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


        public getFullPageDisplay():DisplayImage {
            if (this.FullPageProps.display != null) return this.FullPageProps.display;
            this.FullPageProps.display = new DisplayImage(this);
            this.FullPageProps.display.initSize(this.FullPageProps.width, this.FullPageProps.height);
            return this.FullPageProps.display;
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
              public redrawFullpage() {
                if (this.FullPageProps.display != null) {
                    let FullPageImg = this.FullPageProps.display.getImageData();
                    this.draw(this.FullPageProps, FullPageImg);
                };
    
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
            if (display == this.guiImgProps.display) {
                return this.guiImgProps.createImage(width, height);
            }
            if (display == this.FullPageProps.display) {
                return this.FullPageProps.createImage(width, height);
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