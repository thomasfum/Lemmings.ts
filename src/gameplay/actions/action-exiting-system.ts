module Lemmings {

    export class ActionExitingSystem implements IActionSystem {

        private soundPlayer: AudioPlayer = null;

        private sprite: Animation;

        constructor(sprites: LemmingsSprite, private gameVictoryCondition: GameVictoryCondition, Resources: GameResources) {
            this.sprite = sprites.getAnimation(SpriteTypes.EXITING, false);

            if (Resources.soundEnable == true) {
                Resources.getSoundPlayer(15)//TF sound
                    .then((player) => {
                        this.soundPlayer = player;
                    });
            }
            else
                this.soundPlayer = null;

        }

        public getActionName(): string {
            return "exiting";
        }
        public GetLemState(): LemmingStateType{
            return LemmingStateType.EXITING;
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
            
            lem.frameIndex++;


            //TF sound
            if (lem.frameIndex == 8) {
                if (this.soundPlayer != null)
                    this.soundPlayer.play();
            }

            if (lem.frameIndex >= 8) {
                this.gameVictoryCondition.addSurvivor();
 
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }
}