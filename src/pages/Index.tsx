
import { useState } from "react";
import { FormBuilder } from "@/components/FormBuilder";
import { FormPreview } from "@/components/FormPreview";
import { FormExport } from "@/components/FormExport";
import { FormField } from "@/types/form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const Index = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formTitle, setFormTitle] = useState("Untitled Form");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {formTitle || "Untitled Form"}
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 shadow-md">
              <TabsTrigger value="builder" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">Build</TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">Preview</TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="transition-all duration-300 ease-in-out">
              <Card className="shadow-lg border-t-4 border-t-primary">
                <CardContent className="pt-6">
                  <FormBuilder 
                    formFields={formFields} 
                    setFormFields={setFormFields} 
                    formTitle={formTitle}
                    setFormTitle={setFormTitle}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="transition-all duration-300 ease-in-out">
              <Card className="shadow-lg border-t-4 border-t-blue-500">
                <CardContent className="pt-6">
                  <FormPreview formFields={formFields} formTitle={formTitle} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="export" className="transition-all duration-300 ease-in-out">
              <Card className="shadow-lg border-t-4 border-t-green-500">
                <CardContent className="pt-6">
                  <FormExport formFields={formFields} formTitle={formTitle} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
