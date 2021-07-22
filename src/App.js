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

    formData.append('File', selectedFile);

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
          .then((response) => response.json())
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
      <h1>Let's watch a relaxing video!</h1>
      <Stream controls src={videoIdOrSignedUrl} />
      <h1>Upload your own video here</h1>
      <div>
			  <input type="file" name="file" onChange={changeHandler} />
			  {isFilePicked ? (
				  <div>
            <p>Filename: {selectedFile.name}</p>
            <p>Filetype: {selectedFile.type}</p>
            <p>Size in bytes: {selectedFile.size}</p>
            <p>
              lastModifiedDate:{' '}
              {selectedFile.lastModifiedDate.toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p>Select a file to show details</p>
        )}
        <div>
          <button onClick={handleSubmission}>Submit</button>
        </div>
      </div>
    </div>
  );
}

export default App;
