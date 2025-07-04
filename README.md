A React-based Single Page Application (SPA) that allows users to visually create and preview forms with custom fields, validation rules, and conditional logic — all without writing a single line of code.

🔗 Live Demo
form-builder-xi-amber.vercel.app

✨ Features
✅ Add/Edit/Delete Fields

Text, Number, Email, Date, Dropdown, Checkbox, Radio

✅ Field Properties

Label, Placeholder, Default Value, Required

✅ Validation Rules

Min/Max values, pattern matching, length constraints

✅ Conditional Logic

Show/hide fields based on other field values
Example:
IF Age > 18 THEN Show Occupation

✅ Live Form Preview

Real-time preview with working validation and logic

✅ Export Options

Download form schema (JSON)
Export as embeddable HTML or React component code

✅ Persistence

Autosave to localStorage
"Reset Form" and "Load Last Form" buttons

🛠️ Tech Stack
Layer	Tools Used
Framework	React
Styling	Tailwind CSS
Code Editor	Plain form builder UI (no backend)
Drag & Drop	dnd-kit
Form Rendering	react-hook-form (optional)
State Management	React Context + Local State
Data Persistence	localStorage


🚀 Getting Started
1. Clone the Repo
git clone https://github.com/yourusername/form-builder.git
cd form-builder

2. Install Dependencies
npm install

3. Run the App
npm run dev


📤 Export Format Example
🔹 JSON Schema Output

{
  "fields": [
    {
      "id": "name",
      "type": "text",
      "label": "Full Name",
      "required": true
    },
    {
      "id": "age",
      "type": "number",
      "label": "Age",
      "logic": {
        "showIf": {
          "field": "name",
          "operator": "!=",
          "value": ""
        }
      }
    }
  ]
}


🔹 React Output (Snippet)
<input type="text" required placeholder="Full Name" />
<input type="number" hidden={formData.name === ''} />


💡 Future Enhancements
- Multi-step form support
- Multi-language form support
- Backend integration (optional)
- Drag & drop reorder UI
- Form submission analytics
