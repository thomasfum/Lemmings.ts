 module Lemmings {

    /** read the config.json file */
    export class ConfigReader {

        private configs: Promise<GameConfig[]>;
        private log : LogHandler = new LogHandler("ConfigReader");


        constructor(configFile: Promise<string>) {

            this.configs = new Promise<GameConfig[]>((resolve, reject)=> {

                configFile.then((jsonString) => {

                    let configJson:GameConfig[] = this.parseConfig(jsonString);

                        resolve(configJson);
                    }
                );
            });

        }


        /** return the game config for a given GameId */
        public getConfig(GameId : number) : Promise<GameConfig> {

            return new Promise<GameConfig>((resolve, reject)=> {

                this.configs.then((configs:GameConfig[]) => {

                    let config:GameConfig = configs.find((type) => type.gameID == GameId)

                    if (config == null) {
                        this.log.log("config for GameID:"+ GameId +" not found!");
                        reject();
                        return;
                    }

                    resolve(config);

                });
            });
        }


        /** pars the config file */
        private parseConfig(jsonData:string):GameConfig[] {

            let gameConfigs:GameConfig[] = []

            try {

                var config = <any[]>JSON.parse(jsonData);

            } catch(e) {

                this.log.log("Unable to parse config", e);
                return gameConfigs;
            }

            /// for all game types
            for(let c = 0; c < config.length; c++) {
                let newConfig = new GameConfig();
                let configData:{[key:string]:string} = config[c];

                newConfig.name = configData["name"];
                newConfig.path = configData["path"];
                newConfig.gameID =  parseInt (configData["ID"]);

                /// read level config
                if (configData["level.useoddtable"] != null){
                    newConfig.level.useOddTable = (!!(<any>configData["level.useoddtable"]));
                }
                newConfig.level.order = <any>configData["level.order"];
                newConfig.level.filePrefix = <any>configData["level.filePrefix"];
                newConfig.level.groups = <any>configData["level.groups"];
                newConfig.accessCodeKey = <any>configData["accessCodeKey"];

                /// read audio config
                newConfig.audioConfig.version = <any>configData["audio.version"];
                newConfig.audioConfig.adlibChannelConfigPosition = <any>configData["audio.adlibChannelConfigPosition"];
                newConfig.audioConfig.dataOffset = <any>configData["audio.dataOffset"];
                newConfig.audioConfig.frequenciesOffset = <any>configData["audio.frequenciesOffset"];
                newConfig.audioConfig.octavesOffset = <any>configData["audio.octavesOffset"];
                newConfig.audioConfig.frequenciesCountOffset = <any>configData["audio.frequenciesCountOffset"];

                newConfig.audioConfig.instructionsOffset = <any>configData["audio.instructionsOffset"];
                newConfig.audioConfig.soundIndexTablePosition = <any>configData["audio.soundIndexTablePosition"];
                newConfig.audioConfig.soundDataOffset = <any>configData["audio.soundDataOffset"];
                newConfig.audioConfig.numberOfTracks = <any>configData["audio.numberOfTracks"];

                gameConfigs.push(newConfig);
            }

            return gameConfigs;

        }

    }
 }