const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs')
const userQueries = Array.from(require('./public/static/userQueries.json'))
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors')


app.use(cors({
  origin: '*' 
}))   
app.use(express.static('public'));

 
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
    fs.writeFileSync('./public/static/userQueries.json', JSON.stringify(userQueries)) 
    console.log("Total requests : ",userQueries.length)
    next();
}

// route done
app.get('/getVideoInfo',storeUserQuery, async (req, res) => {
  try {
     const { url , type } = req.query;
    
    if (!ytdl.validateURL(url)) {
      res.json({
        error: 'Invalid YouTube URL'
      });
      return;
    }

    const info = await ytdl.getInfo(url);
    const response = {
      videoDetails : info.videoDetails,
      generalInfo : {
        title : info.videoDetails.title,
        fileName : `${sanitizeFilename(info.videoDetails.title)} - [MAX] - .${type === 'audio' ? 'm4a' : 'mp4'}`,
      },
    } 
    res.json(response); 
  } catch (error) { 
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching audio info');
  }
}); 


// quality in progress
app.get('/download/video', async (req, res) => {
  try {
    const { url, pixels } = req.query;
    console.log(url, pixels, 'video');
    // Validate the YouTube URL
    if (!ytdl.validateURL(url)) {
      res.json({
        error: 'Invalid YouTube URL'
      });
      return;
    } 

    // Get available formats for the video
    const info = await ytdl.getInfo(url);
    let formats = ytdl.filterFormats(info.formats, 'audioandvideo');

    // Convert the "pixels" parameter to a numeric value
    const desiredPixels = parseInt(pixels);

    // Sort the formats based on quality in descending order
    formats.sort((a, b) => parseInt(b.qualityLabel) - parseInt(a.qualityLabel));

    // Find the desired format based on the pixels value
    let formatToDownload;
    for (const format of formats) {
      const formatPixels = parseInt(format.qualityLabel);
      if (!isNaN(formatPixels) && formatPixels <= desiredPixels) {
        formatToDownload = format;
        break;
      }
    }   

    // If no format is found (desiredPixels is too low), use the lowest available format
    if (!formatToDownload) {
      formatToDownload = formats[0];
    }

    // Set response headers for the file download
    res.header('Content-Disposition', `attachment; filename="${sanitizeFilename(info.videoDetails.title)}.${formatToDownload.container}"`);
    res.header('Content-Type', formatToDownload.mimeType);

    // Pipe the video stream to the response
    ytdl(url, { format: formatToDownload }).pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching video');
  } 
});


// route done
app.get('/download/audio', async (req, res) => {
  try {
    const { url } = req.query;
    console.log(url , 'audio')
    // Validate the YouTube URL
    if (!ytdl.validateURL(url)) {  
      res.json({
        error: 'Invalid YouTube URL'
      });
      return;  
    }   

    // Get available formats for the audio
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'audioonly');

    // Select the desired format (e.g., highest quality)
    const selectedFormat = formats[0];

    // Set response headers for the file download
    res.header('Content-Disposition', `attachment; filename="${sanitizeFilename(info.videoDetails.title)} - [MAX] - .m4a"`);
    res.header('Content-Type', 'audio/m4a'); 
    // Pipe the audio stream to the response
    ytdl(url, { format: selectedFormat }).pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching audio');
  }  
});  


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
