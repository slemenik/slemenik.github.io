var game = new Phaser.Game(1300, 800, Phaser.AUTO, 'canvas', 
	{ preload: preload, create: create, update: update });

function preload(){
	game.load.image('white-key', 'assets/img/white.png');
	game.load.image('left-key', 'assets/img/left-small.png');
	game.load.image('right-key', 'assets/img/right-small.png');
	game.load.image('middle-key', 'assets/img/middle-small.png');
	game.load.image('black-key', 'assets/img/black.png');
	game.load.audio('audio', 'assets/aud/audio.mp3' );

//  this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	//this.scale.pageAlignHorizontally = true;
	//this.scale.pageAlignVertically = true;
	//this.scale.setScreenSize( true );
}


var keyData;
var keys;
var notes;
var line1;

var audio;

// var keyCode = {"a", "s", "d","f","g","h","j","k","l","1","2","3","4","5"};
//var keyCode = {a:65,s:83,d:68,f:70,g:71,h:72,j:74,k:75,l:76,č:0,"c":49,"v":50,"b":51,"n":52,"m":53};
var keyboardKeys = [' ',' ',' ',' ',' ','1','2','3','4','5','6','7','8','9','0',"'",'+', 'q','w','e','r','t','z','u','i','o','p','a','s','d','f','g','h','j','k','l','c','v','b','n','m']; 
var pianoKeys = ['C','C#', 'D', 'D#','E','F', 'F#','G', 'G#', 'A', 'A#', 'H'];
var waitForKeys;
var keyToPress;
var sizeMidiMap = {};

var octavesCount = 4;
var minMaxOctave = {mario:[43, 84]};
var lowerOctaveFor = 2;
var TEMPSONG = 'mario';
var song = TEMPSONG;

var positionArray = [0];

