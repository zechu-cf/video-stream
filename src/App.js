import './App.css';
import { Stream } from "@cloudflare/stream-react";
import { useState } from 'react';

function App() {
  const videoIdOrSignedUrl = "3477b2b4398bf9c1fb32cda0a21f0061";

  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);

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
          })
          .catch((error) => {
            console.error('Error:', error);
        });
    });
  };

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
        <Stream controls src={videoIdOrSignedUrl}/>
      </div>
    </div>
  );
}

export default App;
