import { useRef, useState } from 'react';
import { UploadCloud, Trash2, RefreshCw } from 'lucide-react';
import { Card, Button } from '@/components';

interface MealUploadProps {
  onImageSelected: (file: File | null) => void;
  selectedImage: File | null;
}

export const MealUpload: React.FC<MealUploadProps> = ({
  onImageSelected,
  selectedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    return selectedImage ? URL.createObjectURL(selectedImage) : null;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        updateSelectedImage(file);
      }
    }
  };

  const updateSelectedImage = (file: File) => {
    onImageSelected(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        updateSelectedImage(file);
      }
    }
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onImageSelected(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card 
      bordered 
      className={`
        relative flex flex-col items-center justify-center p-6 border-dashed transition-all duration-200 bg-bg-panel/10 min-h-[220px] text-center
        ${isDragOver ? 'border-accent-cyan bg-bg-panel/40 ring-1 ring-accent-cyan/35' : 'border-border-muted hover:border-border-active'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      {previewUrl ? (
        <div className="w-full space-y-4">
          <div className="relative mx-auto max-w-xs h-40 rounded-lg overflow-hidden border border-border-subtle group bg-bg-darkest flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt="Meal preview" 
              className="max-h-full max-w-full object-contain"
            />
            {/* Hover overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-150">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={triggerBrowse}
                className="gap-1.5 font-mono text-[10px] uppercase border-white/15 hover:border-white/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                size="sm" 
                onClick={removeImage}
                className="gap-1.5 font-mono text-[10px] uppercase"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs font-mono text-text-secondary">
            <span>FILE: {selectedImage?.name}</span>
            <span className="text-text-muted">|</span>
            <span>SIZE: {((selectedImage?.size || 0) / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-bg-panel border border-border-subtle rounded-xl text-text-secondary shadow-sm">
            <UploadCloud className="w-6 h-6 text-text-muted" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              Drag & drop meal image, or{' '}
              <button 
                type="button" 
                onClick={triggerBrowse}
                className="text-accent-cyan hover:underline bg-transparent border-0 outline-none cursor-pointer"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-text-muted">
              Supported formats: JPG, JPEG, PNG, WEBP. Max file size: 10MB.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
export default MealUpload;
