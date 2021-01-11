
module Lemmings {

    export class GameConfig {
        /** Name of the Lemmings Game */
        public name: string = "";
        /** Path/Url to the resources */
        public path: string = "";
        /** unique Game ID */
        public gameID: number=-1;

        public audioConfig:AudioConfig = new AudioConfig();

        public level:LevelConfig = new LevelConfig();

        public accessCodeKey: string;
        public gamePaletteID: number;


    }

}