module Lemmings {

    /** manages all triggers */
    export class TriggerManager {

        private triggers: Trigger[] = [];

        constructor(private gameTimer: GameTimer) {

        }

        /** add a new trigger to the manager */
        public add(trigger: Trigger) {
            this.triggers.push(trigger);
        }

        /** remove all triggers having a giving owner */
        public removeByOwner(owner: any): void {
            let triggerIndex = (this.triggers.length - 1);

            while (triggerIndex >= 0) {
                triggerIndex = this.triggers.findIndex((t) => t.owner == owner);
                if (triggerIndex >= 0) {
                    this.triggers.splice(triggerIndex, 1);
                }
            }

        }

        /** add a new trigger to the manager */
        public remove(trigger: Trigger) {
            let triggerIndex = this.triggers.indexOf(trigger);

            this.triggers.splice(triggerIndex, 1);
        }

        public addRange(newTriggers: Trigger[]) {
            for (let i = 0; i < newTriggers.length; i++) {
                this.triggers.push(newTriggers[i]);
            }
        }

        public renderDebug(gameDisplay: DisplayImage) {
            for (let i = 0; i < this.triggers.length; i++) {
                this.triggers[i].draw(gameDisplay);
            }
        }


        triggerNew(lem: Lemming, ressources: GameResources): LemmingStateType {
            let l = this.triggers.length;
            let tick = this.gameTimer.getGameTicks();

            if (lem.isRemoved() || (lem.isDisabled())) {
                return LemmingStateType.NO_STATE_TYPE;
            }
            let offset = 0;

            //console.log("bashing:"+lem.action.GetLemState());
            if (lem.action.GetLemState() == LemmingStateType.BASHING) {
                offset = 8;//test upper for basher
            }
            for (var i = 0; i < l; i++) {

                let triggerType = this.triggers[i].trigger(lem.x, lem.y - offset, tick, ressources);
                //if (triggerType!=TriggerTypes.NO_TRIGGER)
                //    console.log("trigger type: " + triggerType);
    
                switch (triggerType) {
                    case TriggerTypes.STEEL:
                        //console.log("STEEL trigger-----!!!");
                        if ((lem.action.GetLemState() == LemmingStateType.DIGGING) || (lem.action.GetLemState() == LemmingStateType.MINEING)) {

                            return LemmingStateType.WALKING;
                        }
                        if (lem.action.GetLemState() == LemmingStateType.BASHING) {
                            lem.toogleDirection();
                            return LemmingStateType.WALKING;
                        }
                        break;
                    case TriggerTypes.NO_TRIGGER:
                        break;
                    case TriggerTypes.DROWN:
                        return LemmingStateType.DROWNING;
                    case TriggerTypes.EXIT_LEVEL:
                        return LemmingStateType.EXITING;
                    case TriggerTypes.KILL:
                        //return LemmingStateType.SPLATTING;
                        return LemmingStateType.FRYING;
                    case TriggerTypes.TRAP:
                        return LemmingStateType.OUT_OFF_LEVEL;
                        //return LemmingStateType.HOISTING;
                    case TriggerTypes.BLOCKER_LEFT:
                        if (lem.lookRight) lem.lookRight = false;
                        break;
                    case TriggerTypes.BLOCKER_RIGHT:
                        if (!lem.lookRight) lem.lookRight = true;
                        break;
                    case TriggerTypes.ONWAY_LEFT:
                        //console.log("ONWAY_LEFT:"+lem.lookRight);
                        if (lem.lookRight == false)
                            break;
                        //console.log("ONWAY_LEFT: going right"+lem.action.GetLemState());
                        if ((lem.action.GetLemState() == LemmingStateType.BASHING) || (lem.action.GetLemState() == LemmingStateType.MINEING)) {
                            //console.log("ONWAY_LEFT:Bashing: GO BACK");
                            lem.toogleDirection();
                            return LemmingStateType.WALKING;
                        }
                        break;
                    case TriggerTypes.ONWAY_RIGHT:
                        //console.log("ONWAY_Right:"+lem.lookRight);
                        if (lem.lookRight == true)
                            break;
                        //console.log("ONWAY_Right: going left:"+lem.action.GetLemState());
                        if ((lem.action.GetLemState() == LemmingStateType.BASHING) || (lem.action.GetLemState() == LemmingStateType.MINEING)) {
                            //console.log("ONWAY_Right:Bashing: GO BACK");
                            lem.toogleDirection();
                            return LemmingStateType.WALKING;
                        }
                        else
                            break;
                    default:
                        console.warn("unknown trigger type: " + triggerType);
                        break;
                    }
            }
            return LemmingStateType.NO_STATE_TYPE;
        }

        //TF to be removed
        /** test all triggers. Returns the triggered type that matches */
        /*
        trigger(x: number, y: number, ressources:GameResources): TriggerTypes {
            let l = this.triggers.length;
            let tick = this.gameTimer.getGameTicks();
            //everything but steel
            for (var i = 0; i < l; i++) {
                if (this.triggers[i].gerType() != TriggerTypes.STEEL) {
                    let type = this.triggers[i].trigger(x, y, tick, ressources);


                    if (type != TriggerTypes.NO_TRIGGER)
                        return type;
                }
            }

            //steel at the end
            for (var i = 0; i < l; i++) {
                if (this.triggers[i].gerType() == TriggerTypes.STEEL) {
                    let type = this.triggers[i].trigger(x, y, tick, ressources);


                    if (type != TriggerTypes.NO_TRIGGER)
                        return type;
                }
            }




            return TriggerTypes.NO_TRIGGER;
        }
       */

    }
}