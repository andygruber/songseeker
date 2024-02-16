document.addEventListener('DOMContentLoaded', function () {
    let lastDecodedText = ""; // Store the last decoded text

    const qrReader = new Html5Qrcode("qr-reader");
    const resultContainer = document.getElementById("qr-reader-results");

    qrReader.start(
        { facingMode: "environment" },
        {
            fps: 10
        },
        (decodedText) => {
            if (decodedText !== lastDecodedText) {
                lastDecodedText = decodedText; // Update the last decoded text
                handleScannedLink(decodedText);
            }
        },
        (errorMessage) => {
            // handle scan error
        }
    ).catch((err) => {
        // handle initialization error
    });

    // Function to determine the type of link and act accordingly
    async function handleScannedLink(decodedText) {
        let youtubeURL = "";
        if (isYoutubeLink(decodedText)) {
            youtubeURL = decodedText;
        } else if (isHitsterLink(decodedText)) {
            const hitsterData = parseHitsterUrl(decodedText);
            console.log("Hitster data:", hitsterData.id, hitsterData.lang);
            if (hitsterData) {
                try {
                    const response = await fetch(`/hitster-${hitsterData.lang}.csv`);
                    const csvContent = await response.text();
                    const youtubeLink = lookupYoutubeLink(hitsterData.id, csvContent);
                    if (youtubeLink) {
                        // Handle YouTube link obtained from the CSV
                        console.log(`YouTube Link from CSV: ${youtubeLink}`);
                        youtubeURL = youtubeLink;
                        // Example: player.cueVideoById(parseYoutubeLink(youtubeLink).videoId);
                    }
                } catch (error) {
                  console.error("Failed to fetch CSV:", error);
                }
            }
        }

        console.log(`YouTube Video URL: ${youtubeURL}`);

        const youtubeLinkData = parseYoutubeLink(youtubeURL);
        if (youtubeLinkData) {
            resultContainer.innerHTML = `
                <p>Video ID: ${youtubeLinkData.videoId}</p>
                <p>Start Time: ${youtubeLinkData.startTime || 'N/A'}</p>
                <p>End Time: ${youtubeLinkData.endTime || 'N/A'}</p>
            `;
            console.log(youtubeLinkData.videoId)
            player.cueVideoById(youtubeLinkData.videoId, youtubeLinkData.startTime || 0);   
        }

    }

    // Example implementation for isHitsterLink
    function isHitsterLink(url) {
        return url.startsWith("http://www.hitstergame.com/");
    }

    // Example implementation for isYoutubeLink
    function isYoutubeLink(url) {
        return url.startsWith("https://www.youtube.com") || url.startsWith("https://youtu.be");
    }
    
    // Example implementation for parseHitsterUrl
    function parseHitsterUrl(url) {
        const regex = /^http:\/\/www\.hitstergame\.com\/(\w+)\/(\d+)$/;
        const match = url.match(regex);
        if (match) {
            return { lang: match[1], id: match[2] };
        }
        return null;
    }

    // Looks up the YouTube link in the CSV content based on the ID
    function lookupYoutubeLink(id, csvContent) {
        const targetId = parseInt(id, 10); // Convert the incoming ID to an integer
        const lines = csvContent.split('\n');
        for (let line of lines) {
            // Split the line into columns and parse the first column (ID) as an integer
            const columns = line.split(',');
            const csvId = parseInt(columns[0], 10);
            if (csvId === targetId) {
                // Assuming the YouTube URL is in the fourth column
                return columns[3].trim(); // Return the YouTube link
            }
        }
        return null; // If no matching ID is found
    }

    function parseYoutubeLink(url) {
        // First, ensure that the URL is decoded (handles encoded URLs)
        url = decodeURIComponent(url);
    
        const regex = /^https?:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)([^&?\/\s]+)((\?.*)?)$/;
        const match = url.match(regex);
        if (match) {
            const queryParams = new URLSearchParams(match[4]); // Correctly capture and parse the query string part of the URL
            const videoId = match[2];
            let startTime = queryParams.get('start') || queryParams.get('t');
            const endTime = queryParams.get('end');
    
            // Normalize and parse 't' and 'start' parameters
            startTime = normalizeTimeParameter(startTime);
            const parsedEndTime = normalizeTimeParameter(endTime);
    
            return { videoId, startTime, endTime: parsedEndTime };
        }
        return null;
    }
    
    function normalizeTimeParameter(timeValue) {
        if (!timeValue) return null; // Return null if timeValue is falsy
    
        // Handle time formats (e.g., 't=1m15s' or '75s')
        let seconds = 0;
        if (timeValue.endsWith('s')) {
            seconds = parseInt(timeValue, 10);
        } else {
            // Additional parsing can be added here for 'm', 'h' formats if needed
            seconds = parseInt(timeValue, 10);
        }
    
        return isNaN(seconds) ? null : seconds;
    }
    
});

