const ytdl = require('ytdl-core');
const baseUrl = 'http://localhost:3000'
const watermark = "[MAX] - "
const getFileName = (filename,type) => `${watermark}${sanitizeFilename(filename)}.${type === 'audio' ? 'm4a' : 'mp4'}`
const getBaseLinks = (type,url,file) => {
    return type === 'audio' ? `${baseUrl}/audio?url=${url}&size=${file.size}` 
        : `${baseUrl}/video?url=${url}&quality=${file.quality}`
}  

function getSizeLabel(size) {
    if(!size) return 'unknown';

    if (size < 1024) {
        return `${size} bytes`;
      } else if (size < 1048576) {
        return `${(size / 1024).toFixed(2)} KB`;
      } else if (size < 1073741824) {
        return `${(size / 1048576).toFixed(2)} MB`;
      } else {
        return `${(size / 1073741824).toFixed(2)} GB`;
      }
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

const getInfoRes = (url,info) => {
    let videoFormats = ytdl.filterFormats(info.formats, 'audioandvideo');
    let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    console.log('video : ',videoFormats)
    console.log('audio : ',audioFormats)
    const videoLinks = videoFormats.map((format,i) => ({
        id : i,
        link : getBaseLinks('video',url,{ quality : format.qualityLabel}),
        size : format.contentLength,
        sizeLabel : getSizeLabel(format.contentLength),
        qualityLabel : format.qualityLabel
    }))
    const audioLinks = audioFormats.map((format,i) => ({
        id : i,
        link : getBaseLinks('audio',url,{ size : format.contentLength}),
        size : format.contentLength,
        sizeLabel : getSizeLabel(format.contentLength),
    })) 
    const response = {
        title : info.videoDetails.title,
        thumbnail : info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        audioLinks,
        videoLinks,
      } 
    return response;
}

module.exports = {
    getInfoRes,
    getFileName,
    baseUrl,
}