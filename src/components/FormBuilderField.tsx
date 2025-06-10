
import { useState } from "react";
import { FormField, FormFieldOption } from "@/types/form";
import { Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Trash, GripVertical, Copy, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormBuilderFieldProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export const FormBuilderField = ({ 
  field, 
  index, 
  isSelected, 
  onSelect, 
  onDuplicate, 
  onRemove,
  onToggleVisibility
}: FormBuilderFieldProps) => {
  return (
    <Draggable key={field.id} draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className={cn(
            "border rounded-md p-3 flex items-center justify-between bg-white mb-2 group",
            isSelected ? "ring-2 ring-primary shadow-md" : "hover:border-primary/50 transition-all duration-200",
            snapshot.isDragging ? "shadow-lg" : "",
            !field.isVisible && "opacity-70 border-dashed"
          )}
          onClick={() => onSelect(field.id)}
        >
          <div className="flex items-center space-x-3">
            <div {...provided.dragHandleProps} className="cursor-grab p-1 rounded hover:bg-gray-100 transition-colors">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="font-medium">{field.label}</p>
              <p className="text-sm text-gray-500 capitalize">{field.type}</p>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(field.id);
              }}
              title={field.isVisible ? "Hide field" : "Show field"}
              className="text-gray-500 hover:text-gray-700"
            >
              {field.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(field.id);
              }}
              title="Duplicate field"
              className="text-gray-500 hover:text-blue-500"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(field.id);
              }}
              title="Remove field"
              className="text-gray-500 hover:text-red-500"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};
