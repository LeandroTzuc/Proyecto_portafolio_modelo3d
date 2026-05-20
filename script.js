import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. Configuración Básica (Escena, Cámara, Renderer)
// ==========================================
const container = document.getElementById('canvas-container');

// Crear la escena
const scene = new THREE.Scene();

// Crear la cámara (Perspectiva)
const camera = new THREE.PerspectiveCamera(
    45, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
);
// Posicionar la cámara
camera.position.set(0, 2, 7);

// Crear el Renderer (WebGL) con antialiasing y fondo transparente
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización
renderer.outputColorSpace = THREE.SRGBColorSpace; // Asegurar colores correctos en las texturas
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Añadir el canvas al contenedor HTML
container.appendChild(renderer.domElement);


// ==========================================
// 2. Iluminación (Ambient, Focal y Relleno)
// ==========================================

// Luz Ambiental: Iluminación base neutra para rebote
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
scene.add(ambientLight);

// Luz Focal/Techo (DirectionalLight) para generar volumen y sombras
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 25;
directionalLight.shadow.bias = -0.001;
// Ampliar cámara de sombras para abarcar la habitación entera
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Luz de Apoyo Frontal (Directional secundaria) muy tenue
const fillLight = new THREE.DirectionalLight(0xffffff, 0.4); 
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);


// ==========================================
// 3. Controles de Órbita (OrbitControls)
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Rotación y movimiento suaves
controls.dampingFactor = 0.05;
controls.enablePan = true;  // Permitir desplazamiento
controls.enableZoom = true; // Permitir zoom
controls.minDistance = 2;   // Distancia mínima de zoom
controls.maxDistance = 20;  // Distancia máxima de zoom

// --- Lógica para Auto-rotación e Interacción ---
let isInteracting = false;
let interactionTimeout;

controls.addEventListener('start', () => {
    isInteracting = true;
    clearTimeout(interactionTimeout);
});

controls.addEventListener('end', () => {
    // Reanudar la auto-rotación tras 1.5 segundos de inactividad
    interactionTimeout = setTimeout(() => {
        isInteracting = false;
    }, 1500);
});


// ==========================================
// 3.5. Sistema de Partículas (Polvo Estelar)
// ==========================================
// Crear textura circular suave usando Canvas
const particleCanvas = document.createElement('canvas');
particleCanvas.width = 32;
particleCanvas.height = 32;
const particleCtx = particleCanvas.getContext('2d');
const particleGradient = particleCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
particleGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
particleCtx.fillStyle = particleGradient;
particleCtx.fillRect(0, 0, 32, 32);
const particleTexture = new THREE.CanvasTexture(particleCanvas);

// Geometría y posiciones de las partículas
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 600;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    // Distribuir en un volumen amplio alrededor del origen
    posArray[i] = (Math.random() - 0.5) * 20;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material de las partículas
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    map: particleTexture,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Evitar que corten otros objetos
    color: 0x38bdf8
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);


// ==========================================
// 4. Carga del Modelo 3D (GLTFLoader)
// ==========================================
const loader = new GLTFLoader();
let mixer; // Variable para manejar animaciones del modelo si las tiene
let loadedModel = null; // Referencia al modelo para la auto-rotación

// =================================================================
// // INSERTAR RUTA DEL MODELO BLENDER AQUÍ
// =================================================================
const modelPath = 'assets/Habitacion.glb'; // Ruta actualizada a la carpeta assets. Cambia el nombre del archivo aquí si decides usar otro modelo 3D.

if (modelPath) {
    // Si hay una ruta especificada, se carga el modelo
    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;
            loadedModel = model; // Guardar referencia para rotarlo en animate()
            
            // Centrar el modelo automáticamente
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            // Habilitar sombras y corregir materiales (cuadros planos, transparencias)
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    if (child.material) {
                        // Forzar a que los materiales se vean desde ambos lados (soluciona planos invisibles de espaldas)
                        child.material.side = THREE.DoubleSide;
                        
                        // Asegurar que las transparencias (como PNGs en cuadros) no causen fallos de profundidad
                        if (child.material.transparent) {
                            child.material.depthWrite = true;
                            child.material.alphaTest = 0.05; // Ayuda a recortar bordes transparentes
                        }
                    }
                }
            });

            scene.add(model);

            // Iniciar animaciones si el modelo las contiene
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% del modelo cargado');
        },
        (error) => {
            console.error('Error al cargar el modelo 3D:', error);
        }
    );
} else {
    // Geometría de ejemplo interactiva en caso de que no se inserte un modelo
    console.log("No se especificó ruta del modelo. Mostrando geometría 3D de ejemplo.");
    const geometry = new THREE.IcosahedronGeometry(1.5, 0);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x38bdf8,
        metalness: 0.6,
        roughness: 0.2,
        wireframe: true // Estética "developer"
    });
    const placeholderMesh = new THREE.Mesh(geometry, material);
    placeholderMesh.castShadow = true;
    scene.add(placeholderMesh);
    
    // Geometría interna sólida
    const innerGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const innerMat = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.1
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    placeholderMesh.add(innerMesh);
}


// ==========================================
// 5. Ciclo de Animación (Render Loop)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    
    // Actualizar animaciones del modelo cargado
    if (mixer) {
        mixer.update(delta);
    }

    // Auto-rotación del modelo cargado con reanudación post-interacción
    if (loadedModel && !isInteracting) {
        loadedModel.rotation.y += 0.0015; // Velocidad de giro lenta
    }

    // Animación suave de las partículas flotando/girando
    if (particlesMesh) {
        particlesMesh.rotation.y -= 0.0003; // Rotación lenta y contraria
        particlesMesh.rotation.x += 0.0001;
    }

    // Rotación suave continua de la geometría de ejemplo si no hay modelo
    if (!modelPath) {
        const mesh = scene.children.find(c => c.type === 'Mesh');
        if (mesh) {
            mesh.rotation.x += 0.002;
            mesh.rotation.y += 0.005;
        }
    }

    // Actualizar controles en cada frame (requerido para el Damping)
    controls.update();

    // Renderizar la escena
    renderer.render(scene, camera);
}

animate();


// ==========================================
// 6. Responsividad del Canvas
// ==========================================
window.addEventListener('resize', () => {
    // Calculamos el tamaño basándonos en el contenedor padre, 
    // asegurando que se adapte perfectamente a la sección y CSS
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Actualizar la relación de aspecto de la cámara
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Actualizar el tamaño del renderizador
    renderer.setSize(width, height);
});


// ==========================================
// 7. Theme Toggle Logic (Claro/Oscuro)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('.icon');

// Verificar preferencia guardada o por defecto oscuro
const savedTheme = localStorage.getItem('theme') || 'dark';
rootElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = rootElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    rootElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}
