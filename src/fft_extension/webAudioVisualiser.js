class WebAudioVisualizer {
    /**
     * 
     * @param {HTMLAudioElement} audioElement 
     */
    constructor(audioElement, fftSize = 256, canvas_width = 400, canvas_height = 400) {
        this.audioContext = new AudioContext();

        // Create the source node, track is the source
        this.track = this.audioContext.createMediaElementSource(audioElement);
        // Create a splitter that splits the audio into 2 channels
        this.splitter = this.audioContext.createChannelSplitter(2);
        // Create a merger which is used to connect the audio channels back together before we play it
        this.merger = this.audioContext.createChannelMerger(2);
        // Connect the audio source to the splitter so we split it
        this.track.connect(this.splitter);
        // Create a analyser for FFT computation
        this.analyzer = this.audioContext.createAnalyser();
        // Connect the analyzer to the first channel
        this.splitter.connect(this.analyzer, 0);
        // Set the fft sample count
        this.analyzer.fftSize = fftSize;
        // We have to merge the channels back before we can play the audio
        // The first argument is the channel we are connecting from and the other argument is the channel we are connecting to
        this.splitter.connect(this.merger, 0, 0);
        this.splitter.connect(this.merger, 1, 1);
        // After we merge the channels back together we send it to the user 
        this.merger.connect(this.audioContext.destination);

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
            frequency = i * sampleRate / N
            where 0 <= i <= N/2
            - Note: the other samples are above 20KHz so they are useless for visualisation check this article
            - https://dsp.stackexchange.com/questions/38131/if-humans-can-only-hear-up-to-20-khz-frequency-sound-why-is-music-audio-sampled/38141
            
            48000 Hz / 2048 = 23,4375Hz per sample

            16 Band Table
            0  - 1  = 23.4375Hz  => 0Hz         - 23,4375Hz
            1  - 1  = 23.4375Hz  => 23.4375Hz   - 46.875Hz
            2  - 2  = 46.875Hz   => 46.875Hz    - 93.75Hz
            3  - 2  = 46.875Hz   => 93.75Hz     - 140.625Hz
            4  - 4  = 93.75Hz    => 140.625Hz   - 234.375Hz
            5  - 4  = 93.75Hz    => 234.375Hz   - 328.125Hz
            6  - 8  = 187.5Hz    => 328.125Hz   - 515.625Hz
            7  - 16 = 375Hz      => 515.625Hz   - 890.625Hz
            8  - 16 = 375Hz      => 890.625Hz   - 1265.625Hz
            9  - 32 = 750Hz      => 1265.625Hz  - 2015.625Hz
            10 - 32 = 750Hz      => 2015.625Hz  - 2765.625Hz
            11 - 32 = 750Hz      => 2765.625Hz  - 3515.625Hz
            12 - 64 = 1500Hz     => 3515.625Hz  - 5015.625Hz
            13 - 64 = 1500Hz     => 5015.625Hz  - 6515.625Hz
            14 - 128 = 3000Hz    => 6515.625Hz  - 9515.625Hz
            15 - 512 = 12000Hz   => 9515.625Hz  - 22031.25Hz
            918 samples used so we add the rest to the last band
        */

        let count = 0;
        let sampleCount = 1;
        for (let i = 0; i < this.band_count; i++) {

            let average = 0;

            // Calculate sampleCount should be the same as the 16 band table above
            if (i % 2 == 0 && i != 0 && (i < 7 || i > 11) && i != 15) {
                sampleCount *= 2;
            }
            else if (i == 7 || i == 9) {
                sampleCount *= 2;
            } else if (i == 15) {
                sampleCount *= 4;
                sampleCount += 106;
            }
            //console.log(`${i}: ${sampleCount}`);

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