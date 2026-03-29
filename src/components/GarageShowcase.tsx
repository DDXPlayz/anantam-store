import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows, MeshReflectorMaterial, Html, Sparkles, useGLTF, Loader } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useDragControls } from 'framer-motion';
import { ShirtDisplay } from './ShirtDisplay';
import { SizeChartModal } from './SizeChartModal';
import { MessageCircle, Plus, Minus } from 'lucide-react';

useGLTF.preload("/models/CharlesLeclerc-opt.glb");
useGLTF.preload("/models/GeorgeRussell-opt.glb");
useGLTF.preload("/models/LandoNorris-opt.glb");
useGLTF.preload("/models/MaxVerstappen-opt.glb");

type Size = 'S' | 'M' | 'L' | 'XL';

type TransitionState = 'idle' | 'entering' | 'centering' | 'ready' | 'returning_ui_out' | 'returning_main_shirt';

// Deep wind tunnel background rings for Hero atmosphere
function WindTunnel() {
  return (
    <group position={[0, 0, -15]}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 10]}>
          <torusGeometry args={[8 + i * 2, 0.1, 16, 100]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#ff1801" : "#00d2ff"}
            transparent
            opacity={0.15 - (i * 0.02)}
          />
        </mesh>
      ))}
    </group>
  );
}

// Custom rotation helper to handle drag interaction natively via shortest path (quaternions)
function InteractiveShirt({
  modelPath,
  isActive,
  transitionState
}: {
  modelPath: string,
  isActive: boolean,
  transitionState: TransitionState
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  const isDragging = useRef(false);
  const idleAngle = useRef(0);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleDown = (e: PointerEvent) => { 
      if (isActive && transitionState === 'ready') {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const handleUp = () => { isDragging.current = false; };
    const handleMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouse.current.x;
        const deltaY = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        
        targetRotation.current.y += deltaX * 0.01;
        targetRotation.current.x += deltaY * 0.01;
        targetRotation.current.x = THREE.MathUtils.clamp(targetRotation.current.x, -0.4, 0.4);
      }
    };
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointermove', handleMove);
    return () => {
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointermove', handleMove);
    };
  }, [isActive, transitionState]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isActive) {
      if (transitionState === 'ready') {
        // User inspects. Slerp to dragged target rotation securely.
        const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(targetRotation.current.x, targetRotation.current.y, 0));
        groupRef.current.quaternion.slerp(targetQ, delta * 5);
        // Sync idle tracker precisely to where user left it so returning is a clean continuation
        idleAngle.current = targetRotation.current.y;
      } else if (['entering', 'centering', 'returning_ui_out'].includes(transitionState)) {
        targetRotation.current.set(0, 0, 0);
        const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
        // Use shortest-path soft dampening to front-facing view. Fixes the "rapid catchup spin" completely.
        groupRef.current.quaternion.slerp(targetQ, delta * 3.5);
        idleAngle.current = 0; 
      } else {
        // Active but idle state. Keep angle frozen at our most recent track exactly.
        const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle.current, 0));
        groupRef.current.quaternion.slerp(targetQ, delta * 4);
      }
    } else {
      // Background items rotate slowly based purely on delta tick. No global sync multiplier causing infinity wraps.
      idleAngle.current += delta * 0.3;
      if (idleAngle.current > Math.PI * 2) idleAngle.current -= Math.PI * 2; // Prevent extremely large numbers
      
      const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle.current, 0));
      groupRef.current.quaternion.slerp(targetQ, delta * 4);
      
      // Keep target rotation loosely synced to background so next tap starts nicely
      targetRotation.current.set(0, idleAngle.current, 0); 
    }
  });

  return (
    <group ref={groupRef}>
      <ShirtDisplay
        modelPath={modelPath}
        isActive={isActive && transitionState === 'ready'}
      />
    </group>
  );
}

