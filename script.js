import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from "./node_modules/three/examples/jsm/controls/TransformControls.js";
import { GUI } from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";
import { GLTFExporter } from "./node_modules/three/examples/jsm/exporters/GLTFExporter.js";
import { OutlinePass } from "./node_modules/three/examples/jsm/postprocessing/OutlinePass.js";
import { EffectComposer } from "./node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./node_modules/three/examples/jsm/postprocessing/RenderPass.js";

// scene, camera, renderer
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);
scene.background = new THREE.Color(0x111111);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
document
    .getElementById("canvas-container")
    .appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
outlinePass.edgeStrength = 4.0;
outlinePass.edgeThickness = 0.1;
outlinePass.pulsePeriod = 0;
outlinePass.visibleEdgeColor.set("#FEEB18");
outlinePass.hiddenEdgeColor.set("#FEEB18");
composer.addPass(outlinePass);

const controls = new OrbitControls(camera, renderer.domElement);
const initialCameraPosition = new THREE.Vector3(0, 2, 5);
camera.position.copy(initialCameraPosition);
controls.target.set(0, 0, 0);
controls.update();

const transformControls = new TransformControls(
    camera,
    renderer.domElement
);
scene.add(transformControls);
transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
scene.add(lightHelper);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
const objects = [];
const gltfLoader = new GLTFLoader();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

function updateSlidersForSelectedObject() {
    if (selectedObject) {
        document.getElementById("positionX").value =
            selectedObject.position.x;
        document.getElementById("positionXValue").value =
            selectedObject.position.x;
        document.getElementById("positionY").value =
            selectedObject.position.y;
        document.getElementById("positionYValue").value =
            selectedObject.position.y;
        document.getElementById("positionZ").value =
            selectedObject.position.z;
        document.getElementById("positionZValue").value =
            selectedObject.position.z;

        document.getElementById("scaleX").value = selectedObject.scale.x;
        document.getElementById("scaleXValue").value = selectedObject.scale.x;
        document.getElementById("scaleY").value = selectedObject.scale.y;
        document.getElementById("scaleYValue").value = selectedObject.scale.y;
        document.getElementById("scaleZ").value = selectedObject.scale.z;
        document.getElementById("scaleZValue").value = selectedObject.scale.z;

        document.getElementById("rotateX").value = THREE.MathUtils.radToDeg(
            selectedObject.rotation.x
        );
        document.getElementById("rotateXValue").value =
            THREE.MathUtils.radToDeg(selectedObject.rotation.x);
        document.getElementById("rotateY").value = THREE.MathUtils.radToDeg(
            selectedObject.rotation.y
        );
        document.getElementById("rotateYValue").value =
            THREE.MathUtils.radToDeg(selectedObject.rotation.y);
        document.getElementById("rotateZ").value = THREE.MathUtils.radToDeg(
            selectedObject.rotation.z
        );
        document.getElementById("rotateZValue").value =
            THREE.MathUtils.radToDeg(selectedObject.rotation.z);
    }
}

