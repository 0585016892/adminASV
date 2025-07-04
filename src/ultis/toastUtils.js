// src/utils/toastUtils.js
import { toast } from "react-hot-toast";
import { AiOutlineCheckCircle ,AiOutlineCloseCircle} from "react-icons/ai";
import React from "react";

export const showSuccessToast = (title, message) => {
    toast.custom((t) => (
      <div
         className={`bg-white text-dark rounded-lg shadow-md p-3 w-[320px] ${
        t.visible ? "animate-enter" : "animate-leave"
        }`}
        style={{
          borderLeft: "4px solid #22c55e",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          position: "relative",
            overflow: "hidden",
            boxShadow:'grey',
        }}
      >
        <AiOutlineCheckCircle size={24} color="#22c55e" />
        <div style={{ flex: 1 }}>
            <strong className="text-black">{title}</strong>
            <div className="text-sm text-gray-300">{message}</div>
        </div>
  
        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "4px",
            width: "100%",
            backgroundColor: "#22c55e",
            animation: "progressSlide 4s linear forwards",
          }}
        />
      </div>
    ));
  };
export const showErrorToast = (title, message) => {
    toast.custom((t) => (
      <div
        className={`bg-white text-dark rounded-lg shadow-md p-3 w-[320px] ${
        t.visible ? "animate-enter" : "animate-leave"
        }`}
        style={{
          borderLeft: '4px solid #ef4444',
          display: "flex",
          gap: "12px",
          alignItems: "center",
          position: "relative",
            overflow: "hidden",
            boxShadow:'grey',
        }}
      >
        <AiOutlineCloseCircle size={24} color="#ef4444" />
        <div>
          <strong className="text-white">{title}</strong>
          <div className="text-sm text-gray-300">{message}</div>
            </div>
            <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "4px",
            width: "100%",
            backgroundColor: "#22c55e",
            animation: "progressSlide 4s linear forwards",
          }}
        />
      </div>
    ));
  };
  