// Individual Podium Setup
function GaragePodium({
  position,
  accentColor,
  onClick,
  isActive,
  index,
  globalActiveIndex,
  modelPath,
  transitionState,
  isMobile
}: {
  position: [number, number, number],
  accentColor: string,
  onClick: () => void,
  isActive: boolean,
  index: number,
  globalActiveIndex: number | null,
  modelPath: string,
  transitionState: TransitionState,
  isMobile: boolean
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shirtGroupRef = useRef<THREE.Group>(null);
  const isHidden = globalActiveIndex !== null && globalActiveIndex !== index;
  // On mobile, lift the shirt up to Y=2.2 so it perfectly clears the 55vh bottom-sheet
  const centerPos = isMobile ? new THREE.Vector3(0, 2.2, 0) : new THREE.Vector3(-0.9, 1.2, 0); // Offset to left to accommodate right sidebar on desktop
  const basePos = new THREE.Vector3(...position);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetY = (isHidden || isActive) ? -6 : position[1];
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 3);
    }
    if (shirtGroupRef.current) {
      if (isActive) {
        if (['entering', 'centering', 'ready', 'returning_ui_out'].includes(transitionState)) {
          shirtGroupRef.current.position.lerp(centerPos, delta * 4);
        } else if (transitionState === 'returning_main_shirt') {
          shirtGroupRef.current.position.lerp(basePos, delta * 2.5);
        }
      } else {
        const targetY = isHidden ? -6 : position[1];
        shirtGroupRef.current.position.y = THREE.MathUtils.lerp(shirtGroupRef.current.position.y, targetY, delta * 2);
        shirtGroupRef.current.position.x = THREE.MathUtils.lerp(shirtGroupRef.current.position.x, position[0], delta * 2);
        shirtGroupRef.current.position.z = THREE.MathUtils.lerp(shirtGroupRef.current.position.z, position[2], delta * 2);
      }
    }
  });

  return (
    <group>
      <group ref={groupRef} position={position}>
        <spotLight position={[0, 6, -5]} intensity={isMobile ? 35 : 20} angle={0.6} penumbra={0.5} color="#ffffff" distance={25} castShadow={!isMobile} />
        <spotLight position={[0, 1, -2]} intensity={isMobile ? 10 : 15} angle={1.2} penumbra={1} color={accentColor} distance={10} castShadow={!isMobile} />
        <group position={[0, -1.5, 0]}>
          <mesh receiveShadow castShadow position={[0, 0.2, 0]}>
            <cylinderGeometry args={[1, 1.2, 0.4, 64]} />
            <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <torusGeometry args={[0.9, 0.02, 16, 100]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={5} toneMapped={false} />
          </mesh>
          {!isActive && globalActiveIndex === null && (
            <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
              <div onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-64 h-96 cursor-pointer" style={{ background: 'transparent' }} />
            </Html>
          )}
        </group>
      </group>
      <group ref={shirtGroupRef} position={position}>
        <InteractiveShirt modelPath={modelPath} isActive={isActive} transitionState={transitionState} />
        {isActive && <spotLight position={[0, 2, 5]} intensity={isMobile ? 45 : 25} angle={0.8} penumbra={1} color="#ffffff" distance={15} castShadow={!isMobile} />}
      </group>
      <ContactShadows position={[0, -1.45, 0]} opacity={0.6} scale={4} resolution={512} blur={2.5} far={3} color="#000000" />
    </group>
  );
}

