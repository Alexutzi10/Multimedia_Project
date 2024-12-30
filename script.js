import { VideoEffects } from './effects.js';

// Creating an array of videos in order to access them when needed
const videos = ['media/Carina-nebula-3-dimensions-hd.mp4', 
    'media/Gas-cloud-fly-through.mp4',
    'media/Planets-space-jupiter-animatio.mp4', 
    'media/Sketches-space-planetary-nebul.mp4'
];

// Getting the video element and the buttons
const video = document.getElementById('video');
const canvas = document.getElementById('effectCanvas');
const deleteBttn = document.getElementById('delete');
const play = document.getElementById('play');
const next = document.getElementById('next');
const previous = document.getElementById('previous');
const ulVideos = document.getElementById('ul-videos');
const effectButtons = document.querySelectorAll('.effect-grid button');
const sortBttn = document.getElementById('sort');
const progressBar = document.getElementById('progressBar');
const previewCanvas = document.getElementById('previewCanvas');
const previewContext = previewCanvas.getContext('2d');
const dragDropArea = document.getElementById('drag-drop-area');
const fileInput = document.getElementById('file-input');
const scriptContainer = document.getElementById('script-container');
let videoIndex = 0;

const videoEffects = new VideoEffects(video, canvas);

// Load settings from local storage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('videoSettings'));
    if (settings) {
        video.volume = settings.volume;
        video.currentTime = settings.currentTime;
        videoIndex = settings.currentIndex;
        videoEffects.applyEffect(settings.effect);
    }
}


// Save settings to local storage
function saveSettings() {
    const settings = {
        volume: video.volume,
        currentTime: video.currentTime,
        currentIndex: videoIndex,
        effect: videoEffects.currentEffect
    };
    localStorage.setItem('videoSettings', JSON.stringify(settings));
}

fetch('subtitles.json')
    .then(response => response.json())
    .then(data => {
        displayScript(data);
    })
    .catch(error => {
        console.error('Error loading subtitles.json:', error);
    });


    function displayScript(scriptData) {
        let startTime = 0;
        
        scriptData.forEach((scene, index) => {
            const duration = parseInt(scene.length);
            const scriptContent = scene.script;
    
            scriptContent.forEach((line, i) => {
                const scriptLine = document.createElement('div');
                scriptLine.className = 'script-line';
                scriptLine.innerText = line;
                scriptLine.style.position = 'absolute';
                scriptLine.style.left = '50%';
                scriptLine.style.transform = 'translateX(-50%)';
                scriptLine.style.top = `${50 + (i * 30)}px`;

                if (line.startsWith('[Narration]')) {
                    scriptLine.classList.add('narration');
                } else if (line.startsWith('[Scene]')) {
                    scriptLine.classList.add('scene');
                }
    
                scriptContainer.appendChild(scriptLine);

                video.addEventListener('timeupdate', function () {
                    if (video.currentTime >= startTime && video.currentTime <= startTime + duration) {
                        scriptLine.style.display = 'block';
                    } else {
                        scriptLine.style.display = 'none';
                    }
                });
            });
    
            startTime += duration;
        });
    }

video.addEventListener('timeupdate', () => {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.value = progress;
});

// Play - Pause button
play.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        play.textContent = 'Pause';
    } else {
        video.pause();
        play.textContent = 'Play';
    }
});


// Creates a list of videos
function createList() {
    ulVideos.replaceChildren();
    for (let i = 0; i < videos.length; i++) {
        const li = document.createElement('li');
        li.textContent = videos[i].split('/').pop().split('.')[0];
        ulVideos.appendChild(li);
    }
}


// Loads the current video on the screen
function loadVideo(i) {
    if (i >= 0 && i < videos.length) {
        video.src = videos[i];
        video.load();
        video.play();
        videoIndex = i;
    }
}


// Switches to the next video
function nextVideo() {
    if (videoIndex < videos.length - 1) {
        loadVideo(videoIndex + 1);
    } else {
        loadVideo(0);
    }
}


// Switches to the previous video
function previousVideo() {
    if (videoIndex > 0) {
        loadVideo(videoIndex - 1);
    } else if (videoIndex == 0) {
        loadVideo(videos.length - 1);
    }
}


