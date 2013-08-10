// fetchSounds() requires _.forOwn() from the lo-dash library (http://lodash.com)
var AUDIOPATH = 'audio/',
    IMGPATH = 'img/',
    APPPATH = 'apps/roleplay/',
    // May not be needed:
    dialogueList = ['doctor','exam','fired','interview','introductions','recreation','shopping'],
    doctor = ['doctor_01', 2000, 'doctor_03', 1000, 'doctor_05', 3000, 'doctor_07', 5000, 'doctor_09', 3000, 'doctor_11', 2000, 'doctor_13', 4000, 'doctor_15', 2000, 'doctor_17', 1000, 'doctor_19', 1000, 'doctor'],
    exam = ['exam_01', 5000, 'exam_03', 2000, 'exam_05', 4000, 'exam_07', 3000, 'exam_09', 4000, 'exam_11', 1000, 'exam'],
    fired = ['fired_01', 5000, 'fired_03', 6000, 'fired_05', 4000, 'fired_07', 6000, 'fired'],
    interview = ['interview_01', 2000, 'interview_03', 2000, 'interview_05', 2000, 'interview_07', 2000, 'interview_09', 6000, 'interview_11', 5000, 'interview_13', 4000, 'interview_15', 3000, 'interview'],
    introductions = ['introductions_01', 1000, 'introductions_03', 2000, 'introductions_05', 2000, 'introductions_07', 3000, 'introductions_09', 2000, 'introductions_11', 1000, 'introductions'],
    recreation = ['recreation_01', 3000, 'recreation_03', 2000, 'recreation_05', 3000, 'recreation_07', 1000, 'recreation'],
    shopping = ['shopping_01', 3000, 'shopping_03', 4000, 'shopping_05', 3000, 'shopping_07', 4000, 'shopping_09', 3000, 'shopping_11', 2000, 'shopping_13', 1000, 'shopping_15', 1000, 'shopping'],
    AUX = ['instructions', 'z_final'], dialogueIds = {'proficient': doctor, 'intermediate': exam, 'high-intermediate': fired, 'high-advanced': interview, 'beginner': introductions, 'high-beginner': recreation, 'advanced': shopping};

var context, myBuffers = {}, mySource, myNodes = {};

// has the audio been activated by a touch event already?
var playback_unlocked = false;

function init() {
    try {
        safariFullscreenHack();
        getUiOkToPlayback();
        // Fix up for prefixing; As of this writing Webkit browsers only
        // and only Safari Mobile on iOS 6+, among the mobile browsers
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
        fetchSounds(dialogueIds, APPPATH + AUDIOPATH);
    } catch(e) {
        alert('Sorry, this browser version does not support the necessary audio goodies :(');
    }

    $('button').click(function(){
        var $this = $(this),
        pr = $this.data('proficiency'),
        di = $this.data('dialogue');
        playChosenLevel(pr, window[di], dialogueIds);
    });

    // setupNextDialogue(selectRandomVocabWord());

}

function safariFullscreenHack() {
    // http://stackoverflow.com/questions/12822739/full-screen-api-html5-y-safari-ios-6
    // Requires recommended meta tags on pages and putting webapp on the home sceeen.
    // Reportedly works under iOS 6.x but not (yet?) on iOS 7 beta by 
    // scrolling the iOS notification bar off screen.
    window.addEventListener("load",function(){
        setTimeout(function(){
            $('body').scrollTop(1);
        }, 0);
    });
}

function getUiOkToPlayback() {
    // Allow media file playback
    if(!playback_unlocked) {
        $("#ui").click(function(){
            // create empty buffer
            var buffer = context.createBuffer(1, 1, 22050);
            var theSource = context.createBufferSource();
            theSource.buffer = buffer;
            // connect to the output
            theSource.connect(context.destination);
            // play the silent file
            theSource.noteOn(0);
            // Now iOS devices will download, buffer and play back sounds via JS without waiting for user interaction
            playback_unlocked = true;
        }
    );}
}

