/// <reference path="../file/binary-reader.ts"/>
/// <reference path="./range.ts"/>
/// <reference path="./level-properties.ts"/>

module Lemmings {

  /** read a level from LEVEL___.DAT file */
  export class LevelReader {

    public levelWidth = 1600;
    public levelHeight = 160;

    public levelProperties: LevelProperties = new LevelProperties();

    public screenPositionX = 0;

    /** index of GROUNDxO.DAT file */
    public graphicSet1 = 0;
    /** index of VGASPECx.DAT */
    public graphicSet2 = 0;

    public isSuperLemming = false;

    public objects: LevelElement[] = [];
    public terrains: LevelElement[] = [];
    public steel: Range[] = [];

    private log = new LogHandler("LevelReader");

    /// Load a Level
    constructor(fr: BinaryReader) {

      this.readLevelInfo(fr);
      this.readLevelObjects(fr);
      this.readLevelTerrain(fr);
      this.readSteelArea(fr);
      this.readLevelName(fr);

      this.log.debug(this);
    }


    /** read general Level information */
    private readLevelInfo(fr: BinaryReader) {

      fr.setOffset(0);

      this.levelProperties.releaseRate = fr.readWord();
      this.levelProperties.releaseCount = fr.readWord();
      this.levelProperties.needCount = fr.readWord();
      this.levelProperties.timeLimit = fr.readWord();

      //- read amount of skills
      this.levelProperties.skills[SkillTypes.CLIMBER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.FLOATER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.BOMBER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.BLOCKER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.BUILDER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.BASHER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.MINER] = fr.readWord();
      this.levelProperties.skills[SkillTypes.DIGGER] = fr.readWord();

      this.screenPositionX = fr.readWord();

      this.graphicSet1 = fr.readWord();
      this.graphicSet2 = fr.readWord();

      this.isSuperLemming = (fr.readWord() != 0);
    }


    /** read the level objects */
    private readLevelObjects(fr: BinaryReader) {

      /// reset array
      this.objects = [];

      fr.setOffset(0x0020);

      for (var i = 0; i < 32; i++) {

        var newOb = new LevelElement();

        newOb.x = fr.readWord() - 16;
        newOb.y = fr.readWord();
        newOb.id = fr.readWord();

        var flags = fr.readWord();
        let isUpsideDown = ((flags & 0x0080) > 0);
        let noOverwrite = ((flags & 0x8000) > 0);
        let onlyOverwrite = ((flags & 0x4000) > 0);

        newOb.drawProperties = new DrawProperties(isUpsideDown, noOverwrite, onlyOverwrite, false);

        /// ignore empty items/objects
        if (flags == 0) continue;

        this.objects.push(newOb);
      }
    }


    /** read the Level Obejcts */
    private readLevelTerrain(fr: BinaryReader) {

      /// reset array
      this.terrains = [];

      fr.setOffset(0x0120);

      for (var i = 0; i < 400; i++) {
        var newOb = new LevelElement();

        var v = fr.readInt(4);
        if (v == -1) continue;

        newOb.x = ((v >> 16) & 0x0FFF) - 16;

        var y = ((v >> 7) & 0x01FF);
        newOb.y = y - ((y > 256) ? 516 : 4);

        newOb.id = (v & 0x003F);

        var flags = ((v >> 29) & 0x000F);
        let isUpsideDown = ((flags & 2) > 0);
        let noOverwrite = ((flags & 4) > 0);
        let isErase = ((flags & 1) > 0);

        newOb.drawProperties = new DrawProperties(isUpsideDown, noOverwrite, false, isErase);

        this.terrains.push(newOb);
      }
    }


    /** read Level Steel areas (Lemming can't pass) */
      /*
      BYTES 0x0760 to 0x07DF (4 byte blocks)

        x pos : 9-bit value.  min 0x000, max 0xC78.  0x000 = -16, 0x008 = -12,
	        0x010 = -8, 0x018 = -4, ... , 0xC78 = 1580.
	        note: each hex value represents 4 pixels.  since it is 9 bit value it
	              bleeds into the next attribute.

        y pos : min 0x00, max 0x27. 0x00 = 0, 0x01 = 4, 0x02 = 8, ... , 0x27 = 156
	        note: each hex value represents 4 pixels

        area : min 0x00, max 0xFF.  the first nibble is the x-size, from 0 - F.
               each value represents 4 pixels. the second nibble is the y-size.
               0x00 = (4,4), 0x11 = (8,8), 0x7F = (32,64), 0x23 = (12,16)

        eg: 00 9F 52 00 = put steel at (-12,124) width = 24, height = 12

        each 4 byte block starting at byte 0x0760 represents a steel area which
        the lemmings cannot bash through.  the first three bytes are given above,
        and the last byte is always 00.. what a waste of space considering how
        compact they made the first 3 bytes!  write 0x00 to fill each byte up to
        0x07E0 if need be.


*/
    private readSteelArea(fr: BinaryReader) {
   
      /// reset array
      this.steel = [];

      fr.setOffset(0x0760);

      for (var i = 0; i < 32; i++) {
        var newRange = new Range();
        var pos = fr.readWord();
        var size = fr.readByte();
        var unknown = fr.readByte();


        if ((pos == 0) && (size == 0)) continue;
        if (unknown != 0) {
          this.log.log("Error in readSteelArea() : unknown != 0");
          continue;
        }
          /*
          //original
                newRange.x = (pos & 0x01FF) * 4 - 16;
                newRange.y = ((pos >> 9) & 0x007F) * 4;
        */
          //new calculation
          newRange.y = (pos & 0x007F) * 4;
          newRange.x = (((pos ) >> 7) ) * 4 -16;


        newRange.height = (size & 0x0F) * 4 + 4;
        newRange.width = ((size >> 4) & 0x0F) * 4 + 4;

        //console.warn("Steel: x=" + newRange.x + ", y=" + newRange.y + ", dx=" + newRange.width + ", dy=" + newRange.height);

        this.steel.push(newRange);
        }

        console.warn("Nb steel:" + this.steel.length);
    }



    /** read general Level information */
    private readLevelName(fr: BinaryReader) {
      /// at the end of the 
      this.levelProperties.levelName = fr.readString(32, 0x07E0);
      this.log.debug("Level Name: " + this.levelProperties.levelName);
    }


  }

}
