const PEXELS_API_KEY = 'fgAGITIuPfxSnDjrRWN5Dwd6xKvYGSrP9MdPFFIYXzEmGl2DruIsTiVm'; // Replace with your Pexels API key
const JAMENDO_CLIENT_ID = '1398578b'; // Replace with your Jamendo client ID
const SERVER_API_URL = 'http://localhost:5000/process'; // Backend endpoint

async function generateContent() {
    const word = document.getElementById('userInput').value;
    if (!word) {
        alert("Please enter a word or phrase!");
        return;
    }

    document.getElementById('status').textContent = "Generating content...";

    try {
        // Fetch narration from ResponsiveVoice
        const narrationPath = await fetchNarration(word);

        // Fetch video from Pexels
        const videoUrl = await fetchPexelsVideo(word);

        // Fetch music from Jamendo
        const musicUrl = await fetchJamendoMusic(word);

        // Send data to the backend for merging
        const finalVideo = await processMedia(videoUrl, musicUrl, narrationPath);

        // Display final output
        document.getElementById('status').textContent = "Content generated successfully!";
        const videoElement = document.createElement('video');
        videoElement.src = finalVideo;
        videoElement.controls = true;
        document.getElementById('preview').appendChild(videoElement);
    } catch (error) {
        console.error("Error generating content:", error);
        document.getElementById('status').textContent = "An error occurred. Please try again.";
    }
}

async function fetchNarration(text) {
    return new Promise((resolve) => {
        responsiveVoice.speak(text, "US English Female", {
            onend: () => resolve(`/tmp/${text}.mp3`) // Mock path; replace with actual file path
        });
    });
}

async function fetchPexelsVideo(query) {
    const response = await fetch(`https://api.pexels.com/videos/search?query=${query}&per_page=1`, {
        headers: { Authorization: PEXELS_API_KEY }
    });
    const data = await response.json();
    return data.videos[0].video_files[0].link;
}

async function fetchJamendoMusic(query) {
    const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&search=${query}&limit=1`);
    const data = await response.json();
    return data.results[0]?.audio || "";
}

async function processMedia(videoUrl, musicUrl, narrationPath) {
    const response = await fetch(SERVER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, musicUrl, narrationPath })
    });

    if (!response.ok) throw new Error("Failed to process media");
    return await response.json();
}
