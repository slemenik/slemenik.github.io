
//console.log(midi.tracks[6].notes)
var synth = new Tone.Synth  ().toMaster()

//play a middle 'C' for the duration of an 8th note


audio.play('Tone1');
	

//synth.triggerAttackRelease('C4', '8n')


MidiConvert.load("assets/aud/narcotic.mid", function(midi) {
  console.log(midi.tracks)

  var arr2 = midi.tracks;
  for (var j = 0; j<arr2[2].length;j++) {
  	var arr = midi.tracks[j].notes;
  	for (var i = 0; i < arr.length; i++) {
  		synth.triggerAttackRelease(arr[i].midi, arr[i].duration, arr[i].time, arr[i].velocity);
  	}
  }
  

  
  

/*


-note
The note to trigger.
type: Frequency

-duration
How long the note should be held for before triggering the release. This value must be greater than 0.
type: Time

-time
When the note should be triggered.
type: Time
default: now

-velocity
The velocity the note should be triggered at.
type: NormalRange
default: 1


*/
	 

})