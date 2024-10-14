import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, sphere, raycaster, mouse, intersectedFace, controls;
let isDragging = false;
let brushSize = 0.1;
let brushStrength = 0.05;
let push = false;
let light;
let sphereRadius = 1; // Sphere radius
const redDot = document.getElementById('redDot'); // Red dot element

const radiusSlider = document.getElementById('radiusSlider');
const radiusValue = document.getElementById('radiusValue');

function init() {
    // Scene setup
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

    // Initial sphere geometry
    createSphere(sphereRadius);

    // Orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    
    // Customize mouse button behavior for OrbitControls
    controls.mouseButtons = {
        //LEFT: THREE.MOUSE.PAN,     // Left-click will now pan the camera
        MIDDLE: THREE.MOUSE.DOLLY,  // Middle mouse scroll for zoom
        RIGHT: THREE.MOUSE.ROTATE   // Right-click to rotate the camera
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

    // Slider change event for sphere radius
    radiusSlider.addEventListener('input', (event) => {
        const radius = parseFloat(event.target.value);
        radiusValue.textContent = radius.toFixed(1);
        updateSphereRadius(radius);
    });

    animate();
}

function createSphere(radius) {
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, flatShading: true });
    if (sphere) scene.remove(sphere); // Remove the old sphere if it exists
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

function updateSphereRadius(newRadius) {
    sphereRadius = newRadius;
    createSphere(sphereRadius); // Recreate sphere with the new radius
}

function onMouseMove(event) {
    event.preventDefault();
    
    // Update mouse coordinates for Three.js interactions
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update red dot position
    redDot.style.left = `${event.clientX - 5}px`; // Adjust for dot size (5px radius)
    redDot.style.top = `${event.clientY - 5}px`; 

    if (isDragging) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(sphere);
        if (intersects.length > 0) {
            intersectedFace = intersects[0].face;
            const position = intersects[0].point;
            applySculpting(position);
        }
    }
}

function onMouseDown(event) {
    // Only allow sculpting with the left mouse button (event.button === 0)
    if (event.button !== 0) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sphere);
    if (intersects.length > 0) {
        isDragging = true;
        intersectedFace = intersects[0].face;
    }
}

function onMouseUp() {
    isDragging = false;
}

function onKeyDown(event) {
    if (event.key === 'Shift') {
        push = true; // Hold shift to push vertices
    }
}

function onKeyUp(event) {
    if (event.key === 'Shift') {
        push = false; // Release shift to pull vertices
    }
}

function applySculpting(position) {
    const vertices = sphere.geometry.attributes.position;
    const normal = new THREE.Vector3();

    // Iterate through all vertices and displace them if within brush range
    for (let i = 0; i < vertices.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        if (vertex.distanceTo(position) < brushSize) {
            // Calculate vertex normal for displacing the vertex
            sphere.geometry.computeVertexNormals();
            normal.fromBufferAttribute(sphere.geometry.attributes.normal, i);

            // Sculpt: push or pull the vertex along its normal
            const direction = push ? -1 : 1;
            vertex.addScaledVector(normal, brushStrength * direction);
            vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
    }

    // Mark geometry for update
    vertices.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update light to follow the camera's position
    light.position.copy(camera.position);

    controls.update();
    renderer.render(scene, camera);
}

init();