var player; // Define player globally

// This function creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // Cue a video using the videoId from the QR code (example videoId used here)
    // player.cueVideoById('dQw4w9WgXcQ');
}

// Display video information when it's cued
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.CUED) {
        document.getElementById('qr-reader').style.display = 'none'; // Hide the scanner after successful scan
        // Display title and duration
        var videoData = player.getVideoData();
        document.getElementById('video-title').textContent = videoData.title;
        var duration = player.getDuration();
        document.getElementById('video-duration').textContent = formatDuration(duration);
    }
}

// Helper function to format duration from seconds to a more readable format
function formatDuration(duration) {
    var minutes = Math.floor(duration / 60);
    var seconds = duration % 60;
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// Add event listeners to Play and Stop buttons
document.getElementById('play-video').addEventListener('click', function() {
    player.playVideo();
});

document.getElementById('stop-video').addEventListener('click', function() {
    player.stopVideo();
});

var playbackDuration = 30; // Default playback duration

document.getElementById('set-duration').addEventListener('click', function() {
    var durationInput = document.getElementById('playback-duration').value;
    playbackDuration = parseInt(durationInput, 10) || 30; // Use default if input is invalid
});

document.getElementById('play-video-random-start').addEventListener('click', function() {
    playVideoAtRandomStartTime();
});

var playbackTimer; // hold the timer reference

function playVideoAtRandomStartTime() {
    const minStartPercentage = 0.15;
    const maxEndPercentage = 0.85;
    let videoDuration = player.getDuration()
    let startTime = player.getCurrentTime(); // If the video is already cued to a specific start time
    let endTime = startTime + playbackDuration; // Default end time based on playback duration

    // Adjust start and end time based on video duration
    const minStartTime = Math.max(startTime, videoDuration * minStartPercentage);
    const maxEndTime = videoDuration * maxEndPercentage;

    // Ensure the video ends by 85% of its total duration
    if (endTime > maxEndTime) {
        endTime = maxEndTime;
        startTime = Math.max(minStartTime, endTime - playbackDuration);
    }

    // If custom start time is 0 or very close to the beginning, pick a random start time within the range
    if (startTime <= minStartTime) {
        const range = maxEndTime - minStartTime - playbackDuration;
        const randomOffset = Math.random() * range;
        startTime = minStartTime + randomOffset;
        endTime = startTime + playbackDuration;
    }

    // Cue video at calculated start time and play
    console.log("play random", startTime, endTime)
    player.seekTo(startTime, true);
    player.playVideo();

    clearTimeout(playbackTimer); // Clear any existing timer
    // Schedule video stop after the specified duration
    playbackTimer = setTimeout(() => {
        player.pauseVideo();
    }, (endTime - startTime) * 1000); // Convert to milliseconds
}

// Assuming you have an element with the ID 'qr-reader' for the QR scanner
//document.getElementById('qr-reader').style.display = 'none'; // Initially hide the scanner

document.getElementById('startScanButton').addEventListener('click', function() {
    document.getElementById('qr-reader').style.display = 'block'; // Show the scanner
    // Initialize QR scanner here or make it start scanning
});
