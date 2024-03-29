import * as THREE from './three.js';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js'

// Container
const container = document.createElement('div');
document.body.appendChild(container);

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set(200, 100, 200);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x999999);
scene.fog = new THREE.Fog(0x999999, 600, 1000);

// Ground
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshPhongMaterial({ color: 0xcccccc })
);
plane.rotation.x = - Math.PI / 2;
plane.position.y = - 0.5;
scene.add(plane);
plane.receiveShadow = true;

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 3));
addShadowedLight(1, 1, 1, 0xffffff, 3);
addShadowedLight(0.5, 1, - 1, 0xffffff, 3);
function addShadowedLight(x, y, z, color, intensity) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    const d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.bias = - 0.002;
}

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN
}

if (file) {
    // Load STL
    const stl_loader = new STLLoader();
    stl_loader.load('3D_files/' + file, function (geometry) {
        const material = new THREE.MeshPhongMaterial({
            color: 0x669999, 
            specular: 0x669999, 
            shininess: 50
        });
        const mesh = new THREE.Mesh(geometry, material);
        const box = new THREE.Box3;
        mesh.geometry.computeBoundingBox();
        box.copy(mesh.geometry.boundingBox);
        let box_dims = new THREE.Vector3();
        box.getSize(box_dims);
        // mesh.position.set(0, box_dims.z/2, 0);
        mesh.rotation.set(-90 * (Math.PI / 180), 0, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        // Add wireframe
        var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial({ color: 0x000000 });
        var wireframe = new THREE.LineSegments(geo, mat);
        mesh.add(wireframe);
        wireframe.visible = true;
        // wireframe toggle
        $('#wrfrm-tgl-btn').on('click', () => {
            wireframe.visible = !wireframe.visible;
        });
        // Position and point camera at mesh
        camera.position.set(box_dims.x * 2, Math.max(box_dims.x, box_dims.y, box_dims.z) * 2, box_dims.y * 2);
        controls.target = new THREE.Vector3(0, box_dims.z / 2, 0);
        controls.update();
        // fog
        scene.fog = new THREE.Fog(0x999999, Math.sqrt((box_dims.x * 2) ** 2 + (box_dims.y * 2) ** 2) * 2, Math.sqrt((box_dims.x * 2) ** 2 + (box_dims.y * 2) ** 2) * 4);
    });
}

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