function setupSliderListeners() {
    document
        .getElementById("positionX")
        .addEventListener("input", (event) => {
            if (selectedObject) {
                selectedObject.position.x = parseFloat(event.target.value);
                document.getElementById("positionXValue").value =
                    event.target.value;
            }
        });

    document
        .getElementById("positionY")
        .addEventListener("input", (event) => {
            if (selectedObject) {
                selectedObject.position.y = parseFloat(event.target.value);
                document.getElementById("positionYValue").value =
                    event.target.value;
            }
        });

    document
        .getElementById("positionZ")
        .addEventListener("input", (event) => {
            if (selectedObject) {
                selectedObject.position.z = parseFloat(event.target.value);
                document.getElementById("positionZValue").value =
                    event.target.value;
            }
        });

    document.getElementById("scaleX").addEventListener("input", (event) => {
        if (selectedObject) {
            selectedObject.scale.x = parseFloat(event.target.value);
            document.getElementById("scaleXValue").value = event.target.value;
        }
    });

    document.getElementById("scaleY").addEventListener("input", (event) => {
        if (selectedObject) {
            selectedObject.scale.y = parseFloat(event.target.value);
            document.getElementById("scaleYValue").value = event.target.value;
        }
    });

    document.getElementById("scaleZ").addEventListener("input", (event) => {
        if (selectedObject) {
            selectedObject.scale.z = parseFloat(event.target.value);
            document.getElementById("scaleZValue").value = event.target.value;
        }
    });

    document
        .getElementById("rotateX")
        .addEventListener("input", (event) => {
            if (selectedObject) {
                selectedObject.rotation.x = THREE.MathUtils.degToRad(
                    parseFloat(event.target.value)
                );
                document.getElementById("rotateXValue").value =
                    event.target.value;
            }
        });

    document
        .getElementById("rotateY")
        .addEventListener("input", (event) => {
            if (selectedObject) {
                selectedObject.rotation.y = THREE.MathUtils.degToRad(
                    parseFloat(event.target.value)
                );
                document.getElementById("rotateYValue").value =
                    event.target.value;
            }
        });

    document
        .getElementById("rotateZ")
        .addEventListener("input", (event) => {
            if (selectedObject) {
                selectedObject.rotation.z = THREE.MathUtils.degToRad(
                    parseFloat(event.target.value)
                );
                document.getElementById("rotateZValue").value =
                    event.target.value;
            }
        });
}

setupSliderListeners();

function setupColorPicker() {
    const colorPicker = document.getElementById("colorPicker");

    colorPicker.addEventListener("input", (event) => {
        if (selectedObject) {
            selectedObject.material.color.set(event.target.value);
        }
    });
}

setupColorPicker();

function updateColorPicker(color) {
    const colorPicker = document.getElementById("colorPicker");
    colorPicker.value = `#${color.getHexString()}`;
}

function updateColorPickerForSelectedObject() {
    if (
        selectedObject &&
        selectedObject.material &&
        selectedObject.material.color
    ) {
        const colorPicker = document.getElementById("colorPicker");
        colorPicker.value = `#${selectedObject.material.color.getHexString()}`;
    }
}

let undoStack = [];
let redoStack = [];

function recordAction(action) {
    if (action && action.execute && action.undo) {
        undoStack.push(action);
        redoStack = [];
    }
}

function createTransformAction(object, oldTransform, newTransform) {
    return {
        type: "transform",
        object: object,
        oldTransform: { ...oldTransform },
        newTransform: { ...newTransform },
        execute: () => {
            object.position.copy(newTransform.position);
            object.rotation.copy(newTransform.rotation);
            object.scale.copy(newTransform.scale);
        },
        undo: () => {
            object.position.copy(oldTransform.position);
            object.rotation.copy(oldTransform.rotation);
            object.scale.copy(oldTransform.scale);
        },
    };
}

let activeTransform = null;

transformControls.addEventListener("mouseDown", () => {
    if (selectedObject) {
        activeTransform = {
            position: selectedObject.position.clone(),
            rotation: selectedObject.rotation.clone(),
            scale: selectedObject.scale.clone(),
        };
    }
});

transformControls.addEventListener("mouseUp", () => {
    if (selectedObject && activeTransform) {
        const newTransform = {
            position: selectedObject.position.clone(),
            rotation: selectedObject.rotation.clone(),
            scale: selectedObject.scale.clone(),
        };

        const action = createTransformAction(selectedObject, activeTransform, newTransform);
        recordAction(action);

        activeTransform = null;
    }
});

function undo() {
    if (undoStack.length > 0) {
        const action = undoStack.pop();
        action.undo();
        redoStack.push(action);
    } else {
        console.log("No actions to undo");
    }
}

function redo() {
    if (redoStack.length > 0) {
        const action = redoStack.pop();
        action.execute();
        undoStack.push(action);
    } else {
        console.log("No actions to redo");
    }
}


