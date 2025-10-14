import { StorageImage } from '@aws-amplify/ui-react-storage';
import { useEffect, useState, useCallback } from "react";
import { list } from 'aws-amplify/storage';

// --- Configuration ---
const ITEMS_PER_PAGE = 10;
const FOLDER_PATH = 'image-submissions/'; // Must end with a '/'

interface FileItem {
  path: string;
}

function PaginatedImageGallery() {
  const [imageList, setImageList] = useState<FileItem[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null); // State for full-size image

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
      
      // 1. Filter out the folder key itself (e.g., 'image-submissions/')
      const newItems = response.items.filter(item => item.path !== FOLDER_PATH);

      // 2. Append new items to the existing list
      setImageList(prevList => [...prevList, ...newItems]);

      // 3. Update the nextToken for the next request
      setNextToken(response.nextToken);

      // 4. Check if we've reached the end
      if (!response.nextToken) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading image page:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextToken, hasMore]);

  // Load the first page when the component mounts
  useEffect(() => {
    loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it runs only once

 // --- Render Logic ---
  return (
    <div>
      <h2>Image Gallery (Click to view full size)</h2>
      
      {/* Thumbnail Grid Display */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Adjust minmax for desired thumbnail width
        gap: '16px',
        maxWidth: '1200px', // Optional: Control max width of the grid
        margin: '0 auto', // Optional: Center the grid
      }}>
        {imageList.map((file) => (
          <div 
            key={file.path} 
            style={{ 
              width: '100%', 
              paddingBottom: '100%', // Creates a square aspect ratio (1:1)
              position: 'relative',
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden', // Ensures image doesn't break aspect ratio box
            }}
            onClick={() => setSelectedImageKey(file.path)} // Set selected image on click
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
                objectFit: 'cover', // This is key for uniform thumbnail size
                transition: 'transform 0.2s ease-in-out',
              }}
              // Optional: Add hover effect
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
          <p style={{ color: '#888' }}>
            All images loaded. 🎉
          </p>
        )}

        {imageList.length === 0 && !isLoading && !hasMore && (
            <p>No images found in the folder.</p>
        )}
      </div>

      {/* Full-Size Image Modal */}
      {selectedImageKey && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000, // Ensure it's above other content
          }}
          onClick={() => setSelectedImageKey(null)} // Close modal on overlay click
        >
          <div 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              backgroundColor: 'white', 
              padding: '10px', 
              borderRadius: '8px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          >
            <button 
              onClick={() => setSelectedImageKey(null)} 
              style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer', 
                color: '#333',
                zIndex: 1001,
              }}
            >
              ×
            </button>
            <StorageImage 
              alt={selectedImageKey.split('/').pop() || 'Full-size image'} 
              path={selectedImageKey} 
              style={{ 
                maxWidth: 'calc(90vw - 20px)', // Account for padding
                maxHeight: 'calc(90vh - 20px)', // Account for padding
                display: 'block', 
                objectFit: 'contain', // Ensures the whole image is visible
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PaginatedImageGallery;