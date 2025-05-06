import React from "react";
import Webcam from "react-webcam";

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
};

const CameraComponent = () => {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Webcam audio={false} videoConstraints={videoConstraints} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

export default CameraComponent;
