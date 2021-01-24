
module Lemmings {
    
    export enum SoundFxTypes {
        NO_SOUND,           //00 = no sound
        SKILL_SELECT,       //01 = skill select (the sound you get when you click on one of the skill icons at the bottom of the screen)    =>OK
        ENTRANCE_OPENING,   //02 = entrance opening (sounds like "boing")                                                                   =>OK
        LETS_GO,            //03 = level intro (the "let's go" sound)                                                                       =>OK
        SKILL_ASSIGNED,     //04 = the sound you get when you assign a skill to lemming                                                     =>OK
        OH_NO,              //05 = the "oh no" sound when a lemming is about to explode                                                     =>OK
        ELECTRODE,          //06-TRAP = sound effect of the electrode trap and zap trap,                                                           
        SQUISHING,          //07-TRAP = sound effect of the rock squishing trap, pillar squishing trap, and spikes trap
        AARGH,              //08 = the "aargh" sound when the lemming fall down too far and splatters
        ROAP,               //09-TRAP = sound effect of the rope trap and slicer trap
        STEEL,              //10 = sound effect when a basher/miner/digger hits steel
        CAMELEON,           //11-TRAP = (not sure where used in game)
        EXPLODE,            //12 = sound effect of a lemming explosion                                                                    =>OK
        KILL,               //13 = sound effect of the spinning-trap-of-death, coal pits, and fire shooters(when a lemming touches the object and dies)
        TEN_TONS,           //14-TRAP = sound effect of the 10-ton trap
        BEAR_TRAP,          //15-TRAP = sound effect of the bear trap
        EXIT,               //16 = sound effect of a lemming exiting                                                                      =>OK
        DROWING,            //17 = sound effect of a lemming dropping into water and drowning                                             =>OK
        BUILDER             //18 = sound effect for the last 3 bricks a builder is laying down                                            =>OK
    }
}