const params = {
    gridVisible: true,
    addCube: () => {
        const cubeMaterial = new THREE.MeshPhysicalMaterial({
            color: Math.random() * 0xffffff,
            metalness: 0.2,
            roughness: 0.3,
            clearcoat: 0.8,
            clearcoatRoughness: 0.2,
        });
        const cube = new THREE.Mesh(geometry, cubeMaterial);
        cube.position.set(0, 0.5, 0);
        scene.add(cube);
        objects.push(cube);

        const action = createAddAction(cube);
        recordAction(action);

        updateColorPicker(cubeMaterial.color);
    },
    addSphere: () => {
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: Math.random() * 0xffffff,
            metalness: 0.2,
            roughness: 0.3,
            clearcoat: 0.8,
            clearcoatRoughness: 0.2,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0.5, 0);
        scene.add(sphere);
        objects.push(sphere);

        const action = createAddAction(sphere);
        recordAction(action);


        updateColorPicker(sphereMaterial.color);
    },
    addCylinder: () => {
        const cylinderMaterial = new THREE.MeshPhysicalMaterial({
            color: Math.random() * 0xffffff,
            metalness: 0.3,
            roughness: 0.3,
            clearcoat: 0.8,
            clearcoatRoughness: 0.2,
        });
        const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); // radiusTop, radiusBottom, height, radialSegments
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(0, 0.5, 0);
        scene.add(cylinder);
        objects.push(cylinder);

        const action = createAddAction(cylinder);
        recordAction(action);

        updateColorPicker(cylinderMaterial.color);
    },
    mode: "translate",
    toggleGrid: () => {
        gridHelper.visible = params.gridVisible;
    },
    delete: () => {
        if (selectedObject) {
            scene.remove(selectedObject);
            objects.splice(objects.indexOf(selectedObject), 1);
            selectedObject = null;
            transformControls.detach();
            outlinePass.selectedObjects = [];
            // resetGui();
        }
    },
    topView: () => {
        if (selectedObject) {
            camera.position.set(
                selectedObject.position.x,
                selectedObject.position.y + 5,
                selectedObject.position.z
            );
            camera.lookAt(selectedObject.position);
            controls.target.copy(selectedObject.position);
            controls.update();
        }
    },
    frontView: () => {
        if (selectedObject) {
            camera.position.set(
                selectedObject.position.x,
                selectedObject.position.y,
                selectedObject.position.z + 5
            );
            camera.lookAt(selectedObject.position);
            controls.target.copy(selectedObject.position);
            controls.update();
        }
    },
    resetCamera: () => {
        camera.position.copy(initialCameraPosition);
        controls.target.set(0, 0, 0);
        controls.update();
    },
    exportScene: () => {
        exportGLTF(objects);
    },
};

// function createSceneFolder(gui) {
//   const sceneFolder = gui.addFolder('Scene');
//   sceneFolder.add(params, 'addCube').name('Add Cube');
//   sceneFolder.add(params, 'addSphere').name('Add Sphere');
//   sceneFolder.add(params, 'exportScene').name('Export Scene');
//   sceneFolder.add(params, 'gridVisible').name('Show Grid').onChange(params.toggleGrid);
//   sceneFolder.add(params, 'mode', ['translate', 'rotate', 'scale']).name("Mode").onChange((value) => {
//     transformControls.setMode(value);
//   });
//   sceneFolder.open();
// }

// function createCameraFolder(gui, isObjectSelected) {
//   const cameraFolder = gui.addFolder("Camera");
//   if (isObjectSelected) {
//     cameraFolder.add(params, 'topView').name('Top View');
//     cameraFolder.add(params, 'frontView').name('Front View');
//   }
//   cameraFolder.add(params, 'resetCamera').name('Reset Camera');
//   cameraFolder.open();
// }

