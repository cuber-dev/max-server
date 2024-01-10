const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs')
const { getInfoRes, getFileName } = require('./utils')
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors') 

app.use(cors({ origin : '*' }))    

app.get('/',(req,res) => {
  res.json({ msg : 'OK' })
})  

app.get('/video', async (req, res) => {
  const { url , quality} = req.query;
  console.log("request : ",url,quality)
  try {
    const info = await ytdl.getInfo(url);
    if(info){
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
      console.log(formats)
      const choosenFormat = formats.find(format => format.qualityLabel === quality);
      if(choosenFormat){ 
        
        // const headResponse = await axios.head(url);
        // const contentLength = headResponse.headers['content-length'];
        // console.log(contentLength)
        // const fileSize = contentLength 

        const duration = parseInt(choosenFormat.approxDurationMs) / 1000
        const fileSize = (choosenFormat.bitrate / 8) * duration;
        const file = {
          format : choosenFormat,
          name : info.videoDetails.title,
          type : 'video', 
          qualityLabel : choosenFormat.qualityLabel,
          url : url,
          size : choosenFormat.contentLength || fileSize,
        } 
        
        res.setHeader('Content-Disposition', `attachment; filename="${getFileName(file.name,file.type)}"`);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', file.size);
        console.log(file);
        
        ytdl(file.url, { format : file.format  }).pipe(res);
      }else res.status(404).send('Video can not be downloadable with ',quality,'quality.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting video information');
  } 
}); 

app.get('/info',async (req, res) => {
  try {
     const { url , type } = req.query;
    
    if (!ytdl.validateURL(url)) {
      const response = `URL: ${url} is an invalid YouTube video/short URL. Please provide a valid YouTube video/short URL.`

      res.json({
        status_code: '404',
        message: 'Invalid YouTube URL',
        error: response,
      });
      return;
    }

    const info = await ytdl.getInfo(url);
    res.json(getInfoRes(info,type)); 
  } catch (error) { 
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching audio info');
  }
}); 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
