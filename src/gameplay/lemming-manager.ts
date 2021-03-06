/// <reference path="./lemming-state-type.ts"/>

module Lemmings {

    export class LemmingManager {

        /** list of all Lemming in the game */
        private lemmings: Lemming[] = [];

        /** list of all Actions a Lemming can do */
        private actions: IActionSystem[] = [];
        private skillActions: IActionSystem[] = [];

        private releaseTickIndex: number = 0;

        private logging = new LogHandler("LemmingManager");

        /** next lemming index need to explode */
        private nextNukingLemmingsIndex: number = -1;

        constructor(private level: Level,
            lemmingsSprite: LemmingsSprite,
            private triggerManager: TriggerManager,
            private gameVictoryCondition: GameVictoryCondition,
            masks: MaskProvider,
            particleTable: ParticleTable,
            private Resources:GameResources) {

            this.actions[LemmingStateType.WALKING] = new ActionWalkSystem(lemmingsSprite);
            this.actions[LemmingStateType.FALLING] = new ActionFallSystem(lemmingsSprite);
            this.actions[LemmingStateType.JUMPING] = new ActionJumpSystem(lemmingsSprite);
            this.actions[LemmingStateType.DIGGING] = new ActionDiggSystem(lemmingsSprite);
            this.actions[LemmingStateType.EXITING] = new ActionExitingSystem(lemmingsSprite, gameVictoryCondition, Resources);
            this.actions[LemmingStateType.FLOATING] = new ActionFloatingSystem(lemmingsSprite);
            this.actions[LemmingStateType.BLOCKING] = new ActionBlockerSystem(lemmingsSprite, triggerManager);
            this.actions[LemmingStateType.MINEING] = new ActionMineSystem(lemmingsSprite, masks);
            this.actions[LemmingStateType.CLIMBING] = new ActionClimbSystem(lemmingsSprite);
            this.actions[LemmingStateType.HOISTING] = new ActionHoistSystem(lemmingsSprite);
            this.actions[LemmingStateType.BASHING] = new ActionBashSystem(lemmingsSprite, masks);
            this.actions[LemmingStateType.BUILDING] = new ActionBuildSystem(lemmingsSprite, Resources);
            this.actions[LemmingStateType.SHRUG] = new ActionShrugSystem(lemmingsSprite);
            this.actions[LemmingStateType.EXPLODING] = new ActionExplodingSystem(lemmingsSprite, masks, triggerManager, particleTable, Resources);
            this.actions[LemmingStateType.OHNO] = new ActionOhNoSystem(lemmingsSprite);
            this.actions[LemmingStateType.SPLATTING] = new ActionSplatterSystem(lemmingsSprite, Resources);//splash
            this.actions[LemmingStateType.DROWNING] = new ActionDrowningSystem(lemmingsSprite, Resources);//noyade
            this.actions[LemmingStateType.FRYING] = new ActionFryingSystem(lemmingsSprite, Resources);

            this.skillActions[SkillTypes.DIGGER] = this.actions[LemmingStateType.DIGGING];
            this.skillActions[SkillTypes.FLOATER] = this.actions[LemmingStateType.FLOATING];
            this.skillActions[SkillTypes.BLOCKER] = this.actions[LemmingStateType.BLOCKING];
            this.skillActions[SkillTypes.MINER] = this.actions[LemmingStateType.MINEING];
            this.skillActions[SkillTypes.CLIMBER] = this.actions[LemmingStateType.CLIMBING];
            this.skillActions[SkillTypes.BASHER] = this.actions[LemmingStateType.BASHING];
            this.skillActions[SkillTypes.BUILDER] = this.actions[LemmingStateType.BUILDING];
            this.skillActions[SkillTypes.BOMBER] = new ActionCountdownSystem(masks);

            /// wait before first lemming is spawn
            this.releaseTickIndex = this.gameVictoryCondition.getCurrentReleaseRate() - 30;
        }


        private processNewAction(lem: Lemming, newAction: LemmingStateType): boolean {

            if (newAction == LemmingStateType.NO_STATE_TYPE) {
                return false;
            }

            this.setLemmingState(lem, newAction);

            return true;
        }


        /** process all Lemmings to the next time-step */
        public tick() {

            this.addNewLemmings();

            let lems = this.lemmings;

            if (this.isNuking()) {
                this.doLemmingAction(lems[this.nextNukingLemmingsIndex], SkillTypes.BOMBER);
                this.nextNukingLemmingsIndex++;
            }

            for (let i = 0; i < lems.length; i++) {

                let lem = lems[i];

                if (lem.removed) continue;

                let newAction = lem.process(this.level);
                this.processNewAction(lem, newAction);

                //let triggerAction = this.runTrigger(lem);
                let triggerAction = this.triggerManager.triggerNew(lem, this.Resources);
                this.processNewAction(lem, triggerAction);
            }
        }

        /** Add a new Lemming to the manager */
        private addLemming(x: number, y: number) {

            let lem = new Lemming(x, y, this.lemmings.length);

            this.setLemmingState(lem, LemmingStateType.FALLING);

            this.lemmings.push(lem);
        }


        /** let a new lemming arise from an entrance */
        private addNewLemmings() {
            if (this.gameVictoryCondition.getLeftCount() <= 0) {
                return;
            }

            this.releaseTickIndex++;

            if (this.releaseTickIndex >= (104 - this.gameVictoryCondition.getCurrentReleaseRate())) {
                this.releaseTickIndex = 0;

                for (let i = 0; i < this.level.entrances.length; i++) {
                    let entrance = this.level.entrances[i];

                    this.addLemming(entrance.x + 24, entrance.y + 14);//TF better to take middle size ?

                    this.gameVictoryCondition.releaseOne();
                }
            }
        }

        //TF to be removed
        /*
        private runTrigger(lem: Lemming): LemmingStateType {
            if (lem.isRemoved() || (lem.isDisabled())) {
                return LemmingStateType.NO_STATE_TYPE;
            }
            let offset=0;

            //console.log("bashing:"+lem.action.GetLemState());
            if(lem.action.GetLemState()==LemmingStateType.BASHING)
            {
                offset=8;//test upper for basher
            }
            let triggerType = this.triggerManager.trigger(lem.x, lem.y - offset, this.Resources);


            
            if (triggerType!=TriggerTypes.NO_TRIGGER)
                this.logging.log("trigger type: " + triggerType);

            switch (triggerType) {
                case TriggerTypes.STEEL:
                    if ((lem.action.GetLemState() == LemmingStateType.DIGGING) || (lem.action.GetLemState() == LemmingStateType.MINEING) || (lem.action.GetLemState() == LemmingStateType.BASHING) ) {
                        console.log("STEEL trigger-----!!!");
                        lem.toogleDirection();
                        return LemmingStateType.WALKING;
                    }
                    else
                        return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.NO_TRIGGER:
                    return LemmingStateType.NO_STATE_TYPE;
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
                    return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.BLOCKER_RIGHT:
                    if (!lem.lookRight) lem.lookRight = true;
                    return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.ONWAY_LEFT:
                    //console.log("ONWAY_LEFT:"+lem.lookRight);
                    if(lem.lookRight==false)
                        return LemmingStateType.NO_STATE_TYPE;
                    //console.log("ONWAY_LEFT: going right"+lem.action.GetLemState());
                    if((lem.action.GetLemState()==LemmingStateType.BASHING)||(lem.action.GetLemState()==LemmingStateType.MINEING))
                    {
                        //console.log("ONWAY_LEFT:Bashing: GO BACK");
                        lem.toogleDirection();
                        return LemmingStateType.WALKING;
                    }   
                    else
                        return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.ONWAY_RIGHT:
                    //console.log("ONWAY_Right:"+lem.lookRight);
                    if(lem.lookRight==true)
                        return LemmingStateType.NO_STATE_TYPE;
                    //console.log("ONWAY_Right: going left:"+lem.action.GetLemState());
                    if((lem.action.GetLemState()==LemmingStateType.BASHING)||(lem.action.GetLemState()==LemmingStateType.MINEING))
                    {
                        //console.log("ONWAY_Right:Bashing: GO BACK");
                        lem.toogleDirection();
                        return LemmingStateType.WALKING;
                    }   
                    else
                        return LemmingStateType.NO_STATE_TYPE;
                default:
                    this.logging.log("unknown trigger type: " + triggerType);
                    return LemmingStateType.NO_STATE_TYPE;

            }
        }
        */

        /** render all Lemmings to the GameDisplay */
        public render(gameDisplay: DisplayImage) {
            let lems = this.lemmings;

            for (let i = 0; i < lems.length; i++) {
                lems[i].render(gameDisplay);
            }
        }

        /** render all Lemmings to the GameDisplay */
        public renderDebug(gameDisplay: DisplayImage) {
            let lems = this.lemmings;

            for (let i = 0; i < lems.length; i++) {
                lems[i].renderDebug(gameDisplay);
            }
        }

        public getLemmingPosList(): Position2D[]
        {
            let lemmingsPosList: Position2D[] = [];
            let lems = this.lemmings;
            for (let i = 0; i < lems.length; i++) {
                if(lems[i].isRemoved()==false)
                {
                   let p2d = new Position2D (lems[i].x,lems[i].y);
                   lemmingsPosList.push(p2d);
                }
            }
            return lemmingsPosList;
        }
        /** return the lemming with a given id */
        public getLemming(id:number): Lemming {
            return this.lemmings[id];
        }

        /** return a lemming a a geiven position */
        public getLemmingAt(x: number, y: number): Lemming {
            let lems = this.lemmings;

            let minDistance = 99999;
            let minDistanceLem = null;

            for (let i = 0; i < lems.length; i++) {
                let lem = lems[i];

                let distance = lem.getClickDistance(x, y);
                //console.log("--> "+ distance);

                if ((distance < 0) || (distance >= minDistance)) {
                    continue;
                }

                minDistance = distance;
                minDistanceLem = lem;
            }
            //console.log("====> "+ (minDistanceLem? minDistanceLem.id : "null"));
            return minDistanceLem;
        }

        /** change the action a Lemming is doing */
        private setLemmingState(lem: Lemming, stateType: LemmingStateType) {

            if (stateType == LemmingStateType.OUT_OFF_LEVEL) {
                lem.remove();
                this.gameVictoryCondition.removeOne();
                return;
            }

            let actionSystem = this.actions[stateType];

            if (actionSystem == null) {
                lem.remove();

                this.logging.log(lem.id + " Action: Error not an action: " + LemmingStateType[stateType]);
                return;
            }
            else {
               // this.logging.debug(lem.id + " Action: " + actionSystem.getActionName());
            }

            lem.setAction(actionSystem);
        }


        /** change the action a Lemming is doing */
        public doLemmingAction(lem: Lemming, skillType: SkillTypes): boolean {
            if (lem == null) {
                return false;
            }

            let actionSystem = this.skillActions[skillType];
            if (!actionSystem) {
                this.logging.log(lem.id + " Unknown Action: " + skillType);
                return false;
            }

            return actionSystem.triggerLemAction(lem);
        }


        /** return if the game is in nuke state */
        public isNuking() {
            return this.nextNukingLemmingsIndex >= 0;
        }


        /** start the nuking of all lemmings */
        public doNukeAllLemmings() {
            this.nextNukingLemmingsIndex = 0;
        }
    }

}
