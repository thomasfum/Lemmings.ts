module Lemmings {

    export class GameDisplay {

        private dispaly: DisplayImage = null;
        private stage: Stage=null;
        private soundPlayer3:AudioPlayer=null;

        constructor(
            private game: Game,
            private level: Level,
            private lemmingManager: LemmingManager,
            private objectManager: ObjectManager,
            private triggerManager: TriggerManager,
            private Resources: GameResources) {
            this.soundPlayer3 = Resources.getSoundPlayerNew(3);//TF sound
        }

        //C EST LA
        public setGuiDisplay(dispaly: DisplayImage, stage: Stage) {
            this.dispaly = dispaly;
            if(stage!=null)
            {
                this.stage=stage;
            }
            this.dispaly.onMouseDown.on((e) => {
                //console.log(e.x +" "+ e.y);
                let lem = this.lemmingManager.getLemmingAt(e.x, e.y);
                if (!lem) return;
                if (this.soundPlayer3!=null)
                    this.soundPlayer3.play();
                
                this.game.queueCmmand(new CommandLemmingsAction(lem.id));
            });
        }

        public renderSub(dispaly:DisplayImage) {
            this.level.render(dispaly);
            this.objectManager.render(dispaly);
        }
        public render() {
            if (this.dispaly == null) return;

            this.stage.UpdateAutoScroll();
            
            this.level.render(this.dispaly);

            this.objectManager.render(this.dispaly);

            this.lemmingManager.render(this.dispaly);
        }

        
        public renderDebug() {
            if (this.dispaly == null) return;

            this.lemmingManager.renderDebug(this.dispaly);
            this.triggerManager.renderDebug(this.dispaly);
        }

    }
}
