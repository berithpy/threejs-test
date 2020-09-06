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
  }

  animEnded(anim) {
    console.log("animation ended", anim);
    //I don't think we need this
    camera.attachControl(canvas, true);
    for (anim of scene.animations) {
      anim.stop();
    }
  }

  targAnimEnded(test) {
    console.log("targAnimEnded:", test);
  }

  camPosAnimEnded(test) {
    console.log("camPosAnimEnded:", test);
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
  }

  animateCamera(cameraPosition, cameraTarget) {
    //this should push to some kind of queue
    this.animateCameraToPosition(
      ANIMATIONSPEED,
      ANIMATIONFRAMES,
      cameraPosition
    );
    this.animateCameraTargetToPosition(
      ANIMATIONSPEED,
      ANIMATIONFRAMES,
      cameraTarget
    );
  }
}
