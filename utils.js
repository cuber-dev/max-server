const ytdl = require('ytdl-core');
const baseUrl = process.env.BASE_URLs || 'http://localhost:3000'
const watermark = "[MAX] - "

const getFileName = (filename,type) => `${watermark}${sanitizeFilename(filename)}.${type === 'audio' ? 'm4a' : 'mp4'}`
const getBaseLinks = (type,url,file) => {
    return type === 'video' ?  `${baseUrl}/video?url=${url}&quality=${file.quality}` : 
                               `${baseUrl}/audio?url=${url}&size=${file.size}`; 
}  
function getSizeLabel(size) {
    if(!size) return 'unknown';

    if (size < 1024) {
        return `${size} bytes`;
      } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
      } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        return `${(size / 1024 * 1024 * 1024).toFixed(2)} GB`;
      }
  } 
  function convertDuration(milliseconds) {
    // Convert milliseconds to seconds
    var seconds = Math.floor(milliseconds / 1000);

    // Calculate hours, minutes, and remaining seconds
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    // Format the result
    var formattedDuration = `${hours !== 0 ? hours + ':': ''}${minutes !== 0 ? minutes : '00'}:${remainingSeconds}`;

    return formattedDuration;
}
function sanitizeFilename(filename) {
    return filename
        .replace(/[^\w\s.-]/g, '_')  // Replace special characters with underscores
        .replace(/\.(webm|mp4|mp3|m4a|mpeg)/g, '_');  // Replace specified extensions with underscores
  }
  
  
//   function storeUserQuery(req, res, next){
//       const { url , type } = req.query;
//       const time = new Date();
//       const hours = time.getHours().toString()
//       const minutes = time.getMinutes().toString()
//       const seconds = time.getSeconds().toString()
//       const timeLabel = `${hours}:${minutes}:${seconds}`;
      
//       const date = new Intl.DateTimeFormat('en-US').format(time);
      
//       const dateTimeLabel = `${date} ${timeLabel}`;
      
//       const userQuery = `${type} - ${url} - ${dateTimeLabel} \n`
      
//       userQueries.push({
//         userId : "1",
//         query : userQuery
//       })
//       fs.writeFileSync('./static/userQueries.json', JSON.stringify(userQueries)) 
//       console.log("Total requests : ",userQueries.length)
//       next();
//   }

function generateUUID() {
  return 'xx3x-xyxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).replace('|+|','');
  });
}
class Media{
    constructor(format,url){ 
        if(format.qualityLabel){
          this.label = 'Video'
          this.qualityLabel = format.qualityLabel
          this.link = getBaseLinks('video',url,{ quality : this.qualityLabel});
          this.ext = '.mp4'
        }else {
          this.label = 'Audio'
          this.link = getBaseLinks('audio',url,{ size : format.contentLength});
          this.ext = '.m4a'
        }
        this.id = `${url}|+|${generateUUID()}`;
        this.sizeLabel = getSizeLabel(format.contentLength);
    }
} 

const getInfoRes = (url,info) => {
    const videoFormats = ytdl.filterFormats(info.formats, 'audioandvideo');
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
   
    const videoLinks = videoFormats.map((format,i) => (new Media(format,url)));
    const audioLinks = audioFormats.map((format,i) => (new Media(format,url)));

    const response = {
        title : info.videoDetails.title,
        thumbnail : info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        duration : convertDuration(videoFormats[0].approxDurationMs),
        videoLinks,
        audioLinks,
        originalUrl : url,
      } 
    return response;
}

module.exports = {
    getInfoRes,
    getFileName,
    baseUrl,
}