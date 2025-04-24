// Lyrics array with timing, duration, text, and animation styles
const lyrics = [
  { time: 17.46, duration: 4, text: "Smoking cigarettes on the roof", animation: "fadeIn" },
  { time: 24.20, duration: 4, text: "You look so pretty and I love this view", animation: "fadeIn" },
  
  { time: 31.37, duration: 3, text: "We fell in love in October", animation: "slideUp" },
  { time: 36.67, duration: 3, text: "That's why I love fall", animation: "fadeIn" },
  { time: 40.81, duration: 3, text: "Looking at the stars", animation: "zoomIn" },
  { time: 44.14, duration: 3, text: "Admiring from afar", animation: "fadeIn" },

  { time: 47.71, duration: 3, text: "My girl, my girl, my girl", animation: "fadeIn" },
  { time: 51.92, duration: 3, text: "You will be my girl", animation: "slideUp" },
  { time: 55.00, duration: 3, text: "My girl, my girl, my girl", animation: "fadeIn" },
  { time: 59.12, duration: 3, text: "You will be my world", animation: "zoomIn" },
  { time: 62.47, duration: 3, text: "My world, my world, my world", animation: "fadeIn" },
  { time: 66.35, duration: 3, text: "You will be my girl", animation: "slideUp" },

  { time: 76.61, duration: 4, text: "Smoking cigarettes on the roof", animation: "fadeIn" },
  { time: 82.95, duration: 4, text: "You look so pretty and I love this view", animation: "fadeIn" },
  { time: 90.12, duration: 3, text: "Don't bother looking down", animation: "slideUp" },
  { time: 94.25, duration: 3, text: "We're not going that way", animation: "fadeIn" },
  { time: 98.10, duration: 4, text: "At least I know I am here to stay", animation: "zoomIn" },

  { time: 105.22, duration: 3, text: "We fell in love in October", animation: "slideUp" },
  { time: 110.41, duration: 3, text: "That's why I love fall", animation: "fadeIn" },
  { time: 114.43, duration: 3, text: "Looking at the stars", animation: "zoomIn" },
  { time: 117.90, duration: 3, text: "Admiring from afar", animation: "fadeIn" },

  { time: 135.15, duration: 3, text: "My girl, my girl, my girl", animation: "fadeIn" },
  { time: 140.34, duration: 3, text: "You will be my girl", animation: "slideUp" },
  { time: 143.74, duration: 3, text: "My girl, my girl, my girl", animation: "fadeIn" },
  { time: 148.23, duration: 3, text: "You will be my girl", animation: "fadeIn" },
  { time: 151.15, duration: 3, text: "My girl, my girl, my girl", animation: "zoomIn" },
  { time: 155.53, duration: 3, text: "You will be my girl", animation: "fadeIn" },
  { time: 158.70, duration: 3, text: "My girl, my girl, my girl", animation: "slideUp" },
  { time: 162.58, duration: 3, text: "You will be my world", animation: "zoomIn" },
  { time: 166.09, duration: 3, text: "My world, my world, my world", animation: "fadeIn" },
  { time: 170.30, duration: 3, text: "You will be my girl", animation: "slideUp" }
];

// DOM elements
const song = document.getElementById('song');
const introMessage = document.querySelector('.intro-message');
const lyricsContainer = document.querySelector('.lyrics-container');
const barVisualizerContainer = document.getElementById('bar-visualizer');

// Flag to track if the song is playing
let isPlaying = false;
let hasStarted = false; // Track if experience has started at least once
let animationFrameId;
let lyricTimeoutId; // To clear lyric fade-out timeouts on pause

// Audio context and analyzer setup for visualizer
let audioContext, analyzer, dataArray, bufferLength, source;

// Create falling leaves
function createFallingLeaves() {
    const numLeaves = 15;
    for (let i = 0; i < numLeaves; i++) {
        const leaf = document.createElement('div');
        leaf.classList.add('falling-leaf');
        
        // Randomize properties
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.animationDuration = `${Math.random() * 10 + 10}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s`;
        leaf.style.opacity = `${Math.random() * 0.5 + 0.3}`;
        leaf.style.backgroundColor = getRandomAutumnColor();
        
        document.body.appendChild(leaf);
    }
}

// Get random autumn color
function getRandomAutumnColor() {
    const colors = [
        '#B83227', // Autumn Red
        '#D95E44', // Muted Rust
        '#F3C5B1', // Warm Peach
        '#A77D91', // Dusty Mauve
        '#7D9D82', // Muted Sage (as accent)
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Create falling leaves on load
createFallingLeaves();

// Set up click/touch event
document.body.addEventListener('click', togglePlayPause);
// document.body.addEventListener('touchstart', togglePlayPause);
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scrolling
        togglePlayPause();
    }
});

