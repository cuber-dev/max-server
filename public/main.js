const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');

let media = {
  fileName : '',
  type : '',
  blobUrl : '',
  desc : ''  
}
const anchor = url => `<a href="${url}" target="_blank">${url}</a>`
const hashTag = tag => `<a href="https://www.youtube.com/hashtag/${tag.replace('#','')}" target="_blank">${tag}</a>`
 
async function fetchMediaFile(url) {
  const response = await fetch(url);
  return await response.blob();
}

async function fetchMediaInfo(url) {
  const response = await fetch(`/getVideoInfo?url=${encodeURIComponent(url)}&type=${media.type}`);
  return await response.json()
}




function setMediaDetails(blob, mediaInfo) {
  media.blobUrl = URL.createObjectURL(blob);
  media.fileName = mediaInfo.generalInfo.fileName;
  media.desc = mediaInfo.videoDetails.description;
  if(media.blobUrl && media.fileName) setForDownload()
}

function getDownloadElements() {
  const container = document.createElement('div');
  const mediaElement = document.createElement(media.type);
  const title = document.createElement('h3');
  const desc = document.createElement('p');
  const downloadBtn = document.createElement('a');

  return { container , mediaElement , title , desc , downloadBtn };
}

function setDesc(desc) { 
  // let words  = media.desc.split(" ")
  let words = media.desc.split(/\s+/); // Use a regex to split words with any whitespace character
  let isHasLinks = false
  words = words.map(word => {
    word = word.replace(`"`,'')
    if(word.startsWith('http')){
      isHasLinks = true
      return anchor(word)
    }else if(word.startsWith('#')){
      isHasLinks = true
      return hashTag(word)
    }
    return word
  })
  isHasLinks ?
  words.forEach(word => {
    const span = document.createElement('span');
    span.innerHTML = word + " ";
    
    desc.appendChild(span);

    if(span.innerText.startsWith('http')) {
      const br = document.createElement('br')
      desc.appendChild(br)  
    }
  }) : desc.innerText = media.desc; 
  desc.classList.add('media-desc');
}


function setForDownload() {
  const { container , mediaElement, title , desc , downloadBtn } = getDownloadElements()
  
  container.classList.add('chat-bubble','bot','download');

  mediaElement.src = media.blobUrl;
  mediaElement.controls = true;
  mediaElement.classList.add(media.type)

  title.innerText = media.fileName;
  title.classList.add('media-title');

  setDesc(desc)

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
    const mediaInfo = await fetchMediaInfo(url);
    if(mediaInfo) addBotResponse(`recieved ${media.type} meta info...`)

    const downloadUrl = `/download/${media.type}?url=${encodeURIComponent(url)}&pixels=${pixels}`;
    const blob = await fetchMediaFile(downloadUrl);
    if(blob) addBotResponse(`recieved ${media.type}...`)

    setMediaDetails(blob,mediaInfo);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while downloading the video.');
  }
};


function getBubble(){
  const div = document.createElement('div');
  const para = document.createElement('p');
  return { div , para }
}

function addBotResponse(response,type = 'textContent') {
  const { div , para } = getBubble()
  div.classList.add('chat-bubble', 'bot');
  para[type] = response;
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
function addCommands(){
  const commands = [
    'Available commands:',
    'video <YouTube URL>',
    'audio <YouTube URL>',
    'clear (to clear messages except media files)',
  ];
  
  for(msg of commands){
    addBotResponse(msg)
  }
}


function processUserRequest(userMessage){
  // Process user's request
  const commandRegex = /^(video|audio)\s+(https?:\/\/[^\s]+)/i;
  const match = userMessage.match(commandRegex);
  if (match) {
    media.type = match[1].toLowerCase(); // 'video' or 'audio'
    const youtubeURL = match[2]; // YouTube URL
    const response = `Request received! You requested ${media.type} from YouTube URL: ${anchor(youtubeURL)} ,this will be ready in a couple of seconds...`;
    addBotResponse(response,'innerHTML');
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
  const commands = {
    greetings: ['hi', 'hello', 'hello there','hello there!','hey'],
    help: ['help', 'help!', '?'],
    clear: ['clear', 'clear!', 'cls', 'cls!', 'clear messages'],
  };
  
  const userMessageLowerCase = userMessage.toLowerCase();
  
  if (commands.greetings.includes(userMessageLowerCase)) {
    addBotResponse('Hello there!');
  } else if (commands.help.includes(userMessageLowerCase)) {
    addCommands();
  } else if (commands.clear.includes(userMessageLowerCase)) {
    clearMessages();
  } else {
    processUserRequest(userMessage);
  }
  
}

userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});


function checkUser() {
  const isPrevUser = localStorage.getItem('isPrevUser') || false;
  let msg = '';

  if (!isPrevUser) {
    msg = `
      Hi there! I'm a YouTube video downloader bot. 
      I can download videos and audio from YouTube.
      Just type 'help' for a list of available commands.
      If you have used me before, welcome back! 
      I have some awesome new features waiting for you.
    `;
    
    localStorage.setItem('isPrevUser', true);
  } else {
    msg = `
      Welcome back! I'm the YouTube video downloader bot. 
      I'm here to help you download your favorite videos and audio from YouTube.
      Just type 'help' to see the list of available commands.
      If you're new here, welcome! Feel free to ask me to download anything you need.
    `;
  }
  
  addBotResponse(msg);
}


window.addEventListener('load',checkUser)