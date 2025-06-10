
import { useState } from "react";
import { FormField } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Plus, ArrowDown } from "lucide-react";
import { FieldSettings } from "./FieldSettings";
import { FormBuilderField } from "./FormBuilderField";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FormBuilderProps {
  formFields: FormField[];
  setFormFields: (fields: FormField[]) => void;
  formTitle: string;
  setFormTitle: (title: string) => void;
}

export const FormBuilder = ({ formFields, setFormFields, formTitle, setFormTitle }: FormBuilderProps) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}`,
      validations: [],
      isVisible: true,
    };
    
    if (type === 'select' || type === 'radio') {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ];
    }
    
    if (type === 'checkbox') {
      newField.defaultValue = false;
    }
    
    setFormFields([...formFields, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`Added new ${type} field`);
  };
  
  const duplicateField = (fieldId: string) => {
    const fieldToDuplicate = formFields.find(field => field.id === fieldId);
    if (!fieldToDuplicate) return;
    
    const duplicatedField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}`,
      label: `${fieldToDuplicate.label} (copy)`
    };
    
    const indexToDuplicate = formFields.findIndex(field => field.id === fieldId);
    const newFields = [...formFields];
    newFields.splice(indexToDuplicate + 1, 0, duplicatedField);
    
    setFormFields(newFields);
    toast.success("Field duplicated successfully");
  };
  
  const removeField = (fieldId: string) => {
    setFormFields(formFields.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    toast.info("Field removed");
  };
  
  const toggleFieldVisibility = (fieldId: string) => {
    setFormFields(
      formFields.map(field => 
        field.id === fieldId 
          ? { ...field, isVisible: !field.isVisible } 
          : field
      )
    );
  };
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormFields(items);
    toast.success("Field order updated");
  };
  
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields(
      formFields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };
  
  const selectedField = formFields.find(field => field.id === selectedFieldId);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="mb-6">
          <Label htmlFor="formTitle" className="text-lg font-medium mb-2 block">Form Title</Label>
          <Input
            id="formTitle"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-lg font-medium"
            placeholder="Enter form title"
          />
        </div>
        
        <Card className="mb-4 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                {formFields.length}
              </span>
              Form Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {formFields.length === 0 ? (
                      <motion.div 
                        className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-gray-500 mb-2">No fields yet. Add a field to get started.</p>
                        <ArrowDown className="mx-auto h-6 w-6 text-gray-400 animate-bounce" />
                      </motion.div>
                    ) : (
                      formFields.map((field, index) => (
                        <FormBuilderField
                          key={field.id}
                          field={field}
                          index={index}
                          isSelected={selectedFieldId === field.id}
                          onSelect={setSelectedFieldId}
                          onDuplicate={duplicateField}
                          onRemove={removeField}
                          onToggleVisibility={toggleFieldVisibility}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card className="sticky top-4 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Add Fields</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button onClick={() => addField("text")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Text
              </Button>
              <Button onClick={() => addField("email")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Email
              </Button>
              <Button onClick={() => addField("number")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Number
              </Button>
              <Button onClick={() => addField("textarea")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Textarea
              </Button>
              <Button onClick={() => addField("select")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Dropdown
              </Button>
              <Button onClick={() => addField("checkbox")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Checkbox
              </Button>
              <Button onClick={() => addField("radio")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Radio
              </Button>
              <Button onClick={() => addField("date")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Date
              </Button>
              <Button onClick={() => addField("file")} variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> File
              </Button>
            </div>
            
            {selectedField ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-t-4 border-t-primary">
                  <CardHeader className="bg-slate-50 border-b py-3">
                    <CardTitle className="text-md">Field Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <FieldSettings
                      field={selectedField}
                      updateField={(updates) => updateField(selectedField.id, updates)}
                      fields={formFields}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-md mt-6">
                <p className="text-gray-500">Select a field to edit its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
