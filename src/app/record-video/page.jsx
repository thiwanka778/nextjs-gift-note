"use client";
import React, { useState, useRef,useEffect, useLayoutEffect } from "react";
import "./recordVideoStyles.css";
import LinkUsedMessage from "@/components/LinkUsedMessage";
import {Suspense} from "react";
import { useSearchParams } from 'next/navigation';
import { nanoid } from "nanoid";
import Webcam from "react-webcam";
import SuccessModal from "@/components/SuccessModal";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useStore } from "@/zustand/useStore";


function RecordVideoMainPage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
          <RecordVideoPage />
      </Suspense>
  );
}


const RecordVideoPage = () => {
    const webcamRef = useRef(null);
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const [showModal, setShowModal] = useState(false);

    const {isUploadingVideo, uploadVideoToFirebaseAPI,videoUploadingErrorMessage,
       videoUploadStatus, alreadyUsed, checkOrderIdExistAPI} = useStore();
    const [maximumVideoLength, setMaximumVideoLength] = useState(30);
    const [videoFile, setVideoFile] = useState(null); 
    const mediaRecorderRef = useRef(null);
    const [open, setOpen] = React.useState(false);
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const intervalRef = useRef(null);

    const handleCloseSuccessModal=()=>{
      setShowModal(false);
    }

    const handleOpenSuccessModal=()=>{
      setShowModal(true);
    }

    useLayoutEffect(()=>{
      checkOrderIdExistAPI(orderId);
    },[orderId]);

    const handleClickOpen = () => {
      setOpen(true);
    };


    const handleVideoSubmitClick=()=>{
       handleClickOpen();
    }
  
    const handleClose = () => {
      setOpen(false);
    };
  
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
        setVideoFile(videoBlob);
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


const handleFileUploadToFirebase = async(file) => {

  
  
  // Get the FileList from the input element
      const currentTimeMillis = new Date().getTime();
      const fileName = `gift-note-video-${nanoid()}-${currentTimeMillis}`;
      const filePath = `gift-note-videos/${fileName}.webm`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filePath', filePath);
      formData.append('orderId', orderId);
      const uploadResponse = await uploadVideoToFirebaseAPI(formData);
      if(uploadResponse.status === 200){
            console.log("Video uploaded successfully");
            handleClose();
            setShowModal(true);
      }else{
        console.log("Video upload failed");
      }
  
  
 
};

if(!alreadyUsed ){
  return (
    <>


   
     <div className="w-full flex flex-col gap-1 min-h-screen p-2 bg-[#030325]">

        <div className="w-full flex justify-center items-center">
          <span className="text-white text-2xl tracking-[0.5px] w-full items-center text-center flex justify-center">
            🎁 Record Your Heartfelt Message 🎥💌</span>
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
        <div className="relative w-fit">
          <button 
        onClick={() => {setVideoPreview(null); 
          if(typeof window !=='undefined'){
            window.location.reload();
          }
          setRecording(false)}} 
         className="absolute z-10 top-0 right-0 cursor-pointer flex items-center justify-center px-3 py-[5px] tracking-[0.5px]
         bg-blue-600 text-white text-xs  rounded-lg shadow-md hover:bg-blue-700 transition active:scale-95"
    >
         😉 Try Again
    </button>

    <video controls className="video-player-styles rounded-lg shadow-lg">
        <source src={videoPreview} type="video/webm" />
        </video>

        </div>
     
        }
       

        </div>



    
      <div className="w-full flex items-center justify-center gap-2">

              {!recording && !videoPreview && 
              <section onClick={startRecording} className="flex items-center active:scale-90 transition-all duration-100
              justify-center p-1 border-2 border-white rounded-full cursor-pointer">
                   <span className="w-5 h-5 bg-[#ff030f] rounded-full">

                   </span>
              </section>}


              {videoPreview && !recording && (
                <div className="w-full flex justify-center items-center gap-2">
                     
            

    <button 
        onClick={handleVideoSubmitClick} 
         className="cursor-pointer flex items-center justify-center px-3 py-[6px] tracking-[0.5px]
         bg-[#05b005] font-serif text-white text-sm  rounded-lg shadow-md hover:bg-[#05b005]/80 transition active:scale-95"
    >
         💌 Submit
    </button>

                </div>
   
   )}


              {recording && !videoPreview && <section onClick={stopRecording} className="flex items-center active:scale-90 transition-all duration-100
              justify-center p-2 border-2  border-white bg-[#ff030f] rounded-full cursor-pointer">
                   <span className="w-4 h-4 bg-white rounded-sm">

                   </span>
              </section>}






              

       

      </div>
        
     </div>

     <Dialog
        open={open}
        // onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-10">
      <div className="bg-[#f7f9ff] rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center animate-scaleIn">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
          🎁 Confirm Video Submission
        </h2>
        <p className="text-gray-600 text-sm mt-2 text-justify">
          📢 <span className="font-medium">Are you sure you want to submit this video? </span>  
          Once submitted, you <span className="font-semibold">won't be able to record another video</span> using this link.  
          This special video message will be sent <span className="font-semibold">directly to your gift recipient</span>. 🎥💌
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <button 
          disabled={isUploadingVideo}
            onClick={handleFileUploadToFirebase}
            className="px-3 font-serif py-[5px] tracking-[0.5px] cursor-pointer text-white bg-[#ff030f] rounded-full text-sm
             shadow-lg hover:bg-red-600 transition-all"
          >
            {isUploadingVideo ? "Uploading..." : "✅ Confirm"}
          </button>
          <button 
            onClick={handleClose}
            className="px-3 py-[5px] font-serif cursor-pointer
             tracking-[0.5px] text-gray-700 bg-gray-200 rounded-full shadow-md
             hover:bg-gray-300 transition-all text-sm border border-gray-300"
          >
            ⏳ Wait
          </button>
        </div>

       {videoUploadStatus === "error" && <div className="w-full text-center text-xs text-[#f7020b] font-bold mt-2">
             {videoUploadingErrorMessage || "Oops! Upload failed! Please try again later."}
        </div>}

  

      </div>
     
    </div>
        </DialogContent>
       
      </Dialog>




      <Dialog
        open={showModal}
        onClose={handleCloseSuccessModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-xl w-96 text-center">
        <h2 className="text-green-600 text-2xl font-bold">🎉 Success!</h2>
        <p className="text-gray-700 mt-2">
          You have successfully uploaded your <br /> **Gift Note Video Message**! 🎁✨
        </p>
        <button
          onClick={handleCloseSuccessModal}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Got it! ✅
        </button>
      </div>
    </div>
        </DialogContent>
       
      </Dialog>



     </>
  );

}else{
  return (
    <LinkUsedMessage />
  );
}
  

  
};

export default RecordVideoMainPage;
