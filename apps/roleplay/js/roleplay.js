// fetchSounds() requires _.forOwn() from the lo-dash library (http://lodash.com)
const AUDIOPATH = 'audio/',
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

      AUX = ['instructions', 'z_final'],

      dialogueIds = {'proficient': doctor, 'intermediate': exam, 'high-intermediate': fired, 'high-advanced': interview, 'beginner': introductions, 'high-beginner': recreation, 'advanced': shopping};

var myAudioContext, myBuffers = {}, mySource, myNodes = {};

// has the audio been activated by a touch event already?
var permission_to_playback = false;

function init() {
    try {
        safariFullscreenHack();
        getUiOkToPlayback();
        // Fix up for prefixing; As of this writing Webkit browsers only
        // and only Safari Mobile on iOS 6+, among the mobile browsers
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        myAudioContext = new AudioContext();
        fetchSounds(dialogueIds, APPPATH + AUDIOPATH);
    } catch(e) {
        alert('Sorry, this browser does not support the Web Audio API.');
    }

    $('button').click(function(){
        var $this = $(this),
            pr = $this.data('proficiency'),
            di = $this.data('dialogue');
        playNextChoice(pr, di);
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
    if(!permission_to_playback) {
        $("#ui").click(function(){
            // create empty buffer
            var buffer = myAudioContext.createBuffer(1, 1, 22050);
            var theSource = myAudioContext.createBufferSource();
            theSource.buffer = buffer;
            // connect to the output
            theSource.connect(myAudioContext.destination);
            // play the silent file
            theSource.noteOn(0);
            // Now iOS devices will download, buffer and play back sounds via JS without waiting for user interaction
            permission_to_playback = true;
        }
    );}
}

function fetchSounds(appfiles, audio_path) {
    // requires lodash.js
    var request;
    _.forOwn(appfiles, function(proficiencyBaseFilenamesArrayObj, keyDialogueID){
        _.forOwn(proficiencyBaseFilenamesArrayObj, function(baseFileName, baseFilenamesArrayIndex){
            if (!_.isNumber(baseFileName)) {
                request = new XMLHttpRequest();
                request._soundName = baseFileName;
                request.open('GET', audio_path + request._soundName + '.m4a', true);
                request.responseType = 'arraybuffer';
                request.addEventListener('load', bufferSound, false);
                request.send();
            }
        });
    })

    for (s=0, len=AUX.length; s < len; s++) {
        request = new XMLHttpRequest();
        request._soundName = AUX[s];
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

function playSound(soundFileToken) {
    // create a new AudioBufferSourceNode
    var source = myAudioContext.createBufferSource();
    console.log("soundFileToken %o", soundFileToken);
    source.buffer = myBuffers[soundFileToken];
    // = source.buffer.duration;
    source.connect(myAudioContext.destination);
    // play right now (0 seconds from now)
    // can also pass myAudioContext.currentTime
    // noteOn() has reportedly been deprecated but Safari requires it
    // start() takes the place of noteOn() but Safari apparently doesn't support it yet
    // source.start(0);
    source.noteOn(0);
    // Display blinking or throbbing Respond...
}

function buildPresentedWord(hyphenatedWord) {
    var presentedWord = hyphenatedWord.replace(/-/g, " ");
    return presentedWord;
}

function setupNextDialogue(currentDialogue) {
    // stack dialogue's sounds
    // for (var i = 0, sounds = currentDialogue.length - 1; i < sounds; i+2){
      var el = $("#dialogue"[i]+" img");
      $(el).attr("src", APPPATH + IMGPATH + currentDialogue + "_" + "dialogue"[i] + "");
    // }
    // place word text
    setTimeout(function(){
        $('h1.vocab-word').contents().replaceWith(buildPresentedWord(currentDialogue));
        $('.vocab-word').show();
    }, 1000);
    // say the word
    setTimeout(function(){playSound(currentDialogue);}, 1000);
}

// display next interlocutor image and playback her side of the dialogue
function playNextChoice(level, scenario) {
    // save final image and full dialogue for this level of proficiency
    var finalBaseFilename = dialogueIds.level[level.length-1]; 
    for (var i = 0, fn = scenario.length - 2; i < fn; i+2) {
        var imageToken = scenario[i];
        var audioToken = scenario[i];
        var delay = scenario[i+1];
        $(".dialogue img").attr("src");
        // $(".dialogue img").attr("alt", "Currently playing " + buildPresentedWord(level) + " dialog.");
        $(".dialogue img").contents().replaceWith(APPPATH + IMGPATH + imageToken + ".jpg");
        // Playback interlocutor's side of the dialogue
        setTimeout(function(){
            playSound(scenario[i]);
        }, delay + 500);
    }

    // play final sound
    setTimeout(function(){playSound("z_final");}, 1250);

    // return to game index page
    setTimeout(function(){window.location.href = "http://www.eslfornativespeakers.com/game.html";}, 2250);
}
