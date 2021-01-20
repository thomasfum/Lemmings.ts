module Lemmings {


    /** manages all objects on the map */
    export class ObjectManager {
        private objects: MapObject[] = [];


        constructor(private gameTimer: GameTimer) {

        }

        public openDoor()
        {
            for (let i = 0; i < this.objects.length; i++) {
                let obj = this.objects[i];
                if(obj.id==1)//entrance
                    obj.isTrigerred=true;
            }
        }

        /** render all Objects to the GameDisplay */
        public render(gameDisplay: DisplayImage) {
            let objs = this.objects;

            let tick = this.gameTimer.getGameTicks();

            for (let i = 0; i < objs.length; i++) {
                let obj = objs[i];
                if (obj.animation.isRepeat == true)
                    gameDisplay.drawFrameFlags(obj.animation.getFrame(tick), obj.x, obj.y, obj.drawProperties);
                else {
                    if (obj.isTrigerred == true) {
                        //console.log("Istriggered=true:" + i)
                        obj.animation.reStart();
                        gameDisplay.drawFrameFlags(obj.animation.getFrame(tick), obj.x, obj.y, obj.drawProperties);
                        if (obj.animation.isDone == true) {//prepare nest trigger action
                            obj.isTrigerred = false;
                           // obj.animation.reset();
                        }
                        
                    }
                    else
                        gameDisplay.drawFrameFlags(obj.animation.getLastFrame(), obj.x, obj.y, obj.drawProperties);
                    //then test trigger
                }
            }
        }

        /** add map objects to manager */
        public addRange(mapObjects: MapObject[]) {
            for (let i = 0; i < mapObjects.length; i++) {
                this.objects.push(mapObjects[i]);
            }

        }

    }
}