// Auto-generated code. Do not edit.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile1 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile2 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile3 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile4 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "level1":
            case "level1":return tiles.createTilemap(hex`14000c0008070f070707070707070707070707070710070905030303080707070707070707070709030303060503030305040404040404040404040603030306050303030504040404040404040404060303030605030303020404040404040404040402030303060503030303030303030404040403030303030306050303030303030d01040403030e030303030306050303030201010104040401010101020303030605030303050404040404040404040406030303060503030305040404040404040404040603030306050303030c0a0a0a0a0a0a0a0a0a0a0b030303060c0a110a0a0a0a0a0a0a0a0a0a0a0a0a0a110a0b`, img`
2 2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 
2 . . . 2 2 2 2 2 2 2 2 2 2 2 2 . . . 2 
2 . . . 2 . . . . . . . . . . 2 . . . 2 
2 . . . 2 . . . . . . . . . . 2 . . . 2 
2 . . . 2 . . . . . . . . . . 2 . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . 2 . . . . . . . . . . 2 . . . 2 
2 . . . 2 . . . . . . . . . . 2 . . . 2 
2 . . . 2 . . . . . . . . . . 2 . . . 2 
2 . . . 2 2 2 2 2 2 2 2 2 2 2 2 . . . 2 
2 2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 
`, [myTiles.transparency16,sprites.dungeon.hazardHole,sprites.dungeon.hazardSpike,sprites.dungeon.floorDark0,myTiles.tile4,sprites.dungeon.purpleOuterWest0,sprites.dungeon.purpleOuterEast1,sprites.dungeon.purpleOuterNorth0,sprites.dungeon.purpleOuterNorthWest,sprites.dungeon.purpleOuterNorthEast,sprites.dungeon.purpleOuterSouth1,sprites.dungeon.purpleOuterSouthWest,sprites.dungeon.purpleOuterSouthEast,sprites.dungeon.floorDark3,sprites.dungeon.floorDark1,sprites.dungeon.doorOpenNorth,sprites.dungeon.doorLockedNorth,sprites.dungeon.doorOpenSouth], TileScale.Sixteen);
            case "level2":
            case "level2":return tiles.createTilemap(hex`1000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010101010101010101010100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`, img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. 2 2 2 2 2 2 2 2 2 2 2 . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, [myTiles.transparency16,sprites.castle.tileGrass2], TileScale.Sixteen);
        }
        return null;
    })

    helpers._registerFactory("tile", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "baseTransparency16":
            case "transparency16":return transparency16;
            case "myTile5":
            case "tile1":return tile1;
            case "myTile6":
            case "tile2":return tile2;
            case "myTile7":
            case "tile3":return tile3;
            case "myTile8":
            case "tile4":return tile4;
        }
        return null;
    })

}
// Auto-generated code. Do not edit.
