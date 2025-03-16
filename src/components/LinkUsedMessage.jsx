
"use client";
import { useStore } from "@/zustand/useStore";
import LoadingComponent from "./LoadingComponent";

export default function LinkUsedMessage() {
    const {isCheckingOrderIdLoading} = useStore();
    if(isCheckingOrderIdLoading){
        return <LoadingComponent/>;
    }else{
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
          <div className="max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600">⚠️ Link Already Used</h2>
            <p className="text-gray-700 mt-2">
              This link has already been used, and a video message has been successfully uploaded. 
              If you need further assistance, please contact support.
            </p>
          </div>
        </div>
      );
    }
   
  }