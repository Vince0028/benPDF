import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GenericFileTool from './pages/GenericFileTool';
import { BaseConverter, CalculusTool } from './pages/MathTools';
import QrGenerator from './pages/QrGenerator';
import UnitConverter from './pages/UnitConverter';
const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {}
          <Route path="/doc-convert" element={
            <GenericFileTool 
              title="Document Converter" 
              description="PDF ↔ DOCX conversion"
              endpoint="/api/convert-document"
              accept=".pdf,.docx"
              supportsUrl={false}
            />
          } />
          <Route path="/image-convert" element={
            <GenericFileTool 
              title="Image Converter" 
              description="Convert images to PNG"
              endpoint="/api/convert-image"
              accept=".png,.jpg,.jpeg,.gif,.webp,.heic,.avif"
              supportsUrl={true}
            />
          } />
          <Route path="/ico-convert" element={
            <GenericFileTool 
              title="ICO Converter" 
              description="Create .ico favicons from images"
              endpoint="/api/convert-to-ico"
              accept=".png,.jpg,.jpeg,.webp"
              supportsUrl={false}
            />
          } />
           <Route path="/remove-bg" element={
            <GenericFileTool 
              title="Background Remover" 
              description="Remove image backgrounds (PNG output)"
              endpoint="/api/remove-background"
              accept=".png,.jpg,.jpeg,.webp"
              supportsUrl={true}
            />
          } />
            <Route path="/image-resize" element={
             <GenericFileTool 
               title="Image Resizer"
               description="Resize images to specific dimensions"
               endpoint="/api/resize-image"
               accept=".png,.jpg,.jpeg,.gif,.webp"
               supportsUrl={false}
              extraFields={
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                    <input type="number" name="width" required placeholder="e.g. 800" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                    <input type="number" name="height" required placeholder="e.g. 600" className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              }
             />
            } />
          {}
          <Route path="/base-convert" element={<BaseConverter />} />
          <Route path="/calculus" element={<CalculusTool />} />
          {}
          <Route path="/qr-code" element={<QrGenerator />} />
          <Route path="/unit-convert" element={<UnitConverter />} />
        </Routes>
      </Layout>
    </Router>
  );
};
export default App;