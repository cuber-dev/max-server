/*
  1. i used functions those who starts with "fetch",
  for fetching data from server.
  
  2. i used functions those who starts with "set",
  for setting data to DOM.
  
  3. i used functions those who starts with "get",
  for getting data from deffrent functions to fetch of get
  some data from my server or DOM.
chatDisplay
*/  


const chatContainer = document.getElementById('chat-container');
const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');
const loading = document.querySelector('.loader')


const mediaObjects = []
const anchor = url => `<a href="${url}" target="_blank">${url}</a>`
const hashTag = tag => `<a href="https://www.youtube.com/hashtag/${tag.replace('#','')}" target="_blank">${tag}</a>`
 
const loader = bool => {
  if(bool) {
    chatDisplay.appendChild(loading)
    loading.classList.add('show');
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    return
  }

  loading.classList.remove('show');
}

async function fetchMediaFile(url) {
  const response = await fetch(url);
  // console.log("Media-File response : ",response)
  return await response.blob();
}

async function fetchMediaInfo(url,type) {
  const response = await fetch(`/getVideoInfo?url=${encodeURIComponent(url)}&type=${type}`);
  // console.log("Media-Info response : ",response)
  return await response.json()
}
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class Media{
  constructor(){
    this.blobUrl = ''
    this.name = '',
    this.desc = '',
    this.type = ''
    this.id = generateUUID()
  }
}


function setMediaDetails(newMediaObj,blob, mediaInfo) {
  newMediaObj.blobUrl = URL.createObjectURL(blob);
  newMediaObj.fileName = mediaInfo.generalInfo.fileName;
  newMediaObj.desc = mediaInfo.videoDetails.description || 'This video does not contains description.';
  if(newMediaObj.blobUrl && newMediaObj.fileName) setForDownload(newMediaObj)
}
function getDownloadElements(type) {
  const container = document.createElement('div');
  const mediaElement = document.createElement(type);
  const title = document.createElement('h3');
  const desc = document.createElement('p');
  const downloadBtn = document.createElement('a');

  return { container , mediaElement , title , desc , downloadBtn };
}

function setDesc(e,desc) { 
  // let words  = media.desc.split(" ")
  let words = desc.split(/\s+/); // Use a regex to split words with any whitespace character
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
    
    e.appendChild(span);

    if(span.innerText.startsWith('http')) {
      const br = document.createElement('br')
      e.appendChild(br)  
    }
  }) : e.innerText = desc; 
  e.classList.add('media-desc');
}


function setForDownload(newMediaObj) {
  const { container , mediaElement, title , desc , downloadBtn } = getDownloadElements(newMediaObj.type)
  
  container.classList.add('chat-bubble','bot','download');

  mediaElement.src = newMediaObj.blobUrl;
  mediaElement.controls = true;
  mediaElement.classList.add(newMediaObj.type)

  title.innerText = newMediaObj.fileName;
  title.classList.add('media-title');

  setDesc(desc,newMediaObj.desc)

  downloadBtn.href = newMediaObj.blobUrl;
  downloadBtn.download = newMediaObj.fileName;
  downloadBtn.innerHTML = `<i class="fa-solid fa-file-arrow-down"></i> Download ${newMediaObj.type} `;
  downloadBtn.classList.add('download-btn');


  container.appendChild(mediaElement);
  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(downloadBtn);
  loader(false)  
  chatDisplay.appendChild(container);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

const getMedia = async (youtubeURL,newMediaObj) => {

  const url = youtubeURL;
  const pixels = 720

  try {
    const mediaInfo = await getMediaInfo(url,newMediaObj.type);
    if(!mediaInfo) return;
   
    // console.log("Media-Info in json : ",mediaInfo)
    const downloadUrl = `/download/${newMediaObj.type}?url=${encodeURIComponent(url)}&pixels=${pixels}`;
    const blob = await fetchMediaFile(downloadUrl);
    // console.log("Media-File in blob : ",blob)
    setMediaDetails(newMediaObj,blob,mediaInfo); 
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while downloading the video.');
    loader(false)
  }

};
const getMediaInfo = async (url,type) => {
  const mediaInfo = await fetchMediaInfo(url,type);
  if(mediaInfo.error) {
      addBotResponse(mediaInfo.error)
      loader(false)
      return false;
  }  
  const response = `Request received! You requested ${type} from YouTube video URL: ${anchor(url)} ,this will be ready in a couple of seconds...`;
  addBotResponse(response,'innerHTML');
  return mediaInfo;
}

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
    'video <YouTube video/short URL>',
    'audio <YouTube video/short URL>',
    'clear (to clear messages except media files)',
  ];
  
  for(msg of commands){
    addBotResponse(msg)
  }
}

function validateURL(url) {
  const urlMatch = url.startsWith('https://youtu.be/') || url.startsWith('https://www.youtube.com/');
  console.log("url regex match: ", urlMatch,url);
 
  if (!urlMatch) {
    const response = `URL: ${url} is an invalid YouTube video/short URL. Please provide a valid YouTube video/short URL.`
    addBotResponse(response);
    loader(false)
    return false;
  }
  return true;
}

function processUserRequest(userMessage){
  loader(true)
  // Process user's request
  const commandRegex = /^(video|audio)\s+(https?:\/\/[^\s]+)/i;
  const match = userMessage.match(commandRegex);
  console.log("command regex match : ",match)
  
  if (match) {
    if(!validateURL(match[2])) return;

    mediaObjects.push(new Media())
    const newMediaObj = mediaObjects[mediaObjects.length-1]
    newMediaObj.type = match[1].toLowerCase(); // 'video' or 'audio'
    const youtubeURL = match[2]; // YouTube video URL
    getMedia(youtubeURL,newMediaObj);
  } else {
    const response = "I'm sorry, I couldn't understand your request. Please use commands like 'video <youtube_video_url>' or 'audio <youtube_video_url>'.";
    addBotResponse(response);
    loader(false)
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