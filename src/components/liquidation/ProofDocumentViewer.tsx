import React from 'react';
import { X, Mail, MessageCircle, Download } from 'lucide-react';

interface ProofDocument {
  id: string;
  name: string;
  url?: string;
  type?: string;
}

interface ProofDocumentViewerProps {
  proof: ProofDocument;
  onClose: () => void;
}

export const ProofDocumentViewer: React.FC<ProofDocumentViewerProps> = ({ proof, onClose }) => {
  const handleShareViaEmail = async () => {
    try {
      // Convert image to blob for attachment
      if (proof.url) {
        const response = await fetch(proof.url);
        const blob = await response.blob();

        // Create a File object from the blob
        const file = new File([blob], proof.name, { type: blob.type });

        // Check if Web Share API with files is supported
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Stock Verification Proof',
            text: `Stock verification proof document: ${proof.name}`,
            files: [file]
          });
        } else {
          // Fallback: Open email client with mailto link
          const subject = encodeURIComponent('Stock Verification Proof');
          const body = encodeURIComponent(`Please find attached the stock verification proof document: ${proof.name}\n\nDocument URL: ${proof.url}`);
          window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        }
      }
    } catch (error) {
      console.error('Error sharing via email:', error);
      // Fallback to mailto
      const subject = encodeURIComponent('Stock Verification Proof');
      const body = encodeURIComponent(`Please find the stock verification proof document: ${proof.name}\n\nDocument URL: ${proof.url || 'N/A'}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleShareViaWhatsApp = async () => {
    try {
      if (proof.url) {
        const response = await fetch(proof.url);
        const blob = await response.blob();
        const file = new File([blob], proof.name, { type: blob.type });

        // Check if Web Share API with files is supported
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Stock Verification Proof',
            text: `Stock verification proof: ${proof.name}`,
            files: [file]
          });
        } else {
          // Fallback: Open WhatsApp with text message
          const text = encodeURIComponent(`Stock verification proof: ${proof.name}\n\nDocument: ${proof.url}`);
          window.open(`https://wa.me/?text=${text}`, '_blank');
        }
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      // Fallback to WhatsApp web with text
      const text = encodeURIComponent(`Stock verification proof: ${proof.name}\n\nDocument: ${proof.url || 'N/A'}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleDownload = () => {
    if (proof.url) {
      const link = document.createElement('a');
      link.href = proof.url;
      link.download = proof.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{proof.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 min-h-[400px]">
          {proof.url ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <img
                src={proof.url}
                alt={proof.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
              <p>No preview available</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Download</span>
            </button>

            <button
              onClick={handleShareViaEmail}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Share via Email</span>
            </button>

            <button
              onClick={handleShareViaWhatsApp}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Share via WhatsApp</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            Note: File sharing capability depends on your device and browser support
          </p>
        </div>
      </div>
    </div>
  );
};
