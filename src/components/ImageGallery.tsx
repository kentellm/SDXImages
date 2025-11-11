import { StorageImage } from '@aws-amplify/ui-react-storage';
import { useEffect, useState, useCallback, useRef } from "react";
import { list } from 'aws-amplify/storage';
import './Gallery.css';

// --- Configuration ---
const ITEMS_PER_PAGE = 10;
const FOLDER_PATH = 'image-submissions/';

interface FileItem {
  path: string;
}

function PaginatedImageGallery() {
  const [imageList, setImageList] = useState<FileItem[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);
  
  // Zoom and pan states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await list({
        path: FOLDER_PATH,
        options: {
          pageSize: ITEMS_PER_PAGE,
          nextToken,
        },
      });
      
      const newItems = response.items.filter(item => item.path !== FOLDER_PATH);
      setImageList(prevList => [...prevList, ...newItems]);
      setNextToken(response.nextToken);

      if (!response.nextToken) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading image page:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextToken, hasMore]);

  useEffect(() => {
    loadNextPage();
  }, []);

  // Reset zoom and pan when opening a new image
  const openImage = (path: string) => {
    setSelectedImageKey(path);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Close modal and reset states
  const closeModal = () => {
    setSelectedImageKey(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom controls
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // Pan functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImageKey) return;
      
      switch(e.key) {
        case 'Escape':
          closeModal();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageKey]);

  return (
    <div>
      <h2>Image Gallery (Click to view full size)</h2>
      
      {/* Thumbnail Grid Display */}
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
            onClick={() => openImage(file.path)}
          >
            <StorageImage 
              alt={file.path.split('/').pop() || 'Uploaded image'} 
              path={file.path} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.2s ease-in-out',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        {isLoading && <p>Loading more images...</p>}

        {!isLoading && hasMore && (
          <button onClick={loadNextPage} style={{ padding: '10px 20px', cursor: 'pointer' }}>
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

      {/* Enhanced Full-Size Image Modal with Zoom & Pan */}
      {selectedImageKey && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          {/* Zoom Controls Bar */}
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '10px 20px',
              borderRadius: '30px',
              zIndex: 1002,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={zoomOut}
              disabled={scale <= 0.5}
              style={{ 
                padding: '8px 16px',
                fontSize: '1.2rem',
                cursor: scale <= 0.5 ? 'not-allowed' : 'pointer',
                border: 'none',
                background: scale <= 0.5 ? '#ddd' : '#007bff',
                color: 'white',
                borderRadius: '5px',
                fontWeight: 'bold',
              }}
            >
              −
            </button>
            
            <span style={{ 
              padding: '8px 16px', 
              fontSize: '1rem',
              fontWeight: '600',
              color: '#333',
              minWidth: '80px',
              textAlign: 'center',
            }}>
              {Math.round(scale * 100)}%
            </span>
            
            <button 
              onClick={zoomIn}
              disabled={scale >= 5}
              style={{ 
                padding: '8px 16px',
                fontSize: '1.2rem',
                cursor: scale >= 5 ? 'not-allowed' : 'pointer',
                border: 'none',
                background: scale >= 5 ? '#ddd' : '#007bff',
                color: 'white',
                borderRadius: '5px',
                fontWeight: 'bold',
              }}
            >
              +
            </button>
            
            <button 
              onClick={resetZoom}
              style={{ 
                padding: '8px 16px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: 'none',
                background: '#6c757d',
                color: 'white',
                borderRadius: '5px',
              }}
            >
              Reset
            </button>
          </div>

          {/* Close Button */}
          <button 
            onClick={closeModal}
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              background: 'rgba(255, 255, 255, 0.9)', 
              border: 'none', 
              fontSize: '2rem', 
              cursor: 'pointer', 
              color: '#333',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1002,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            ×
          </button>

          {/* Instructions */}
          <div 
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              zIndex: 1002,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {scale > 1 ? 'Drag to pan • ' : ''}Scroll to zoom • +/- keys • ESC to close
          </div>

          {/* Image Container with Pan & Zoom */}
          <div 
            ref={imageContainerRef}
            style={{ 
              width: '90vw',
              height: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <StorageImage 
                alt={selectedImageKey.split('/').pop() || 'Full-size image'} 
                path={selectedImageKey} 
                style={{ 
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  display: 'block', 
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaginatedImageGallery;