
import { useState } from "react";
import { FormField } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, DownloadIcon } from "lucide-react";

interface FormExportProps {
  formFields: FormField[];
  formTitle: string;
}

export const FormExport = ({ formFields, formTitle }: FormExportProps) => {
  const [activeTab, setActiveTab] = useState("json");
  
  const formSchema = {
    title: formTitle,
    fields: formFields
  };
  
  const jsonOutput = JSON.stringify(formSchema, null, 2);
  
  // Generate React Hook Form code
  const generateReactCode = () => {
    const imports = `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Textarea, Checkbox, Label, Select, RadioGroup } from "your-ui-library";`;

    const zodSchema = `const formSchema = z.object({
${formFields.map(field => {
  let schemaCode = `  ${field.id}: `;
  
  switch (field.type) {
    case 'text':
    case 'textarea':
      schemaCode += 'z.string()';
      break;
    case 'email':
      schemaCode += 'z.string().email()';
      break;
    case 'number':
      schemaCode += 'z.number()';
      break;
    case 'checkbox':
      schemaCode += 'z.boolean()';
      break;
    case 'select':
    case 'radio':
    case 'date':
      schemaCode += 'z.string()';
      break;
    case 'file':
      schemaCode += 'z.instanceof(FileList)';
      break;
    default:
      schemaCode += 'z.any()';
  }
  
  field.validations.forEach(validation => {
    switch (validation.type) {
      case 'required':
        if (field.type !== 'checkbox') {
          schemaCode += '.min(1, ' + JSON.stringify(validation.message) + ')';
        }
        break;
      case 'min':
        schemaCode += `.min(${validation.value}, ${JSON.stringify(validation.message)})`;
        break;
      case 'max':
        schemaCode += `.max(${validation.value}, ${JSON.stringify(validation.message)})`;
        break;
      case 'minLength':
        schemaCode += `.min(${validation.value}, ${JSON.stringify(validation.message)})`;
        break;
      case 'maxLength':
        schemaCode += `.max(${validation.value}, ${JSON.stringify(validation.message)})`;
        break;
      case 'pattern':
        schemaCode += `.regex(new RegExp(${JSON.stringify(validation.value)}), { message: ${JSON.stringify(validation.message)} })`;
        break;
    }
  });
  
  // Make optional if not required
  if (!field.validations.some(v => v.type === 'required')) {
    schemaCode += '.optional()';
  }
  
  return schemaCode;
}).join(',\n')}
});`;

    const defaultValues = `const defaultValues = {
${formFields.filter(field => field.defaultValue !== undefined).map(field => {
  return `  ${field.id}: ${JSON.stringify(field.defaultValue)}`;
}).join(',\n')}
};`;

    const formComponent = `function ${formTitle.replace(/\s+/g, '')}Form() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(data) {
    console.log(data);
    // Submit data to your API
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold">${formTitle}</h2>
      
${formFields.map(field => {
  let fieldCode = '';
  
  if (field.conditionalDisplay) {
    fieldCode += `      {form.watch("${field.conditionalDisplay.fieldId}") ${field.conditionalDisplay.operator} ${JSON.stringify(field.conditionalDisplay.value)} && (\n`;
  }
  
  fieldCode += `      <div className="space-y-2">
        <label htmlFor="${field.id}" className="text-sm font-medium">${field.label}</label>`;
  
  switch (field.type) {
    case 'text':
    case 'email':
      fieldCode += `
        <Input
          id="${field.id}"
          type="${field.type}"
          placeholder="${field.placeholder || ''}"
          {...form.register("${field.id}")}
        />`;
      break;
    case 'number':
      fieldCode += `
        <Input
          id="${field.id}"
          type="number"
          placeholder="${field.placeholder || ''}"
          {...form.register("${field.id}", { valueAsNumber: true })}
        />`;
      break;
    case 'textarea':
      fieldCode += `
        <Textarea
          id="${field.id}"
          placeholder="${field.placeholder || ''}"
          {...form.register("${field.id}")}
        />`;
      break;
    case 'select':
      fieldCode += `
        <Select
          id="${field.id}"
          {...form.register("${field.id}")}
        >
          <option value="">Select an option</option>
          ${field.options?.map(option => `<option value="${option.value}">${option.label}</option>`).join('\n          ')}
        </Select>`;
      break;
    case 'checkbox':
      fieldCode += `
        <div className="flex items-center gap-2">
          <Checkbox
            id="${field.id}"
            {...form.register("${field.id}")}
          />
          <label htmlFor="${field.id}" className="text-sm font-medium">${field.placeholder || 'Checkbox'}</label>
        </div>`;
      break;
    case 'radio':
      fieldCode += `
        <RadioGroup>
          ${field.options?.map(option => `
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="${field.id}-${option.value}"
              value="${option.value}"
              {...form.register("${field.id}")}
            />
            <label htmlFor="${field.id}-${option.value}">${option.label}</label>
          </div>`).join('\n          ')}
        </RadioGroup>`;
      break;
    case 'date':
      fieldCode += `
        <Input
          id="${field.id}"
          type="date"
          {...form.register("${field.id}")}
        />`;
      break;
    case 'file':
      fieldCode += `
        <Input
          id="${field.id}"
          type="file"
          {...form.register("${field.id}")}
        />`;
      break;
  }
  
  fieldCode += `
        {form.formState.errors.${field.id} && (
          <p className="text-sm text-red-500">{form.formState.errors.${field.id}.message}</p>
        )}
      </div>`;
  
  if (field.conditionalDisplay) {
    fieldCode += '\n      )}';
  }
  
  return fieldCode;
}).join('\n\n')}
      
      <Button type="submit">Submit</Button>
    </form>
  );
}`;

    return `${imports}\n\n${zodSchema}\n\n${defaultValues}\n\n${formComponent}`;
  };
  
  // Generate HTML code
  const generateHtmlCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    input, select, textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.25rem;
      font-size: 1rem;
    }
    button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background-color: #1d4ed8;
    }
    .error {
      color: red;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <h2>${formTitle}</h2>
  <form id="dynamicForm">
${formFields.map(field => {
  let htmlField = `    <div class="form-group" ${field.conditionalDisplay ? `data-conditional-field="${field.conditionalDisplay.fieldId}" data-conditional-operator="${field.conditionalDisplay.operator}" data-conditional-value="${field.conditionalDisplay.value}" style="display: none;"` : ''}>
      <label for="${field.id}">${field.label}</label>`;
      
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      htmlField += `
      <input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.validations.some(v => v.type === 'required') ? 'required' : ''} ${field.defaultValue ? `value="${field.defaultValue}"` : ''}>`;
      break;
    case 'textarea':
      htmlField += `
      <textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.validations.some(v => v.type === 'required') ? 'required' : ''}>${field.defaultValue || ''}</textarea>`;
      break;
    case 'select':
      htmlField += `
      <select id="${field.id}" name="${field.id}" ${field.validations.some(v => v.type === 'required') ? 'required' : ''}>
        <option value="">Select an option</option>
        ${field.options?.map(option => `<option value="${option.value}" ${field.defaultValue === option.value ? 'selected' : ''}>${option.label}</option>`).join('\n        ')}
      </select>`;
      break;
    case 'checkbox':
      htmlField += `
      <div>
        <input type="checkbox" id="${field.id}" name="${field.id}" ${field.defaultValue ? 'checked' : ''}>
        <label for="${field.id}" style="display: inline;">${field.placeholder || 'Checkbox'}</label>
      </div>`;
      break;
    case 'radio':
      htmlField += `
      <div>
        ${field.options?.map((option, i) => `
        <div>
          <input type="radio" id="${field.id}-${i}" name="${field.id}" value="${option.value}" ${field.defaultValue === option.value ? 'checked' : ''}>
          <label for="${field.id}-${i}" style="display: inline;">${option.label}</label>
        </div>`).join('\n        ')}
      </div>`;
      break;
    case 'file':
      htmlField += `
      <input type="file" id="${field.id}" name="${field.id}" ${field.validations.some(v => v.type === 'required') ? 'required' : ''}>`;
      break;
  }
      
  htmlField += `
      <div class="error" id="${field.id}-error"></div>
    </div>`;
      
  return htmlField;
}).join('\n')}
    
    <button type="submit">Submit</button>
  </form>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const form = document.getElementById('dynamicForm');
      const conditionalFields = document.querySelectorAll('[data-conditional-field]');
      
      // Handle conditional logic
      function updateVisibility() {
        conditionalFields.forEach(field => {
          const sourceFieldId = field.dataset.conditionalField;
          const operator = field.dataset.conditionalOperator;
          const requiredValue = field.dataset.conditionalValue;
          const sourceField = document.getElementById(sourceFieldId);
          
          let sourceValue;
          if (sourceField.type === 'checkbox') {
            sourceValue = sourceField.checked;
          } else if (sourceField.type === 'radio') {
            const checkedRadio = document.querySelector(\`input[name="\${sourceFieldId}"]:checked\`);
            sourceValue = checkedRadio ? checkedRadio.value : '';
          } else {
            sourceValue = sourceField.value;
          }
          
          let shouldShow = false;
          switch (operator) {
            case '==':
              shouldShow = sourceValue == requiredValue;
              break;
            case '!=':
              shouldShow = sourceValue != requiredValue;
              break;
            case '>':
              shouldShow = sourceValue > requiredValue;
              break;
            case '<':
              shouldShow = sourceValue < requiredValue;
              break;
            case '>=':
              shouldShow = sourceValue >= requiredValue;
              break;
            case '<=':
              shouldShow = sourceValue <= requiredValue;
              break;
            case 'contains':
              shouldShow = sourceValue.includes(requiredValue);
              break;
            case 'startsWith':
              shouldShow = sourceValue.startsWith(requiredValue);
              break;
            case 'endsWith':
              shouldShow = sourceValue.endsWith(requiredValue);
              break;
          }
          
          field.style.display = shouldShow ? 'block' : 'none';
          
          // Disable input fields when hidden to prevent them from being submitted
          const inputs = field.querySelectorAll('input, select, textarea');
          inputs.forEach(input => {
            input.disabled = !shouldShow;
          });
        });
      }
      
      // Set up event listeners for fields that trigger conditional logic
      const triggerFields = new Set();
      conditionalFields.forEach(field => {
        triggerFields.add(field.dataset.conditionalField);
      });
      
      triggerFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.addEventListener('input', updateVisibility);
          field.addEventListener('change', updateVisibility);
        }
      });
      
      // Initial update
      updateVisibility();
      
      // Form validation and submission
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        let isValid = true;
        
        // Basic validation
        // ... (add your validation logic here based on field.validations)
        
        if (isValid) {
          // Form is valid, collect data
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          console.log('Form data:', data);
          
          // Submit the data (replace with your actual submission code)
          alert('Form submitted successfully!');
        }
      });
    });
  </script>
</body>
</html>`;
  };
  
  const embedIframeCode = `<iframe
  src="YOUR_FORM_URL_HERE"
  width="100%"
  height="800"
  style="border: none;"
  title="${formTitle}"
></iframe>`;
  
  const getExportContent = () => {
    switch (activeTab) {
      case "json":
        return jsonOutput;
      case "react":
        return generateReactCode();
      case "html":
        return generateHtmlCode();
      case "iframe":
        return embedIframeCode;
      default:
        return jsonOutput;
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(getExportContent());
    toast.success("Copied to clipboard!");
  };
  
  const handleDownload = () => {
    const content = getExportContent();
    const fileType = activeTab === 'json' ? 'json' 
      : activeTab === 'react' ? 'jsx'
      : activeTab === 'html' ? 'html'
      : 'txt';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formTitle.toLowerCase().replace(/\s+/g, '-')}.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded as ${a.download}`);
  };
  
  if (formFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Export your form</h2>
        <p className="text-gray-500">Add fields in the builder tab to export your form.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Export your form</h2>
        <p className="text-gray-500">Export your form in different formats.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="json">JSON Schema</TabsTrigger>
          <TabsTrigger value="react">React Code</TabsTrigger>
          <TabsTrigger value="html">HTML & JS</TabsTrigger>
          <TabsTrigger value="iframe">Embed</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>{activeTab === 'json' ? 'JSON Schema' : activeTab === 'react' ? 'React Component' : activeTab === 'html' ? 'HTML & JavaScript' : 'Embed Code'}</CardTitle>
            <CardDescription>
              {activeTab === 'json' 
                ? 'Raw JSON schema representing your form.'
                : activeTab === 'react' 
                ? 'React component using React Hook Form and Zod.'
                : activeTab === 'html'
                ? 'Standalone HTML, CSS, and JavaScript.'
                : 'Code to embed your form in another website.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea 
                value={getExportContent()}
                readOnly
                className="h-96 font-mono text-sm"
              />
              <div className="absolute top-2 right-2 space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <DownloadIcon className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};