// function createObjectFolder(gui, object) {
//   const objectFolder = gui.addFolder('Object');
//   objectFolder.addColor({ color: object.material.color.getHex() }, 'color').name('Color').onChange((value) => {
//     object.material.color.set(value);
//   });
//   objectFolder.add(params, 'delete').name('Delete Object');
//   objectFolder.open();
// }

// // Update GUI based on selection
// function updateGuiForSelectedObject(object) {
//   if (gui) gui.destroy();
//   gui = new GUI();

//   createSceneFolder(gui);
//   createObjectFolder(gui, object);
//   createCameraFolder(gui, true);  // Show camera options for object selection
// }

// function resetGui() {
//   if (gui) gui.destroy();
//   gui = new GUI();

//   createSceneFolder(gui);
//   createCameraFolder(gui, false);  // Basic camera controls
// }

// resetGui();

//Event Listeners
document
    .getElementById("addCubeButton")
    .addEventListener("click", params.addCube);
document
    .getElementById("addSphereButton")
    .addEventListener("click", params.addSphere);
document
    .getElementById("addCylinderButton")
    .addEventListener("click", params.addCylinder);
document
    .getElementById("deleteButton")
    .addEventListener("click", params.delete);
document.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        params.delete();
    }
});
document
    .getElementById("topCameraButton")
    .addEventListener("click", params.topView);
document.addEventListener("keydown", (event) => {
    if (event.key === "t" || event.key === "T") {
        params.topView();
    }
});
document
    .getElementById("frontCameraButton")
    .addEventListener("click", params.frontView);
document.addEventListener("keydown", (event) => {
    if (event.key === "f" || event.key === "F") {
        params.frontView();
    }
});
document
    .getElementById("resetCameraButton")
    .addEventListener("click", params.resetCamera);
document.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") {
        params.resetCamera();
    }
});
document
    .getElementById("exportButton")
    .addEventListener("click", params.exportScene);
document.getElementById("importButton").addEventListener("click", () => {
    document.getElementById("fileInput").click();
});
document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        gltfLoader.parse(arrayBuffer, "", (gltf) => {
            const importedObject = gltf.scene;

            // Set the scale directly to (1, 1, 1)
            importedObject.scale.set(1, 1, 1);

            // Add the object to the scene and track it
            scene.add(importedObject);
            objects.push(importedObject);

            console.log("Imported .glb file with scale (1, 1, 1):", importedObject);
        });
    };

    reader.readAsArrayBuffer(file);
});
document
    .getElementById("showGrid")
    .addEventListener("change", function () {
        params.gridVisible = this.checked;
        params.toggleGrid();
    });

document.getElementById("undoButton").addEventListener("click", undo);
document.getElementById("redoButton").addEventListener("click", redo);

function setTransformMode(mode) {
    transformControls.setMode(mode);
}

document
    .getElementById("translateMode")
    .addEventListener("click", () => setTransformMode("translate"));
document
    .getElementById("scaleMode")
    .addEventListener("click", () => setTransformMode("scale"));
document
    .getElementById("rotationMode")
    .addEventListener("click", () => setTransformMode("rotate"));

function exportGLTF(objects) {
    const exporter = new GLTFExporter();
    const sceneForExport = new THREE.Scene();

    objects.forEach((obj) => {
        sceneForExport.add(obj.clone());
    });

    exporter.parse(
        sceneForExport,
        (result) => {
            const blob = new Blob([result], { type: "model/gltf-binary" });
            saveAs(blob, "scene.glb");
        },
        { binary: true }
    );
}

function saveAs(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

window.addEventListener("click", (event) => {
    if (
        event.target.closest(".sidebar") ||
        event.target.closest(".color-container")
    ) {
        return;
    }

    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        outlinePass.selectedObjects = [selectedObject];
        transformControls.attach(selectedObject);
        //updateGuiForSelectedObject(selectedObject);
    } else {
        selectedObject = null;
        outlinePass.selectedObjects = [];
        transformControls.detach();
        //resetGui();
    }
});

window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}
animate();