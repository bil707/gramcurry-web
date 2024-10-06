import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
//import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 4); // Camera position to see the donut from an angle
scene.background = new THREE.Color(0xeeeeee);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create a Torus (Donut) geometry
const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 }); // Tomato color for the donut
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.y = 1.5; // Raise the donut above the plane
torus.castShadow = true;
scene.add(torus);

// Create a plane geometry to act as the floor
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: '#999999', side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie horizontally
plane.receiveShadow = true;
scene.add(plane);

//sharp directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5); // Positioned to the right of the scene
directionalLight.castShadow = true; // Enable shadows from this light
directionalLight.shadow.mapSize.width = 1024;  // High-quality shadow map size
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Helper to visualize light direction (optional)
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
scene.add(lightHelper);

// Keyboard input to move the donut
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const moveDistance = 0.1; // Distance to move the donut with each key press

  if (key === 'a') {
    // Move left
    torus.position.x -= moveDistance;
  } else if (key === 'd') {
    // Move right
    torus.position.x += moveDistance;
  } else if (key === 'w') {
    // Move right
    torus.position.z -= moveDistance;
  } else if (key === 's') {
    // Move right
    torus.position.z += moveDistance;
  }
});

//camera movement
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
  renderer.render(scene, camera);
}

animate();