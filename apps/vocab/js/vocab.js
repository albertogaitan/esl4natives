const AUDIOPATH = 'audio/',
      IMGPATH = 'img/',
      APPPATH = 'apps/vocab/',
      VOCAB = ['achievement', 'active', 'advice', 'ambition', 'busy', 'community', 'culture', 'family', 'freetime', 'friendly', 'happiness', 'healthy', 'hope', 'play', 'regretful', 'respect', 'responsibility', 'routine', 'successful', 'to-be-worth-it', 'to-decide', 'to-doubt', 'to-fear', 'to-study', 'to-work', 'vacation'],
      VOCAB_EXT = ['TL', 'TR', 'BL', 'BR'],
      VOCAB_ANSWER = ['BR', 'TL', 'TR', 'TL', 'TL', 'BL', 'BL', 'BR', 'TL', 'BL', 'BL', 'BL', 'TR', 'TL', 'TR', 'BL', 'BR', 'BL', 'BR', 'BL', 'BR', 'BL', 'TL', 'TL', 'TR', 'TL'],
      OUTCOME = ['z_correct', 'z_incorrect', 'z_score'];

var myAudioContext, myBuffers = {}, mySource, myNodes = {}, score = 0;

// keep track of this session's completed vocabulary challenges
var words_done = [];
var answerId = {};
var currentWordInPlay = "";

// has the audio been activated by a touch event already?
var sound_is_initialized = false;

function init() {
    try {
      // Fix up for prefixing; As of this writing Webkit browsers only
      // and only Safari Mobile on iOS 6+ among the mobile browsers
      window.AudioContext = window.AudioContext||window.webkitAudioContext;
      myAudioContext = new AudioContext();
      words_done = VOCAB;
      fetchSounds(VOCAB, APPPATH + AUDIOPATH);
    } catch(e) {
      // alert('Sorry, this browser does not support the Web Audio API so you will not hear the vocabulary words. You may, however still take the test!');
      alert('Sorry, this browser does not support the Web Audio API.');
    }
    VOCAB_EXT.forEach(function(f) {
      document.getElementById(f).onclick = function(e) {
        evaluate(this.id);
        return false;
      };
    });
    // Next button used to greenlight media playback downloads on iOS devices
    // which need a user-initiated UI event to play at least the
    // first one of a session
    document.getElementById("next").onclick = function(e) {
    // Initialize gameplay environment and setup first word
        if(!sound_is_initialized) {
            // create empty buffer
            var buffer = myAudioContext.createBuffer(1, 1, 22050);
            var theSource = myAudioContext.createBufferSource();
            theSource.buffer = buffer;
            // connect to the output
            theSource.connect(myAudioContext.destination);
            // play the silent file
            theSource.noteOn(0);
            // Now iOS devices will download, buffer and play back sounds 
            // via JS without waiting for user interaction
            sound_is_initialized = true;
        }
        setupNextWord(selectRandomVocabWord());
        // we're done with the Next button
        document.getElementById("next").style.display = 'none';
    };
}

// Stashed here for safekeeping. Reportedly not needed under iOS 6.
function safariFullscreenHack() {
    window.addEventListener("load",function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 0);
    });
}

// function greenLightMediaDownloads() {
//     // $('.container-fluid').bind('touchstart', function(e) {
//     window.addEventListener('touchstart', function(e) {
//         // create empty buffer
//         var buffer = myAudioContext.createBuffer(1, 1, 22050);
//         var theSource = myAudioContext.createBufferSource();
//         theSource.buffer = buffer;
//         // connect to the output
//         theSource.connect(myAudioContext.destination);
//         // play the silent file
//         theSource.noteOn(0);
//         // Now iOS devices will download, buffer and play back sounds 
//         // via JS without waiting for user interaction
//         sound_is_initialized = true;
//     }, false);
// }

function fetchSounds(appfiles, audio_path) {
    var request;
    for (var i = 0, len = appfiles.length; i < len; i++) {
        // Let's load the test Q&A while we're iterating
        answerId[appfiles[i]] = VOCAB_ANSWER[i];
        // Then we rejoin our regularly scheduled program
        request = new XMLHttpRequest();
        request._soundName = appfiles[i];
        request.open('GET', audio_path + request._soundName + '.m4a', true);
        request.responseType = 'arraybuffer';
        request.addEventListener('load', bufferSound, false);
        request.send();
    }
    // fetch the response success notifier sounds
    for (var j = 0, err = OUTCOME.length; j < err; j++) {
        request = new XMLHttpRequest();
        request._soundName = OUTCOME[j];
        request.open('GET', audio_path + request._soundName + '.m4a', true);
        request.responseType = 'arraybuffer';
        request.addEventListener('load', bufferSound, false);
        request.send();
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
    source.connect(myAudioContext.destination);
    // play right now (0 seconds from now)
    // can also pass myAudioContext.currentTime
    // noteOn() has reportedly been deprecated but Safari requires it
    // start() takes the place of noteOn() but Safari doesn't support it yet
    // source.start(0);
    source.noteOn(0);
}

function buildPresentedWord(wordAsFilename) {
    var presentedWord = wordAsFilename.replace(/-/g, " ");
    return presentedWord;
}

function setupNextWord(currentWordInPlay) {
    // create a new AudioBufferSourceNode
    // var currentSource = myAudioContext.createBufferSource();
    // currentSource.buffer = myBuffers[currentWordInPlay];
    // currentSource.loop = false;
    // currentSource = routeSound(currentSource);

    // place images
    for (var i = 0, images = 4; i < images; i++){
      var el = $("#"+VOCAB_EXT[i]+" img");
      $(el).attr("src", APPPATH + IMGPATH + currentWordInPlay + "_" + VOCAB_EXT[i] + ".jpg");
    }
    // place word text
    setTimeout(function(){
        $('h1.vocab-word').contents().replaceWith(buildPresentedWord(currentWordInPlay));
        $('.vocab-word').show();
    }, 1000);
    // say the word
    setTimeout(function(){playSound(currentWordInPlay);}, 1000);
}

function pauseSound() {
    var source = mySource;
    // noteOff() has reportedly been deprecated but Safari requires it
    // stop() takes the place of noteOff() but Safari doesn't support it yet
    // source.stop(0);
    source.noteOff(0);
}

function evaluate(id) {
    if (answerId[currentWordInPlay] == id){
        score++;
        playSound("z_correct");
    } else {
        playSound("z_incorrect");
    }
    if (words_done.length > 0) {
        // TODO hide the word here? or in setUpNextWord?
        $('.vocab-word').hide();
        // display next word and images and say next word
        setTimeout(function(){setupNextWord(selectRandomVocabWord());}, 1000);
    } else {
        // display score
        setTimeout(function(){playSound("z_score"); alert("Your score was " + score + "!");}, 1250);
        // return to index page
        setTimeout(function(){window.location.href = "http://www.eslfornativespeakers.com/game.html";}, 2250);
    }
}
