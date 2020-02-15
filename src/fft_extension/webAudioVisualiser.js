class WebAudioVisualizer {
    /**
     * 
     * @param {HTMLAudioElement} audioElement 
     */
    constructor(audioElement, fftSize = 256, canvas_width = 400, canvas_height = 400) {
        this.audioContext = new AudioContext();

        // Create the source node
        this.track = this.audioContext.createMediaElementSource(audioElement);
        // Connect the source node to the song destination so we can use it for sound manipulation
        this.track.connect(this.audioContext.destination);
        // Create a visualizer
        this.analyzer = this.audioContext.createAnalyser();
        this.track.connect(this.analyzer);
        // Set the fft sample count
        this.analyzer.fftSize = fftSize;

        // check if context is in suspended state (autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        createCanvas(canvas_width, canvas_height);
    }

    draw(background = 'white', fillColour = 'black') {
        // clear the canvas
        clear(background);

        // Ready the container for the frequency bin
        let dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);

        // Draw code goes here...
        const w = 5;
        for (let i = 0; i < dataArray.length; i++) {
            let h = dataArray[i];
            drawFillRect(i * w, HEIGHT, w, -h, fillColour);
        }
    }
}