function fetchSounds(appfiles, audio_path) {
    // requires lodash.js
    var request;
    request = new XMLHttpRequest();
    _.forOwn(appfiles, function(proficiencyBaseFilenamesArrayObj, keyDialogueID){
        _.forOwn(proficiencyBaseFilenamesArrayObj, function(baseFileName, baseFilenamesArrayIndex){
            if (!_.isNumber(baseFileName)) {
                request._soundName = baseFileName;
                request.open('GET', audio_path + request._soundName + '.m4a', true);
                request.responseType = 'arraybuffer';
                request.addEventListener('load', bufferSound, false);
                request.send();
            }
        });
    });

    for (s=0, len=AUX.length; s < len; s++) {
        // request = new XMLHttpRequest();
        request._soundName = AUX[s];
        request.open('GET', audio_path + request._soundName + '.m4a', true);
        request.responseType = 'arraybuffer';
        request.addEventListener('load', bufferSound, false);
        request.send();
    }
}

function bufferSound(event) {
    var request = event.target;
    var buffer = context.createBuffer(request.response, false);
    myBuffers[request._soundName] = buffer;
}

// function routeSound(source) {
//     myNodes.panner = context.createPanner();
//     myNodes.volume = context.createGainNode();
//     var volume = 1;
//     var panX = 3;
//     myNodes.panner.setPosition(panX, 0, 0);
//     myNodes.volume.gain.value = volume;
//     source.connect(myNodes.volume);
//     myNodes.panner.connect(myNodes.volume);
//     myNodes.volume.connect(context.destination);
//     return source;
// }

// function playSound(soundFileToken, delayAfter) {
//     // create a new AudioBufferSourceNode
//     var source = context.createBufferSource();
//     // console.log("soundFileToken %o", soundFileToken);
//     source.buffer = myBuffers[soundFileToken];
//     // = source.buffer.duration;
//     source.connect(context.destination);
//     // play right now (0 seconds from now)
//     // can also pass context.currentTime
//     // noteOn() has reportedly been deprecated but Safari requires it
//     // start() takes the place of noteOn() but Safari apparently doesn't support it yet
//     // source.start(0);
//     source.noteOn(0);
//     // TODO: Display blinking or throbbing Respond...
//     setTimeout(function(){return true;}, delayAfter + 500);
// }

function buildPresentedWord(hyphenatedWord) {
    var presentedWord = hyphenatedWord.replace(/-/g, " ");
    return presentedWord;
}

// function setupNextDialogue(currentDialogue) {
//     // stack dialogue's sounds
//     // for (var i = 0, sounds = currentDialogue.length - 1; i < sounds; i+2){
//       var el = $("#dialogue"[i]+" img");
//       $(el).attr("src", APPPATH + IMGPATH + currentDialogue + "_" + "dialogue"[i] + "");
//     // }
//     // place word text
//     setTimeout(function(){
//         $('h1.vocab-word').contents().replaceWith(buildPresentedWord(currentDialogue));
//         $('.vocab-word').show();
//     }, 1000);
//     // say the word
//     setTimeout(function(){playSound(currentDialogue);}, 1000);
// }

function isPlaying (bufferSource) {
    setTimeout(function() {
        if((bufferSource.playbackState === bufferSource.PLAYING_STATE || bufferSource.playbackState === bufferSource.FINISHED_STATE)) {
            return true;
        }
    }, 0);
}

// display next interlocutor image and playback her side of the dialogue
function playChosenLevel(level, scenario, dIds) {
    // save final image and full dialogue base name for this level of proficiency
    var finalBaseFilename = dIds[level][dIds[level].length-1];
    var files = scenario.length - 2;
    var theseImages = [];
    var theseLines = [];
    for (var i = 0; i < files; i += 2) {
        var imageToken = "<img src=" + APPPATH + IMGPATH + scenario[i] + ".jpg \/>";
        var audioToken = scenario[ i ];
        var delay = scenario[ i + 1 ];
        theseImages.push(imageToken);
        theseLines.push(audioToken);
    }

    for (var j in files/2) {
        var source = context.createBufferSource();
        
        // $(".dialogue img").attr("src");
        $(".dialogue img").replaceWith(theseImages[ j ]);
        // Playback interlocutor's side of the dialogue
        source.buffer = myBuffers[theseLines[ j ]];
        source.connect(context.destination);
        source.noteOn(0);
        while (isPlaying(source.buffer)) {
            // shuddup and listen        
        }
    }    // source.noteOff(0);
    // setTimeout(function(){playSound(scenario[i], delay);});

    // if (!playSound(scenario[i]), delay){
    //     // alert('Trouble playing sound ' + audioToken + ".m4a");
    // }

// play final sound
// setTimeout(function(){playSound("z_final");}, 1250);

alert("Here's where we would return to the game page");

// return to game index page
// setTimeout(function(){window.location.href = "http://www.eslfornativespeakers.com/game.html";}, 2250);
}
