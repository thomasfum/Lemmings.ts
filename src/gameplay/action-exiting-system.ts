module Lemmings {

    export class ActionExitingSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation;

        constructor(sprites: LemmingsSprite, private gameVictoryCondition:GameVictoryCondition) {
            this.sprite = sprites.getAnimation(SpriteTypes.EXITING, false);
        }

        public getActionName(): string {
            return "exiting";
        }

        public draw(gameDisplay:DisplayImage, lem: Lemming) {

            let frame = this.sprite.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {
            
            lem.removed = true;

            lem.frameIndex++;

            if (lem.frameIndex >= 8) {
                this.gameVictoryCondition.AddSurvivor();
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }
}