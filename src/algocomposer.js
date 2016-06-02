var NOTE_ON = 144;
var NOTE_OFF = 128;
var OUT;

var BASENOTE = 40;
var CHORDS = [
	[0,7,12,24],
	[3,15,3,27],
	[0,5,12,17,5],
	[5,5,17,19]
];

var MAX_NOTES = 4;
var NOTES = [];


var SCALER = 8;
var PROB_PLAY = 0.4;

var midiSend = function(type, ch, val0, val1) {
	OUT.sendMessage ([type+ch, val0, val1]);
};

var getRandomNote = function(chord) {
	var n = CHORDS[chord].length;
	var r = Math.floor(Math.random()*(n-0.0001));
	return 62+CHORDS[chord][r];
}

var play0 = function (ch) {

	
	// decrease note duration
	for (var i=0; i<NOTES.length; i++) {
		NOTES[i].duration -= 1;
		if (NOTES[i].duration<=0) {
			// stop
			OUT.sendMessage([NOTE_OFF+ch, NOTES[i].pitch, 0]);
		}
			
	}

	var C = Math.round(frameCnt/80) % 4;
	for (var i=0; i<MAX_NOTES; i++) {
		// start new with prob
		if (Math.random() < PROB_PLAY && NOTES[i].duration<=0) {

			var pitch = getRandomNote(C);
			NOTES[i].duration = Math.pow(2,Math.round(Math.random()*2));
			NOTES[i].pitch = pitch;
			OUT.sendMessage([NOTE_ON+ch, pitch, 120]);
				//	console.log(NOTES);
		}
	}
}


var cnt = 0;
var clockDivide = function (ch, pitch, vel, PRE) {
	
	var C = Math.pow(2, Math.round(PRE));
	if ((cnt%C)==0) { //(Math.pow(2,Math.round(PRE))==0)) {
		OUT.sendMessage([NOTE_OFF+ch, pitch, vel]);		
		OUT.sendMessage([NOTE_ON+ch, pitch, vel]);		
	}
}


module.exports = {

	init : function (midiOut) {
		OUT = midiOut;	
		for (var i=0; i<MAX_NOTES; i++) {
			NOTES[i] = {pitch:0, duration:0};
		}
	},

	play : function (frameCnt, ch) {

		if ((frameCnt%SCALER) != 0) return;

		pre0 = Math.sin(frameCnt*0.01)+1;
		oct = Math.round(Math.random())*12;
		clockDivide (ch, 84+oct, 70, pre0);
		
		pre1 = (frameCnt%1000)/333+1;
		clockDivide (ch, 60, 100, pre1);
		cnt = cnt+1;
	},

	test : function () {
		console.log("test");
	}
};
