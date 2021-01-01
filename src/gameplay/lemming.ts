module Lemmings {

    export class Lemming {
        public static readonly LEM_MIN_Y = -5;
        public static readonly LEM_MAX_FALLING = 60

        public x: number = 0;
        public y: number = 0;
        public lookRight = true;
        public frameIndex: number = 0;
        public canClimb: boolean = false;
        public hasParachute: boolean = false;
        public removed: boolean = false;
        public countdown:number = 0;
        public action: IActionSystem;
        public countdownAction: IActionSystem;
        public state: number = 0;
        public id: number;
        private disabled:boolean = false;

        constructor(x:number, y:number, id:number) {
            this.x = x;
            this.y = y;
            this.id = id;
        }

        /** return the number shown as countdown */
        public getCountDownTime() : number {
            return (8 - (this.countdown >> 4));
        }

        public GetCurrentSkill(): string
        {
            if((this.canClimb==true)&&(this.hasParachute==true))
                return "ATHLETE";
            if(this.canClimb==true)
                return "CLIMBER";
            if(this.hasParachute==true)
                return "FLOATER";
            if(this.countdown>0)
                return "BOMBER";

            switch (this.action.GetLemState()) {
                case LemmingStateType.WALKING:
                    return "WALKER";
                case LemmingStateType.BLOCKING:
                    return "BLOCKER";
                case LemmingStateType.BUILDING:
                    return "BUILDER";
                case LemmingStateType.DIGGING://digg down  side
                    return "DIGGER";
                case LemmingStateType.FALLING:// after falling down from too high
                    return "FALLER";
                case LemmingStateType.FLOATING://ombrella
                    return "FLOATER";
                case LemmingStateType.MINEING:////digg in diagonal
                    return "MINER";
                case LemmingStateType.BASHING://cdigg horizontally
                    return "BASHER";
                case LemmingStateType.CLIMBING:
                    return "CLIMBER";
                case LemmingStateType.EXPLODING:// fire ball and explosion particles
                    return "BOMBER";
                case LemmingStateType.SHRUG:// builder finished buildung
                    return "BUILDER";
                case LemmingStateType.FRYING:// killed by flameblower etc.
                    return "WALKER";
                case LemmingStateType.HOISTING:// end of climbing
                    return "CLIMBER";
                case LemmingStateType.DROWNING:// in water
                    return "WALKER";
                case LemmingStateType.EXITING:
                    return "WALKER";
                case LemmingStateType.JUMPING:
                    return "WALKER";
                case LemmingStateType.NO_STATE_TYPE:
                    return "WALKER";
                case LemmingStateType.OHNO:
                    return "WALKER";
                case LemmingStateType.OUT_OFF_LEVEL:
                    return "WALKER";
                case LemmingStateType.SPLATTING:// after falling down from too high
                    return "WALKER";
            }
            return "WALKER";
           // return this.action.getActionName();
            
        }
        /** switch the action of this lemming */
        public setAction(action: IActionSystem) {
            this.action = action;
            this.frameIndex = 0;
            this.state = 0;
        }

        /** set the countdown action of this lemming */
        public setCountDown(action: IActionSystem): boolean {
            this.countdownAction = action;

            if (this.countdown > 0) {
                return false;
            }
            
            this.countdown = 80;

            return true;
        }

        /** return the distance of this lemming to a given position */
        public getClickDistance(x:number, y:number):number {
            let yCenter = this.y - 5;
            let xCenter = this.x;

            let x1 = xCenter - 5;
            let y1 = yCenter - 6;
            let x2 = xCenter + 5;
            let y2 = yCenter + 7;

            //console.log(this.id + " : "+ x1 +"-"+ x2 +"  "+ y1 +"-"+ y2);

            if ((x >= x1) && (x <= x2) && (y >= y1) && (y < y2)) {
                return ((yCenter - y) * (yCenter - y) + (xCenter - x) * (xCenter - x));
            }

            return -1;
        }

        /** render this lemming to the display */
        public render(gameDisplay: DisplayImage):void {
            if (!this.action) {
                return;
            }

            if (this.countdownAction != null) {
                this.countdownAction.draw(gameDisplay, this);
            }

            this.action.draw(gameDisplay, this);
        }


        /** render this lemming debug "information" to the display */
        public renderDebug(gameDisplay: DisplayImage):void {
            if (!this.action) {
                return;
            }

            gameDisplay.setDebugPixel(this.x, this.y)
        }

        /** process this lemming one tick in time */
        public process(level:Level) : LemmingStateType {

            if ((this.x < 0) || (this.x >= level.width) || (this.y < 0) || (this.y >= level.height + 6)) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            /// run main action
            if (!this.action) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            /// run secondary action
            if (this.countdownAction) {
                let newAction = this.countdownAction.process(level, this);
                
                if (newAction != LemmingStateType.NO_STATE_TYPE) {
                    return newAction;
                }
            }

            if (this.action) {
                return this.action.process(level, this);
            }
        }


        /** disable this lemming so it can not longer be triggert 
         *   or beeing selected by the user */
        public disable(): void {
            this.disabled = true;
        }

        /** remove this lemming */
        public remove(): void {
            this.action = null;
            this.countdownAction = null;
            this.removed = true;
        }

        public isDisabled(): boolean {
            return this.disabled;
        }

        public isRemoved(): boolean {
            return (this.action == null);
        }

    }
}