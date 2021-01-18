module Lemmings {

    export class ActionDrowningSystem implements IActionSystem {

        private soundPlayer: AudioPlayer = null;

        private sprite: Animation;

        constructor(sprites: LemmingsSprite, Resources: GameResources) {
            this.sprite = sprites.getAnimation(SpriteTypes.DROWNING, false);

            if (Resources.soundEnable == true) {
                Resources.getSoundPlayer(16)//TF sound
                    .then((player) => {
                        this.soundPlayer = player;
                    });
            }
            else
                this.soundPlayer = null;

        }

        public getActionName(): string {
            return "drowning";
        }
        public GetLemState(): LemmingStateType{
            return LemmingStateType.DROWNING;
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

            if (!level.hasGroundAt(lem.x + (lem.lookRight ? 8 : -8), lem.y)) {
                lem.x += (lem.lookRight ? 1 : -1);
            }
            else {
                lem.lookRight = !lem.lookRight;
            }
            
            return LemmingStateType.NO_STATE_TYPE;
        }

    }
}