module Lemmings {

    export class ActionFryingSystem implements IActionSystem {

        private sprite: Animation;

        constructor(sprites: LemmingsSprite) {
            this.sprite = sprites.getAnimation(SpriteTypes.WALKING, false);
        }

        public getActionName(): string {
            return "Frying";
        }
        public GetLemState(): LemmingStateType{
            return LemmingStateType.WALKING;
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }

        /** render Lemming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let frame = this.sprite.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
            console.log("Frying draw");
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frameIndex++;
            console.log("Frying process" + lem.frameIndex);
/*
            if (lem.frameIndex >= 14) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }
*/
            return LemmingStateType.NO_STATE_TYPE;

        }

    }

}
