import { VideoEffects } from './effects.js';

//Creating an array of videos in order to access them when needed
const videos = ['media/Carina-nebula-3-dimensions-hd.mp4', 
    'media/Gas-cloud-fly-through.mp4',
    'media/Planets-space-jupiter-animatio.mp4', 
    'media/Sketches-space-planetary-nebul.mp4'
];

//Getting the video element and the buttons
const video = document.getElementById('video');
const canvas = document.getElementById('effectCanvas');
const importBttn = document.getElementById('import');
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

//Play - Pause button
play.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        play.textContent = 'Pause';
    } else {
        video.pause();
        play.textContent = 'Play';
    }
});

//Creates a list of videos
function createList() {
    ulVideos.replaceChildren();
    for (let i = 0; i < videos.length; i++) {
        const li = document.createElement('li');
        li.textContent = videos[i].split('/').pop().split('.')[0];
        ulVideos.appendChild(li);
    }
}

//Leads the current video on the screen
function loadVideo(i) {
    if (i >= 0 && i < videos.length) {
        video.src = videos[i];
        video.load();
        video.play();
        videoIndex = i;
    }
}

//Switches to the next video
function nextVideo() {
    if (videoIndex < videos.length - 1) {
        loadVideo(videoIndex + 1);
    } else {
        loadVideo(0);
    }
}

//Switches to the previous video
function previousVideo() {
    if (videoIndex > 0) {
        loadVideo(videoIndex - 1);
    } else if (videoIndex == 0) {
        loadVideo(videos.length - 1);
    }
}

//automatically switching to the next video
video.addEventListener('ended', () => {
    if (videoIndex == videos.length - 1) {
        loadVideo(0);
    } else {
        nextVideo();
    }
});

//Importing a video - mp4 only
importBttn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4';
    input.click();

    input.addEventListener('change', () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            videos.push(reader.result);
            loadVideo(videos.length - 1);
            createList();
        }
    });
});

//Deleting the current video
deleteBttn.addEventListener('click', () => {
    videos.splice(videoIndex, 1);
    if (videoIndex >= videos.length) {
        videoIndex = 0;
    }
    loadVideo(videoIndex);
    createList();
});

//Sorting videos by duration
sortBttn.addEventListener('click', () => {
    const videoDurations = [];
    const cnt = 0;

    //Processes each video to get its duration
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
createList();

// Save settings when the video is paused or the page is unloaded
video.addEventListener('pause', saveSettings);
window.addEventListener('beforeunload', saveSettings);

// Load settings when the page is loaded
window.addEventListener('load', loadSettings);

next.addEventListener('click', nextVideo);
previous.addEventListener('click', previousVideo);

//Applying video effects
effectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const effect = button.getAttribute('data-effect');
        videoEffects.applyEffect(effect);
        saveSettings(); // Save settings whenever an effect is applied
    });
});

// Sincronizarea progressBar cu timpul videoclipului
video.addEventListener('timeupdate', () => {
    progressBar.value = (video.currentTime / video.duration) * 100;
});

// Când utilizatorul modifică progressBar
progressBar.addEventListener('input', () => {
    const targetTime = (progressBar.value / 100) * video.duration;
    video.currentTime = targetTime;
});

// Previzualizare cadru pe mouseover
progressBar.addEventListener('mousemove', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const progress = (e.clientX - rect.left) / rect.width;
    const previewTime = progress * video.duration;

    // Mutăm canvas-ul de previzualizare
    previewCanvas.style.left = `${e.clientX - rect.left - previewCanvas.width / 2}px`;
    previewCanvas.style.top = `${rect.top - previewCanvas.height - 10}px`;
    previewCanvas.style.display = 'block';

    // Extragem cadrul de previzualizare
    extractFrame(previewTime);
});

// Ascunde canvas-ul de previzualizare când mouse-ul iese
progressBar.addEventListener('mouseout', () => {
    previewCanvas.style.display = 'none';
});

// Funcție pentru extragerea unui cadru la un anumit timp
function extractFrame(time) {
    // Setăm videoclipul pe timpul specificat fără a porni redarea
    video.pause();
    const tempCurrentTime = video.currentTime; // Salvează timpul curent
    video.currentTime = time;

    video.addEventListener(
        'seeked',
        function onSeeked() {
            previewContext.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
            video.currentTime = tempCurrentTime; // Revenim la timpul original
            video.removeEventListener('seeked', onSeeked);
        },
        { once: true }
    );
}

// Initial load
loadVideo(videoIndex);
createList();
videoEffects.drawFrame();