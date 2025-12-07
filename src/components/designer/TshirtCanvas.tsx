'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { DesignState, TextElement, ImageElement } from './Designer';
import { MATERIALS } from './panels/MaterialPanel';

interface TshirtCanvasProps {
  designState: DesignState;
  setDesignState: React.Dispatch<React.SetStateAction<DesignState>>;
  onExportReady?: (exportFn: () => void) => void;
}

interface ElementMesh extends THREE.Mesh {
  userData: {
    elementId: string;
    elementType: 'text' | 'image';
  };
}

export function TshirtCanvas({ designState, setDesignState, onExportReady }: TshirtCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const designGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Export function - high quality canvas only
  const exportToPNG = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Store original camera position and controls target
    const originalPosition = camera.position.clone();
    const originalTarget = controls.target.clone();

    // Reset camera to straight view for the current side
    const exportZ = designState.currentSide === 'back' ? -5 : 5;
    camera.position.set(0, 0, exportZ);
    controls.target.set(0, 0, 0);
    controls.update();

    // Store original size
    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;

    // Render at higher resolution for export
    const exportWidth = 2048;
    const exportHeight = 2048;
    renderer.setSize(exportWidth, exportHeight, false);
    camera.aspect = exportWidth / exportHeight;
    camera.updateProjectionMatrix();

    // Render the scene
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png', 1.0);

    // Restore original camera position and controls
    camera.position.copy(originalPosition);
    controls.target.copy(originalTarget);
    controls.update();

    // Restore original size
    renderer.setSize(originalWidth, originalHeight, false);
    camera.aspect = originalWidth / originalHeight;
    camera.updateProjectionMatrix();

    // Download
    const link = document.createElement('a');
    link.download = `tshirt-design-${designState.currentSide}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, [designState.currentSide]);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const geometry = new THREE.BoxGeometry(2.5, 3.5, 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: designState.color,
      roughness: 0.7,
      metalness: 0.1,
    });
    const tShirtMesh = new THREE.Mesh(geometry, material);
    scene.add(tShirtMesh);
    meshRef.current = tShirtMesh;

    // Create a group to hold text and image elements
    const designGroup = new THREE.Group();
    designGroup.position.z = 0.11; // Place slightly in front of the t-shirt
    scene.add(designGroup);
    designGroupRef.current = designGroup;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controlsRef.current = controls;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect =
          currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(
          currentMount.clientWidth,
          currentMount.clientHeight
        );
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Register export function
  useEffect(() => {
    if (onExportReady) {
      onExportReady(exportToPNG);
    }
  }, [onExportReady, exportToPNG]);

  // Update color
  useEffect(() => {
    if (meshRef.current) {
      (
        meshRef.current.material as THREE.MeshStandardMaterial
      ).color.set(designState.color);
    }
  }, [designState.color]);

  // Sync camera view with current side
  useEffect(() => {
    if (cameraRef.current && controlsRef.current) {
      if (designState.currentSide === 'back') {
        cameraRef.current.position.set(0, 0, -5);
        cameraRef.current.lookAt(0, 0, 0);
      } else {
        cameraRef.current.position.set(0, 0, 5);
        cameraRef.current.lookAt(0, 0, 0);
      }
      controlsRef.current.update();
    }
  }, [designState.currentSide]);

  // Update material texture
  useEffect(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const materialInfo = MATERIALS.find(m => m.type === designState.material);

    if (materialInfo) {
      material.roughness = materialInfo.roughness;
      material.metalness = materialInfo.metalness;
      material.needsUpdate = true;
    }
  }, [designState.material]);

  // Update text and image elements with interactive features
  useEffect(() => {
    if (!designGroupRef.current || !sceneRef.current) return;
    const designGroup = designGroupRef.current;
    const scene = sceneRef.current;

    // Clear existing design elements from scene
    const elementsToRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData.elementId) {
        elementsToRemove.push(obj);
      }
    });
    elementsToRemove.forEach((obj) => {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });

    // Add text elements for current side only
    designState.textElements
      .filter(el => el.side === designState.currentSide)
      .forEach((textElement) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = 512;
        canvas.height = 256;

        // Apply flip if needed
        if (textElement.flipped) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.fillStyle = textElement.color;
        const fontStyle = textElement.fontStyle === 'italic' ? 'italic' : '';
        const fontWeight = textElement.fontWeight === 'bold' ? 'bold' : '';
        context.font = `${fontStyle} ${fontWeight} ${textElement.fontSize * 200}px ${textElement.fontFamily}`.trim();
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Draw underline if needed
        if (textElement.textDecoration === 'underline') {
          const metrics = context.measureText(textElement.text);
          const textWidth = metrics.width;
          const underlineY = canvas.height / 2 + textElement.fontSize * 100;
          context.beginPath();
          context.moveTo(canvas.width / 2 - textWidth / 2, underlineY);
          context.lineTo(canvas.width / 2 + textWidth / 2, underlineY);
          context.strokeStyle = textElement.color;
          context.lineWidth = textElement.fontSize * 10;
          context.stroke();
        }

        context.fillText(textElement.text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const textGeometry = new THREE.PlaneGeometry(
          textElement.fontSize * 4,
          textElement.fontSize * 2
        );
        const textMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial) as unknown as ElementMesh;
        textMesh.position.set(textElement.x, textElement.y, textElement.z);
        textMesh.rotation.z = (textElement.rotation * Math.PI) / 180;
        if (textElement.side === 'back') {
          textMesh.rotation.y = Math.PI;
        }
        textMesh.userData = {
          elementId: textElement.id,
          elementType: 'text',
        };

        // Add selection border
        if (designState.selectedElementId === textElement.id) {
          const borderGeometry = new THREE.EdgesGeometry(textGeometry);
          const borderMaterial = new THREE.LineBasicMaterial({
            color: 0x0ea5e9,
            linewidth: 2
          });
          const border = new THREE.LineSegments(borderGeometry, borderMaterial);
          textMesh.add(border);
        }

        scene.add(textMesh);
      });

    // Add image elements for current side only
    designState.imageElements
      .filter(el => el.side === designState.currentSide)
      .forEach((imageElement) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imageElement.url, (texture) => {
          const imageGeometry = new THREE.PlaneGeometry(
            imageElement.width,
            imageElement.height
          );
          const imageMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          });
          const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial) as unknown as ElementMesh;
          imageMesh.position.set(imageElement.x, imageElement.y, imageElement.z);
          imageMesh.rotation.z = (imageElement.rotation * Math.PI) / 180;
          if (imageElement.side === 'back') {
            imageMesh.rotation.y = Math.PI;
          }

          // Apply flip
          if (imageElement.flipped) {
            imageMesh.scale.x = -1;
          }

          imageMesh.userData = {
            elementId: imageElement.id,
            elementType: 'image',
          };

          // Add selection border
          if (designState.selectedElementId === imageElement.id) {
            const borderGeometry = new THREE.EdgesGeometry(imageGeometry);
            const borderMaterial = new THREE.LineBasicMaterial({
              color: 0x0ea5e9,
              linewidth: 2
            });
            const border = new THREE.LineSegments(borderGeometry, borderMaterial);
            imageMesh.add(border);
          }

          if (sceneRef.current) {
            sceneRef.current.add(imageMesh);
          }
        });
      });
  }, [designState.textElements, designState.imageElements, designState.selectedElementId, designState.currentSide]);

  // Mouse interaction handlers
  const getMousePosition = useCallback((event: MouseEvent) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  const getIntersectedElement = useCallback(() => {
    if (!cameraRef.current || !sceneRef.current) return null;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      sceneRef.current.children.filter(obj => obj.userData.elementId),
      false
    );

    return intersects.length > 0 ? intersects[0].object as ElementMesh : null;
  }, []);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!controlsRef.current) return;

    getMousePosition(event);
    const intersectedElement = getIntersectedElement();

    if (intersectedElement && intersectedElement.userData.elementId) {
      event.stopPropagation();
      setIsDragging(true);
      controlsRef.current.enabled = false;

      // Select element
      setDesignState(prev => ({
        ...prev,
        selectedElementId: intersectedElement.userData.elementId,
        selectedElementType: intersectedElement.userData.elementType,
      }));

      // Store offset
      dragOffsetRef.current.copy(intersectedElement.position);
    } else {
      // Deselect if clicking empty area
      setDesignState(prev => ({
        ...prev,
        selectedElementId: null,
        selectedElementType: null,
      }));
    }
  }, [getMousePosition, getIntersectedElement, setDesignState]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !cameraRef.current || !sceneRef.current || !designState.selectedElementId) return;

    getMousePosition(event);

    // Find the selected element to get its Z position
    const selectedElement = sceneRef.current.children.find(
      obj => obj.userData.elementId === designState.selectedElementId
    ) as ElementMesh | undefined;

    if (!selectedElement) return;

    const currentZ = selectedElement.position.z;

    // Create a plane at the element's Z position
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -currentZ);
    const intersectPoint = new THREE.Vector3();
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    raycasterRef.current.ray.intersectPlane(plane, intersectPoint);

    if (intersectPoint) {
      // No boundary constraints - allow free positioning
      const newX = intersectPoint.x;
      const newY = intersectPoint.y;

      if (designState.selectedElementType === 'text') {
        setDesignState(prev => ({
          ...prev,
          textElements: prev.textElements.map(el =>
            el.id === designState.selectedElementId
              ? { ...el, x: newX, y: newY }
              : el
          ),
        }));
      } else if (designState.selectedElementType === 'image') {
        setDesignState(prev => ({
          ...prev,
          imageElements: prev.imageElements.map(el =>
            el.id === designState.selectedElementId
              ? { ...el, x: newX, y: newY }
              : el
          ),
        }));
      }
    }
  }, [isDragging, designState.selectedElementId, designState.selectedElementType, getMousePosition, setDesignState]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && controlsRef.current) {
      setIsDragging(false);
      controlsRef.current.enabled = true;
    }
  }, [isDragging]);

  // Add event listeners
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    />
  );
}
