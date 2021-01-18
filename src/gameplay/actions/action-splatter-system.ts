module Lemmings {

    export class ActionSplatterSystem implements IActionSystem {

        private soundPlayer: AudioPlayer = null;

        private sprite: Animation;

        constructor(sprites: LemmingsSprite, Resources: GameResources) {
            this.sprite = sprites.getAnimation(SpriteTypes.SPLATTING, false);

            if (Resources.soundEnable == true) {
                Resources.getSoundPlayer(14)//TF sound
                    .then((player) => {
                        this.soundPlayer = player;
                    });
            }
            else
                this.soundPlayer = null;

        }

        public getActionName(): string {
            return "splatter";
        }
        public GetLemState(): LemmingStateType{
            return LemmingStateType.SPLATTING;
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }
        
        public draw(gameDisplay: DisplayImage, lem: Lemming) {

            let frame = this.sprite.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {
            lem.disable();

            if (lem.frameIndex == 0) {
                //TF sound
                if (this.soundPlayer != null)
                    this.soundPlayer.play();
            }
            lem.frameIndex++;

            if (lem.frameIndex >= 16) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }
}