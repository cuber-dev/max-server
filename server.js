require('dotenv').config() 
const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs')
const { getInfoRes, getFileName, baseUrl } = require('./utils')
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors') 

app.use(cors({ origin : '*' }))    
app.get('/',(req,res) => {
  res.json({ msg : 'OK' })
})  

app.get('/video', async (req, res) => {
  const { url , quality} = req.query;
  console.log("video request : ",req.query);
  try {
    const info = await ytdl.getInfo(url);
    if(info){
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
      const choosenFormat = formats.find(format => format.qualityLabel === quality);
      if(choosenFormat){ 
        
        // const duration = parseInt(choosenFormat.approxDurationMs) / 1000
        // const fileSize = (choosenFormat.bitrate / 8) * duration;
        const file = {
          format : choosenFormat,
          name : info.videoDetails.title,
          type : 'video', 
          qualityLabel : choosenFormat.qualityLabel,
          url : url,
          size : choosenFormat.contentLength,
        } 
        
        res.setHeader('Content-Disposition', `attachment; filename="${getFileName(file.name,file.type)}"`);
        res.setHeader('Content-Type', 'video/mp4');
        file.size && res.setHeader('Content-Length', file.size);
        console.log('resolved video request for : ',req.query);
        
        ytdl(file.url, { format : file.format  }).pipe(res);
      }else{
        const msg = 'Video can not be downloadable with : ' + req.query;
        console.log(msg); 
        res.status(404).send(msg);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error (500), please try again later!');
  } 
}); 
app.get('/audio', async (req, res) => {
  const { url , size} = req.query;
  console.log("audio request : ",req.query);
  try {
    const info = await ytdl.getInfo(url);
    if(info){
      const formats = ytdl.filterFormats(info.formats, 'audioonly');
      const choosenFormat = formats.find(format => format.contentLength === size);
      if(choosenFormat){ 
        const file = {
          format : choosenFormat,
          name : info.videoDetails.title,
          type : 'audio', 
          qualityLabel : choosenFormat.qualityLabel,
          url : url,
          size : choosenFormat.contentLength,
        } 
        
        res.setHeader('Content-Disposition', `attachment; filename="${getFileName(file.name,file.type)}"`);
        res.setHeader('Content-Type', 'audio/m4a');
        file.size && res.setHeader('Content-Length', file.size);
        console.log('resolved audio request for : ',req.query);
        
        ytdl(file.url, { format : file.format  }).pipe(res);
      }else{
        const msg = 'Audio can not be downloadable with : ' + req.query;
        console.log(msg); 
        res.status(404).send(msg);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error (500), please try again later!');
  } 
}); 
app.get('/info',async (req, res) => {
  try {
     const { url } = req.query;
    console.log("info request : ",url);
    if (!ytdl.validateURL(url)) {
      const response = `URL: ${url} is an invalid YouTube video/short URL. Please provide a valid YouTube video/short URL.`

      res.json({
        status_code: '404',
        message: 'Invalid YouTube URL, cant even get the info!',
        error: response,
      });
      return;
    }

    const info = await ytdl.getInfo(url);
    res.json(getInfoRes(url,info)); 
  } catch (error) { 
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching audio info');
  }
}); 

app.listen(port, () => {
  console.log(`
    Server running on port ${port}, 
    public : ${baseUrl} , 
    local : http://localhost:${port}/`
  );
});
  