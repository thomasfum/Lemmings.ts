module Lemmings {

    export class GameDisplay {

        private dispaly: DisplayImage = null;
        private stage: Stage=null;

        constructor(
            private game: Game,
            private level: Level,
            private lemmingManager: LemmingManager,
            private objectManager: ObjectManager,
            private triggerManager: TriggerManager) {
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

                this.game.queueCmmand(new CommandLemmingsAction(lem.id));
            });
        }


        public render() {
            if (this.dispaly == null) return;

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
