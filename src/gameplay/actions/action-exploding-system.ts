module Lemmings {

    export class ActionExplodingSystem implements IActionSystem {

        private soundPlayer4: AudioPlayer = null;
        private soundPlayer11: AudioPlayer = null;

        private mask: MaskList;
        private sprite: Animation;

        constructor(sprites: LemmingsSprite, masks: MaskProvider, private triggerManager: TriggerManager, private particleTable: ParticleTable, Resources: GameResources) {
            this.mask = masks.GetMask(MaskTypes.EXPLODING);
            this.sprite = sprites.getAnimation(SpriteTypes.EXPLODING, false);


            if (Resources.soundEnable == true) {
                Resources.getSoundPlayer(4)//TF sound
                    .then((player) => {
                        this.soundPlayer4 = player;
                    });
            }
            else
                this.soundPlayer4 = null;

            if (Resources.soundEnable == true) {
                Resources.getSoundPlayer(11)//TF sound
                    .then((player) => {
                        this.soundPlayer11 = player;
                    });
            }
            else
                this.soundPlayer11 = null;

        }

        public getActionName(): string {
            return "exploding";
        }
        public GetLemState(): LemmingStateType{
            return LemmingStateType.EXPLODING;
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }

        /** render Lemming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {

            if (lem.frameIndex == 0) {
                let frame = this.sprite.getFrame(lem.frameIndex);
                gameDisplay.drawFrame(frame, lem.x, lem.y);
            }
            else {
                this.particleTable.draw(gameDisplay, lem.frameIndex - 1, lem.x, lem.y);
            }


        }


        public process(level: Level, lem: Lemming): LemmingStateType {
            lem.disable();

            lem.frameIndex++;

            if (lem.frameIndex == 1) {
                this.triggerManager.removeByOwner(lem);

                level.clearGroundWithMask(this.mask.GetMask(0), lem.x, lem.y);
                                            
                //TF sound
                if (this.soundPlayer4 != null)
                    this.soundPlayer4.play();
              
            }

            if (lem.frameIndex == 10) {
                //TF sound
                if (this.soundPlayer11 != null)
                    this.soundPlayer11.play();
            }



            if (lem.frameIndex == 52) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }


    }

}



