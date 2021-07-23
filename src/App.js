import './App.css';
import { Stream } from "@cloudflare/stream-react";
import { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, Box, Grid, AppBar, Toolbar } from '@material-ui/core';

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [videoIds, setVideoIds] = useState([]);

  const loadVideos = async () => {
    const res = await fetch('https://video-helper.trackers.ninja/videos');
    const json = await res.json();
    var ids = [];
    for (let obj of json) {
      console.log(obj.name);
      ids.push(obj.name);
    }
    return ids;
  };

  const updateVideos = () => {
    loadVideos().then((ids) => {
      setVideoIds(ids);
    });
  }

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleUploadSuccess = (uploadUrl) => {
    const uid = uploadUrl.split("/").slice(-1)[0];
    const pollingUrl = `https://video-helper.trackers.ninja/status?uid=${uid}`;
    var repeatingTask = setInterval(() => {
      fetch(pollingUrl).then((res) => {
        res.text().then((isReady) => {
          if (isReady === 'true') {
            console.log("Video is ready to stream.");
            updateVideos();
            clearInterval(repeatingTask);
          }
        });
      });
    }, 500);
  };

  const handleSubmission = () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    fetch('https://video-helper.trackers.ninja/upload')
      .then((response) =>response.text())
      .then((uploadUrl) => {
        console.log("Upload URL is " + uploadUrl);
        fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          }
        )
          .then((result) => {
            console.log('Success:', result);
            // after success, keep polling every one second until video is ready to stream
            handleUploadSuccess(uploadUrl);
          })
          .catch((error) => {
            console.error('Error:', error);
        });
    });
  };

  useEffect(() => {
    // executes when the app first starts
    updateVideos();
  }, []);

  return (
    <div className="App">
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Cloudshare</Typography>
        </Toolbar>
      </AppBar>
      <Grid container spacing={1} direction="row">
        <Grid item xs={3} style={{backgroundColor: '#63d6eb'}}/>
        <Grid container item xs={6} direction="column" alignItems='center' >
          <Box m={6}/>
          <Typography variant="h3">
          Share your video with the community!
          </Typography>
          <Box m={2}/>
          <Card variant='outlined' style={{width: 400}}>
            <CardContent>
              <Typography variant="h5">
              Step one: choose a video file
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                component="label"
              >
                <input type="file" name="file" onChange={changeHandler} />
              </Button>
              {isFilePicked ? (
                <div>
                  <p>Filename: {selectedFile.name}</p>
                  <p>Filetype: {selectedFile.type}</p>
                </div>
              ) : (
                <p>File must be less than 5 min and smaller than 200MB.</p>
              )}
            </CardContent>
          </Card>
          <Card variant='outlined' style={{width: 400}}>
            <CardContent>
              <Typography variant="h5">
                Step two: upload it!
              </Typography>
              <div>
                <Button variant="contained" color="primary" onClick={handleSubmission}>
                  Upload
                </Button>
                <p>This process may take up to a minute...</p>
              </div>
            </CardContent>
          </Card>  
          <Box m={2}/>
          <Typography variant="h5">
            Now, let's watch some relaxing videos shared by others!
          </Typography>
          <div style={{width: '60%', display: 'inline-block'}}>
            {
              videoIds.map((uid) => (
                <Card style={{margin: 20}}>
                  <iframe
                    src={"https://iframe.videodelivery.net/" + uid}
                    height="300"
                    width="500"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowfullscreen={false}
                  ></iframe>
                </Card>
              ))
            }
          </div>
        </Grid>
        <Grid item xs={3} style={{backgroundColor: '#63d6eb'}}/>
      </Grid>
    </div>
  );
}

export default App;
