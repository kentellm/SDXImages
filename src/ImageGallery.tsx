// PaginatedImageGallery.tsx
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { useEffect, useState, useCallback, useRef } from "react";
import { list } from 'aws-amplify/storage';
import './Gallery.css';

// ──────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;
const FOLDER_PATH = 'image-submissions/'; // Must end with a '/'
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface FileItem { path: string; }

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

// ──────────────────────────────────────────────────────────────
// Reusable zoomable image (modal or inline)
// ──────────────────────────────────────────────────────────────
function ZoomableImage({
  path,
  alt,
  onClose,
}: {
  path: string;
  alt: string;
  onClose?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // ---------- Slider ----------
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = Number(e.target.value);
    setZoom((z) => ({ ...z, scale: newScale }));
  };

  // ---------- Wheel (desktop) ----------
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => {
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z.scale + delta));
      return { ...z, scale: newScale };
    });
  };

  // ---------- Pinch / Double-tap ----------
  const lastTap = useRef<number>(0);
  const lastDistance = useRef<number>(0);
  const startPos = useRef<{ x: number; y: number } | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    lastDistance.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
  } else if (e.touches.length === 1) {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setZoom((z) => ({
        ...z,
        scale: z.scale > 1.5 ? MIN_ZOOM : 2,
        translateX: 0,
        translateY: 0,
      }));
    }
    lastTap.current = now;
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const distance = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
    const ratio = distance / lastDistance.current;
    lastDistance.current = distance;

    setZoom((z) => {
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z.scale * ratio));
      return { ...z, scale: newScale };
    });
  } else if (e.touches.length === 1 && zoom.scale > 1 && startPos.current) {
    const dx = e.touches[0].clientX - startPos.current.x;
    const dy = e.touches[0].clientY - startPos.current.y;
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setZoom((z) => ({
      ...z,
      translateX: z.translateX + dx,
      translateY: z.translateY + dy,
    }));
  }
};


  const resetZoom = () => setZoom({ scale: 1, translateX: 0, translateY: 0 });

  // ---------- Render ----------
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'hidden',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '2rem',
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      {/* Image */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <StorageImage
          ref={imgRef}
          path={path}
          alt={alt}
          style={{
            maxWidth: 'none',
            maxHeight: 'none',
            transform: `translate(${zoom.translateX}px, ${zoom.translateY}px) scale(${zoom.scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.05s',
            cursor: zoom.scale > 1 ? 'grab' : 'default',
          }}
        />
      </div>

      {/* Controls (desktop slider + reset) */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 16px',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>Zoom:</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.1}
          value={zoom.scale}
          onChange={handleSlider}
          style={{ width: 150 }}
        />
        <span>{zoom.scale.toFixed(1)}×</span>
        <button onClick={resetZoom} style={{ marginLeft: 8 }}>
          Reset
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Gallery Component
// ──────────────────────────────────────────────────────────────
export default function PaginatedImageGallery() {
  const [imageList, setImageList] = useState<FileItem[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await list({
        path: FOLDER_PATH,
        options: { pageSize: ITEMS_PER_PAGE, nextToken },
      });
      const newItems = response.items.filter((i) => i.path !== FOLDER_PATH);
      setImageList((prev) => [...prev, ...newItems]);
      setNextToken(response.nextToken);
      if (!response.nextToken) setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextToken, hasMore]);

  useEffect(() => {
    loadNextPage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h2>Image Gallery (Click to view full size)</h2>

      {/* Thumbnails */}
      <div className="gallery-grid">
        {imageList.map((file) => (
          <div
            key={file.path}
            style={{
              width: '100%',
              paddingBottom: '100%',
              position: 'relative',
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
            onClick={() => setSelectedImageKey(file.path)}
          >
            <StorageImage
              alt={file.path.split('/').pop() || 'Uploaded image'}
              path={file.path}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform .2s ease-in-out',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 30, textAlign: 'center' }}>
        {isLoading && <p>Loading more images...</p>}
        {!isLoading && hasMore && (
          <button onClick={loadNextPage} style={{ padding: '10px 20px' }}>
            Load More ({ITEMS_PER_PAGE} images)
          </button>
        )}
        {!hasMore && imageList.length > 0 && (
          <p style={{ color: '#888' }}>All images loaded.</p>
        )}
        {imageList.length === 0 && !isLoading && !hasMore && (
          <p>No images found in the folder.</p>
        )}
      </div>

      {/* Full-size modal with zoom */}
      {selectedImageKey && (
        <ZoomableImage
          path={selectedImageKey}
          alt={selectedImageKey.split('/').pop() || 'Full-size image'}
          onClose={() => setSelectedImageKey(null)}
        />
      )}
    </div>
  );
}