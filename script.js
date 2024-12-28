//Creating an array of videos in order to access them when needed
const videos = ['media/Carina-nebula-3-dimensions-hd.mp4', 
    'media/Gas-cloud-fly-through.mp4',
    'media/Planets-space-jupiter-animatio.mp4', 
    'media/Sketches-space-planetary-nebul.mp4'
];


//Getting the video element and the buttons
const video = document.getElementById('video');
const importBttn = document.getElementById('import');
const deleteBttn = document.getElementById('delete');
const play = document.getElementById('play');
const ulVideos = document.getElementById('ul-videos');
const sortBttn = document.getElementById('sort');
let videoIndex = 0;


//Creating actions for play/pause buttons
play.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        play.textContent = 'Pause';
    } else {
        video.pause();
        play.textContent = 'Play';
    }
});


//Creating a list of videos
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


//Switches to the next video when the button is pressed
function nextVideo() {
    if (videoIndex < videos.length - 1) {
        loadVideo(videoIndex + 1);
    } else if (videoIndex == videos.length - 1) {
        loadVideo(0);
    }
}


//Switches to the previous video when the button is pressed
function previousVideo() {
    if (videoIndex > 0) {
        loadVideo(videoIndex - 1);
    } else if (videoIndex == 0) {
        loadVideo(videos.length - 1);
    }
}


//When a video ends, it automatically switches to the next one
video.addEventListener('ended', () => {
    if (videoIndex == videos.length - 1) {
        loadVideo(0);
    } else {
        nextVideo();
    }
});


//Importing a video from the user's device - only mp4 accepted
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
            saveVideosToStorage();
        }
    });
});


//Deleting the current video
deleteBttn.addEventListener ('click', () => {
    videos.splice(videoIndex, 1);
    if (videos.length > 0) {
        loadVideo(videoIndex % videos.length);
    }
    createList();
    saveVideosToStorage();
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


//Saving the preferrences in local storage
function saveVideos() {
    localStorage.setItem('videos', JSON.stringify(videos));
}

function loadVideos() {
    const storedVideos = localStorage.getItem('videos');
    if (storedVideos) {
        return JSON.parse(savedVideos);
    }
    return null;
}

const storedVideos = loadVideos();
if (storedVideos) {
    videos.length = 0;
    videos.push(...storedVideos);
}

createList();