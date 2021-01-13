# Lemmings.ts
A Web Lemmings Clone/Remake in TypeScript 
Forked from tomsoftware/Lemmings.ts

The goal is to finish it and extand it to custom levels like the ones present here:
<a href="http://www.garjen.co.uk/Lemmings.php/">[Custom levels]</a>


<p style="text-align:center" align="center">
<a href="http://tfumey.free.fr/lem/lemmings.html">[Play the game]</a></br>
<a href="http://tfumey.free.fr/lem/debug.html">[browse levels and versions with debug version]</a></br>
<a href="http://lemmings.hmilch.net/">[Play the original tomsoftware game]</a>
</p>

## Feature
* Browser Game
* Support all variants of Lemmings Game
* Read original Lemmings binaries on the fly
* Support playing of original music by interpreting the adlib.dat file and using an Adlib emulator(s) (DosBox or Robson Cozendey )

## Improvements since fork
* Map added on game page
* Mouse cursor added with color palette
* Long touch support
* No need to change code to add new levels, use only config.json
* Level presentation page added (objective)
* Result page added
* Original mouse navigation adde
* Welcome page of each game added with mouse and touch pad support
* Game selection page added with mouse and touch pad support

## ToDo
* finish welcome page (Reel)
* On level presentation page add level map
* automate music and sound
* fix some game issues (some killing leming ojects are not triggered (hanging, rolling...))

## How to run
* download the *Lemmings.ts.zip* from ![releases](https://github.com/thomasfum/Lemmings.ts/releases)
* copy the original *Lemmings*, *OhNo* and *Holiday* binaries into the directory **run/{version}/**
* start *lemmings.html*

## How to compile
* you need TypeScript to compile the code to JavaScript


## State
![demo1](docu/examples/demo_01.png "Demo 01")
![demo2](docu/examples/demo_02.png "Demo 02")

# Disclaimer
Disclaimer: This Project does not claim rights to any Lemmings Version. To the best of our/my knowledge, these titles have been discontinued by their publishers. If you know otherwise, please contact us/me and we will remove them accordingly. Thank you for your attention. See the LICENSE for more information.

## Standing on the shoulders of giants
Special thanks goes to:
- DMA for the original game
- Volker Oth, ccexplore and Mindless for their work on reverse engineering the Lemmings Level and Grafic Formats
- DosBox for there OPL emulator
- Robson Cozendey for his Java OPL3 emulator
- tomsoftware for the original ts version
- https://www.camanis.net/lemmings/files/docs/lemmings_main_dat_file_format.txt
