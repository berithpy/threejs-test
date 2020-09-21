export default class TargetableManager {
  constructor(scene, cameraManager, homePOV, highlightLayer) {
    this.scene = scene;
    this.highlightLayer = highlightLayer;
    this.cameraManager = cameraManager;
    this.targets = { home: homePOV };
    this.currentTarget = "";
    this.setTarget("home");
  }
  addTarget(key, value) {
    this.targets[key] = value;
  }
  getTarget(key) {
    return this.targets[key];
  }
  setTarget(key) {
    const targetKey = key === this.currentTarget ? "home" : key;
    this.currentTarget = targetKey;
    this.cameraManager.animateToTarget(this.targets[targetKey]);
  }
}
