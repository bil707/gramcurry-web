import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, object, raycaster, mouse, intersectedFace, controls;
let isDragging = false;
let brushSize = 0.1;
let brushStrength = 0.01;
let push = false;
let light;
let shape = 'sphere'; // Start with a sphere
let objectSize = 1; // Initial size for both sphere and cube
let currentMode = 'sculpt'; // Default mode is sculpting

const redDot = document.getElementById('redDot');
const radiusSlider = document.getElementById('radiusSlider');
const radiusValue = document.getElementById('radiusValue');
const modeSelect = document.getElementById('modeSelect'); // Mode selector
const toggleShapeBtn = document.getElementById('toggleShapeBtn'); // Button to toggle shapes

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Light source
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.copy(camera.position);
    scene.add(light);

    // Initial geometry creation (default to sphere)
    createGeometry(shape, objectSize);

    // Orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    };

    // Raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);

    // Slider event to change the size of the object
    radiusSlider.addEventListener('input', (event) => {
        const size = parseFloat(event.target.value);
        radiusValue.textContent = size.toFixed(1);
        updateObjectSize(size);
    });

    // Mode selection event
    modeSelect.addEventListener('change', (event) => {
        currentMode = event.target.value;
        handleModeChange();
    });

    // Toggle shape event (only for manipulating mode)
    toggleShapeBtn.addEventListener('click', () => {
        shape = (shape === 'sphere') ? 'cube' : 'sphere';
        toggleShapeBtn.textContent = (shape === 'sphere') ? 'Switch to Cube' : 'Switch to Sphere';
        createGeometry(shape, objectSize); // Recreate geometry with the new shape
    });

    animate();
}

// Handles mode switching between sculpting and manipulating
function handleModeChange() {
    if (currentMode === 'sculpt') {
        toggleShapeBtn.style.display = 'none'; // Hide shape toggle button
        radiusSlider.disabled = false; // Enable resizing for sculpting
    } else if (currentMode === 'manipulate') {
        toggleShapeBtn.style.display = 'inline-block'; // Show shape toggle button
        isDragging = false; // Stop any sculpting
    }
}

// Create geometry based on the shape type and size
function createGeometry(shapeType, size) {
    if (object) scene.remove(object); // Remove the existing object if it exists

    let geometry;
    if (shapeType === 'sphere') {
        geometry = new THREE.SphereGeometry(size, 128, 128);
    } else if (shapeType === 'cube') {
        geometry = new THREE.BoxGeometry(size, size, size);
    }

    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, flatShading: true });
    object = new THREE.Mesh(geometry, material);
    scene.add(object);
}

// Update the size of the sphere or cube
function updateObjectSize(newSize) {
    objectSize = newSize;
    createGeometry(shape, objectSize); // Recreate object with the new size
}

function onMouseMove(event) {
    event.preventDefault();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    redDot.style.left = `${event.clientX - 5}px`; 
    redDot.style.top = `${event.clientY - 5}px`; 

    if (isDragging && currentMode === 'sculpt') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(object);
        if (intersects.length > 0) {
            intersectedFace = intersects[0].face;
            const position = intersects[0].point;
            applySculpting(position);
        }
    }
}

function onMouseDown(event) {
    if (event.button !== 0 || currentMode !== 'sculpt') return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(object);
    if (intersects.length > 0) {
        isDragging = true;
        intersectedFace = intersects[0].face;
    }
}

function onMouseUp() {
    isDragging = false;
}

function onKeyDown(event) {
    if (event.key === 'Shift' && currentMode === 'sculpt') {
        push = true; 
    }
}

function onKeyUp(event) {
    if (event.key === 'Shift' && currentMode === 'sculpt') {
        push = false; 
    }
}

function applySculpting(position) {
    const vertices = object.geometry.attributes.position;
    const normal = new THREE.Vector3();

    for (let i = 0; i < vertices.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        if (vertex.distanceTo(position) < brushSize) {
            object.geometry.computeVertexNormals();
            normal.fromBufferAttribute(object.geometry.attributes.normal, i);

            const direction = push ? -1 : 1;
            vertex.addScaledVector(normal, brushStrength * direction);
            vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
    }

    vertices.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    light.position.copy(camera.position);

    controls.update();
    renderer.render(scene, camera);
}

init(); 