module Lemmings {

    export class ActionBuildSystem implements IActionSystem {

        private sprite: Animation[] = [];
        private soundPlayer: AudioPlayer = null;

        constructor(sprites: LemmingsSprite, Resources: GameResources) {

            this.sprite.push(sprites.getAnimation(SpriteTypes.BUILDING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.BUILDING, true));

            if (Resources.soundEnable == true) {
                Resources.getSoundPlayer(17)//TF sound
                    .then((player) => {
                        this.soundPlayer = player;
                    });
            }
            else
                this.soundPlayer = null;

        }

        public getActionName(): string {
            return "building";
        }
        public GetLemState(): LemmingStateType{
            return LemmingStateType.BUILDING;
        }


        public triggerLemAction(lem: Lemming): boolean {
            lem.setAction(this);

            return true;
        }

        /** render Lemming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let ani = this.sprite[(lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }



        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frameIndex = (lem.frameIndex + 1) % 16;

            if (lem.frameIndex == 9) {

                /// lay brick
                var x = lem.x + (lem.lookRight ? 0 : -4);
                for (var i = 0; i < 6; i++) {
                    level.setGroundAt(x + i, lem.y - 1, 7);
                }

                return LemmingStateType.NO_STATE_TYPE;
            }

            if (lem.frameIndex == 0) {
                /// walk 

                lem.y--;

                for (let i = 0; i < 2; i++) {
                    lem.x += (lem.lookRight ? 1 : -1);
                    if (level.hasGroundAt(lem.x, lem.y - 1)) {
                        lem.lookRight = !lem.lookRight;
                        return LemmingStateType.WALKING;
                    }
                }

                lem.state++;
                //TF sound
                if ((lem.state >= 10)&& (lem.state <=12)) {
                    if (this.soundPlayer != null)
                        this.soundPlayer.play();
                }


                if (lem.state >= 12) {
                    return LemmingStateType.SHRUG;
                }

                if (level.hasGroundAt(lem.x + (lem.lookRight ? 2 : -2), lem.y - 9)) {
                    lem.lookRight = !lem.lookRight;
                    return LemmingStateType.WALKING;
                }
            }
            return LemmingStateType.NO_STATE_TYPE;

        }


    }

}
