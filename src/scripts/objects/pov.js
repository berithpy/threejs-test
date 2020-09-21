const DEFAULTSPEED = 45;
const DEFAULTFRAMES = 200;
export default class POV {
  constructor(cameraPosition, targetPosition, speed, frames) {
    const animationSpeed = speed ? speed : DEFAULTSPEED;
    const animationFrames = frames ? frames : DEFAULTFRAMES;
    this.camera = {
      position: cameraPosition,
      speed: animationSpeed,
      frames: animationFrames,
    };
    this.target = {
      position: targetPosition,
      speed: animationSpeed,
      frames: animationFrames,
    };
  }
}
