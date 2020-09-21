import { EasingFunction, CubicEase } from "@babylonjs/core/Animations/easing";
import { Animation } from "@babylonjs/core/Animations";
const ANIMATIONSPEED = 45;
const ANIMATIONFRAMES = 200;

export default class CameraManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.activeCamera = camera;
    this.cameras = [camera];
    this.queue = [];
    this.animatingTarget = false;
    this.animatingCamera = false;
  }

  targAnimEnded() {
    this.animatingTarget = false;
  }

  camPosAnimEnded() {
    this.animatingCamera = false;
  }

  animateCameraTargetToPosition(speed, frameCount, newPos) {
    let ease = new CubicEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    let aable1 = Animation.CreateAndStartAnimation(
      "targetAnimation",
      this.activeCamera,
      "target",
      speed,
      frameCount,
      this.activeCamera.target,
      newPos,
      0,
      ease,
      this.targAnimEnded
    );
    aable1.disposeOnEnd = true;
    aable1.waitAsync().finally(() => {
      this.animatingTarget = false;
    });
  }

  animateCameraToPosition(speed, frameCount, position) {
    let ease = new CubicEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    let aable2 = Animation.CreateAndStartAnimation(
      "objectAnimation",
      this.activeCamera,
      "position",
      speed,
      frameCount,
      this.activeCamera.position,
      position,
      0,
      ease,
      this.camPosAnimEnded
    );
    aable2.disposeOnEnd = true;
    aable2.waitAsync().finally(() => {
      this.animatingCamera = false;
    });
  }

  animateCamera(
    cameraPosition,
    cameraSpeed,
    cameraFrames,
    tgtPosition,
    tgtSpeed,
    tgtFrames
  ) {
    this.animateCameraToPosition(cameraSpeed, cameraFrames, cameraPosition);
    this.animateCameraTargetToPosition(tgtSpeed, tgtFrames, tgtPosition);
  }

  animateToTarget(pov) {
    this.queue.push(pov);
  }

  moveQueue() {
    const pov = this.queue.shift();
    console.log(pov);
    this.animateCamera(
      pov.camera.position,
      pov.camera.speed,
      pov.camera.frames,
      pov.target.position,
      pov.target.speed,
      pov.target.frames
    );
  }

  update() {
    // console.log(this.queue);
    // console.log(this.animatingTarget);
    // console.log(this.animatingCamera);
    if (this.queue.length != 0) {
      if (!this.animatingTarget && !this.animatingCamera) {
        this.moveQueue();
        this.animatingCamera = true;
        this.animatingTarget = true;
      }
    }
  }
}
