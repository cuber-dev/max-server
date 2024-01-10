const ytdl = require('ytdl-core');

function sanitizeFilename(filename) {
    return filename
        .replace(/[^\w\s.-]/g, '_')  // Replace special characters with underscores
        .replace(/\.(webm|mp4|mp3|m4a|mpeg)/g, '_');  // Replace specified extensions with underscores
  }
  
  
  function storeUserQuery(req, res, next){
      const { url , type } = req.query;
      const time = new Date();
      const hours = time.getHours().toString()
      const minutes = time.getMinutes().toString()
      const seconds = time.getSeconds().toString()
      const timeLabel = `${hours}:${minutes}:${seconds}`;
      
      const date = new Intl.DateTimeFormat('en-US').format(time);
      
      const dateTimeLabel = `${date} ${timeLabel}`;
      
      const userQuery = `${type} - ${url} - ${dateTimeLabel} \n`
      
      userQueries.push({
        userId : "1",
        query : userQuery
      })
      fs.writeFileSync('./static/userQueries.json', JSON.stringify(userQueries)) 
      console.log("Total requests : ",userQueries.length)
      next();
  }

const watermark = "[MAX] - "
const getFileName = (filename,type) => `${watermark}${sanitizeFilename(filename)}.${type === 'audio' ? 'm4a' : 'mp4'}`
  
const getInfoRes = (info,type) => {
    let videoFormats = ytdl.filterFormats(info.formats, 'audioandvideo');
    let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    console.log('video : ',videoFormats)
    console.log('audio : ',audioFormats)

    const response = {
        videoFormats,
        audioFormats,
        generalInfo : { 
          title : info.videoDetails.title,
          fileName : getFileName(info.videoDetails.title,type),
        },
      } 
    return response;
}

module.exports = {
    getInfoRes
}