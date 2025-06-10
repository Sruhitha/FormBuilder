import React, { useState, useEffect } from "react";
import { FormField as FormFieldType } from "@/types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface FormPreviewProps {
  formFields: FormFieldType[];
  formTitle: string;
}

export const FormPreview = ({ formFields, formTitle }: FormPreviewProps) => {
  const [schema, setSchema] = useState<z.ZodTypeAny>(z.object({}));
  const [formValues, setFormValues] = useState<any>({});
  const [visibleFields, setVisibleFields] = useState<{ [key: string]: boolean }>({});
  
  // Generate Zod schema based on form fields and their validations
  useEffect(() => {
    const schemaObj: Record<string, any> = {};
    
    formFields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      
      // Base schema by field type
      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          // Apply string-specific validations
          field.validations.forEach(validation => {
            if (validation.type === 'minLength' && typeof validation.value === 'number') {
              fieldSchema = (fieldSchema as z.ZodString).min(validation.value, validation.message);
            } else if (validation.type === 'maxLength' && typeof validation.value === 'number') {
              fieldSchema = (fieldSchema as z.ZodString).max(validation.value, validation.message);
            } else if (validation.type === 'pattern' && typeof validation.value === 'string') {
              fieldSchema = (fieldSchema as z.ZodString).regex(new RegExp(validation.value), {
                message: validation.message,
              });
            }
          });
          break;
        case 'email':
          fieldSchema = z.string().email();
          // Apply string-specific validations
          field.validations.forEach(validation => {
            if (validation.type === 'minLength' && typeof validation.value === 'number') {
              fieldSchema = (fieldSchema as z.ZodString).min(validation.value, validation.message);
            } else if (validation.type === 'maxLength' && typeof validation.value === 'number') {
              fieldSchema = (fieldSchema as z.ZodString).max(validation.value, validation.message);
            }
          });
          break;
        case 'number':
          fieldSchema = z.number();
          // Apply number-specific validations
          field.validations.forEach(validation => {
            if (validation.type === 'min' && typeof validation.value === 'number') {
              fieldSchema = (fieldSchema as z.ZodNumber).min(validation.value, validation.message);
            } else if (validation.type === 'max' && typeof validation.value === 'number') {
              fieldSchema = (fieldSchema as z.ZodNumber).max(validation.value, validation.message);
            }
          });
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        case 'date':
          fieldSchema = z.string();
          break;
        case 'select':
        case 'radio':
          fieldSchema = z.string();
          break;
        case 'file':
          fieldSchema = z.instanceof(FileList);
          break;
        default:
          fieldSchema = z.string();
      }
      
      // Apply required validation
      field.validations.forEach(validation => {
        if (validation.type === 'required') {
          if (field.type === 'checkbox') {
            fieldSchema = (fieldSchema as z.ZodBoolean).refine(val => val === true, {
              message: validation.message,
            });
          } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'select' || field.type === 'radio' || field.type === 'date') {
            fieldSchema = (fieldSchema as z.ZodString).min(1, validation.message);
          }
        }
      });
      
      // Make field optional if not required
      if (!field.validations.some(v => v.type === 'required')) {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaObj[field.id] = fieldSchema;
    });
    
    setSchema(z.object(schemaObj));
  }, [formFields]);
  
  // Evaluate conditional display logic
  useEffect(() => {
    const newVisibleFields: { [key: string]: boolean } = {};
    
    // First set all fields to visible
    formFields.forEach(field => {
      newVisibleFields[field.id] = true;
    });
    
    // Then hide fields based on conditional logic
    formFields.forEach(field => {
      if (field.conditionalDisplay) {
        const { fieldId, operator, value } = field.conditionalDisplay;
        const sourceFieldValue = formValues[fieldId];
        
        if (sourceFieldValue !== undefined) {
          let isVisible = false;
          
          switch (operator) {
            case '==':
              isVisible = sourceFieldValue == value;
              break;
            case '!=':
              isVisible = sourceFieldValue != value;
              break;
            case '>':
              isVisible = sourceFieldValue > value;
              break;
            case '<':
              isVisible = sourceFieldValue < value;
              break;
            case '>=':
              isVisible = sourceFieldValue >= value;
              break;
            case '<=':
              isVisible = sourceFieldValue <= value;
              break;
            case 'contains':
              isVisible = String(sourceFieldValue).includes(String(value));
              break;
            case 'startsWith':
              isVisible = String(sourceFieldValue).startsWith(String(value));
              break;
            case 'endsWith':
              isVisible = String(sourceFieldValue).endsWith(String(value));
              break;
          }
          
          newVisibleFields[field.id] = isVisible;
        } else {
          // If source field doesn't have a value yet, hide the dependent field
          newVisibleFields[field.id] = false;
        }
      }
    });
    
    setVisibleFields(newVisibleFields);
  }, [formFields, formValues]);
  
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: formFields.reduce((acc, field) => {
      if (field.defaultValue !== undefined) {
        acc[field.id] = field.defaultValue;
      }
      return acc;
    }, {} as any),
  });
  
  // Update formValues when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormValues(values);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  const onSubmit = (data: any) => {
    toast.success("Form submitted successfully!", {
      description: "Check the console for the submitted data.",
    });
    console.log("Form data:", data);
  };
  
  if (formFields.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-slate-100 rounded-full p-4 mb-4">
          <ArrowRight className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Preview your form</h2>
        <p className="text-gray-500">Add fields in the builder tab to see a preview.</p>
      </motion.div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <motion.h2 
        className="text-2xl font-semibold mb-8 text-center bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {formTitle}
      </motion.h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formFields.map((field, index) => {
            if (!visibleFields[field.id]) return null;
            
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FormField
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem className="transition-all duration-200 hover:shadow-md p-4 rounded-md">
                      <FormLabel className="text-base">{field.label}</FormLabel>
                      {field.type === 'text' && (
                        <FormControl>
                          <Input 
                            placeholder={field.placeholder} 
                            {...formField} 
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                          />
                        </FormControl>
                      )}
                      {field.type === 'email' && (
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder={field.placeholder} 
                            {...formField}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" 
                          />
                        </FormControl>
                      )}
                      {field.type === 'number' && (
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={field.placeholder} 
                            onChange={(e) => formField.onChange(Number(e.target.value))}
                            value={formField.value}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                          />
                        </FormControl>
                      )}
                      {field.type === 'textarea' && (
                        <FormControl>
                          <Textarea 
                            placeholder={field.placeholder} 
                            {...formField}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" 
                          />
                        </FormControl>
                      )}
                      {field.type === 'select' && field.options && (
                        <FormControl>
                          <Select
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                          >
                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/30">
                              <SelectValue placeholder={field.placeholder || "Select an option"} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      )}
                      {field.type === 'checkbox' && (
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
                            />
                            <span>{field.placeholder || "Checkbox"}</span>
                          </div>
                        </FormControl>
                      )}
                      {field.type === 'radio' && field.options && (
                        <FormControl>
                          <RadioGroup
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                            className="flex flex-col space-y-1"
                          >
                            {field.options.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} className="text-primary" />
                                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      )}
                      {field.type === 'date' && (
                        <FormControl>
                          <Input 
                            type="date" 
                            {...formField}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" 
                          />
                        </FormControl>
                      )}
                      {field.type === 'file' && (
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => formField.onChange(e.target.files)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            );
          })}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: formFields.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="pt-4"
          >
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all duration-300 text-white shadow-lg"
            >
              Submit
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
};
