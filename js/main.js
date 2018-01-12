var playState = { preload: preload, create: create, update: update, init:init};

function preload(){
	game.load.image('white-key', 'assets/img/white.png');
	game.load.image('left-key', 'assets/img/left-small.png');
	game.load.image('right-key', 'assets/img/right-small.png');
	game.load.image('middle-key', 'assets/img/middle-small.png');
	game.load.image('black-key', 'assets/img/black.png');
	game.load.image('mario-sheet-1', 'assets/img/mario2.PNG');
	game.load.audio('audio', 'assets/aud/audio.mp3' );
}

var keyData;
var keys;
var notes;
var line1;

var audio;

// var keyCode = {"a", "s", "d","f","g","h","j","k","l","1","2","3","4","5"};
//var keyCode = {a:65,s:83,d:68,f:70,g:71,h:72,j:74,k:75,l:76,č:0,"c":49,"v":50,"b":51,"n":52,"m":53};
var keyboardKeys = [' ',' ',' ',' ',' ','1','2','3','4','5','6','7','8','9','0','+', 'q','w','e','r','t','z','u',
					'i','o','p','a','s','d','f','g','h','j','k','l','c','v','b','n','m', ',','.','-'];
var pianoKeys = ['C','C#', 'D', 'D#','E','F', 'F#','G', 'G#', 'A', 'A#', 'H'];
var waitForKeys;
var keysToPress = [];
var sizeMidiMap = {};

var octavesCount = 4;
var minMaxOctave = {mario:[43, 84]};
var lowerOctaveFor = 2;

var positionArray = [0];
var points = 0;
var songName;
//TODO ko menjaš roke naj se predvajata obe, ampak igraš samo eno!!
var level;
var levelData = {
	0: {songName: 'mario', waitForKeys: true, bothHands: false, midiChannels: [-1, 2], playEveryNthTone: 2, startingTone: 1},//2- right, 3-left
	1: {songName: 'mario', waitForKeys: true, bothHands: false, midiChannels: [-1, 2], playEveryNthTone: 1, startingTone: 0},
	2: {songName: 'mario', waitForKeys: true, bothHands: false, midiChannels: [3, -1], playEveryNthTone: 1, startingTone: 0},
	3: {songName: 'mario', waitForKeys: true, bothHands: true, midiChannels: [3, 2], playEveryNthTone: 1, startingTone: 0},
	4: {songName: 'mario', waitForKeys: false, bothHands: false, midiChannels: [3, 2], playEveryNthTone: 1, startingTone: 0}
}

function init(l) {
	level = l;
    songName = levelData[level].songName;
    // waitForKeys = false
    waitForKeys = levelData[level].waitForKeys;

}

var noteAppearsTimeEvents;

function create(){

	//check if browser is google chrome
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    if (is_chrome) navigator.requestMIDIAccess().then( onsuccesscallback, onerrorcallback );

	game.stage.backgroundColor = '#124184';
	game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.isPaused = false;
    game.paused = false;
    game.time.events.resume();
    // waitForKeys = false;
	//game.stage.disableVisibilityChange = true;//ko greš iz okna se igra nadaljuje

    if (level<4){
        addMenuOption1('Naslednji nivo >', function (target) {
            game.paused = false;
            game.state.start('play', true, false, level+1);
        }, 300);
    }

    if (level>0) {
        addMenuOption1('< Prejšnji nivo ', function (target) {
            game.paused = false;
            game.state.start('play', true, false, level-1);
        }, 550);
    }

    pointsText = game.add.text(game.world.width-400, 750, 'Nivo št.: ' + (level +1), { font: '40pt menuFont', fill: '#fff' });

    var sheet = game.add.sprite(game.world.width-(game.cache.getImage('mario-sheet-1').width * 0.9), 100, 'mario-sheet-1');
    sheet.scale.set(0.85);
	// console.log(game.world.width,game.cache.getImage('mario-sheet-1').wi)

	position = 0;

	keys = game.add.group();
    keys.enableBody = true;
	
    var graphics=game.add.graphics(0,0);//if you have a static line
  	graphics.lineStyle(1, 0x000000, 1);

  	index = 0;
  	for (var j = 0; j<octavesCount;j++){
  		keysOrder = [0,1,2,1,3,0,1,2,1,2,1,3];//0-left, 1-black, 2-middle, 3-right
	    for (var i = 0; i<keysOrder.length;i++ ){
	    	keyType = keysOrder[i];
	    	keyName = (keyType==0 ? 'left-key' : 
	    				keyType==1 ? 'black-key' : 
	    				keyType==2 ? 'middle-key' : 'right-key');	
		 	keyData = game.cache.getImage(keyName);
		 	var whiteKeyHeight = keyData.height;
			var key = keys.create(position,game.world.height-whiteKeyHeight,keyName);

			textColor = keyType == 1 ? '#fff' : '#000';
			game.add.text(key.x + 5,key.y + 10, keyboardKeys[index], {fill: textColor}); //asdfg
			game.add.text(key.x + 5,key.y + 80, pianoKeys[i%12], {fill: textColor, font: "bold 16px Arial"});//cdefg
			game.add.text(key.x + 5,key.y + 120, 
				getOctaveNumber(minMaxOctave[songName][0]-(lowerOctaveFor*8))+ index, {font: "bold 16px Arial"});//24,25,26

			sizeMidiMap[(getOctaveNumber(minMaxOctave[songName][0]-(lowerOctaveFor*8))+ index)] = keyName;

			key.inputEnabled = true;
			//key.events.onInputDown.add( listener, key );
			key.name = "key" + i;


			graphics.moveTo(position-1,0);//moving position of graphic if you draw mulitple lines
	  		graphics.lineTo(position-1,game.world.height-whiteKeyHeight);

			position += keyData.width;
			positionArray.push(position);
			key.body.immovable = true;
	  		
	  		index++;
		}
	}
	graphics.moveTo(position-1,0);//moving position of graphic if you draw mulitple lines
  	graphics.lineTo(position-1,game.world.height-whiteKeyHeight/2);

	notes = game.add.group();
	notes.enableBody = true;


  	cursors = game.input.keyboard.createCursorKeys(); 
  	this.game.input.keyboard.onPressCallback = function(e) {
		var indexOf = keysToPress.indexOf(e);
  		if (waitForKeys && indexOf != -1)   {
            keysToPress.splice(indexOf, 1);
            if (keysToPress.length < 1){
                game.paused = false;
                game.physics.arcade.isPaused = false;
                game.time.events.resume();
			}
            // console.log(notesToKill);//
  			notesToKill[indexOf].kill();
            notesToKill.splice(indexOf, 1);
  			points++;
  		} else if(waitForKeys && indexOf == -1){
  			points--;
		}
        pointsText.text = 'Točke: ' + points;
  		// audio.play('Tone' + game.rnd.integerInRange(0,88));
  		//28 je MIDDLE C
  		keyNumber = keyboardKeys.indexOf(e);

  		audio.play('Tone' + (keyNumber + getOctaveNumber(minMaxOctave[songName][0]-(lowerOctaveFor*8))));

  	};

  	this.game.input.keyboard.onDownCallback = function(e){
  		//console.log(e);
  		keyToColor = keyboardKeys.indexOf(e.key);
  		keys.children[keyToColor].tint = 0xf10f2f;
  	};
  	
  	this.game.input.keyboard.onUpCallback = function(e){
  		keyToUncolor = keyboardKeys.indexOf(e.key);
  		keys.children[keyToUncolor].tint = 0xffffff;
  	};

  	// waitForKeys = false;
  	// toggleMode = game.add.text(game.world.width - 120, 20, 'Čakaj: NE', { font: '24px Arial', fill: '#fff' });
    // toggleMode.inputEnabled = true;
    // toggleMode.events.onInputUp.add(function () {
    // 	waitForKeys = !waitForKeys;
    // 	toggleMode.text = waitForKeys ? 'Čakaj: DA' : 'Čakaj: NE';
    // });

    pointsText = game.add.text(game.world.width-120, 50, 'Točke: 0', { font: '24px menuFont', fill: '#fff' });

    audio = game.add.audio('audio');
    audio.allowMultiple = true;

    fromMarker = 0;
    for (i = 0; i<88; i++) {
    	audio.addMarker('Tone' + i, fromMarker, 1.9);
    	fromMarker += 2;
    }

    // console.log(lowerOctaveFor);
    //read MIDI
    MidiConvert.load("assets/aud/"+songName+".mid", function(midi) {

    	// console.log(midi)
		var max = -1;
		var min = 89;//55-18 = 37 84-36=66
        // 0: {songName: 'mario', bothHands: false, midiChannels: [2], playEveryNthTone: 2},
		var midiChannels = levelData[level].midiChannels;
		var playEveryNthTone = levelData[level].playEveryNthTone;
		var startingTone = levelData[level].startingTone;
		for (var j = 0; j<midiChannels.length;j++){
			var channelIndex = midiChannels[j];
			if (channelIndex == -1) continue;
			midiNotes = midi.tracks[channelIndex].notes;
			tint = j== 0 ? 0xffff00 : 0xff00ff; //yellow : purple
			for (var i = startingTone; i<midiNotes.length;i=i+playEveryNthTone) {
			    // if(i==3) console.log(midiNotes[i]./time);
				if (midiNotes[i].midi > max) max = midiNotes[i].midi;
				if (midiNotes[i].midi < min) min = midiNotes[i].midi;
                game.time.events.add(800* (midiNotes[i].time), function(midiNote, tint){

					if (!waitForKeys){
                        audio.play('Tone' + (midiNote.midi-(lowerOctaveFor*8)));
					}

					positionNum = positionArray[midiNote.midi - getOctaveNumber(minMaxOctave[songName][0])] ;
                    var note = notes.create(positionNum, 0, sizeMidiMap[(midiNote.midi-(lowerOctaveFor*8))]);

					// note.immovable = true;
					note.scale.setTo(1, 0.2);
					game.physics.arcade.enable(note);
					note.body.velocity.y = 150;
					note.body.collideWorldBounds = false;
					
					note.tint = tint;
					note.name = "note" + (midiNote.midi-(lowerOctaveFor*8)-getOctaveNumber(minMaxOctave[songName][0]-(lowerOctaveFor*8)));
                     // console.log(lowerOctaveFor)
					note.events.onKilled.add(function(note){
						notes.remove(note)
					},this);

				}, this, midiNotes[i], tint);
                // console.log(noteAppearsTimeEvents);
			}
		
		}
		// console.log(min,max)
   	});

  	

}

