"use client";
import { useState, useRef } from "react";
import Webcam from "react-webcam";

const RecordVideoPage = () => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
  
    const startRecording = () => {
      setRecording(true);
      setTime(0);
  
      // Start timer
      const id = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
  
      // Start recording
      const stream = webcamRef.current.stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
    };
  

  return (
     <div className="w-full min-h-screen p-2 bg-[#272729]">
        <div className="w-full flex justify-center">

        <Webcam 
        ref={webcamRef}
        className="rounded-lg"

        audio={true} 
          videoConstraints={{
            facingMode: "user"
          }}
          />

        </div>


        <p className="mt-2 text-xl font-semibold">
          {new Date(time * 1000).toISOString().slice(11, 19)}
        </p>

      <button
        onClick={startRecording}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Start Recording
      </button>

      <div className="w-full flex items-center justify-center gap-2">
            
      </div>
        
     </div>
  );
};

export default RecordVideoPage;
