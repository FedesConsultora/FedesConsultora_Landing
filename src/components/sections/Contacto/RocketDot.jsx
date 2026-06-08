import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import rocketAnim from "../../../assets/lotties/coheteThankYou.json"; // reuse existing rocket animation

const RocketDot = () => (
  <span className="rocket-dot" aria-hidden="true">
    <Player autoplay loop src={rocketAnim} style={{ width: "20px", height: "20px" }} />
  </span>
);

export default RocketDot;