// Automatically switching to the next video
video.addEventListener('ended', () => {
    if (videoIndex == videos.length - 1) {
        loadVideo(0);
    } else {
        nextVideo();
    }
});


// Handling drag-and-drop functionality
dragDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dragDropArea.classList.add('drag-over');
});


// Removing the drag-over class
dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('drag-over');
});


// Handling the drop event
dragDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dragDropArea.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'video/mp4') {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            videos.push(reader.result); 
            loadVideo(videos.length - 1); 
            createList(); 
        };
    } else {
        alert('Please upload a valid MP4 video file.');
    }
});


// Handling file input button
dragDropArea.addEventListener('click', () => {
    fileInput.click();
});


// Handling file input change
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.type === 'video/mp4') {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            videos.push(reader.result); 
            loadVideo(videos.length - 1);
            createList();
        };
    } else {
        alert('Please upload a valid MP4 video file.');
    }
});


// Deleting the current video
deleteBttn.addEventListener('click', () => {
    videos.splice(videoIndex, 1);
    if (videoIndex >= videos.length) {
        videoIndex = 0;
    }
    loadVideo(videoIndex);
    createList();
});


// Sorting videos by duration
sortBttn.addEventListener('click', () => {
    const videoDurations = [];
    const cnt = 0;

    const processVideo = (index) => {
        if (index >= videos.length) {
            videoDurations.sort((x1, x2) => x1.duration - x2.duration);
            videos.length = 0; 
            videoDurations.forEach(item => videos.push(item.src));
            createList();
            loadVideo(0); 
            saveVideos();
            return;
        }

        const tempVideo = document.createElement('video');
        tempVideo.src = videos[index];
        tempVideo.onloadedmetadata = () => {
            videoDurations.push({ src: videos[index], duration: tempVideo.duration });
            processVideo(index + 1);
        };
    };

    processVideo(0);
});


// Saving settings when video is paused or page is unloaded
video.addEventListener('pause', saveSettings);
window.addEventListener('beforeunload', saveSettings);


// Loading settings when the page is loaded
window.addEventListener('load', loadSettings);
next.addEventListener('click', nextVideo);
previous.addEventListener('click', previousVideo);


// Desenarea cadrelor video și aplicarea efectelor
let animationId;
videoEffects.drawFrame = function () {
    cancelAnimationFrame(animationId); // Oprește orice ciclu anterior
    animationId = requestAnimationFrame(() => {
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        const frame = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = frame.data;

        switch (this.currentEffect) {
            case 'green_tint':
                this.green_tint(data);
                break;
            case 'magenta_tint':
                this.magenta_tint(data);
                break;
            case 'old_paper':
                this.old_paper(data);
                break;
            case 'colder_tint':
                this.cold_tint(data);
                break;
            case 'normal':
            default:
                break;
        }

        this.context.putImageData(frame, 0, 0);
        this.drawFrame();
    });
};


// Applying video effects
effectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const effect = button.getAttribute('data-effect');
        videoEffects.applyEffect(effect);
        saveSettings();
    });
});


// Syncing the progress bar with the video
video.addEventListener('timeupdate', () => {
    progressBar.value = (video.currentTime / video.duration) * 100;
});


// User modifying the progress bar
progressBar.addEventListener('input', () => {
    const targetTime = (progressBar.value / 100) * video.duration;
    video.currentTime = targetTime;
});


// Preview canvas
progressBar.addEventListener('mousemove', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const progress = (e.clientX - rect.left) / rect.width;
    const previewTime = progress * video.duration;

    previewCanvas.style.left = `${e.clientX - rect.left - previewCanvas.width / 2}px`;
    previewCanvas.style.top = `${video.getBoundingClientRect().top - previewCanvas.height - 50}px`;
    previewCanvas.style.display = 'block';

    extractFrame(previewTime);
});


// Hide preview
progressBar.addEventListener('mouseout', () => {
    previewCanvas.style.display = 'none';
});


// Extract a frame from the video
function extractFrame(time) {
    video.pause();
    const tempCurrentTime = video.currentTime;
    video.currentTime = time;

    video.addEventListener(
        'seeked',
        function onSeeked() {
            previewContext.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
            video.currentTime = tempCurrentTime;
            video.removeEventListener('seeked', onSeeked);
        },
        { once: true }
    );
}

loadVideo(videoIndex);
createList();
videoEffects.drawFrame();
