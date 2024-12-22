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
      }).toDestination() },
      // Additional instruments
      { name: 'cowbell', synth: new Tone.MetalSynth({
        frequency: 800,
        envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination() },
      { name: 'ride', synth: new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
        harmonicity: 5,
        modulationIndex: 32,
        resonance: 3000,
        octaves: 1.5
      }).toDestination() },
      { name: 'synth', synth: new Tone.PolySynth().toDestination() },
      { name: 'shaker', synth: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0 }
      }).toDestination() },
    ];
  
    let steps = 16; // Default number of steps
    const maxSteps = 32;
    const tempoSlider = document.getElementById('tempo');
    const tempoValue = document.getElementById('tempo-value');
    const stepsInput = document.getElementById('steps');
    const updateStepsBtn = document.getElementById('update-steps');
    const gridElement = document.getElementById('grid');
    const playButton = document.getElementById('play-button');
    const stopButton = document.getElementById('stop-button');
  
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
      // Need to update the Sequence and re-initialize the grid
      loop.dispose();
      createSequence();
      initSequencer();
    });
  
    // Sequencer playback
    let loop;
  
    function createSequence() {
      loop = new Tone.Sequence((time, stepIndex) => {

        // Highlight current column
        highlightColumn(stepIndex);

        instruments.forEach((instrument, instrumentIndex) => {
          if (sequencerState[instrumentIndex][stepIndex]) {
            switch (instrument.name) {
              case 'bass':
                instrument.synth.triggerAttackRelease('C2', '8n', time);
                break;
              case 'tom':
                instrument.synth.triggerAttackRelease('G2', '8n', time);
                break;
              case 'synth':
                instrument.synth.triggerAttackRelease(['C4', 'E4', 'G4'], '8n', time);
                break;
              default:
                instrument.synth.triggerAttackRelease('8n', time);
            }
          }
        });
      }, [...Array(steps).keys()], '16n');
    }

    // Function to highlight the current column
    function highlightColumn(stepIndex) {
        // Remove highlight from all steps
        const allSteps = document.querySelectorAll('.step');
        allSteps.forEach(step => {
        step.classList.remove('current-step');
        });

        // Add highlight to the current column
        instruments.forEach((instrument, instrumentIndex) => {
        const step = document.querySelector(`.step[data-instrument-index="${instrumentIndex}"][data-step-index="${stepIndex}"]`);
        if (step) {
            step.classList.add('current-step');
        }
        });
    }
  
    createSequence();
  
    // Handle tempo changes
    tempoSlider.addEventListener('input', () => {
      const bpm = tempoSlider.value;
      Tone.Transport.bpm.value = bpm;
      tempoValue.innerText = `${bpm} BPM`;
    });
  
    // Start and stop transport with buttons
    playButton.addEventListener('click', async () => {
      await Tone.start();
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
      if (loop.state !== 'started') {
        loop.start(0);
      }
    });
  
    stopButton.addEventListener('click', () => {
        if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
        }
        if (loop && loop.state === 'started') {
        loop.stop();
        }
        // Remove highlights when stopped
        const allSteps = document.querySelectorAll('.step');
        allSteps.forEach(step => {
            step.classList.remove('current-step');
        });
    });
  
    // Initialize the sequencer
    initSequencer();
  
    // Set initial BPM
    Tone.Transport.bpm.value = 120;
  });
  