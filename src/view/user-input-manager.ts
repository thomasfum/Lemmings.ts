module Lemmings {

    export class MouseMoveEventArguemnts extends Position2D {
        /** delta the mouse move Y */
        public deltaX: number = 0;
        /** delta the mouse move Y */
        public deltaY: number = 0;

        public button: boolean = false;

        /** position the user starts pressed the mouse */
        public mouseDownX: number = 0;
        /** position the user starts pressed the mouse */
        public mouseDownY: number = 0;

        constructor(x: number = 0, y: number = 0, deltaX: number = 0, deltaY: number = 0, button: boolean = false) {
            super(x, y);
            this.deltaX = deltaX;
            this.deltaY = deltaY;
            this.button = button;
        }
    }

    export class ZoomEventArguemnts extends Position2D {
        public deltaZoom: number;

        constructor(x: number = 0, y: number = 0, deltaZoom: number = 0) {
            super(x, y);
            this.deltaZoom = deltaZoom;
        }
    }


    /** handel the user events on the stage */
    export class UserInputManager {

        private mouseDownX = 0;
        private mouseDownY = 0;

        private lastMouseX = 0;
        private lastMouseY = 0;

        private timeOutEvent  = 0;
        public  longtouch:boolean= false ;
        private mouseButton:boolean = false;

        public onMouseMove = new EventHandler<MouseMoveEventArguemnts>();
        public onMouseUp = new EventHandler<Position2D>();
        public onMouseDown = new EventHandler<Position2D>();
        public onDoubleClick = new EventHandler<Position2D>();
        public onZoom = new EventHandler<ZoomEventArguemnts>();

        constructor(listenElement: HTMLElement) {

            listenElement.addEventListener("mousemove", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseMove(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });


            listenElement.addEventListener("touchmove", (e: TouchEvent) => {
                console.log("touch move");
                let relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
                this.handelMouseMove(relativePos);
               /*
               //TODO: clean
                console.log("clear touch timeout");
                clearTimeout(this.timeOutEvent);
                this.timeOutEvent = 0;
                */
                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("touchstart", (e: TouchEvent) => {
                this.longtouch=false;
                let relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
                this.handelMouseDown(relativePos);
                // Long press event trigger
                var self = this;
                this.timeOutEvent = setTimeout(function() {
                    this.timeOutEvent = 0;
                    console.log("long touch timeout");
                    self.longtouch=true;
                    //TODO: clean
                    //console.log("longtouch="+ self.longtouch);
                }, 500); //Long press 500 milliseconds
                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mousedown", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseDown(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mouseup", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseUp(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mouseleave", (e: MouseEvent) => {
                this.handelMouseClear();
            });

            listenElement.addEventListener("touchend", (e: TouchEvent) => {
                //TODO: clean
                //console.log("touch end");
                //console.log("longtouch="+ this.longtouch);
                //let relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
                let relativePos = this.getRelativePosition(listenElement, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
                
                if (this.longtouch=== true) {
                         // double click event
                         this.handleMouseDoubleClick(relativePos);
                         console.log("long touch");
                        
                }else
                {
                    // click event
                    this.handelMouseUp(relativePos);
                    //console.log("simple touch");//TODO: clean
                }
                clearTimeout(this.timeOutEvent);
                this.timeOutEvent = 0;
                return false;
            });

            listenElement.addEventListener("touchleave", (e: TouchEvent) => {
                console.log("touch leave");
                this.handelMouseClear();
                return false;
            });

            listenElement.addEventListener("touchcancel", (e: TouchEvent) => {
                console.log("touch cancel");
                this.handelMouseClear();
                return false;
            });

           
            listenElement.addEventListener("dblclick", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handleMouseDoubleClick(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });



            listenElement.addEventListener("wheel", (e: WheelEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handeWheel(relativePos, e.deltaY);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

        }



        private getRelativePosition(element: HTMLElement, clientX: number, clientY: number): Position2D {

            var rect = element.getBoundingClientRect();

            return new Position2D(clientX - rect.left, clientY - rect.top);
        }


        private handelMouseMove(position: Position2D) {

            //- Move Point of View
            if (this.mouseButton) {

                let deltaX = (this.lastMouseX - position.x);
                let deltaY = (this.lastMouseY - position.y);

                //- save start of Mousedown
                this.lastMouseX = position.x;
                this.lastMouseY = position.y;

                let mouseDragArguments = new MouseMoveEventArguemnts(position.x, position.y, deltaX, deltaY, true)
                mouseDragArguments.mouseDownX = this.mouseDownX;
                mouseDragArguments.mouseDownY = this.mouseDownY;

                /// raise event
                this.onMouseMove.trigger(mouseDragArguments);
            }
            else {
                /// raise event
                this.onMouseMove.trigger(new MouseMoveEventArguemnts(position.x, position.y, 0, 0, false));
            }
        }

        private handelMouseDown(position: Position2D) {
            //- save start of Mousedown
            this.mouseButton = true;
            this.mouseDownX = position.x;
            this.mouseDownY = position.y;
            this.lastMouseX = position.x;
            this.lastMouseY = position.y;

            /// create new event handler
            this.onMouseDown.trigger(position);
        }

        private handleMouseDoubleClick(position: Position2D) {
            this.onDoubleClick.trigger(position);
        }

        private handelMouseClear() {
            this.mouseButton = false;
            this.mouseDownX = 0;
            this.mouseDownY = 0;
            this.lastMouseX = 0;
            this.lastMouseY = 0;
        }

        private handelMouseUp(position: Position2D) {
            this.handelMouseClear();

            this.onMouseUp.trigger(new Position2D(position.x, position.y));
        }

        /** Zoom view 
         * todo: zoom to mouse pointer */
        private handeWheel(position: Position2D, deltaY: number) {

            if (deltaY < 0) {
                this.onZoom.trigger(new ZoomEventArguemnts(position.x, position.y, 1));
            }
            if (deltaY > 0) {
                this.onZoom.trigger(new ZoomEventArguemnts(position.x, position.y, -1));
            }
        }


    }
}