// const media.blobUrlInput = document.getElementById('media.blobUrl');
// const pixelsSelect = document.getElementById('pixels');
// const downloadBtn = document.getElementById('download-btn');
// const form = document.querySelector('form')

let media = {
  fileName : '',
  type : '',
  blobUrl : '',
  desc : ''
}
 
async function getVideo(url) {
  const response = await fetch(url);
  return await response.blob();
}

async function getVideoInfo(url) {
  const response = await fetch(`/getVideoInfo?url=${encodeURIComponent(url)}`);
  return await response.json()
}


function getDownloadElements() {
  const container = document.createElement('div');
  const mediaElement = document.createElement(media.type);
  const title = document.createElement('h3');
  const desc = document.createElement('p');
  const downloadBtn = document.createElement('a');

  return { container , mediaElement , title , desc , downloadBtn };
}

function setVideoDetails(blob, videoInfo) {
  media.blobUrl = URL.createObjectURL(blob);
  media.fileName = videoInfo.generalInfo.fileName;
  media.desc = videoInfo.videoDetails.description;
  if(media.blobUrl && media.fileName && media.desc) addBotResponse(`
    ${media.blobUrl},
    ${media.fileName},
    ${media.desc}
  `)
  setForDownload()
}
function setForDownload() {
  const { container , mediaElement, title , desc , downloadBtn } = getDownloadElements()
  
  container.classList.add('chat-bubble','bot','download');

  mediaElement.src = media.blobUrl;
  mediaElement.controls = true;
  mediaElement.classList.add(media.type)

  title.innerText = media.fileName;
  title.classList.add('media-type');

  desc.innerText = media.desc;
  desc.classList.add('media-desc');

  downloadBtn.href = media.blobUrl;
  downloadBtn.download = media.fileName;
  downloadBtn.innerHTML = `Download <i class="fa-solid fa-file-arrow-down"></i>`;
  downloadBtn.classList.add('download-btn');


  container.appendChild(mediaElement);
  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(downloadBtn);

  chatDisplay.appendChild(container);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

const getMedia = async (youtubeURL) => {

  const url = youtubeURL;
  const pixels = 720

  try {
    const videoInfo = await getVideoInfo(url);
    if(videoInfo) addBotResponse(`recieved ${media.type} meta info`)
    const downloadUrl = `/download/${media.type}?url=${encodeURIComponent(url)}&pixels=${pixels}`;
    const blob = await getVideo(downloadUrl);
    if(blob) addBotResponse(`recieved ${media.type}`)

    setVideoDetails(blob,videoInfo);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while downloading the video.');
  }
};

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

function processRequest(userMessage){
  // Process user's request
  const commandRegex = /^(video|audio)\s+(https?:\/\/[^\s]+)/i;
  const match = userMessage.match(commandRegex);
  if (match) {
    media.type = match[1].toLowerCase(); // 'video' or 'audio'
    const youtubeURL = match[2]; // YouTube URL

    const response = `Request received! You requested ${media.type} from YouTube URL: ${youtubeURL} this will be ready in a couple of seconds...`;
    addBotResponse(response);
    getMedia(youtubeURL);
  } else {
    const response = "I'm sorry, I couldn't understand your request. Please use commands like 'video <YouTube URL>' or 'audio <YouTube URL>'.";
    addBotResponse(response);
  }
}
function clearMessages(){
  const messages = chatDisplay.querySelectorAll('.chat-bubble:not(.bot.download)')
  for(x of messages){
    x.remove()
  }
  // chatDisplay.innerHTML = ''
}
function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;
  addUserResponse(userMessage)
  userInput.value = '';
  switch(userMessage.toLowerCase()){
    case 'hi' :
    case 'hello' :
    case 'hey':
      addBotResponse('Hello there!')
      break;
    case 'help':
      addBotResponse('Available commands: video <YouTube URL> or audio <YouTube URL> and clear')
      break;
    case 'clear':
      clearMessages()
      break;
    default:
      processRequest(userMessage)
  }
  
}

userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});


// window.onload = function(){
//   addBotResponse(`Hi there, I'm a bot. Type 'help' to see the list of commands`)
// }