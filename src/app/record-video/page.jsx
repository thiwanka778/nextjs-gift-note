"use client";
import { useState, useRef,useEffect } from "react";
import Webcam from "react-webcam";
import "./recordVideoStyles.css";

const RecordVideoPage = () => {
    const webcamRef = useRef(null);
    const [maximumVideoLength, setMaximumVideoLength] = useState(30);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const intervalRef = useRef(null);
  
    const startRecording = () => {
      setVideoPreview(null);
      setRecording(true);
      setTime(0); // Reset time

      // Clear existing interval if any (prevents multiple intervals)
      if (intervalRef.current) {
          clearInterval(intervalRef.current);
      }

      // Start timer
      // Start timer
    intervalRef.current = setInterval(() => {
      setTime((prev) => {
          if (prev + 1 >= maximumVideoLength) {
              stopRecording(); // Auto-stop when time reaches max
          }
          return prev + 1;
      });
  }, 1000);

      // Start recording
      const stream = webcamRef.current.stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);

    // Stop timer
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.ondataavailable = (event) => {
        const videoBlob = new Blob([event.data], { type: "video/webm" });
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoPreview(videoUrl); // Store video for preview
    };
};

   // Cleanup interval when component unmounts or recording stops
   useEffect(() => {
    setVideoPreview(null);
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
}, []);

// Format time properly (fixes 00:01:01 issue)
const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
};
  

  return (
     <div className="w-full flex flex-col gap-2 min-h-screen p-2 bg-[#030325]">

        <div className="w-full flex justify-center items-center">
          <span className="text-white text-2xl tracking-[0.5px]">🎁 Record Your Heartfelt Message 🎥💌</span>
        </div>


        <div className="w-full flex justify-center">

         
      {!videoPreview && <div className="w-fit flex flex-col gap-1">


      {recording && 
       <div className="w-full items-center flex justify-end gap-2">
        
         <span className=" text-white text-sm font-semibold">
             {formatTime(time)}
        </span> 
                   <span className="recording-indicator"></span>
          </div>}
       <Webcam 
        ref={webcamRef}
        className="rounded-lg"

        audio={true} 
          videoConstraints={{
            facingMode: "user"
          }}
          />
        </div> }    


        {videoPreview &&
        <video controls className="video-player-styles rounded-lg shadow-lg">
        <source src={videoPreview} type="video/webm" />
        </video>
        }
       

        </div>



    
      <div className="w-full flex items-center justify-center gap-2 mt-2">

              {!recording && !videoPreview && 
              <section onClick={startRecording} className="flex items-center active:scale-90 transition-all duration-100
              justify-center p-1 border-2 border-white rounded-full cursor-pointer">
                   <span className="w-5 h-5 bg-[#ff030f] rounded-full">

                   </span>
              </section>}


              {videoPreview && !recording && (
    <button 
        onClick={() => {setVideoPreview(null); setRecording(false)}} 
        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition active:scale-95"
    >
         😉 Try Again
    </button>
   )}





              {recording && !videoPreview && <section onClick={stopRecording} className="flex items-center active:scale-90 transition-all duration-100
              justify-center p-2 border-2  border-white bg-[#ff030f] rounded-full cursor-pointer">
                   <span className="w-4 h-4 bg-white rounded-sm">

                   </span>
              </section>}






              

       

      </div>
        
     </div>
  );
};

export default RecordVideoPage;
