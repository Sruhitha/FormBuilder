
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'minLength' | 'maxLength' | 'email';
  value?: string | number | boolean;
  message: string;
}

export interface ConditionalLogic {
  fieldId: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number | boolean;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'textarea';
  label: string;
  placeholder?: string;
  defaultValue?: string | string[] | boolean | number;
  options?: FormFieldOption[];
  validations: ValidationRule[];
  conditionalDisplay?: ConditionalLogic;
  isVisible?: boolean;
}
