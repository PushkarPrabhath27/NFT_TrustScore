import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiCube, FiMaximize2, FiMinimize2, FiRotateCw, FiInfo } from 'react-icons/fi';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ARVisualization = ({ nftData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(true);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameIdRef = useRef(null);
  const cubeRef = useRef(null);
  
  useEffect(() => {
    if (nftData?.image) {
      // Initialize scene
      initScene();
      
      // Clean up on unmount
      return () => {
        if (frameIdRef.current) {
          cancelAnimationFrame(frameIdRef.current);
        }
        
        if (rendererRef.current && mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }
        
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object.geometry) {
              object.geometry.dispose();
            }
            
            if (object.material) {
              if (object.material.map) {
                object.material.map.dispose();
              }
              object.material.dispose();
            }
          });
        }
      };
    }
  }, [nftData]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        
        rendererRef.current.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Initialize Three.js scene
  const initScene = () => {
    if (!mountRef.current) return;
    
    setIsLoading(true);
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827); // Dark bg matching the app
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Load NFT image as texture
    if (nftData.image) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.crossOrigin = "Anonymous";
      
      // Try to load image
      textureLoader.load(
        nftData.image,
        (texture) => {
          // Create cube with NFT texture
          const geometry = new THREE.BoxGeometry(3, 3, 3);
          const materials = [
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ map: texture })
          ];
          
          const cube = new THREE.Mesh(geometry, materials);
          scene.add(cube);
          cubeRef.current = cube;
          
          setTextureLoaded(true);
          setIsLoading(false);
          
          // Start animation
          animate();
        },
        undefined,
        (error) => {
          console.error('Error loading NFT texture:', error);
          // Fallback to a colored cube
          const geometry = new THREE.BoxGeometry(3, 3, 3);
          const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B5CF6, // Purple color
            metalness: 0.3,
            roughness: 0.4
          });
          
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);
          cubeRef.current = cube;
          
          setIsLoading(false);
          
          // Start animation
          animate();
        }
      );
    } else {
      // If no image, create default cube
      const geometry = new THREE.BoxGeometry(3, 3, 3);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x8B5CF6, // Purple color
        metalness: 0.3,
        roughness: 0.4
      });
      
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      cubeRef.current = cube;
      
      setIsLoading(false);
      
      // Start animation
      animate();
    }
    
    // Add small NFT collection cubes around the main cube
    if (nftData.collection && nftData.collection.items && nftData.collection.items.length > 0) {
      const smallCubeSize = 0.5;
      const radius = 6;
      const count = Math.min(nftData.collection.items.length, 8); // Limit to 8 items
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const geometry = new THREE.BoxGeometry(smallCubeSize, smallCubeSize, smallCubeSize);
        const material = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color().setHSL(i / count, 0.8, 0.5),
          metalness: 0.3,
          roughness: 0.4
        });
        
        const smallCube = new THREE.Mesh(geometry, material);
        smallCube.position.set(x, y, 0);
        scene.add(smallCube);
      }
    }
  };
  
  // Animation loop
  const animate = () => {
    frameIdRef.current = requestAnimationFrame(animate);
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    if (cubeRef.current && rotation) {
      cubeRef.current.rotation.x += 0.005;
      cubeRef.current.rotation.y += 0.01;
    }
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Update renderer size after state change
    setTimeout(() => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        
        rendererRef.current.setSize(width, height);
      }
    }, 100);
  };
  
  // Toggle rotation
  const toggleRotation = () => {
    setRotation(!rotation);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900 rounded-xl shadow-lg overflow-hidden ${
        isFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center">
          <FiCube className="mr-2" /> AR Visualization
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleRotation}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={rotation ? "Stop Rotation" : "Start Rotation"}
          >
            <FiRotateCw />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        </div>
      </div>
      
      <div 
        ref={mountRef} 
        className={`relative ${isFullscreen ? 'h-[calc(100vh-61px)]' : 'h-96'}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading 3D visualization...</p>
            </div>
          </div>
        )}
        
        {!textureLoaded && !isLoading && (
          <div className="absolute bottom-4 left-4 right-4 bg-yellow-900/70 text-yellow-300 p-3 rounded-lg text-sm z-10">
            <div className="flex items-start">
              <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
              <p>Could not load NFT image texture. Showing placeholder visualization instead.</p>
            </div>
          </div>
        )}
      </div>
      
      {!isFullscreen && (
        <div className="p-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            {nftData?.name || 'NFT'} visualized in 3D. Drag to rotate, scroll to zoom.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ARVisualization;
