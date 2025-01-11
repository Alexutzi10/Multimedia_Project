const videos = ['media/Carina-nebula-3-dimensions-hd.mp4', 
    'media/Gas-cloud-fly-through.mp4',
    'media/Planets-space-jupiter-animatio.mp4', 
    'media/Sketches-space-planetary-nebul.mp4'
];

class VideoEffects {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d', { willReadFrequently: true });
        this.currentEffect = 'normal';
    }

    applyEffect(effect) {
        this.currentEffect = effect;
        this.drawFrame();
    }

    green_tint(data) {
        for (let i = 0; i < data.length; i = i+4) {
            data[i] = data[i] * 0.8;
            data[i+1] = data[i+1] * 1.2;
            data[i+2] = data[i+2] * 0.8; 
            data[i+1] = Math.min(255, data[i+1]);
        }
    }

    magenta_tint(data) {
        for (let i = 0; i < data.length; i = i+4) {
            data[i] = data[i] * 1.2;   
            data[i+1] = data[i+1] * 0.8; 
            data[i+2] = data[i+2] * 1.2; 
            data[i] = Math.min(255, data[i]); 
            data[i+2] = Math.min(255, data[i+2]); 
        }
    }

    old_paper(data) {
        for (let i = 0; i < data.length; i = i+4) {
            const avg = (data[i] + data[i+1] + data[i+2]) / 3;
            data[i] = Math.min(255, avg + 50);
            data[i+1] = Math.min(255, avg + 35);
            data[i+2] = Math.min(255, avg);

            const noise = (Math.random() - 0.5) * 25;
            data[i] = data[i] + noise;
            data[i+1] = data[i+1] + noise;
            data[i+2] = data[i+2] + noise;
        }
    }

    cold_tint(data) {
        for (let i = 0; i < data.length; i = i+4) {
            data[i] = data[i] * 0.8;    
            data[i+1] = data[i+1] * 0.9; 
            data[i+2] = data[i+2] * 1.2; 
            data[i+2] = Math.min(255, data[i+2]); 
        }
    }

    drawFrame() {
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

        requestAnimationFrame(() => this.drawFrame());
    }
}

const video = document.getElementById('video');
const canvas = document.getElementById('effectCanvas');
const deleteBttn = document.getElementById('delete');
const play = document.getElementById('play');
const next = document.getElementById('next');
const previous = document.getElementById('previous');
const volumeControl = document.getElementById('volumeControl');
const ulVideos = document.getElementById('ul-videos');
const effectButtons = document.querySelectorAll('.effect-grid button');
const sortBttn = document.getElementById('sort');
const progressBar = document.getElementById('progressBar');
const previewCanvas = document.getElementById('previewCanvas');
const previewContext = previewCanvas.getContext('2d');
const dragDropArea = document.getElementById('drag-drop-area');
const fileInput = document.getElementById('file-input');
let videoIndex = 0;

const videoEffects = new VideoEffects(video, canvas);

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('videoSettings'));
    if (settings) {
        video.volume = settings.volume;
        video.currentTime = settings.currentTime;
        videoIndex = settings.currentIndex;
        videoEffects.applyEffect(settings.effect);
    }
}

function saveSettings() {
    const settings = {
        volume: video.volume,
        currentTime: video.currentTime,
        currentIndex: videoIndex,
        effect: videoEffects.currentEffect
    };
    localStorage.setItem('videoSettings', JSON.stringify(settings));
}

video.addEventListener('timeupdate', () => {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.value = progress;
});


play.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        play.textContent = '⏸';
    } else {
        video.pause();
        play.textContent = '⏯';
    }
});

volumeControl.addEventListener('input', (e) => {
    e.stopPropagation();
    video.volume = volumeControl.value;
    saveSettings();
});

video.addEventListener('loadedmetadata', () => {
    volumeControl.value = video.volume;
});

document.addEventListener('DOMContentLoaded', () => {
    video.volume = 0.5;
    volumeControl.value = video.volume;
    
    volumeControl.addEventListener('input', (e) => {
        e.stopPropagation();
        video.volume = volumeControl.value;
        saveSettings();
    });
    
    volumeControl.addEventListener('change', (e) => {
        e.stopPropagation();
        video.volume = volumeControl.value;
        saveSettings();
    });
});

function createList() {
    ulVideos.replaceChildren();
    for (let i = 0; i < videos.length; i++) {
        const li = document.createElement('li');
        li.textContent = videos[i].split('/').pop().split('.')[0];
        ulVideos.appendChild(li);
    }
}

function loadVideo(i) {
    if (i >= 0 && i < videos.length) {
        video.src = videos[i];
        video.load();
        video.play();
        videoIndex = i;
    }
}

function nextVideo() {
    if (videoIndex < videos.length - 1) 
        loadVideo(videoIndex + 1);
    else 
        loadVideo(0);
}

function previousVideo() {
    if (videoIndex > 0) 
        loadVideo(videoIndex - 1);
    else if (videoIndex == 0) 
        loadVideo(videos.length - 1);
}

video.addEventListener('ended', () => {
    if (videoIndex == videos.length - 1)
        loadVideo(0);
    else 
        nextVideo();
});

dragDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dragDropArea.classList.add('drag-over');
});

dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('drag-over');
});

dragDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dragDropArea.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'video/mp4') {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            videos.push(reader.result); 
            loadVideo(videos.length-1); 
            createList(); 
        };
    } else 
        alert('Please upload a valid MP4 video file.');
});

dragDropArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.type === 'video/mp4') {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload=()=> {
            videos.push(reader.result); 
            loadVideo(videos.length - 1);
            createList();
        };
    } else {
        alert('Upload a valid MP4 video file.');
    }
});

deleteBttn.addEventListener('click', () => {
    videos.splice(videoIndex, 1);
    if (videoIndex >= videos.length)
        videoIndex = 0;
    loadVideo(videoIndex);
    createList();
});

sortBttn.addEventListener('click', () => {
    const videoDurations = [];

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

video.addEventListener('pause', saveSettings);
window.addEventListener('beforeunload', saveSettings);

window.addEventListener('load', loadSettings);
next.addEventListener('click', nextVideo);
previous.addEventListener('click', previousVideo);

let animationId;
videoEffects.drawFrame = function () {
    cancelAnimationFrame(animationId); 
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

effectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const effect = button.getAttribute('data-effect');
        videoEffects.applyEffect(effect);
        saveSettings();
    });
});

video.addEventListener('timeupdate', () => {
    progressBar.value = (video.currentTime / video.duration) * 100;
});

progressBar.addEventListener('input', () => {
    const targetTime = (progressBar.value / 100) * video.duration;
    video.currentTime = targetTime;
});

progressBar.addEventListener('mousemove', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const progress = (e.clientX - rect.left) / rect.width;
    const previewTime = progress * video.duration;

    previewCanvas.style.left = `${e.clientX - rect.left - previewCanvas.width / 2}px`;
    previewCanvas.style.top = `${video.getBoundingClientRect().top - previewCanvas.height - 50}px`;
    previewCanvas.style.display = 'block';

    extractFrame(previewTime);
});

progressBar.addEventListener('mouseout', () => {
    previewCanvas.style.display = 'none';
});

function extractFrame(time) {
    video.pause();
    const tempCurrentTime = video.currentTime;
    video.currentTime = time;

    video.addEventListener('seeked',
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
