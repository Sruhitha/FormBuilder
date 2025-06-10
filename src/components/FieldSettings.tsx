
import { useState } from "react";
import { FormField, FormFieldOption, ValidationRule, ConditionalLogic } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash, Check } from "lucide-react";

interface FieldSettingsProps {
  field: FormField;
  updateField: (updates: Partial<FormField>) => void;
  fields: FormField[];
}

export const FieldSettings = ({ field, updateField, fields }: FieldSettingsProps) => {
  const otherFields = fields.filter(f => f.id !== field.id);
  
  const addValidation = (type: ValidationRule['type']) => {
    const newValidation: ValidationRule = {
      type,
      message: `Field is ${type === 'required' ? 'required' : 'invalid'}`,
    };
    
    // Set default values based on validation type
    if (type === 'min' || type === 'max') {
      newValidation.value = 0;
    } else if (type === 'minLength' || type === 'maxLength') {
      newValidation.value = 1;
    } else if (type === 'pattern') {
      newValidation.value = '';
    }
    
    updateField({
      validations: [...field.validations, newValidation]
    });
  };
  
  const updateValidation = (index: number, updates: Partial<ValidationRule>) => {
    const newValidations = [...field.validations];
    newValidations[index] = { ...newValidations[index], ...updates };
    updateField({ validations: newValidations });
  };
  
  const removeValidation = (index: number) => {
    updateField({
      validations: field.validations.filter((_, i) => i !== index)
    });
  };
  
  const addOption = () => {
    if (!field.options) return;
    
    const newOption: FormFieldOption = {
      label: `Option ${field.options.length + 1}`,
      value: `option${field.options.length + 1}`
    };
    
    updateField({
      options: [...field.options, newOption]
    });
  };
  
  const updateOption = (index: number, updates: Partial<FormFieldOption>) => {
    if (!field.options) return;
    
    const newOptions = [...field.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateField({ options: newOptions });
  };
  
  const removeOption = (index: number) => {
    if (!field.options) return;
    
    updateField({
      options: field.options.filter((_, i) => i !== index)
    });
  };
  
  const setConditionalLogic = (logic: ConditionalLogic | undefined) => {
    updateField({ conditionalDisplay: logic });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Field Settings</h3>
      
      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="logic">Logic</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="mt-1"
            />
          </div>
          
          {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'date' || field.type === 'textarea') && (
            <div>
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={field.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
          
          {field.type === 'text' && (
            <div>
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input
                id="defaultValue"
                value={field.defaultValue as string || ''}
                onChange={(e) => updateField({ defaultValue: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
          
          {field.type === 'textarea' && (
            <div>
              <Label htmlFor="defaultValue">Default Value</Label>
              <Textarea
                id="defaultValue"
                value={field.defaultValue as string || ''}
                onChange={(e) => updateField({ defaultValue: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
          
          {field.type === 'number' && (
            <div>
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input
                id="defaultValue"
                type="number"
                value={field.defaultValue as number || ''}
                onChange={(e) => updateField({ defaultValue: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1"
              />
            </div>
          )}
          
          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="defaultValue"
                checked={field.defaultValue as boolean || false}
                onCheckedChange={(checked) => updateField({ defaultValue: checked })}
              />
              <Label htmlFor="defaultValue">Default Value (checked)</Label>
            </div>
          )}
          
          {(field.type === 'select' || field.type === 'radio') && field.options && (
            <div>
              <Label className="mb-2 block">Options</Label>
              <div className="space-y-2">
                {field.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(index, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="Option label"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2 w-full justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="validation" className="space-y-4">
          {field.validations.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {field.validations.map((validation, index) => (
                <AccordionItem key={index} value={`validation-${index}`}>
                  <AccordionTrigger className="text-sm">
                    {validation.type.charAt(0).toUpperCase() + validation.type.slice(1)}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {(validation.type === 'min' || validation.type === 'max') && (
                      <div>
                        <Label>Value</Label>
                        <Input
                          type="number"
                          value={validation.value as number || 0}
                          onChange={(e) => updateValidation(index, { value: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    )}
                    
                    {(validation.type === 'minLength' || validation.type === 'maxLength') && (
                      <div>
                        <Label>Length</Label>
                        <Input
                          type="number"
                          value={validation.value as number || 1}
                          onChange={(e) => updateValidation(index, { value: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    )}
                    
                    {validation.type === 'pattern' && (
                      <div>
                        <Label>Regex Pattern</Label>
                        <Input
                          value={validation.value as string || ''}
                          onChange={(e) => updateValidation(index, { value: e.target.value })}
                          className="mt-1"
                          placeholder="e.g., ^[A-Za-z0-9]+$"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label>Error Message</Label>
                      <Input
                        value={validation.message}
                        onChange={(e) => updateValidation(index, { message: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeValidation(index)}
                      className="mt-2"
                    >
                      <Trash className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-md">
              <p className="text-gray-500">No validation rules yet.</p>
            </div>
          )}
          
          <div className="mt-4">
            <Label className="block mb-2">Add Validation</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => addValidation('required')} variant="outline" size="sm">
                Required
              </Button>
              {(field.type === 'text' || field.type === 'textarea') && (
                <>
                  <Button onClick={() => addValidation('minLength')} variant="outline" size="sm">
                    Min Length
                  </Button>
                  <Button onClick={() => addValidation('maxLength')} variant="outline" size="sm">
                    Max Length
                  </Button>
                  <Button onClick={() => addValidation('pattern')} variant="outline" size="sm">
                    Pattern
                  </Button>
                </>
              )}
              {field.type === 'email' && (
                <Button onClick={() => addValidation('email')} variant="outline" size="sm">
                  Email
                </Button>
              )}
              {field.type === 'number' && (
                <>
                  <Button onClick={() => addValidation('min')} variant="outline" size="sm">
                    Min Value
                  </Button>
                  <Button onClick={() => addValidation('max')} variant="outline" size="sm">
                    Max Value
                  </Button>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="logic" className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="enable-logic"
                checked={!!field.conditionalDisplay}
                onCheckedChange={(checked) => {
                  if (checked && otherFields.length > 0) {
                    setConditionalLogic({
                      fieldId: otherFields[0].id,
                      operator: '==',
                      value: ''
                    });
                  } else {
                    setConditionalLogic(undefined);
                  }
                }}
              />
              <Label htmlFor="enable-logic">Enable conditional display</Label>
            </div>
            
            {field.conditionalDisplay && otherFields.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label>When field</Label>
                  <Select
                    value={field.conditionalDisplay.fieldId}
                    onValueChange={(value) => setConditionalLogic({ ...field.conditionalDisplay, fieldId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherFields.map((otherField) => (
                        <SelectItem key={otherField.id} value={otherField.id}>
                          {otherField.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Operator</Label>
                  <Select
                    value={field.conditionalDisplay.operator}
                    onValueChange={(value: any) => setConditionalLogic({ ...field.conditionalDisplay!, operator: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="==">equals</SelectItem>
                      <SelectItem value="!=">not equals</SelectItem>
                      {(fields.find(f => f.id === field.conditionalDisplay?.fieldId)?.type === 'number') && (
                        <>
                          <SelectItem value=">">greater than</SelectItem>
                          <SelectItem value="<">less than</SelectItem>
                          <SelectItem value=">=">greater than or equal</SelectItem>
                          <SelectItem value="<=">less than or equal</SelectItem>
                        </>
                      )}
                      {(fields.find(f => f.id === field.conditionalDisplay?.fieldId)?.type === 'text') && (
                        <>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="startsWith">starts with</SelectItem>
                          <SelectItem value="endsWith">ends with</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Value</Label>
                  <Input
                    value={field.conditionalDisplay.value as string}
                    onChange={(e) => setConditionalLogic({ ...field.conditionalDisplay!, value: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            {field.conditionalDisplay && otherFields.length === 0 && (
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">Add more fields to enable conditional logic.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
