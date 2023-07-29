// const videoUrlInput = document.getElementById('videoUrl');
// const pixelsSelect = document.getElementById('pixels');
// const downloadBtn = document.getElementById('download-btn');
// const form = document.querySelector('form')

// let mediaName;
// let mediaType;
// let mediaBlobUrl; 

// const video = document.getElementById('video');
// const audio = document.getElementById('audio');
// const mediaTitle = document.getElementById('media-title');
// const mediaDesc = document.getElementById('media-desc');
 

// async function getVideoInfo(url) {
//   const response = await fetch(`/getVideoInfo?url=${encodeURIComponent(url)}`);
//   const videoInfo = await response.json();

//   return videoInfo;
// }

// async function getVideo(url) {
//   const response = await fetch(url);
//   return response.blob();
// }

// function setVideoDetails(blob, videoInfo) {
//   mediaTitle.innerText = videoInfo.title;
//   mediaDesc.innerText = videoInfo.description;
//   const url = URL.createObjectURL(blob);


//   if (mediaType === 'video') {
//     video.src = url; 
//     video.controls = true;
//     audio.controls = false;
//     audio.src = '';
//   } else {
//     audio.src = url;
//     audio.controls = true;
//     video.controls = false;
//     video.src = ''; 
//   }
//   mediaBlobUrl = url;
// }
// function setForDownload() {
//   downloadBtn.href = mediaBlobUrl;
//   downloadBtn.download = mediaName;
//   downloadBtn.classList.remove('hidden');
//   downloadBtn.innerText = 'Download';
// }

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   mediaType = document.querySelector('input[name="mediaType"]:checked').value;
  
//   const url = videoUrlInput.value;
//   const pixels = pixelsSelect.value;

//   if (!url.trim() || !pixels) {
//     alert('Please enter a valid YouTube URL and select pixels.');
//     return;
//   }

//   try {
  
//     const videoInfo = await getVideoInfo(url)
//     // Check if there's an error in the response (e.g., invalid URL)
//     if (videoInfo.error) {
//       alert(`Error: ${videoInfo.error}`);
//       return;
//     }

//     // Get the video title and other necessary information
//     mediaName = videoInfo.generalInfo.fileName;

//     const downloadUrl = `/download/${mediaType}?url=${encodeURIComponent(url)}&pixels=${pixels}`;
//     const blob = await getVideo(downloadUrl);

//     setVideoDetails(blob,videoInfo.videoDetails);
//     setForDownload()
//   } catch (error) {
//     console.error('Error:', error);
//     alert('An error occurred while downloading the video.');
//   }
// });

const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');

function getBubble(){
  const div = document.createElement('div');
  const para = document.createElement('p');
  return { div , para }
}

function addBotResponse(response) {
  const { div , para } = getBubble()
  div.classList.add('chat-bubble', 'bot');
  para.textContent = response;
  div.appendChild(para);
  chatDisplay.appendChild(div);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}
function addUserResponse(response) {
  const { div , para } = getBubble()
  div.classList.add('chat-bubble', 'user');
  para.textContent = response;
  div.appendChild(para);
  chatDisplay.appendChild(div);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}
function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;
  addUserResponse(userMessage)
  userInput.value = '';

  // Process user's request
  const commandRegex = /^(video|audio)\s+(https?:\/\/[^\s]+)/i;
  const match = userMessage.match(commandRegex);
  if (match) {
    const mediaType = match[1].toLowerCase(); // 'video' or 'audio'
    const youtubeURL = match[2]; // YouTube URL

    // Simulate the download request (replace this with actual download code)
    // For demonstration purposes, we will just display a fixed response.
    const response = `Request received! You requested ${mediaType} from YouTube URL: ${youtubeURL}`;
    addBotResponse(response);
  } else {
    const response = "I'm sorry, I couldn't understand your request. Please use commands like 'video <YouTube URL>' or 'audio <YouTube URL>'.";
    addBotResponse(response);
  }
}

document.getElementById('user-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