function getOctaveNumber(min){
	while(min>0){
		if (min%8==0) return min;
		min--;
	}
	return 0;
}

var notesToKill = [];
var pianoKeysToPress = [];
function update (){

	//game.physics.arcade.collide(notes, keys);
	game.physics.arcade.collide(notes, keys, 
		function(note, keys){
			console.log(note.name);

			if (waitForKeys){
				keysToPress.push(keyboardKeys[note.name.substring(4)]);
                pianoKeysToPress.push(parseInt(note.name.substring(4)) + 24);
				// console.log(note)
				notesToKill.push(note);
				// note.scale.setTo(1,0.5);
				// keys.bringToTop();
                // game.time.events.add(100, function(){
                	game.physics.arcade.isPaused = true;
                    game.time.events.pause();
                // }, this);


			} else {
				note.kill();
			}
			
		}, null, this);

    pointsText.text = 'Točke: ' + points;



}

function addMenuOption1(text, callback, xPosition) {
    var optionStyle = { font: '25pt menuFont', fill: 'white', align: 'right', stroke: 'rgba(0,0,0,0)', strokeThickness: 4};
    var txt = game.add.text(game.world.width-xPosition, game.world.height-125, text, optionStyle);
    var onOver = function (target) {
        target.fill = "##E9E91A";
        target.stroke = "rgba(200,200,200,0.5)";
    };
    var onOut = function (target) {
        target.fill = "white";
        target.stroke = "rgba(0,0,0,0)";
    };
    txt.stroke = "rgba(0,0,0,0";
    txt.strokeThickness = 4;
    txt.inputEnabled = true;
    txt.events.onInputUp.add(callback);
    txt.events.onInputOver.add(onOver);
    txt.events.onInputOut.add(onOut);
}

function onsuccesscallback( access ) {
    access.inputs.values().next().value.onmidimessage = myMIDIMessagehandler; // inputs = MIDIInputMaps, you can retrieve the inputs with iterators
}

function onerrorcallback( err ) {
    console.log(err);
}

function myMIDIMessagehandler(event){
    var data = event.data,
        cmd = data[0] >> 4,
        channel = data[0] & 0xf,
        type = data[0], // ignore [inconsistent between devices]
        note = data[1],
        velocity = data[2];
    if (velocity) {
        keyToColor = note-24;
        keys.children[keyToColor].tint = 0xf10f2f;
        var indexOf = pianoKeysToPress.indexOf(note);
        if (waitForKeys && indexOf != -1)   {
            pianoKeysToPress.splice(indexOf, 1);
            if (pianoKeysToPress.length < 1){
                game.paused = false;
                game.physics.arcade.isPaused = false;
                game.time.events.resume();
			}

            notesToKill[indexOf].kill();
            notesToKill.splice(indexOf, 1);
            points++;
        } else if(waitForKeys &&  indexOf == -1){
            points--;
        }
        pointsText.text = 'Točke: ' + points;
        audio.play('Tone' + note);
    }
    else{
        keyToUncolor = note-24;
        keys.children[keyToUncolor].tint = 0xffffff;
    }
}
