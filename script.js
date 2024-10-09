import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 4);
scene.background = new THREE.Color('#323232');

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create objects (Torus and Sphere)
const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347, wireframe: true });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = 1.5;
sphere.castShadow = true;
scene.add(sphere);

const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 }); // Tomato color for the donut
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(3,1.5,0);
torus.castShadow = true;
scene.add(torus);

// Create a plane geometry to act as the floor
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: '#999999', side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
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
let isDragging = false;    // Track if the mouse is being dragged for rotation
let previousMousePosition = { x: 0, y: 0 }; // Track the previous mouse position for rotation

// Create an outline material for highlighting the selected object
const outlineMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  side: THREE.BackSide // Ensures outline is rendered outside the object
});

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.5, 0);
controls.enabled = true;

// Disable pan to avoid conflicts
controls.enablePan = false;

// Function to create the glowing outline effect
function createOutline(originalObject) {
  const outlineGeometry = originalObject.geometry.clone();
  const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
  outline.position.copy(originalObject.position);
  outline.rotation.copy(originalObject.rotation);
  outline.scale.multiplyScalar(1.05); // Scale slightly to create the outline effect
  return outline;
}

// Mouse event listener for selecting objects
document.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const object = intersects[0].object;

    // Remove the old outline if an object was already selected
    if (selectedObject) {
      scene.remove(selectedObject.outline); // Remove previous outline
    }

    // Select the new object
    selectedObject = object;

    // Add an outline effect by scaling and adding a secondary mesh
    selectedObject.outline = createOutline(selectedObject);
    scene.add(selectedObject.outline); // Add the outline to the scene

    // Enable dragging for rotation
    isDragging = true;
  }
});

// Mousemove event to rotate the selected object while dragging
document.addEventListener('mousemove', (event) => {
  if (isDragging && selectedObject) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };

    // Rotate the selected object based on mouse movement
    selectedObject.rotation.y += deltaMove.x * 0.01; // Adjust sensitivity for Y-axis rotation (horizontal)
    selectedObject.rotation.x += deltaMove.y * 0.01; // Adjust sensitivity for X-axis rotation (vertical)

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
});

// Stop rotating when the mouse button is released
document.addEventListener('mouseup', () => {
  isDragging = false; // Stop dragging when mouse is released
});

// Camera zoom control with mouse wheel
document.addEventListener('wheel', (event) => {
  event.preventDefault();
  const zoomAmount = 0.01; // Adjust this for zoom sensitivity
  camera.position.z += event.deltaY * zoomAmount;
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

  //outline.rotation.copy(originalObject.rotation);

  camera.lookAt(0, 2, 0);
  renderer.render(scene, camera);
}

animate();
