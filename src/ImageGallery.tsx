import { StorageImage, FileUploader } from '@aws-amplify/ui-react-storage';
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
      <h2>Image Gallery (10 items per page)</h2>
      
      {/* Gallery Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {imageList.map((file) => (
          <div key={file.path} style={{ border: '1px solid #ccc', padding: '10px' }}>
            {/* The StorageImage component handles rendering and secure URL generation */}
            <StorageImage 
              alt={file.path.split('/').pop()} // Use the file name as alt text
              path={file.path} 
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {isLoading && <div>Loading more images...</div>}

        {!isLoading && hasMore && (
          <button onClick={loadNextPage} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Load More (Next 10)
          </button>
        )}

        {!hasMore && imageList.length > 0 && (
          <div style={{ color: '#888' }}>
            All images loaded. 🎉
          </div>
        )}

        {imageList.length === 0 && !isLoading && !hasMore && (
            <div>No images found in the folder.</div>
        )}
      </div>
    </div>
  );
}

export default PaginatedImageGallery;