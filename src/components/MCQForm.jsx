import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

const MCQForm = ({ onSubmit=()=>{} , onClose, editData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm({
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      selectedOption: null
    },
    mode: "onChange"
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };
  useEffect(() => {
    if (editData) {
      reset({
        question: editData.question,
        options: editData.options,
        selectedOption: editData.selectedOption
      });
    }
  }, [editData, reset]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {editData ? "Edit MCQ Question" : "Add MCQ Question"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 space-y-5">
          {/* Question Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("question", { 
                required: "Question is required",
                minLength: { value: 3, message: "Question must be at least 3 characters" }
              })}
              placeholder="Enter your question here..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.question ? "border-red-300" : "border-gray-300"
              }`}
              rows="3"
            />
            {errors.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
            )}
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex items-center h-10">
                    <input
                      type="radio"
                      {...register("selectedOption", { 
                        required: "Please select a correct answer" 
                      })}
                      value={index}
                      id={`option-${index}`}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      {...register(`options.${index}`, { 
                        required: `Option ${index + 1} is required`,
                        minLength: { value: 1, message: `Option ${index + 1} cannot be empty` }
                      })}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.options?.[index] ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.options?.[index] && (
                      <p className="text-red-500 text-xs mt-1">{errors.options[index].message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.selectedOption && (
              <p className="text-red-500 text-sm mt-2">{errors.selectedOption.message}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-5 py-2.5 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {editData ? "Update MCQ" : "Add MCQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MCQForm;