// Function to toggle play/pause
function togglePlayPause() {
    if (!hasStarted) {
        // First time playing
        setupAudio(); // Setup audio context
        audioContext.resume(); // Resume context if suspended
        song.play();
        isPlaying = true;
        hasStarted = true;
        
        // Hide intro message
        introMessage.style.opacity = '0';
        setTimeout(() => {
            introMessage.style.display = 'none';
        }, 800);
        
        // Start visualization and lyrics
        createVisualizerBars();
        drawVisualizer();
        processLyrics();
        
        document.body.style.cursor = 'none';
    } else if (isPlaying) {
        // Pause
        song.pause();
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        document.body.style.cursor = 'pointer';
    } else {
        // Resume
        audioContext.resume();
        song.play();
        isPlaying = true;
        drawVisualizer();
        processLyrics();
        document.body.style.cursor = 'none';
    }
}

// Set up audio analyzer
function setupAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(song);
    analyzer = audioContext.createAnalyser();
    
    analyzer.fftSize = 256;
    bufferLength = analyzer.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
}

// Create the visualizer bars
function createVisualizerBars() {
    barVisualizerContainer.innerHTML = ''; 
    const numBars = window.innerWidth < 768 ? 20 : 64; // Adjust number of bars based on screen size 
    
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('visualizer-bar');
        bar.style.height = '0px'; // Start with zero height
        barVisualizerContainer.appendChild(bar);
    }
}

// Draw the audio visualizer
function drawVisualizer() {
    if (!isPlaying) return;
    
    animationFrameId = requestAnimationFrame(drawVisualizer);
    
    // Get frequency data
    analyzer.getByteFrequencyData(dataArray);
    
    // Update bar heights
    const bars = barVisualizerContainer.children;
    const barCount = bars.length;
    
    for (let i = 0; i < barCount; i++) {
        // Map the frequency data to the available bars
        const dataIndex = Math.floor(i / barCount * bufferLength);
        const value = dataArray[dataIndex];
        const percent = value / 255;
        const height = Math.max(3, percent * 80); // Max height of 80px
        
        bars[i].style.height = `${height}px`;
        
        // Add some color variation based on intensity
        const hue = 15 + (i / barCount * 30); // Shift through autumn hues
        bars[i].style.background = `linear-gradient(to top, 
            hsla(${hue}, 70%, 60%, ${0.3 + percent * 0.6}), 
            hsla(${hue + 10}, 80%, 70%, ${0.5 + percent * 0.5}))`;
    }
}

// Function to display lyrics at the right time - completely rewritten
function processLyrics() {
    if (!isPlaying) return;
    
    let lyricsInterval;
    let lastDisplayedLyricIndex = -1; // Keep track of last displayed lyric
    
    const checkLyrics = () => {
        if (!isPlaying) {
            clearInterval(lyricsInterval);
            return;
        }
        
        const currentTime = song.currentTime;
        
        // Check each lyric to see if it should be displayed
        for (let i = 0; i < lyrics.length; i++) {
            const lyric = lyrics[i];
            
            // Check if current time is within the start time window AND if this lyric hasn't been displayed yet
            // OR if we somehow skipped a lyric (might happen with fast-forwarding)
            if ((currentTime >= lyric.time && currentTime < lyric.time + 0.3) && 
                (i > lastDisplayedLyricIndex || i - lastDisplayedLyricIndex > 1)) {
                
                displayLyric(lyric);
                lastDisplayedLyricIndex = i;
                break; // Only display one lyric at a time
            }
        }
        
        // Check if song ended
        if (song.ended) {
            clearInterval(lyricsInterval);
            resetExperience();
        }
    };
    
    // Check lyrics more frequently (50ms) to reduce chances of missing any
    lyricsInterval = setInterval(checkLyrics, 50);
}

// Function to display a lyric - improved
function displayLyric(lyric) {
    // Clear previous lyrics and timeout
    if (lyricTimeoutId) clearTimeout(lyricTimeoutId);
    lyricsContainer.innerHTML = '';
    
    // Create a new element for the lyric
    const lyricEl = document.createElement('div');
    lyricEl.className = 'lyric';
    lyricEl.textContent = lyric.text;
    
    // Add to container
    lyricsContainer.appendChild(lyricEl);
    
    // Force reflow to ensure transitions work
    void lyricEl.offsetWidth;
    
    // Show the lyric
    lyricEl.style.opacity = '1';
    
    // Set timeout to fade out - use the lyric's duration
    lyricTimeoutId = setTimeout(() => {
        if (lyricEl && lyricEl.style) {
            lyricEl.style.opacity = '0';
        }
    }, Math.max(1000, (lyric.duration * 1000) - 800)); // At least 1 second, but normally fade 800ms before end of duration
}

// Reset when song ends
function resetExperience() {
    isPlaying = false;
    hasStarted = false;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(lyricTimeoutId);
    
    // Clear any lingering intervals
    const highestId = window.setTimeout(() => {}, 0);
    for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
    }
    
    // Clear the lyrics
    lyricsContainer.innerHTML = '';
    
    // Reset visualizer
    const bars = barVisualizerContainer.children;
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.height = '0px';
    }
    
    // Show intro message again
    introMessage.style.display = 'block';
    setTimeout(() => {
        introMessage.style.opacity = '0.8';
    }, 100);
    
    document.body.style.cursor = 'pointer';
}

// Handle song ending naturally
song.addEventListener('ended', resetExperience);

// Handle window resize
window.addEventListener('resize', () => {
    if (hasStarted) {
        createVisualizerBars(); // Recreate bars on resize
    }
});
