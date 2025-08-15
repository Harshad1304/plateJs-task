import { useState, useEffect, useCallback, useRef } from "react";

const AddButton = ({ editor, onOpenDialog, showDialog }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  const positionUpdateTimeoutRef = useRef(null);
  const lastPositionRef = useRef({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!editor || showDialog) {
      setIsVisible(false);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!range) {
      setIsVisible(false);
      return;
    }

    // Check if selection is within the editor
    const editorElement = document.querySelector("[data-slate-editor]");
    if (!editorElement || !editorElement.contains(range.commonAncestorContainer)) {
      setIsVisible(false);
      return;
    }

    // Additional check: See if current selection is within an MCQ element using editor value
    try {
      const editorValue = editor.children;
      const currentPath = editor.selection?.anchor?.path;
      
      if (currentPath && currentPath.length > 0) {
        // Check if the current path leads to an MCQ element
        let currentNode = editorValue;
        for (let i = 0; i < currentPath.length; i++) {
          if (currentNode && currentNode[currentPath[i]]) {
            currentNode = currentNode[currentPath[i]];
            if (currentNode && currentNode.type === 'mcq') {
              console.log('Hiding button: MCQ element detected via editor value');
              setIsVisible(false);
              return;
            }
          }
        }
      }
    } catch (error) {
      console.log('Error checking editor value for MCQ:', error);
    }

    // Check if cursor is on an MCQ element
    let currentNode = range.commonAncestorContainer;
    let isOnMCQElement = false;
    
    // First, check if we're directly inside an MCQ element
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode;
      if (element.getAttribute('data-slate-element') === 'mcq' || 
          element.classList.contains('mcq-element') ||
          element.getAttribute('data-mcq') === 'true') {
        isOnMCQElement = true;
      }
    }
    
    // If not directly on MCQ element, traverse up the DOM tree
    if (!isOnMCQElement) {
      while (currentNode && currentNode !== editorElement) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode;
          
          // Check multiple ways to identify MCQ elements
          const isMCQElement = 
            element.getAttribute('data-slate-element') === 'mcq' ||
            element.closest('[data-slate-element="mcq"]') ||
            element.classList.contains('mcq-element') ||
            element.closest('.mcq-element') ||
            element.getAttribute('data-mcq') === 'true' ||
            element.closest('[data-mcq="true"]') ||
            // Check if the element contains MCQ-specific content
            element.textContent?.includes('Submit Answer') ||
            element.querySelector('input[type="radio"]') !== null ||
            // Additional checks for MCQ elements
            element.querySelector('[class*="mcq"]') !== null;
          
          if (isMCQElement) {
            console.log('MCQ element detected, hiding button');
            isOnMCQElement = true;
            break;
          }
        }
        currentNode = currentNode.parentNode;
      }
    }

    // Hide button if on MCQ element
    if (isOnMCQElement) {
      console.log('Hiding button: MCQ element detected');
      setIsVisible(false);
      return;
    }

    // Debug: Log when button should be visible

    // Get the selection rectangle
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      // Collapsed selection (just cursor), try to get position from a text node
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE && textNode.parentNode) {
        const tempRange = document.createRange();
        tempRange.setStart(textNode, range.startOffset);
        tempRange.setEnd(textNode, range.startOffset);
        const tempRect = tempRange.getBoundingClientRect();
        if (tempRect.width > 0 || tempRect.height > 0) {
          rect.top = tempRect.top;
          rect.left = tempRect.left;
          rect.width = tempRect.width;
          rect.height = tempRect.height;
        }
      }
    }

    // Validate rectangle dimensions
    if (rect.width === 0 && rect.height === 0) {
      setIsVisible(false);
      return;
    }

    const editorRect = editorElement.getBoundingClientRect();
    
    // Calculate position relative to the editor
    const newPosition = {
      top: rect.top - editorRect.top + rect.height,
      left: rect.left - editorRect.left + rect.width,
    };

    // Only update if position has actually changed significantly (performance optimization)
    const positionChanged = Math.abs(newPosition.top - lastPositionRef.current.top) > 1 || 
                           Math.abs(newPosition.left - lastPositionRef.current.left) > 1;
    
    if (positionChanged) {
      setPosition(newPosition);
      lastPositionRef.current = newPosition;
      setIsVisible(true);
    }
  }, [editor, showDialog]);

  useEffect(() => {
    if (!editor) return;

    // Debounced position update for better performance
    const debouncedUpdatePosition = () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
      positionUpdateTimeoutRef.current = setTimeout(updatePosition, 10);
    };

    const handleSelectionChange = () => {
      debouncedUpdatePosition();
    };

    const handleScroll = () => {
      debouncedUpdatePosition();
    };

    const handleResize = () => {
      debouncedUpdatePosition();
    };

    const handleKeyDown = () => {
      debouncedUpdatePosition();
    };

    const handleMouseUp = () => {
      debouncedUpdatePosition();
    };

    // Add event listeners
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Initial position update
    updatePosition();

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mouseup", handleMouseUp);
      
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
    };
  }, [editor, updatePosition]);

  const handleClick = () => {
    onOpenDialog();
  };

  if (!isVisible) return null;
  

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: `${position.top - 10}px`,
          left: `${position.left + 5}px`,
          zIndex: 1000,
          transform: "translateY(-50%)",
        }}
        className="bg-white border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-out"
      >
        <button
          onClick={handleClick}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Add MCQ question"
        >
          +
        </button>
      </div>
    </>
  );
};

export default AddButton;
