import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";

import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";

import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/loaders/glTF";
import { GridMaterial } from "@babylonjs/materials/grid";

import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF/glTFFileLoader";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core";
// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas");

// Associate a Babylon Engine to it.
const engine = new Engine(canvas, true, { stencil: true });

// Create our first scene.
var scene = new Scene(engine);

// This creates and positions the camera
var camera = new ArcRotateCamera(
  "camera1",
  0,
  0,
  0,
  new Vector3(0, 5, -10),
  scene
);
// var camera = new UniversalCamera(
//   "UniversalCamera",
//   new Vector3(0, 0, -10),
//   scene
// );
// This targets the camera to scene origin
camera.setTarget(Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new HemisphericLight("light1", new Vector3(0, 3, 0), scene);
var light2 = new HemisphericLight("light1", new Vector3(0, 5, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 1;

// Create a grid material
// var material = new GridMaterial("grid", scene);

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
// var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);

// Move the sphere upward 1/2 its height
// sphere.position.y = 2;

// Affect a material
// sphere.material = material;
// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
// var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);

// Affect a material
// ground.material = material;

// var myBox = MeshBuilder.CreateBox(
//   "myBox",
//   { height: 0.1, width: 2, depth: 0.5 },
//   scene
// );

// var body = MeshBuilder.CreateCylinder(
//   "body",
//   {
//     height: 0.75,
//     diameterTop: 0.2,
//     diameterBottom: 0.5,
//     tessellation: 6,
//     subdivisions: 1,
//   },
//   scene
// );
// var arm = MeshBuilder.CreateBox(
//   "arm",
//   { height: 0.75, width: 0.3, depth: 0.1875 },
//   scene
// );
// arm.position.x = 0.125;
// var pilot = Mesh.MergeMeshes([body, arm], true);
// let [alpha, beta, gamma] = [0, 0, 1];
// pilot.rotation.x = alpha;

SceneLoader.Append("./public/assets/models/", "office.glb", scene, function (
  scene
) {
  // Create a default arc rotate camera and light.
  // scene.createDefaultCameraOrLight(true, true, true);
  // The default camera looks at the back of the asset.
  // Rotate the camera by 180 degrees to the front of the asset.
  scene.activeCamera.alpha += Math.PI;
});

var highlightLayer = new HighlightLayer("highlightLayer", scene);

scene.onPointerObservable.add((pointerInfo) => {
  switch (pointerInfo.type) {
    case PointerEventTypes.POINTERDOWN:
      break;
    case PointerEventTypes.POINTERMOVE:
      break;
    case PointerEventTypes.POINTERPICK:
      const pickedMesh = pointerInfo.pickInfo.pickedMesh;
      if (pickedMesh.parent && pickedMesh.parent.metadata != null) {
        pickedMesh.parent.getChildMeshes().forEach((mesh) => {
          if (highlightLayer.hasMesh(mesh)) {
            highlightLayer.removeMesh(mesh);
          } else {
            highlightLayer.addMesh(mesh, Color3.White());
          }
        });
      } else {
        // hl is the highlight layer
        // This checks if the mesh is already in the highlight layer
        if (highlightLayer.hasMesh(pickedMesh)) {
          highlightLayer.removeMesh(pickedMesh);
        } else {
          highlightLayer.addMesh(pickedMesh, Color3.White());
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
