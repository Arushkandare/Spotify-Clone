let currentSong = new Audio(); 
let currFolder;
let songs = []; 

function playMusic(track1, track2) {
    const audioUrl = `https://arushkandare.github.io/Spotify-Clone/${currFolder}/` + track1.trim() + " - " + track2.trim() + ".mp3";
    currentSong.src = audioUrl;

    currentSong.play();
    document.getElementById("play").src = "img/pause.svg"; 

    document.querySelector(".song-info").innerHTML = track1.trim() + " - " + track2.trim();
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
    
    document.querySelector(".playbar").style.display = "block"; 
}


async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`https://arushkandare.github.io/Spotify-Clone/${currFolder}/`);
        let textResponse = await response.text();

        let div = document.createElement("div");
        div.innerHTML = textResponse;

        let as = div.getElementsByTagName("a");
        let songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${currFolder}/`)[1]);
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function secondsToMinSec(seconds) {
    let minutes = Math.floor(seconds / 60);  
    let remainingSeconds = Math.floor(seconds % 60);  

    minutes = String(minutes).padStart(2, "0");
    remainingSeconds = String(remainingSeconds).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}

async function displaySongs(songs) {
    const songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // Clear the current song list

    for (let song of songs) {
        let songFullName = song.slice(0, song.length - 4);
        let [songName, songArtist] = songFullName.split("-");

        songUl.innerHTML += `
            <li class="song-details">
                <img class="music-logo" src="img/music.svg" alt="">
                <div class="info">
                    <div style="font-size: 15px; font-weight: bold;">${decodeURIComponent(songName)}</div>
                    <div style="font-size: 13px;">${decodeURIComponent(songArtist)}</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach click event listener to each song element
    Array.from(document.querySelectorAll(".song-details")).forEach(e => {
        e.addEventListener("click", () => {
            let songInfo = e.querySelectorAll(".info div");
            let songName = songInfo[0].textContent.trim();
            let songArtist = songInfo[1].textContent.trim();

            playMusic(songName, songArtist);
        });
    });
}

async function displayAlbums() {
    let response = await fetch(`https://arushkandare.github.io/Spotify-Clone/songs/`);
    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;

    let anchors = div.getElementsByTagName("a");
    const cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = "";

    // Render album cards
    for (let e of anchors) {
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`https://arushkandare.github.io/Spotify-Clone/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML +=
                `<div data-folder="${folder}" class="card">
                    <div class="play-card">
                        <svg class="play" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="#000000">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" 
                            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="Album cover">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p> 
                </div>`;
        }
    }

    // Attach event listener to dynamically created album cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder;

            songs = await getSongs(`songs/${folder}`);
            displaySongs(songs); 
        });
    });
}

// Autoplay next song when the current one ends
currentSong.addEventListener('ended', () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (currentIndex < songs.length - 1) {
        let [songArtist, songName] = songs[currentIndex + 1].split("-");
        playMusic(decodeURIComponent(songArtist), decodeURIComponent(songName.slice(0, songName.length - 4)));
    }
});

(async () => {
    displayAlbums();

    const play = document.getElementById("play"); 
    const previous = document.getElementById("previous"); 
    const next = document.getElementById("next"); 
    
    // Play/pause functionality
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Update time and seekbar circle position
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;

        if (!isNaN(duration)) {
            document.querySelector(".song-time").innerHTML = `${secondsToMinSec(currentTime)} / ${secondsToMinSec(duration)}`;
            document.querySelector(".circle").style.left = (currentTime / duration * 100) + "%";
        }
    });

    // Seekbar functionality
    document.querySelector(".seekbar").addEventListener("click", e => {
        const seekbarWidth = e.target.getBoundingClientRect().width;
        const percent = (e.offsetX / seekbarWidth) * 100;

        document.querySelector(".circle").style.left = percent + "%";

        if (currentSong.duration > 0) {
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        }
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Cross (close menu)
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Add event listener for previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index > 0) {
            let [songArtist, songName] = songs[index - 1].split("-");
            playMusic(decodeURIComponent(songArtist), decodeURIComponent(songName.slice(0, songName.length - 4)));
        }
    });

    // Add event listener for next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index < songs.length - 1) {
            let [songArtist, songName] = songs[index + 1].split("-");
            playMusic(decodeURIComponent(songArtist), decodeURIComponent(songName.slice(0, songName.length - 4)));
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    //Mute event listener
    let previousVolume = currentSong.volume; 
    const volumeInput = document.querySelector(".volume-input");
    
    document.querySelector(".volume-button").addEventListener("click", () => {
        if (currentSong.volume > 0) {
            previousVolume = currentSong.volume;  
            currentSong.volume = 0; 
            volumeInput.value = 0;  
            document.querySelector(".volume img").src = "img/mute.svg";  
        } else {
            currentSong.volume = previousVolume;  
            volumeInput.value = previousVolume * 100;  
            document.querySelector(".volume img").src = "img/volume.svg";  
        }
    });
    
})();
