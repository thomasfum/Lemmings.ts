module Lemmings {

    /** loads the config and provides an game-resources object */
    export class GameFactory {

        private configReader:ConfigReader;
        private fileProvider : FileProvider;

        constructor(private rootPath: string) {
            this.fileProvider = new FileProvider(rootPath);
            
            let configFileReader = this.fileProvider.loadString("config.json");
            this.configReader = new ConfigReader(configFileReader);
        }


        /** return a game object to controle/run the game */
        public getGame(gameTypeId : number) : Promise<Game> {

            return new Promise<Game>((resolve, reject)=> {

                /// load resources
                this.getGameResources(gameTypeId)
                    .then(res => resolve(new Game(res)));
            });

        }
       
        /** return the config of a game type */
        public getConfig(gameTypeId : number) : Promise<GameConfig> {
            return this.configReader.getConfig(gameTypeId);
        }

        /** return a Game Resources that gaves access to images, maps, sounds  */
        public getGameResources(gameTypeId : number) : Promise<GameResources> {

            return new Promise<GameResources>((resolve, reject)=> {

                this.configReader.getConfig(gameTypeId).then(config => {

                    if (config == null) {
                        reject();
                        return;
                    }

                    resolve(new GameResources(this.fileProvider, config));
                });

            });
        }
    }

}