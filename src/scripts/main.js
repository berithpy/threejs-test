import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";

import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";

import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { GridMaterial } from "@babylonjs/materials/grid";

import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core";
import ElementManager from "./managers/elementManager";
import "../styles/index.scss";
import CameraManager from "./managers/cameraManager";
import TargetManager from "./managers/targetManager";
import POV from "./objects/pov";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

const elements = new ElementManager([
  "infoParagraph1",
  "debug",
  "debugCamera",
  "testButton",
]);

const infoElement = elements.get("infoParagraph1");
const debugElement = elements.get("debug");
const cameraPositionDebugElement = elements.get("debugCamera");
const testButton = elements.get("testButton");

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas");

// Associate a Babylon Engine to it.
const engine = new Engine(canvas, true, { stencil: true });

// Create our first scene.
var scene = new Scene(engine);
scene.clearColor = new Color3(0.3, 0.5, 0.8);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
const light = new HemisphericLight("light1", new Vector3(0, 3, 0), scene);
const light2 = new HemisphericLight("light2", new Vector3(0, 5, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 1;

// This creates and positions the camera
/**
 * Alpha:8.862160309140117
 * beta:1.2042576861967587
 * radius:5.226759349093842
 * GP:{X: -3.9250482511266886 Y:2.332834600993618 Z:2.4499805763462303}
 */
var camera = new ArcRotateCamera(
  "camera1",
  8.862160309140117,
  1.2042576861967587,
  4.226759349093842,
  new Vector3(0, 0, 0),
  scene
);
// This targets the camera to scene origin
camera.setTarget(new Vector3(0, 0, 0));
// This attaches the camera to the canvas
camera.attachControl(canvas, true);

const highlightLayer = new HighlightLayer("highlightLayer", scene);

//Should the camera manager create the camera?
const cameraManager = new CameraManager(scene, camera);

const homePOV = new POV(
  new Vector3(-3.9250482511266886, 2.332834600993618, 2.4499805763462303),
  new Vector3(0, 0, 0)
);

const monitorPOV = new POV(
  new Vector3(-0.6273243739201747, 1.5740085977648293, 0.5156315816511976),
  new Vector3(1.1691228052256966, 0.3696672344653039, -0.37055848692617843)
);

const targetManager = new TargetManager(
  scene,
  cameraManager,
  homePOV,
  highlightLayer
);

targetManager.addTarget("MonitorScreen_primitive1", monitorPOV);
targetManager.addTarget("MonitorScreen_primitive0", monitorPOV);

//Do we need to load it as a scene?
SceneLoader.Append(
  "./public/assets/models/",
  "office.glb",
  scene,
  function () {}
);

const animateToHome = function () {
  targetManager.setTarget("home");
};

testButton.setOnClick(animateToHome);

// All this will be done in the targetableManager
scene.onPointerObservable.add((pointerInfo) => {
  switch (pointerInfo.type) {
    case PointerEventTypes.POINTERMOVE:
      cameraPositionDebugElement.innerText = `Alpha:${camera.alpha} \n beta:${camera.beta}\n radius:${camera.radius}\n GP:${camera.globalPosition}`;
      break;
    case PointerEventTypes.POINTERPICK:
      const pickedMesh = pointerInfo.pickInfo.pickedMesh;

      // This should only happen for meshes with povs in targets
      if (pickedMesh.name in targetManager.targets) {
        const objectCamera = new Vector3();
        objectCamera.copyFrom(pickedMesh.position);
        debugElement.innerText = `pickedMesh position ${
          pickedMesh.position
        } objectCamera position ${
          (objectCamera.x, objectCamera.y, objectCamera.z)
        }`;

        // Most meshes have parents
        // Having metadata it means that the parent is a TransformNode
        // otherwise the the parent is a mesh which makes everything
        // highlighted
        // checks if the mesh is already in the highlight layer, if it is
        // it removes the highlight otherwise, it sets the highlight
        infoElement.setContent(pickedMesh.name);
        targetManager.setTarget(pickedMesh.name);
        if (pickedMesh.parent && pickedMesh.parent.metadata != null) {
          pickedMesh.parent.getChildMeshes().forEach((mesh) => {
            if (highlightLayer.hasMesh(mesh)) {
              highlightLayer.removeMesh(mesh);
              // animateToHome();
            } else {
              highlightLayer.addMesh(mesh, Color3.White());
            }
          });
        } else {
          if (highlightLayer.hasMesh(pickedMesh)) {
            highlightLayer.removeMesh(pickedMesh);
          } else {
            highlightLayer.addMesh(pickedMesh, Color3.White());
          }
        }
      }

      break;
  }
});

engine.runRenderLoop(() => {
  // We should probably add the main.update here,
  // or any update for any class we want to call on every frame,
  // Maybe a targetable update?
  scene.render();
  cameraManager.update();
});
