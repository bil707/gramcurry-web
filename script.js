import { OBJLoader } from "./node_modules/three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "./node_modules/three/build/three.module.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 4); // Camera position to see the scene from an angle
scene.background = new THREE.Color('#323232');

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create objects (Torus and Sphere)
const sphereGeometry = new THREE.SphereGeometry(1, 5, 5);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(3, 1.5, 0); // Position the sphere
sphere.castShadow = true;
scene.add(sphere);

const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 }); // Tomato color for the donut
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.y = 1.5;
torus.castShadow = true;
scene.add(torus);

// Create a plane geometry to act as the floor
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: '#999999', side: THREE.DoubleSide, wireframe: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie horizontally
plane.receiveShadow = true;
scene.add(plane);

// Directional light for shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Raycaster and mouse for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null; // Store the currently selected object

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.5, 0);
controls.enabled = false; // Disable initially, only activate with 'Alt' + 'Control'

// Enable orbit controls only when 'Alt' + 'Control' keys are pressed
let isCtrl = false;
document.addEventListener('keydown', (event) => {
    if ( event.ctrlKey ) {
      isCtrl = true; // Enable orbiting when both keys are pressed
    }
});
  
document.addEventListener('keyup', (event) => {
    isCtrl = false; // Disable orbiting when keys are released
});

// Disable pan to avoid conflicts
controls.enablePan = false;

// Mouse event listeners for object selection and rotation
document.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycast to detect if an object is clicked
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    selectedObject = intersects[0].object; // Select the first intersected object
    controls.enabled = false; // Disable orbit controls during object manipulation
  } else {
    selectedObject = null;
  }
});

// Variables for mouse drag rotation and button detection
let isLDragging = false;
let isRDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousemove', (event) => {
  if (!selectedObject) return; // Only rotate if an object is selected

  if(isRDragging) {
    controls.enabled = true;
  }

  if (isLDragging) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };
    

    // Rotate the selected object based on mouse movement
    selectedObject.rotation.y += deltaMove.x * 0.01; // Adjust sensitivity
    selectedObject.rotation.x += deltaMove.y * 0.01; // Adjust sensitivity
  }

  // Update the previous mouse position
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
});

document.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
        isRDragging = true;
    }
    if (event.button === 0) {
        isLDragging = true;
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button === 2) {
        isRDragging = false;
    }
    if (event.button === 0) {
        isLDragging = false;
    }
});

// Prevent the context menu from opening on right-click
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Camera zoom control with mouse wheel
document.addEventListener('wheel', (event) => {
  event.preventDefault();
  const zoomAmount = 0.01; // Adjust this for zoom sensitivity
  camera.position.z += event.deltaY * zoomAmount; // Moves the camera forward/backward
}, { passive: false });

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop (no rotation for the donut)
function animate() {
  requestAnimationFrame(animate);
  camera.lookAt(0,2,0);
  renderer.render(scene, camera);
}

animate();
