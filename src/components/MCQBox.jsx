import React, { useState } from 'react';

const MCQBox = ({ attributes, children, element }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === element.correctAnswer;

  return (
    <div {...attributes} contentEditable={false} className="border-2 border-gray-200 p-6 bg-gray-50 rounded-lg shadow-md my-6">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3 pb-2 border-b border-gray-300">
          {element.question}
        </h3>
      </div>
      
      <div className="space-y-3 mb-4">
        {element.options.map((option, index) => (
          <div 
            key={index} 
            className={`flex items-center p-3 rounded-md border transition-colors cursor-pointer ${
              selectedAnswer === index 
                ? 'bg-blue-100 border-blue-300' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handleOptionSelect(index)}
          >
            <input
              type="radio"
              name={`mcq-${element.id || 'default'}`}
              id={`option-${index}`}
              checked={selectedAnswer === index}
              onChange={() => handleOptionSelect(index)}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <label 
              htmlFor={`option-${index}`}
              className="flex-1 cursor-pointer text-gray-700"
            >
              {String.fromCharCode(65 + index)}. {option}
            </label>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
        
        {showResult && (
          <div className={`px-4 py-2 rounded font-medium ${
            isCorrect 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>
        )}
      </div>
      
      {showResult && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
          <p className="text-green-800 font-medium">
            <span className="font-bold">Correct Answer:</span> {String.fromCharCode(65 + element.correctAnswer)}. {element.options[element.correctAnswer]}
          </p>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default MCQBox;