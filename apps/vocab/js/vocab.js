const AUDIOPATH = 'audio/', 
      IMGPATH = 'img/',
      BASEPATH = 'apps/vocab/',
      VOCAB = ['achievement', 'active', 'advice', 'ambition', 'busy', 'community', 'culture', 'decide', 'doubt', 'family', 'fear', 'freetime', 'friendly', 'happiness', 'healthy', 'hope', 'play', 'regretful', 'respect', 'responsibility', 'routine', 'study', 'successful', 'vacation', 'work', 'worthit'],
      VOCAB_EXT = ['TL', 'TR', 'BL', 'BR'],
      VOCAB_ANSWER = ['BR', 'TL', 'TR', 'TL', 'TL', 'BL', 'BL', 'BR', 'BL', 'BR', 'TL', 'TL', 'BL', 'BL', 'BL', 'TR', 'TL', 'TR', 'BL', 'BR', 'BL', 'TL', 'BR', 'TL', 'TR', 'BL'],
      OUTCOME = ['z_correct', 'z_incorrect'];

var myAudioContext, myBuffers = {}, mySource, myNodes = {}, score = 0;

// keep track of this session's completed vocabulary challenges
var words_done = [];
var QandA = {};
var newWordInPlay, currentWordInPlay;
// has the audio been activated by a touch event already?
var untouched = true;

function init() {
  try {
    // Fix up for prefixing; Webkit browsers only, as of this writing
    // and only Safari Mobile among the mobile browsers
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    myAudioContext = new webkitAudioContext();
    fetchSounds(VOCAB, BASEPATH + AUDIOPATH);
    words_done = VOCAB;
  } catch(e) {
    alert('Sorry, the Web Audio API is not supported in this browser.');
  }
}

function touchStart() {
    if (untouched) {
        window.addEventListener('touchstart', function() {
            // create empty buffer
            var buffer = myContext.createBuffer(1, 1, 22050);
            var theSource = myContext.createBufferSource();
            theSource.buffer = buffer;
            // connect to the output
            theSource.connect(myContext.destination);
            // play the silent file
            theSource.noteOn(0);
        }, false);
        untouched = false;
    }
}

// Stached here for safekeeping. Reportedly not needed under iOS 6.
function safariFullScreenHack() {
    window.addEventListener("load",function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 0);
    });
}

function fetchSounds(appfiles, audio_path) {
    var request = new XMLHttpRequest();
    for (var i = 0, len = appfiles.length; i < len; i++) {

        // Let's load the test Q&A while we're iterating
        QandA[appfiles[i]] = VOCAB_ANSWER[i];
        // Then we rejoin our regularly scheduled program
        request = new XMLHttpRequest();
        request._soundName = appfiles[i];
        request.open('GET', audio_path + request._soundName + '.m4a', true);
        request.responseType = 'arraybuffer';
        request.addEventListener('load', bufferSound, false);
        request.send();
    }
    for (var j = 0, err = OUTCOME.length; j < err; j++) {
        request2 = new XMLHttpRequest();
        request2._soundName = OUTCOME[j];
        request2.open('GET', audio_path + request._soundName + '.m4a', true);
        request2.responseType = 'arraybuffer';
        request2.addEventListener('load', bufferSound, false);
        request2.send();
    }
}

function bufferSound(event) {
    var request = event.target;
    var buffer = myAudioContext.createBuffer(request.response, false);
    myBuffers[request._soundName] = buffer;
}

function selectRandomVocabWord() {
    var rand = Math.floor(Math.random() * words_done.length);
    var soundName = words_done[rand];
    words_done.splice(rand, 1);
    currentWordInPlay = soundName;
    // return myBuffers[soundName];
    return soundName;
}

function routeSound(source) {
    myNodes.panner = myAudioContext.createPanner();
    myNodes.volume = myAudioContext.createGainNode();
    var volume = 1;
    var panX = 3;
    myNodes.panner.setPosition(panX, 0, 0);
    myNodes.volume.gain.value = volume;
    source.connect(myNodes.volume);
    myNodes.panner.connect(myNodes.volume);
    myNodes.volume.connect(myAudioContext.destination);
    return source;
}

function playSound(stringToken) {
    // create a new AudioBufferSourceNode
    var source = myAudioContext.createBufferSource();
    // source.buffer = selectRandomVocabWord();
    // console.log("stringToken %o", stringToken);
    source.buffer = myBuffers[stringToken];
    // play right now (0 seconds from now)
    // can also pass myAudioContext.currentTime
    // noteOn() has reportedly been deprecated but Safari requires it
    // start() takes the place of noteOn() but Safari doesn't support it yet
    // source.start(0);
    source.noteOn(0);
}

function setupNextWord(currentWordInPlay) {
    // create a new AudioBufferSourceNode
    var currentSource = myAudioContext.createBufferSource();
    currentSource.buffer = myBuffers[currentWordInPlay];
    currentSource.loop = false;
    currentSource = routeSound(currentSource);
    // mySource = currentSource;

    // place images
    for (var i = 0, images = 4; i < images; i++){
        $("img#" + VOCAB_EXT).attr("src", BASEPATH + IMGPATH + currentWordInPlay + "_" + VOCAB_EXT[i] + ".jpg");
    }
    playSound(currentSource);
}

function pauseSound() {
    var source = mySource;
    // noteOff() has reportedly been deprecated but Safari requires it
    // stop() takes the place of noteOff() but Safari doesn't support it yet
    // source.stop(0);
    source.noteOff(0);
}

function evaluate(id) {
    console.log("the id %o", id);
    if (words_done.length > 0) {
        if (QandA[currentWordInPlay] == id){
            playSound("z_correct");
        } else {
            playSound("z_incorrect");
        }
            // display next word and images
            setupNextWord(selectRandomVocabWord());
    } else {
        // display score
        alert("Your score was" + score + "!");
        // return to index page
    }
}