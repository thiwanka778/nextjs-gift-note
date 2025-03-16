'use client';
import { useState } from "react";

const SuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-xl w-96 text-center">
        <h2 className="text-green-600 text-2xl font-bold">🎉 Success!</h2>
        <p className="text-gray-700 mt-2">
          You have successfully uploaded your <br /> **Gift Note Video Message**! 🎁✨
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Got it! ✅
        </button>
      </div>
    </div>
  );
};