var points = 0;
function create(){
	game.stage.backgroundColor = '#124184';
	game.physics.startSystem(Phaser.Physics.ARCADE);
	//game.stage.disableVisibilityChange = true;//ko greš iz okna se igra nadaljuje
	
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
		 	keyHeight = keyData.height;
			var key = keys.create(position,game.world.height-keyHeight,keyName);

			textColor = keyType == 1 ? '#fff' : '#000';
			game.add.text(key.x + 5,key.y + 10, keyboardKeys[index], {fill: textColor});
			game.add.text(key.x + 5,key.y + 80, pianoKeys[i%12], {fill: textColor, font: "bold 16px Arial"});
			game.add.text(key.x + 5,key.y + 120, 
				getOctaveNumber(minMaxOctave[song][0]-(lowerOctaveFor*8))+ index, {font: "bold 16px Arial"});
			sizeMidiMap[(getOctaveNumber(minMaxOctave[song][0]-(lowerOctaveFor*8))+ index)] = keyName;

			key.inputEnabled = true;
			//key.events.onInputDown.add( listener, key );
			key.name = "key" + i;
			//key.scale.setTo(0.5);

			graphics.moveTo(position,0);//moving position of graphic if you draw mulitple lines
	  		graphics.lineTo(position,game.world.height-keyHeight);

			position += keyData.width;
			positionArray.push(position);
			key.body.immovable = true;
	  		
	  		index++;
		}
	}
	graphics.moveTo(position,0);//moving position of graphic if you draw mulitple lines
  	graphics.lineTo(position,game.world.height-keyHeight/2);

	notes = game.add.group();
	notes.enableBody = true;

	
	//for(var i = 0; i < 15;);

	//var line = new Phaser.Line(0, 0, 100, 100);
  	//var graphics=game.add.graphics(0,0);
  	cursors = game.input.keyboard.createCursorKeys(); 
  	this.game.input.keyboard.onPressCallback = function(e) {
  		//console.log(e);

  		if (waitForKeys && e==keyToPress)   {
  			game.paused = false;
  			noteToKill.kill();
  			points++;
  		}
  		
  		//audio.play('Tone' + game.rnd.integerInRange(0,88));
  		//28 je MIDDLE C
  		keyNumber = keyboardKeys.indexOf(e);

  		console.log(getOctaveNumber(minMaxOctave[song][0]-(lowerOctaveFor*8)) + keyNumber);
  		audio.play('Tone' + (keyNumber + getOctaveNumber(minMaxOctave[song][0]-(lowerOctaveFor*8))));

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

  	waitForKeys = false;
  	toggleMode = game.add.text(game.world.width - 120, 20, 'Čakaj: NE', { font: '24px Arial', fill: '#fff' });
    toggleMode.inputEnabled = true;
    toggleMode.events.onInputUp.add(function () {
    	waitForKeys = !waitForKeys;
    	toggleMode.text = waitForKeys ? 'Čakaj: DA' : 'Čakaj: NE';
    });

    pointsText = game.add.text(game.world.width-120, 50, 'Točke: 0', { font: '24px Arial', fill: '#fff' });

    audio = game.add.audio('audio');
    audio.allowMultiple = true;

    fromMarker = 0;
    for (i = 0; i<88; i++) {
    	audio.addMarker('Tone' + i, fromMarker, 1.9);
    	fromMarker += 2;
    } 


    //read MIDIq
    MidiConvert.load("assets/aud/mario.mid", function(midi) {
  		

		
    	console.log(midi)
		//midi = [1,2,3,4,5,6,7];
		//audio.onStop.add(playNext, this, 0, midi.tracks[6].notes);

		// for (var i = 0; i<midi.tracks.length;i++) {
		// 	console.log(midi.tracks[i].name, midi.tracks[i].notes.length);
		// 	track = midi.tracks[i];
		// 	if (i == 2) {
		// 		game.time.events.repeat(1000 * 0.3, 1000, playNext, this, track.notes);
		// 	}

		// }

			max = -1;
			min = 89;//55-18 = 37 84-36=66
		for (var j = 2; j<=3;j++){
			midiNotes = midi.tracks[j].notes;
			tint = j== 2 ? 0xff00ff : 0xffff00;
			for (var i = 0; i<midiNotes.length;i++) {
			
				if (midiNotes[i].midi > max) max = midiNotes[i].midi;
				if (midiNotes[i].midi < min) min = midiNotes[i].midi;
				game.time.events.add(700* (midiNotes[i].time), function(midiNote, tint){
					
					audio.play('Tone' + (midiNote.midi-(lowerOctaveFor*8)));

					positionNum = positionArray[midiNote.midi - getOctaveNumber(minMaxOctave[song][0])] ;
					console.log('Tone' + (midiNote.midi-(lowerOctaveFor*8)));
					var note = notes.create(positionNum, 580, sizeMidiMap[
						(midiNote.midi-(lowerOctaveFor*8))]);
					note.scale.setTo(1, 0.1);
					game.physics.arcade.enable(note);
					note.body.velocity.y = -70;
					note.body.collideWorldBounds = false;
					
					note.tint = tint;
					note.name = "note" + positionNum;
					note.events.onKilled.add(function(note){notes.remove(note)},this);
					
					


					//console.log(midiNote);
					//if (audio._sound) audio._sound.playbackRate.value = 3;
				}, this, midiNotes[i], tint);
			}
		
		}
		console.log(min, max);
		
   	});

  	

}

function getOctaveNumber(min){
	while(min>0){
		if (min%8==0) return min;
		min--;
	}
	return 0;
}

var appearanceTime = 0;
var noteToKill;
function update (){
	
	//game.physics.arcade.collide(notes, keys);
	game.physics.arcade.collide(notes, keys, 
		function(note, keys){ 
			if (waitForKeys){
				game.paused = true;
				keyToPress = keyboardKeys[note.name.substring(4)];
				noteToKill = note;
				//console.log(keyCode[keyToPress]);

			} else {
				//note.kill(); 
			}
			
		}, null, this);
	if (game.time.now > appearanceTime) {
            
            

    }

    pointsText.text = 'Točke: ' + points;



}


