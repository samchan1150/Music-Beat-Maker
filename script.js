// script.js

// Wait for the document to load
document.addEventListener('DOMContentLoaded', () => {

    // Create synths for different sounds
    const kickSynth = new Tone.MembraneSynth().toDestination();
    const snareSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();
    const hihatSynth = new Tone.MetalSynth({
      frequency: 400,
      envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();
    const clapSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
    }).toDestination();
  
    // State of the active sounds
    const soundState = {
      kick: false,
      snare: false,
      hihat: false,
      clap: false
    };
  
    // Sequencer steps
    const sequence = ['0', '1', '2', '3'];
  
    // Create a Tone.Part for each sound
    const kickPart = new Tone.Part((time) => {
      if (soundState.kick) kickSynth.triggerAttackRelease('C1', '8n', time);
    }, sequence).start(0);
  
    const snarePart = new Tone.Part((time) => {
      if (soundState.snare) snareSynth.triggerAttackRelease('8n', time);
    }, sequence).start(0);
  
    const hihatPart = new Tone.Part((time) => {
      if (soundState.hihat) hihatSynth.triggerAttackRelease('16n', time);
    }, sequence).start(0);
  
    const clapPart = new Tone.Part((time) => {
      if (soundState.clap) clapSynth.triggerAttackRelease('8n', time);
    }, sequence).start(0);
  
    // Loop the sequences
    kickPart.loop = true;
    snarePart.loop = true;
    hihatPart.loop = true;
    clapPart.loop = true;
    kickPart.loopEnd = '1m';
    snarePart.loopEnd = '1m';
    hihatPart.loopEnd = '1m';
    clapPart.loopEnd = '1m';
  
    // Set initial BPM
    Tone.Transport.bpm.value = 120;
  
    // Start the Transport
    Tone.Transport.start();
  
    // Function to toggle sound activation
    function toggleSound(sound) {
      soundState[sound] = !soundState[sound];
      document.getElementById(sound).classList.toggle('active');
    }
  
    // Add event listeners to buttons
    document.getElementById('kick').addEventListener('click', async () => {
      await Tone.start(); // Required for user interaction
      toggleSound('kick');
    });
    document.getElementById('snare').addEventListener('click', async () => {
      await Tone.start();
      toggleSound('snare');
    });
    document.getElementById('hihat').addEventListener('click', async () => {
      await Tone.start();
      toggleSound('hihat');
    });
    document.getElementById('clap').addEventListener('click', async () => {
      await Tone.start();
      toggleSound('clap');
    });
  
    // Handle tempo slider
    const tempoSlider = document.getElementById('tempo');
    const tempoValue = document.getElementById('tempo-value');
  
    tempoSlider.addEventListener('input', () => {
      const bpm = tempoSlider.value;
      Tone.Transport.bpm.value = bpm;
      tempoValue.innerText = `${bpm} BPM`;
    });
  
  });