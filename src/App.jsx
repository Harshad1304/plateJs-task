import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import { useState } from 'react';
import AddButton from './components/AddButton';
import MCQElement from './components/MCQElement';
import MCQForm from './components/MCQForm';

export default function App() {   
  const [showDialog, setShowDialog] = useState(false);

  const editor = usePlateEditor({
    value:[
      {type:'p',
        children:[{text:"Welcome To Classavo"}]
      }
    ]
  });

  const insertMCQContent = (formData) => {
    
    try {
      // Filter out empty options
      const validOptions = formData.options.filter(option => option.trim() !== '');
      
      // Insert the MCQ content into the editor
      const mcqNode = {
        type: 'mcq',
        question: formData.question,
        options: validOptions,
        correctAnswer: parseInt(formData.selectedOption),
        children: [{ text: '' }]
      };
      
      
      // Insert the MCQ node at the current selection
      editor.insertNode(mcqNode);

    } catch (error) {
      console.error(error);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const handleSubmit = (formData) => {
    insertMCQContent(formData);
    closeDialog();
  };
  
  return (
    <div className="relative">
      <Plate editor={editor}>
        <PlateContent 
          className='bg-amber-100 min-h-screen w-full  pt-32 px-20'
          placeholder="Type your amazing content here..."
          renderElement={(props) => {
            if (props.element.type === 'mcq') {
             
              return <MCQElement {...props} />;
            }
            return <div {...props.attributes}>{props.children}</div>;
          }}
        />
        <AddButton 
          editor={editor} 
          showDialog={showDialog}
          onOpenDialog={() => setShowDialog(true)}
        /> 
      </Plate>

      {showDialog && (
        <MCQForm
          onSubmit={handleSubmit}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

// MCQ Element Component

  