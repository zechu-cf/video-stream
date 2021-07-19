import './App.css';
import { Stream } from "@cloudflare/stream-react";

function App() {
  const videoIdOrSignedUrl = "3477b2b4398bf9c1fb32cda0a21f0061";

  return (
    <div className="App">
      <h1>Let's watch a relaxing video!</h1>
      <Stream controls src={videoIdOrSignedUrl} />
    </div>
  );
}

export default App;
