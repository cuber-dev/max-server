const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs')
const userQueries = Array.from(require('./static/userQueries.json'))
const { getInfoRes } = require('./utils')
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors') 

app.use(cors({ origin : '*' }))    

app.get('/',(req,res) => {
  res.json({ msg : 'OK' })
})  

app.get('/video', async (req, res) => {
  const { url , quality} = req.query;
  console.log("request : ",url)
  try {
    const  info = await ytdl.getBasicInfo(url);
    if(info){
        const fileSize = parseInt(info.videoDetails.lengthSeconds) * parseInt(info.videoDetails.averageBitrate) / 8;

        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', fileSize);
        console.log("file size : ",fileSize);
      
        ytdl(url, { height : quality }).pipe(res);
        res.json(info);
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
