// script.js

document.addEventListener('DOMContentLoaded', () => {

    // Define the instruments and their synths
    const instruments = [
      { name: 'kick', synth: new Tone.MembraneSynth().toDestination() },
      { name: 'snare', synth: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
      }).toDestination() },
      { name: 'hihat', synth: new Tone.MetalSynth({
        frequency: 400,
        envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination() },
      { name: 'clap', synth: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
      }).toDestination() },
      { name: 'bass', synth: new Tone.MonoSynth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 0.2 },
        filterEnvelope: { attack: 0.001, decay: 0.7, sustain: 0.1, release: 0.8, baseFrequency: 200, octaves: 2.6 }
      }).toDestination() },
      { name: 'tom', synth: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 1 }
      }).toDestination() }
      // Add more instruments here
    ];
  
    let steps = 16; // Default number of steps
    const maxSteps = 32;
    const tempoSlider = document.getElementById('tempo');
    const tempoValue = document.getElementById('tempo-value');
    const stepsInput = document.getElementById('steps');
    const updateStepsBtn = document.getElementById('update-steps');
    const gridElement = document.getElementById('grid');
  
    // Create a 2D array to hold the sequencer state
    let sequencerState = [];
  
    // Initialize sequencer state
    function initSequencer() {
      sequencerState = instruments.map(() => Array(steps).fill(false));
      createGrid();
    }
  
    // Create the grid in the DOM
    function createGrid() {
      gridElement.innerHTML = '';
      gridElement.style.gridTemplateColumns = `repeat(${steps}, 30px)`;
      instruments.forEach((instrument, instrumentIndex) => {
        for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
          const step = document.createElement('div');
          step.classList.add('step');
          step.dataset.instrumentIndex = instrumentIndex;
          step.dataset.stepIndex = stepIndex;
          step.addEventListener('click', () => {
            toggleStep(instrumentIndex, stepIndex, step);
          });
          gridElement.appendChild(step);
        }
      });
    }
  
    // Toggle a step on or off
    function toggleStep(instrumentIndex, stepIndex, stepElement) {
      sequencerState[instrumentIndex][stepIndex] = !sequencerState[instrumentIndex][stepIndex];
      stepElement.classList.toggle('active');
    }
  
    // Update steps based on user input
    updateStepsBtn.addEventListener('click', () => {
      const newSteps = Math.min(Math.max(parseInt(stepsInput.value), 4), maxSteps);
      steps = newSteps;
      stepsInput.value = steps;
      initSequencer();
    });
  
    // Sequencer playback
    const loop = new Tone.Sequence((time, stepIndex) => {
      instruments.forEach((instrument, instrumentIndex) => {
        if (sequencerState[instrumentIndex][stepIndex]) {
          if (instrument.name === 'bass') {
            instrument.synth.triggerAttackRelease('C2', '8n', time);
          } else if (instrument.name === 'tom') {
            instrument.synth.triggerAttackRelease('G2', '8n', time);
          } else {
            instrument.synth.triggerAttackRelease('8n', time);
          }
        }
      });
    }, [...Array(steps).keys()], '16n').start(0);
  
    // Handle tempo changes
    tempoSlider.addEventListener('input', () => {
      const bpm = tempoSlider.value;
      Tone.Transport.bpm.value = bpm;
      tempoValue.innerText = `${bpm} BPM`;
    });
  
    // Start Tone.Transport on user interaction
    async function startTransport() {
      await Tone.start();
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
    }
  
    // Start transport when clicking on the page
    document.body.addEventListener('mousedown', startTransport, { once: true });
  
    // Initialize the sequencer
    initSequencer();
  
    // Set initial BPM
    Tone.Transport.bpm.value = 120;
  
  });