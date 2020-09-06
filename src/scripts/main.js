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
const defaultCameraPosition = new Vector3(
  -3.9250482511266886,
  2.332834600993618,
  2.4499805763462303
);
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
// camera.inputs.addGamepad();

//Should the camera manager create the camera?
const cameraManager = new CameraManager(scene, camera);

SceneLoader.Append(
  "./public/assets/models/",
  "office.glb",
  scene,
  function () {}
);

// Do we need a function that does this?
// Should we add every param?
// Also, do we need a queue for this?
// Should we have a config with known poses(both position and target) based on clicked item?

const animateToHome = function () {
  cameraManager.animateCamera(defaultCameraPosition, new Vector3(0, 0, 0));
};

const animateToMonitor = function () {
  console.log("asd");
  const cameraPosition = new Vector3(
    -0.6273243739201747,
    1.5740085977648293,
    0.5156315816511976
  );
  const cameraTarget = new Vector3(
    1.1691228052256966,
    0.3696672344653039,
    -0.37055848692617843
  );
  cameraManager.animateCamera(cameraPosition, cameraTarget);
};
testButton.setOnClick(animateToHome);

var highlightLayer = new HighlightLayer("highlightLayer", scene);
// This will be done in the targetableManager
const whitelist = ["MonitorScreen_primitive1", "MonitorScreen_primitive0"];
scene.onPointerObservable.add((pointerInfo) => {
  switch (pointerInfo.type) {
    case PointerEventTypes.POINTERMOVE:
      cameraPositionDebugElement.innerText = `Alpha:${camera.alpha} \n beta:${camera.beta}\n radius:${camera.radius}\n GP:${camera.globalPosition}`;
      break;
    case PointerEventTypes.POINTERPICK:
      const pickedMesh = pointerInfo.pickInfo.pickedMesh;

      // This should only happen for whitelisted elements
      if (whitelist.includes(pickedMesh.name)) {
        const objectCamera = new Vector3();
        objectCamera.copyFrom(pickedMesh.position);
        debugElement.innerText = `pickedMesh position ${
          pickedMesh.position
        } objectCamera position ${
          (objectCamera.x, objectCamera.y, objectCamera.z)
        }`;
        /**
         *  Alpha:2.7085872007963125
         *  beta:1.0731817239502128
         *  radius:1.4379025790837194
         *  GP:{X: -0.6273243739201747 Y:1.5740085977648293 Z:0.5156315816511976}
         */

        // Most meshes have parents
        // Having metadata it means that the parent is a TransformNode
        // otherwise the the parent is a mesh which makes everything
        // highlighted
        // checks if the mesh is already in the highlight layer, if it is
        // it removes the highlight otherwise, it sets the highlight
        infoElement.setContent(pickedMesh.name);
        if (pickedMesh.parent && pickedMesh.parent.metadata != null) {
          pickedMesh.parent.getChildMeshes().forEach((mesh) => {
            if (highlightLayer.hasMesh(mesh)) {
              highlightLayer.removeMesh(mesh);
              animateToHome();
            } else {
              highlightLayer.addMesh(mesh, Color3.White());
              if (
                pickedMesh.name === "MonitorScreen_primitive1" ||
                pickedMesh.name === "MonitorScreen_primitive0"
              ) {
                animateToMonitor();
              }
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

// Render every frame
let reverse = false;
engine.runRenderLoop(() => {
  // if (pilot.position.x > 1 && reverse === false) {
  //   reverse = true;
  // } else if (pilot.position.x < -1) {
  //   reverse = false;
  // }
  // pilot.position.x = reverse
  //   ? pilot.position.x - 0.05
  //   : pilot.position.x + 0.05;
  // pilot.rotation.x = pilot.rotation.x + 0.1;
  // pilot.rotation.y = pilot.rotation.y + 0.1;
  // pilot.rotation.z = pilot.rotation.z + 0.1;
  scene.render();
});
