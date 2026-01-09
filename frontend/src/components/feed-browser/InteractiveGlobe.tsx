import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { localesData, latLonToVector3, getPinSize, getPinColor } from '../../lib/locales-data';
import type { LocalePin } from '../../types/feed';

interface GlobePinProps {
  locale: LocalePin;
  onClick: (locale: LocalePin) => void;
  onHover: (locale: LocalePin | null) => void;
  isHovered: boolean;
}

/**
 * Individual pin component for each locale on the globe.
 */
function GlobePin({ locale, onClick, onHover, isHovered }: GlobePinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position] = useState(() => latLonToVector3(locale.lat, locale.lon, 1.02));
  const size = useMemo(() => getPinSize(locale.articleCount), [locale.articleCount]);
  const color = useMemo(() => getPinColor(locale.articleCount), [locale.articleCount]);

  useFrame((state) => {
    if (meshRef.current && isHovered) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={position}>
      {/* Glow effect when hovered */}
      {isHovered && (
        <Sphere args={[size * 2, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            attach="material"
          />
        </Sphere>
      )}

      {/* Main pin */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(locale);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(locale);
        }}
        onPointerOut={() => onHover(null)}
        scale={isHovered ? 1.5 : 1}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.8 : 0.3}
          attach="material"
        />
      </mesh>

      {/* Tooltip on hover */}
      {isHovered && (
        <Html
          position={[0, size + 0.1, 0]}
          center
          distanceFactor={2}
          style={{
            pointerEvents: 'none',
            transition: 'all 0.2s',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-lol-card border border-lol-gold/50 rounded-lg px-3 py-2 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{locale.flag}</span>
              <span className="text-white font-medium text-sm">{locale.name}</span>
            </div>
            <div className="text-lol-gold text-xs font-semibold">
              {locale.articleCount} articles
            </div>
            <div className="text-gray-400 text-xs">
              {locale.code}
            </div>
          </motion.div>
        </Html>
      )}
    </group>
  );
}

interface GlobeSceneProps {
  onLocaleClick: (locale: LocalePin) => void;
  hoveredLocale: LocalePin | null;
  onLocaleHover: (locale: LocalePin | null) => void;
  selectedLocale: LocalePin | null;
}

/**
 * Main 3D scene with globe and pins.
 */
function GlobeScene({ onLocaleClick, hoveredLocale, onLocaleHover, selectedLocale }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Mesh>(null);

  // Auto-rotation when not interacting
  useFrame(() => {
    if (globeRef.current && !hoveredLocale && !selectedLocale) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0AC8B9" />

      {/* Main Globe Sphere */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#0A1428"
          roughness={0.8}
          metalness={0.2}
          attach="material"
        />
      </Sphere>

      {/* Wireframe overlay for tech look */}
      <Sphere args={[1.01, 32, 32]}>
        <meshBasicMaterial
          color="#C89B3C"
          wireframe
          transparent
          opacity={0.1}
          attach="material"
        />
      </Sphere>

      {/* Locale Pins */}
      {localesData.map((locale) => (
        <GlobePin
          key={locale.code}
          locale={locale}
          onClick={onLocaleClick}
          onHover={onLocaleHover}
          isHovered={hoveredLocale?.code === locale.code}
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={4}
        autoRotate={!hoveredLocale && !selectedLocale}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

/**
 * Loading indicator for the globe.
 */
function LoadingGlobe() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="text-6xl mb-4"
      >
        🌍
      </motion.div>
      <p className="text-lol-gold font-medium">Loading Globe...</p>
    </div>
  );
}

interface InteractiveGlobeProps {
  onLocaleFilter?: (localeCode: string) => void;
}

/**
 * Interactive 3D Globe component displaying all 20 supported locales.
 * Features:
 * - Geographic positioning of locale pins
 * - Pin size based on article count
 * - Pin color heatmap (gold = high, blue = low)
 * - Hover tooltips with locale info
 * - Click to filter by locale
 * - Auto-rotation when idle
 * - Smooth camera transitions
 */
export const InteractiveGlobe = ({ onLocaleFilter }: InteractiveGlobeProps) => {
  const [hoveredLocale, setHoveredLocale] = useState<LocalePin | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<LocalePin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLocaleClick = (locale: LocalePin) => {
    setSelectedLocale(locale);

    // Trigger filter callback
    if (onLocaleFilter) {
      onLocaleFilter(locale.code);
    }

    // Reset selection after 2 seconds
    setTimeout(() => {
      setSelectedLocale(null);
    }, 2000);
  };

  const handleLocaleHover = (locale: LocalePin | null) => {
    setHoveredLocale(locale);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold text-lol-gold mb-2">
            🌍 Interactive 3D Globe
          </h2>
          <p className="text-lol-blue max-w-2xl mx-auto">
            Explore RSS feeds across 20 locales worldwide. Hover for details, click to filter.
          </p>
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lol-gold" />
            <span className="text-sm text-gray-300">200+ articles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lol-blue" />
            <span className="text-sm text-gray-300">100-200 articles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lol-blue-light" />
            <span className="text-sm text-gray-300">50-100 articles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lol-blue-dark" />
            <span className="text-sm text-gray-300">&lt;50 articles</span>
          </div>
          <div className="text-sm text-gray-400">
            Pin size indicates article count
          </div>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full h-[600px] rounded-xl overflow-hidden bg-lol-dark border border-lol-gold/20"
      >
        {isLoading && <LoadingGlobe />}

        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 45 }}
          onCreated={() => setIsLoading(false)}
          style={{ cursor: hoveredLocale ? 'pointer' : 'grab' }}
        >
          <GlobeScene
            onLocaleClick={handleLocaleClick}
            hoveredLocale={hoveredLocale}
            onLocaleHover={handleLocaleHover}
            selectedLocale={selectedLocale}
          />
        </Canvas>

        {/* Instructions Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 left-4 right-4 flex justify-center"
        >
          <div className="bg-lol-card/90 backdrop-blur-sm border border-lol-gold/30 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-300 text-center">
              <span className="text-lol-gold font-semibold">Drag</span> to rotate •
              <span className="text-lol-gold font-semibold"> Scroll</span> to zoom •
              <span className="text-lol-gold font-semibold"> Hover</span> for details •
              <span className="text-lol-gold font-semibold"> Click</span> to filter
            </p>
          </div>
        </motion.div>

        {/* Selected Locale Indicator */}
        {selectedLocale && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 right-4 bg-lol-card border border-lol-gold rounded-lg px-4 py-3 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedLocale.flag}</span>
              <div>
                <div className="text-white font-medium">{selectedLocale.name}</div>
                <div className="text-lol-gold text-sm">Filtering feeds...</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-lol-gold mb-1">20</div>
          <div className="text-xs text-gray-400">Locales</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-lol-blue mb-1">
            {localesData.reduce((sum, l) => sum + l.articleCount, 0)}
          </div>
          <div className="text-xs text-gray-400">Total Articles</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {Math.max(...localesData.map((l) => l.articleCount))}
          </div>
          <div className="text-xs text-gray-400">Max (Locale)</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {Math.min(...localesData.map((l) => l.articleCount))}
          </div>
          <div className="text-xs text-gray-400">Min (Locale)</div>
        </div>
      </motion.div>
    </div>
  );
};
