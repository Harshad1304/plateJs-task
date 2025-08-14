import { useState, useEffect } from 'react';

const AddButton = ({ editor }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const editorElement = document.querySelector('[data-slate-editor]');
        if (editorElement) {
          const editorRect = editorElement.getBoundingClientRect();
          
          setPosition({
            top: rect.top - editorRect.top + rect.height,
            left: rect.left - editorRect.left
          });
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    };

    const handleSelectionChange = () => {
      updatePosition();
    };

    const handleScroll = () => {
      updatePosition();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [editor]);

  const handleClick = () => {
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setQuestion('');
    setOptions(['', '', '', '']);
    setSelectedOption(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Test function to verify editor is working
  const testEditor = () => {
    if (editor) {
      console.log('Editor exists:', editor);
      try {
        editor.insertText('Test text from editor!');
        console.log('Test text inserted successfully');
      } catch (error) {
        console.error('Error inserting test text:', error);
      }
    } else {
      console.log('Editor is null or undefined');
    }
  };

  const insertMCQContent = () => {
    if (!editor || !question.trim()) return;

    const validOptions = options.filter(option => option.trim());
    const correctAnswer = selectedOption;
    
    console.log('Attempting to insert MCQ content:', { question, validOptions, correctAnswer });
    
    try {
      // Create MCQ element
      const mcqElement = {
        type: 'mcq',
        question: question,
        options: validOptions,
        correctAnswer: correctAnswer,
        children: [{ text: '' }]
      };
      
      // Insert the MCQ element
      editor.insertNode(mcqElement);
      editor.insertBreak();
      
      console.log('MCQ element inserted successfully');
      
    } catch (error) {
      console.error('Error inserting MCQ element:', error);
      // Fallback: insert as plain text
      const fullText = `\n\nMCQ Question:\n${question}\n\nOptions:\n${validOptions
        .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
        .join('\n')}\n\nCorrect Answer: ${String.fromCharCode(65 + selectedOption)}. ${validOptions[selectedOption]}\n\n`;
      
      editor.insertText(fullText);
    }
  };

  const handleSubmit = () => {
    if (question.trim() && selectedOption !== null) {
      console.log('Question:', question);
      console.log('Options:', options);
      console.log('Selected Option:', options[selectedOption]);
      
      // Insert the MCQ content into the editor
      insertMCQContent();
      
      // Close the dialog
      closeDialog();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: `${position.top-10}px`,
          left: `${position.left-40}px`,
          zIndex: 1000, 
          transform: 'translateY(-50%)',
        }}
        className="bg-white border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        <button
          onClick={handleClick}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
        >
          +
        </button>
      </div>

      {/* Test button for debugging */}
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1001,
        }}
      >
        <button
          onClick={testEditor}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Editor
        </button>
      </div>

      {/* Question Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add MCQ Question</h3>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question:
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options:
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="option"
                        id={`option-${index}`}
                        checked={selectedOption === index}
                        onChange={() => setSelectedOption(index)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || selectedOption === null}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add MCQ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddButton;