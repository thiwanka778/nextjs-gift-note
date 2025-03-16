"use client";
const LoadingComponent = () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 text-lg font-semibold">Loading, please wait...</p>
        </div>
      </div>
    );
  };
  
  export default LoadingComponent;