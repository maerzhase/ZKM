var NOTE_ON = 144;
var NOTE_OFF = 128;
var OUT;

var BASENOTE = 40;
var CHORDS = [
	[0,7,12,19,24,25],
	[0,2,9],
	[0,5,12],
	[0,4,8]
];

var MAX_NOTES = 3;
var NOTES = [];


var SCALER = 4;
var PROB_PLAY = 0.99;

var midiSend = function(type, ch, val0, val1) {
	OUT.sendMessage ([type+ch, val0, val1]);
};

var getRandomNote = function(chord) {
	var n = CHORDS[chord].length;
	var r = Math.floor(Math.random()*(n-0.0001));
	return 62+CHORDS[chord][r];
}

module.exports = {

	init : function (midiOut) {
		OUT = midiOut;	
		for (var i=0; i<MAX_NOTES; i++) {
			NOTES[i] = {pitch:0, duration:0};
		}
	},

	play : function (frameCnt) {

		var ch = 0;
		if ((frameCnt%SCALER) == 0) {
	
			// decrease note duration
			for (var i=0; i<NOTES.length; i++) {
				NOTES[i].duration -= 1;
				if (NOTES[i].duration<=0) {
					// stop
					OUT.sendMessage([NOTE_OFF+ch, NOTES[i].pitch, 0]);
				}
			}

			for (var i=0; i<MAX_NOTES; i++) {
				// start new with prob
				if (Math.random() < PROB_PLAY && NOTES[i].duration<=0) {
					var pitch = getRandomNote(0);
					NOTES[i].duration = Math.pow(2,Math.round(Math.random()*1));
					NOTES[i].pitch = pitch;
					OUT.sendMessage([NOTE_ON+ch, pitch, 120]);
					console.log(NOTES);
				}
			}
			console.log(NOTES);	
		}
	},

	test : function () {
		console.log("test");
	}
};
