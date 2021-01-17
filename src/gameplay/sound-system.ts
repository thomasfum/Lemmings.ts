/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {


    function BufferLoader(context, urlList, callback) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;
      }
      
      BufferLoader.prototype.loadBuffer = function(url, index, self) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
      
        var loader = this;
      
        request.onload = function() {
          // Asynchronously decode the audio file data in request.response
          loader.context.decodeAudioData(
            request.response,
            function(buffer) {
              if (!buffer) {
                alert('error decoding file data: ' + url);
                return;
              }
              loader.bufferList[index] = buffer;
              if (++loader.loadCount == loader.urlList.length)
                loader.onload(loader.bufferList,self);
            },
            function(error) {
              console.error('decodeAudioData error', error);
            }
          );
        }
      
        request.onerror = function() {
          alert('BufferLoader: XHR error');
        }
      
        request.send();
      }
      
      BufferLoader.prototype.load = function(self) {
        for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i, self);
      }


    export class SoundSystem {

        private  context:AudioContext=null;
        private bufferLoader;
        private myBufferList=null;

        constructor() {

        }

        public playSound(lem: Lemming, soundId: number) {
            console.log("Play sound " + soundId);
        }

        public init(){


           //window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
          
            this.bufferLoader = new BufferLoader(
                this.context,
              [
                '/sounds/ACTION.WAV',
                '/sounds/AGFALL.WAV',
              ],
              this.finishedLoading
              );
              var self = this;
              this.bufferLoader.load(self);

        }

                
        private finishedLoading(bufferList, self) {
            console.log("finishedLoading");
            self.myBufferList=bufferList;
   
        }

        public play()
        {
           
            let source1 = this.context.createBufferSource();
            source1.buffer = this.myBufferList[0];
            source1.connect(this.context.destination);
            source1.start(0);
        }

    }

}