function CameraController({ activePodiumIndex, smoothProgress, transitionState, isMobile }: { activePodiumIndex: number | null, smoothProgress: any, transitionState: TransitionState, isMobile: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  // Bring the hero and garage cameras noticeably closer and lower
  // On mobile, 14 is much closer than 26, ensuring immediate visual impact.
  const heroPosition = isMobile ? new THREE.Vector3(0, 5, 14) : new THREE.Vector3(0, 4, 10);
  const heroLookAt = new THREE.Vector3(0, 1.5, -2);
  const garagePosition = isMobile ? new THREE.Vector3(0, 1.2, 12) : new THREE.Vector3(0, 0.5, 7.5);
  const garageLookAt = new THREE.Vector3(0, 1.0, 0);
  const currentPosition = useRef(heroPosition.clone());
  const currentLookAt = useRef(heroLookAt.clone());
  const targetLookAt = useRef(heroLookAt.clone());

  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    const shouldZoomIn = activePodiumIndex !== null && !['returning_main_shirt', 'idle'].includes(transitionState);
    if (shouldZoomIn) {
      // Zoom extremely close. Center look target slightly below the object so object sits in top half of screen on mobile.
      const inspectPos = isMobile ? new THREE.Vector3(0, 1.2, 5.8) : new THREE.Vector3(0, 1.5, 4.5);
      const inspectLookTarget = isMobile ? new THREE.Vector3(0, 1.6, 0) : new THREE.Vector3(0, 1.25, 0);
      currentPosition.current.lerp(inspectPos, delta * 3.5); // Snappier zoom-in
      targetLookAt.current.copy(inspectLookTarget);
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, isMobile ? 55 : 30, delta * 3.5);
    } else {
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, isMobile ? 55 : 40, delta * 2.5);
      const t = state.clock.getElapsedTime();
      const progress = smoothProgress.get() / 1000;
      const basePos = heroPosition.clone().lerp(garagePosition, progress);
      const baseLook = heroLookAt.clone().lerp(garageLookAt, progress);
      if (progress > 0.9) {
        basePos.y += Math.sin(t * 0.5) * 0.05;
        basePos.x += Math.cos(t * 0.3) * 0.05;
      } else {
        basePos.x = Math.sin(t * 0.1) * 7 * (1 - progress);
        basePos.z = 15 + Math.cos(t * 0.1) * 5 * (1 - progress);
      }
      currentPosition.current.lerp(basePos, delta * 1.5);
      targetLookAt.current.lerp(baseLook, delta * 2);
    }
    cameraRef.current.position.copy(currentPosition.current);
    currentLookAt.current.lerp(targetLookAt.current, delta * 3);
    cameraRef.current.lookAt(currentLookAt.current);
    cameraRef.current.updateProjectionMatrix();
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 10, 15]} fov={35} near={0.1} far={100} />;
}

