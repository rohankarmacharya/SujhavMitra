import { useCallback, useEffect, useMemo, useState } from "react";
import { addToWishlist, removeFromWishlist, getWishlist } from "../services/wishlistService";

/**
 * Custom hook to manage wishlist state and operations
 * @returns {Object} Wishlist methods and state
 */
export default function useWishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map API response to internal format
  const mapApiToItems = useCallback((apiItems) => {
    if (!Array.isArray(apiItems)) {
      console.warn('Expected array of items, got:', apiItems);
      return [];
    }
    
    return apiItems.map(item => {
      // The item data is now stored in the 'data' field as a JSON string or object
      let itemData = {};
      
      // Handle different possible data formats
      if (item.data) {
        if (typeof item.data === 'string') {
          try {
            itemData = JSON.parse(item.data);
          } catch (e) {
            console.warn('Failed to parse item data:', item.data, e);
          }
        } else if (typeof item.data === 'object') {
          itemData = { ...item.data };
        }
      }
      
      // Common fields for all items
      const commonFields = {
        id: item.item_id,
        title: item.title || itemData.title || itemData.name || 'Untitled',
        overview: itemData.overview || itemData.description || '',
        poster_path: itemData.poster_path || itemData.image || null,
        genres: Array.isArray(itemData.genres) ? itemData.genres : 
               (typeof itemData.genres === 'string' ? itemData.genres.split(',').map(g => g.trim()) : [])
      };
      
      // Type-specific fields
      const typeSpecificFields = item.item_type === 'book' ? {
        isbn: item.item_id,
        author: itemData.author || itemData.authors?.[0] || 'Unknown Author',
        description: itemData.description || itemData.overview || '',
        cover_image: itemData.cover_image || itemData.image || null,
        pageCount: itemData.pageCount || itemData.page_count || null,
        publishedDate: itemData.publishedDate || itemData.published_date || null,
        publisher: itemData.publisher || null
      } : {
        // Movie-specific fields
        id: item.item_id,
        release_date: itemData.release_date || itemData.year || null,
        vote_average: itemData.vote_average || itemData.rating || null,
        vote_count: itemData.vote_count || 0,
        cast: itemData.cast || [],
        crew: itemData.crew || '',
        // Ensure we have a valid poster URL
        poster_path: itemData.poster_path || itemData.image || null,
        // Ensure genres is always an array
        genres: Array.isArray(itemData.genres) ? itemData.genres : 
              (typeof itemData.genres === 'string' ? itemData.genres.split(',').map(g => g.trim()) : [])
      };
      
      // Combine all fields
      const result = {
        id: item.id,
        kind: item.item_type,
        key: item.item_id.toString(),
        data: {
          ...commonFields,
          ...typeSpecificFields,
          // Include any additional fields from the original data
          ...itemData
        }
      };
      
      // Clean up any undefined or null values
      Object.keys(result.data).forEach(key => {
        if (result.data[key] === undefined || result.data[key] === null) {
          delete result.data[key];
        }
      });
      
      return result;
    });
  }, []);

  // Load wishlist from API on component mount
  const fetchWishlist = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const { success, data, error } = await getWishlist();
      
      // Only update state if component is still mounted
      if (isMounted) {
        if (success) {
          setItems(mapApiToItems(data));
        } else {
          setError(error || 'Failed to load wishlist');
        }
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (isMounted) {
        setError('Failed to fetch wishlist. Please try again.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [mapApiToItems]);

  // Initial fetch
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if an item is in the wishlist
  const isSaved = useCallback((kind, key) => {
    if (!kind || key === undefined || key === null) return false;
    const k = String(key);
    return items.some((it) => it.kind === kind && it.key === k);
  }, [items]);

  // Add item to wishlist
  const addItem = useCallback(async (kind, key, data) => {
    if (!kind || key === undefined || key === null) {
      console.error('Invalid parameters for addItem:', { kind, key });
      return { success: false, error: 'Invalid parameters' };
    }

    const k = String(key);
    
    // Check if already in wishlist
    if (isSaved(kind, k)) {
      return { success: true, alreadyExists: true };
    }

    // Create an AbortController for this request
    const controller = new AbortController();
    let isMounted = true;

    try {
      // Prepare the item data with all necessary fields
      const itemData = {
        ...data,
        id: k,
        // Ensure we have the correct ID field based on item type
        ...(kind === 'book' && { isbn: k }),
        ...(kind === 'movie' && { id: k }),
        // Ensure we have a title
        title: data?.title || data?.name || 'Untitled'
      };

      // Optimistic update
      const newItem = {
        id: `temp-${Date.now()}`,
        kind,
        key: k,
        data: itemData
      };
      
      setItems(prev => [...prev, newItem]);

      // Call API with complete item data and signal for aborting
      const { success, data: responseData, error } = await addToWishlist(
        kind, 
        k, 
        itemData,
        { signal: controller.signal }
      );

      if (!isMounted) {
        return { success: false, error: 'Operation cancelled' };
      }

      if (!success) {
        throw new Error(error || 'Failed to add to wishlist');
      }

      // Show success toast
      window.dispatchEvent(
        new CustomEvent("wishlist:toast", {
          detail: {
            action: "added",
            kind,
            key: k,
            data,
            variant: "success"
          }
        })
      );

      // Refresh the wishlist to get the latest data
      await fetchWishlist();

      return { success: true, data: responseData };
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Add to wishlist request was aborted');
        return { success: false, error: 'Request cancelled' };
      }

      console.error('Error adding to wishlist:', err);
      
      // Revert optimistic update on error
      if (isMounted) {
        setItems(prev => prev.filter(item => !(item.kind === kind && item.key === k)));
        setError(err.message || 'Failed to add to wishlist');
        
        // Show error toast
        window.dispatchEvent(
          new CustomEvent("wishlist:toast", {
            detail: {
              action: "error",
              message: err.message || "Failed to add to wishlist",
              variant: "error"
            }
          })
        );
      }
      
      return { success: false, error: err.message || 'Failed to add to wishlist' };
    } finally {
      // Cleanup function
      isMounted = false;
      controller.abort();
    }
  }, [isSaved, fetchWishlist]);

  // Remove item from wishlist
  const removeItem = useCallback(async (wishlistId) => {
    if (!wishlistId) {
      console.error('Invalid wishlistId for removeItem:', wishlistId);
      return { success: false, error: 'Invalid wishlist ID' };
    }

    try {
      // Find the item to remove
      const itemToRemove = items.find(item => item.id === wishlistId);
      if (!itemToRemove) {
        console.warn('Item not found in wishlist:', wishlistId);
        return { success: false, error: 'Item not found in wishlist' };
      }

      // Optimistic update
      setItems(prev => prev.filter(item => item.id !== wishlistId));

      // Call API
      const { success, error } = await removeFromWishlist(wishlistId);

      if (!success) {
        throw new Error(error || 'Failed to remove from wishlist');
      }

      // Show success toast
      window.dispatchEvent(
        new CustomEvent("wishlist:toast", {
          detail: {
            action: "removed",
            kind: itemToRemove.kind,
            key: itemToRemove.key,
            variant: "error"
          }
        })
      );

      return { success: true };
    } catch (err) {
      console.error("Error in removeItem:", err);
      // Revert optimistic update on error
      await fetchWishlist();
      
      // Show error toast
      window.dispatchEvent(
        new CustomEvent("wishlist:toast", {
          detail: {
            action: "error",
            message: err.message || "Failed to remove from wishlist",
            variant: "error"
          }
        })
      );
      
      return { 
        success: false, 
        error: err.message || 'Failed to remove from wishlist' 
      };
    }
  }, [items, fetchWishlist]);

  // Toggle item in wishlist
  const toggleItem = useCallback(async (kind, key, data) => {
    const k = String(key);
    const existingItem = items.find(item => item.kind === kind && item.key === k);
    
    if (existingItem) {
      return removeItem(existingItem.id);
    } else {
      return addItem(kind, k, data);
    }
  }, [items, addItem, removeItem]);

  // Memoized values
  const memoizedValues = useMemo(() => ({
    isSaved,
    add: addItem,
    remove: removeItem,
    toggle: toggleItem,
    refresh: fetchWishlist,
    list: items,
    count: items.length,
    loading,
    error
  }), [
    isSaved, 
    addItem, 
    removeItem, 
    toggleItem, 
    fetchWishlist, 
    items, 
    loading, 
    error
  ]);

  return memoizedValues;
}
