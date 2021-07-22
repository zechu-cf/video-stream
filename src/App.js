import './App.css';
import { Stream } from "@cloudflare/stream-react";
import { useState, useEffect } from 'react';

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
      console.log("setVideoIds called!");
      setVideoIds(ids);
    });
  }

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    fetch('https://video-helper.trackers.ninja/upload')
      .then((response) =>response.text())
      .then((uploadUrl) => {
        console.log("Upload URL is " + uploadUrl);
        fetch(
          uploadUrl,
          {
            method: 'POST',
            body: formData,
          }
        )
          .then((result) => {
            console.log('Success:', result);
            // after success, keep polling every one second until video is ready to stream
            const uid = uploadUrl.split("/").slice(-1)[0];
            const pollingUrl = `https://video-helper.trackers.ninja/status?uid=${uid}`;
            var repeatingTask = setInterval(() => {
              fetch(pollingUrl).then((res) => {
                res.text().then((isReady) => {
                  if (isReady === 'true') {
                    console.log("isready!!!");
                    updateVideos();
                    clearInterval(repeatingTask);
                  }
                });
              });
            }, 500);
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
      <h1>Share your video with the community!</h1>
      <h2>Step one: choose a video file</h2>
      <div>
			  <input type="file" name="file" onChange={changeHandler} />
			  {isFilePicked ? (
				  <div>
            <p>Filename: {selectedFile.name}</p>
            <p>Filetype: {selectedFile.type}</p>
          </div>
        ) : (
          <p>The video file must be less than 5 min and smaller than 200MB.</p>
        )}
        <h2>Step two: upload it!</h2>
        <div>
          <button onClick={handleSubmission}>Upload</button>
          <p>This process may take up to a minute.</p>
        </div>
      </div>
      <h1>Now, let's watch some relaxing videos shared by others!</h1>
      <div style={{width: '30%', display: 'inline-block'}}>
        {
          videoIds.map((uid) => (<Stream controls src={uid} key={uid}/>))
        }
      </div>
    </div>
  );
}

export default App;