export function GarageShowcase() {
  const [isMobile, setIsMobile] = useState(false);
  const [activePodium, setActivePodium] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('L');
  const [quantity, setQuantity] = useState(1);
  const scrollValue = useMotionValue(0);
  const smoothProgress = useSpring(scrollValue, { damping: 50, stiffness: 200 });
  const progressNormalized = useTransform(smoothProgress, [0, 1000], [0, 1]);
  const heroOpacity = useTransform(progressNormalized, [0, 0.3], [1, 0]);
  const heroY = useTransform(progressNormalized, [0, 0.3], [0, -50]);
  const heroPointerEvents = useTransform(progressNormalized, [0, 0.1], ["auto" as const, "none" as const]);
  const dragControls = useDragControls();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activePodium !== null || sizeChartOpen) return;
      // Prevent default browser scroll to stop the "wobble" and rubber-banding
      e.preventDefault();
      scrollValue.set(Math.min(1000, Math.max(0, scrollValue.get() + e.deltaY * 0.5)));
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (activePodium !== null || sizeChartOpen) return;
      lastTouchY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (activePodium !== null || sizeChartOpen) return;
      // Prevent pull-to-refresh and rubber banding
      if (e.cancelable) e.preventDefault();
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentY; 
      lastTouchY = currentY;
      scrollValue.set(Math.min(1000, Math.max(0, scrollValue.get() + deltaY * 2)));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    // Adding non-passive touchmove is needed to call preventDefault
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activePodium, sizeChartOpen, scrollValue]);

  const podiums = [
    {
      title: "CHARLES LECLERC — FERRARI TEE",
      driver: "Charles Leclerc",
      tagline: "Legacy meets speed.",
      position: [-3.3, 0, 0] as [number, number, number],
      accentColor: "#ff1801",
      price: 799,
      modelPath: "/models/CharlesLeclerc-opt.glb",
      description: "Ferrari is more than a team — it’s a legacy. This Charles Leclerc tee captures the intensity of Scuderia racing with a bold back graphic featuring Leclerc and the iconic Ferrari machine.",
      specs: ["240 GSM French Terry Cotton", "Oversized fit", "Premium soft cotton fabric", "High-detail graphic print"],
      fit: "Comfortable oversized fit designed for everyday wear."
    },
    {
      title: "GEORGE RUSSELL — MERCEDES TEE",
      driver: "George Russell",
      tagline: "Precision. Performance. Power.",
      position: [-1.1, 0, 0] as [number, number, number],
      accentColor: "#00d2ff",
      price: 799,
      modelPath: "/models/GeorgeRussell-opt.glb",
      description: "The Mercedes AMG Petronas era represents engineering excellence. This George Russell tee showcases that precision with a powerful back graphic featuring Russell and the silver machine.",
      specs: ["240 GSM French Terry Cotton", "Oversized fit", "Premium soft cotton fabric", "High-detail graphic print"],
      fit: "Relaxed oversized fit designed for comfort."
    },
    {
      title: "LANDO NORRIS — MCLAREN TEE",
      driver: "Lando Norris",
      tagline: "Pure racing energy.",
      position: [1.1, 0, 0] as [number, number, number],
      accentColor: "#ff8700",
      price: 799,
      modelPath: "/models/LandoNorris-opt.glb",
      description: "The McLaren spirit is fearless, fast, and always pushing forward. This Lando Norris tee captures that momentum with a dynamic back graphic featuring the iconic papaya machine.",
      specs: ["240 GSM French Terry Cotton", "Oversized fit", "Premium soft cotton fabric", "High-detail graphic print"],
      fit: "Designed with a relaxed oversized silhouette."
    },
    {
      title: "MAX VERSTAPPEN — RED BULL TEE",
      driver: "Max Verstappen",
      tagline: "Built for domination.",
      position: [3.3, 0, 0] as [number, number, number],
      accentColor: "#0600ef",
      price: 799,
      modelPath: "/models/MaxVerstappen-opt.glb",
      description: "Inspired by the relentless speed of Red Bull Racing, this tee captures the energy of championship racing. The back explodes with a bold graphic of Verstappen and his machine.",
      specs: ["240 GSM French Terry Cotton", "Oversized streetwear fit", "Premium soft cotton fabric", "High-detail graphic print"],
      fit: "Relaxed oversized silhouette designed for everyday wear."
    }
  ];

  const handleInteractionStart = (index: number) => {
    scrollValue.set(1000);
    setActivePodium(index);
    setTransitionState('entering'); // Start cinematic push-in
    
    // After camera push-in is well underway, show the UI
    setTimeout(() => {
      setTransitionState('ready');
    }, 1200);
  };

  const handleExit = () => {
    setTransitionState('returning_ui_out');
    
    // Stage 1: UI fades, then camera and main shirt begin cinematic return concurrently
    setTimeout(() => {
      setTransitionState('returning_main_shirt');
    }, 400);

    // Stage 2: As main shirt lands, other pedestals rise up gracefully from shadows
    setTimeout(() => {
      setActivePodium(null);
    }, 1400);

    // Stage 3: Return to idle state (restores hero text)
    setTimeout(() => {
      setTransitionState('idle');
      setIsMinimized(false);
    }, 2200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sizeChartOpen) setSizeChartOpen(false);
        else if (activePodium !== null && ['ready', 'centering'].includes(transitionState)) handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePodium, sizeChartOpen]);

  return (
    <div className="relative w-full h-[100dvh] bg-[#020202] overflow-hidden selection:bg-f1-red/30 touch-none">
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: false, powerPreference: "high-performance" }} dpr={isMobile ? [1, 1.2] : [1, 2]}>
          <Suspense fallback={null}>
            <color attach="background" args={['#020202']} />
            <CameraController activePodiumIndex={activePodium} smoothProgress={smoothProgress} transitionState={transitionState} isMobile={isMobile} />
            <ambientLight intensity={isMobile ? 1.0 : 0.4} />
            <directionalLight position={[0, 10, 5]} intensity={isMobile ? 1.5 : 0.5} />
            <WindTunnel />
            {!isMobile && <Sparkles count={150} scale={10} size={2} speed={0.4} opacity={0.1} color="#ffffff" position={[0, 5, 0]} />}
            {podiums.map((podium, i) => (
              <GaragePodium key={i} index={i} globalActiveIndex={activePodium} position={podium.position} accentColor={podium.accentColor} isActive={activePodium === i} onClick={() => handleInteractionStart(i)} modelPath={podium.modelPath} transitionState={transitionState} isMobile={isMobile} />
            ))}
            <mesh receiveShadow position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[100, 100]} />
              {!isMobile ? (
                <MeshReflectorMaterial blur={[400, 100]} resolution={1024} mixBlur={1} mixStrength={15} roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#050505" metalness={0.5} mirror={0.5} />
              ) : (
                <MeshReflectorMaterial blur={[100, 25]} resolution={128} mixBlur={0.5} mixStrength={5} roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#050505" metalness={0.5} mirror={0.15} />
              )}
            </mesh>
            <Environment preset="night" environmentIntensity={isMobile ? 0.75 : 0.2} />
            <fog attach="fog" args={['#020202', 8, 30]} />
            {!isMobile && (
              <EffectComposer>
                <Bloom luminanceThreshold={1} mipmapBlur intensity={activePodium !== null ? 0.2 : 0.8} />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {transitionState === 'idle' && (
          <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center w-full p-6 md:p-12 pointer-events-none">
            <a href="https://anantamracing.com" className="text-xl md:text-2xl font-orbitron font-black tracking-widest uppercase flex items-center gap-2 pointer-events-auto no-underline text-white">
              <span className="text-f1-red">ANANTAM</span> RACING
            </a>
            <div className="hidden md:flex items-center gap-12 font-orbitron text-[10px] tracking-[0.4em] uppercase text-white/40">
              <span onClick={() => scrollValue.set(1000)} className="hover:text-white transition-colors cursor-pointer pointer-events-auto">Collection</span>
              <a href="https://anantamracing.com" className="hover:text-white transition-colors pointer-events-auto no-underline text-white/40">The Lab</a>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePodium === null && transitionState === 'idle' && (
          <motion.div style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointerEvents }} className="absolute inset-0 z-10 flex flex-col justify-start pt-[12vh] md:pt-[15vh] items-center text-center px-4">
            <h1 className="text-[14vw] md:text-[10vw] font-display font-black italic tracking-tighter uppercase leading-[0.8] text-white">ANANTAM RACING</h1>
            <h2 className="mt-2 md:mt-4 text-sm md:text-2xl font-display font-black tracking-[0.3em] text-f1-red uppercase text-glow italic">FAST. FIERCE. FEARLESS.</h2>
            <div className="mt-12 group flex flex-col items-center gap-4">
              <span className="text-[10px] font-mono text-white/30 tracking-[0.5em] uppercase italic">// Scroll to Init</span>
              <div className="w-px h-20 bg-linear-to-b from-f1-red to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitionState === 'ready' && activePodium !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 pointer-events-none">
            <button onClick={handleExit} className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-4 md:gap-6 pointer-events-auto group outline-none z-100">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:border-f1-red transition-all">
                <span className="font-mono text-2xl text-white group-hover:text-f1-red">×</span>
              </div>
              <div className="text-left">
                <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase italic font-bold">// Return to Paddock</p>
                <p className="font-orbitron text-[10px] tracking-[0.2em] text-white uppercase italic">Exit Inspection</p>
              </div>
            </button>

            <motion.div
              initial={isMobile ? { y: '100dvh', opacity: 0 } : { x: '100%', opacity: 0 }}
              animate={isMobile 
                ? { y: isMinimized ? '45dvh' : 0, opacity: 1 } 
                : { x: 0, opacity: 1 }
              }
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              drag={isMobile ? "y" : false}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 500 }}
              dragElastic={0.05}
              onDragEnd={(_, info) => {
                if (info.offset.y > 50) setIsMinimized(true);
                else if (info.offset.y < -30) setIsMinimized(false);
              }}
              onWheel={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 top-auto md:inset-auto md:right-0 md:top-0 md:bottom-0 w-full md:w-[500px] h-[55dvh] md:h-[100dvh] md:bg-carbon/40 bg-carbon/95 backdrop-blur-3xl md:backdrop-blur-[60px] border-t-2 md:border-t-0 md:border-l border-white/20 md:border-white/10 p-6 pt-0 md:p-16 flex flex-col pointer-events-auto z-50 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] md:shadow-none"
            >
                {isMobile && (
                  <div 
                    onPointerDown={(e: any) => dragControls.start(e)}
                    onClick={() => isMinimized && setIsMinimized(false)}
                    className="w-full shrink-0 flex flex-col items-center py-6 cursor-pointer sticky top-0 bg-transparent z-60 touch-none"
                  >
                    <div className="w-16 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors mb-2" />
                    {isMinimized && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-orbitron text-[8px] tracking-[0.4em] text-f1-red uppercase font-black italic">
                        Tap handle to expand
                      </motion.p>
                    )}
                  </div>
                )}
                <div className={`relative flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 pb-12 ${isMinimized && isMobile ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}>
                  <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] opacity-20`} style={{ backgroundColor: podiums[activePodium].accentColor }} />
                  <p className="font-mono text-[10px] tracking-[0.5em] text-f1-red uppercase mb-4 italic font-bold">// SEASON 01 LIMITED</p>
                  <h3 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-[0.9] mb-4 text-white italic">
                    {podiums[activePodium].title}
                  </h3>
                  <p className="font-display text-xl font-black text-white/30 uppercase tracking-[0.2em] mb-8 italic">{podiums[activePodium].tagline}</p>

                  <div className="w-16 h-1 mb-10" style={{ backgroundColor: podiums[activePodium].accentColor }} />

                  <p className="text-sm font-light text-white/60 mb-10 leading-relaxed italic">
                    {podiums[activePodium].description}
                  </p>

                  <div className="grid grid-cols-2 gap-8 mb-12 border-y border-white/5 py-8">
                    <div>
                      <h5 className="font-mono text-[9px] tracking-[0.3em] text-f1-red uppercase mb-3 font-bold italic">// Build Specs</h5>
                      <ul className="space-y-1">
                        {podiums[activePodium].specs.map(s => (
                          <li key={s} className="font-mono text-[10px] text-white/40 uppercase tracking-widest italic">{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-mono text-[9px] tracking-[0.3em] text-f1-red uppercase mb-3 font-bold italic">// Silhouette</h5>
                      <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest italic">{podiums[activePodium].fit}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase italic font-bold">Select Size</span>
                      <button onClick={() => setSizeChartOpen(true)} className="font-mono text-[9px] tracking-widest uppercase text-white/30 hover:text-white underline italic cursor-pointer outline-none">[ Size Chart ]</button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {(['S', 'M', 'L', 'XL'] as Size[]).map((size) => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-14 font-mono text-xs uppercase transition-all outline-none border ${selectedSize === size ? 'border-white text-white bg-white/10' : 'border-white/10 text-white/50 hover:bg-white/5'} `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10 mb-8">
                    <p className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase italic font-bold ml-2">Units</p>
                    <div className="flex items-center gap-6">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-white/30 hover:text-white p-2 outline-none cursor-pointer"><Minus size={16} /></button>
                      <span className="font-display text-xl w-6 text-center text-white font-black italic">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="text-white/30 hover:text-white p-2 outline-none cursor-pointer"><Plus size={16} /></button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="font-mono text-[9px] tracking-widest text-white/20 uppercase mb-1 italic">Unit Value</p>
                      <p className="font-display text-5xl font-black text-white italic tracking-tighter">₹{799 * quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[9px] tracking-widest text-white/20 uppercase mb-1 italic">Unit Mark</p>
                      <p className="font-mono text-xs text-white/50 uppercase tracking-widest italic font-bold">ANANTAM-G1</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <button 
                      onClick={() => {
                        const msg = encodeURIComponent(`Hello, I would like to order the following item:\n\nProduct: ${podiums[activePodium].title}\nSize: ${selectedSize}\nQuantity: ${quantity}\n\nPlease confirm availability.`);
                        window.open(`https://wa.me/919310124672?text=${msg}`, '_blank');
                      }}
                      className="w-full flex items-center justify-center gap-4 py-6 bg-[#25D366] text-white font-orbitron font-black uppercase tracking-[0.3em] text-xs hover:bg-[#20bd5c] transition-all transform hover:scale-[1.02] active:scale-[0.98] outline-none cursor-pointer rounded-2xl shadow-[0_10px_30px_rgba(37,211,102,0.2)]"
                    >
                      <MessageCircle size={18} />
                      Order via WhatsApp
                    </button>
                    <p className="font-mono text-[9px] text-center text-white/20 uppercase tracking-widest italic font-bold">Secure Order // Instant Confirmation</p>
                  </div>
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
      <Loader
        containerStyles={{ background: '#020202', zIndex: 1000 }}
        innerStyles={{ width: '300px' }}
        barStyles={{ background: '#ff1801' }}
        dataStyles={{ fontFamily: 'Orbitron', fontSize: '12px', color: '#ffffff', letterSpacing: '0.2em' }}
      />
    </div>
  );
}
