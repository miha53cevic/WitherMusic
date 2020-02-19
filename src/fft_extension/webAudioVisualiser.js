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

        this.band_count = 16;
        this.freq_band = new Array(this.band_count);
        this.band_buffer = new Array(this.band_count).fill(0);
        this.buffer_decrease = new Array(this.band_count).fill(this.band_count);
    }

    draw(background = 'white', fillColour = 'black') {
        // clear the canvas
        clear(background);

        // Ready the container for the frequency bin
        let dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);

        /*  We have N / 2 usable samples
            frequency = i / sampleRate / N/2
            48000 Hz / 1024 = 46,875Hz per sample

            8 Band Table
            0 - 2 = 93.75Hz in range 0 - 93.75Hz
            1 - 4 = 187,5Hz in range 93.75 - 281.75Hz 
            2 - 8 repeat the same
            3 - 16 ...
            4 - 32 ...
            5 - 64 ...
            6 - 128 ...
            7 - 256 ...
            8 - 512 ...
            1022 samples used so we add the last 2 for the last band

            16 Band Table
            0  - 1 = 46.875Hz in range 0 - 46.875Hz
            1  - 1 = 46.875Hz in range 46.875 - 93.75Hz
            2  - 2 = 93.75Hz in range 93.75 - 187,5Hz
            3  - 2 = 187,5Hz in range 187,5 - 281.75Hz
            4  - 4 = 187.5Hz in range 281.75 - 469.25Hz
            5  - 4 = 187.5Hz in range 469.25 - 656.75Hz
            6  - 8 = 375Hz in range 656.75 - 1031.75Hz
            7  - 16 = 750Hz in range 1031.75 - 1781.75Hz
            8  - 16 = 750Hz in range 1781.75 - 2156Hz
            9  - 32 = 1500Hz in range 2156 - 3656Hz
            10 - 32 = 1500Hz in range 3656 - 5156Hz
            11 - 32 = 1500Hz in range 5156 - 6656Hz
            12 - 64 = 3000Hz in range 6656 - 9656Hz
            13 - 64 = 3000Hz in range 9656 - 12656Hz
            14 - 128 = 6000Hz in range 12656 - 18656Hz
            15 - 128 = 6000Hz in range 18656 - 24656Hz
            534 samples used so we add the rest to the last band
            - Note: the other samples are above 20KHz so they are useless for visualisation check this article
            - https://dsp.stackexchange.com/questions/38131/if-humans-can-only-hear-up-to-20-khz-frequency-sound-why-is-music-audio-sampled/38141
        */

        let count = 0;
        let sampleCount = 1;
        for (let i = 0; i < this.band_count; i++) {

            let average = 0;

            // Calculate sampleCount should be the same as the 16 band table above
            if (i % 2 == 0 && i != 0 && (i < 7 || i > 11)) {
                sampleCount *= 2;
            }
            else if (i == 7 || i == 9) {
                sampleCount *= 2;
            } 

            // Get average from samples for a band
            for (let j = 0; j < sampleCount; j++) {
                average += dataArray[count];
                count++;
            }
            average /= sampleCount;

            // Save the result
            this.freq_band[i] = average;
        }

        // Smooth out the peaks with a buffer
        for (let i = 0; i < this.band_count; i++) {

            if (this.freq_band[i] < this.band_buffer[i]) {
                this.band_buffer[i] -= this.buffer_decrease[i];
                this.buffer_decrease[i] *= 1.2;
            } else if (this.freq_band[i] > this.band_buffer[i]) {
                this.band_buffer[i] = this.freq_band[i];
                this.buffer_decrease[i] = 0.25;
            }
        }

        // Draw code goes here...
        const w = 20;
        const spacer = (WIDTH - (w * this.band_count)) / this.band_count; // space between the bars
        for (let i = 0; i < dataArray.length; i++) {
            let h = this.band_buffer[i];
            drawFillRect(i * (w + spacer), HEIGHT, w, -h, fillColour);
        }
    }
}