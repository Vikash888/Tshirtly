'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DesignState, ImageElement } from '../Designer';
import type { Dispatch, SetStateAction } from 'react';

interface ImagePanelProps {
  designState: DesignState;
  setDesignState: Dispatch<SetStateAction<DesignState>>;
}

export function ImagePanel({ designState, setDesignState }: ImagePanelProps) {
  const selectedImageId = designState.selectedElementType === 'image' ? designState.selectedElementId : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;

      // Load image to get aspect ratio
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const newImage: ImageElement = {
          id: Date.now().toString(),
          url,
          x: 0,
          y: 0,
          z: designState.currentSide === 'front' ? 0.11 : -0.11,
          width: 1,
          height: 1 / aspectRatio,
          rotation: 0,
          flipped: false,
          side: designState.currentSide,
          aspectRatio,
        };
        setDesignState((prev) => ({
          ...prev,
          imageElements: [...prev.imageElements, newImage],
          selectedElementId: newImage.id,
          selectedElementType: 'image',
        }));
        toast({
          title: 'Image uploaded',
          description: 'Your image has been added to the design.',
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const updateImageProperty = <K extends keyof ImageElement>(
    id: string,
    key: K,
    value: ImageElement[K]
  ) => {
    setDesignState((prev) => ({
      ...prev,
      imageElements: prev.imageElements.map((img) =>
        img.id === id ? { ...img, [key]: value } : img
      ),
    }));
  };

  const deleteImage = (id: string) => {
    setDesignState((prev) => ({
      ...prev,
      imageElements: prev.imageElements.filter((img) => img.id !== id),
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
      selectedElementType: prev.selectedElementId === id ? null : prev.selectedElementType,
    }));
  };

  const selectedImage = designState.imageElements.find(
    (img) => img.id === selectedImageId
  );

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="text-primary" />
            <span>Upload Image</span>
          </CardTitle>
          <CardDescription>
            Add images to your t-shirt design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </CardContent>
      </Card>

      {designState.imageElements.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Your Images</CardTitle>
            <CardDescription>
              Click on an image to adjust its properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {designState.imageElements.map((img) => (
              <div
                key={img.id}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${selectedImageId === img.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                  }`}
                onClick={() => setDesignState(prev => ({
                  ...prev,
                  selectedElementId: img.id,
                  selectedElementType: 'image',
                }))}
              >
                <img
                  src={img.url}
                  alt="Design element"
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 text-sm">
                  Image {designState.imageElements.indexOf(img) + 1}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedImage && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Image Properties</CardTitle>
            <CardDescription>
              Adjust position, size, and rotation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Position X: {selectedImage.x.toFixed(2)}</Label>
              <Slider
                value={[selectedImage.x]}
                onValueChange={([value]) =>
                  updateImageProperty(selectedImage.id, 'x', value)
                }
                min={-2}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Y: {selectedImage.y.toFixed(2)}</Label>
              <Slider
                value={[selectedImage.y]}
                onValueChange={([value]) =>
                  updateImageProperty(selectedImage.id, 'y', value)
                }
                min={-2}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Z: {selectedImage.z.toFixed(2)}</Label>
              <Slider
                value={[selectedImage.z]}
                onValueChange={([value]) =>
                  updateImageProperty(selectedImage.id, 'z', value)
                }
                min={-0.15}
                max={0.15}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Size: {selectedImage.width.toFixed(2)}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedImage.aspectRatio) {
                      updateImageProperty(selectedImage.id, 'height', selectedImage.width / selectedImage.aspectRatio);
                    }
                  }}
                  className="h-6 text-xs"
                >
                  Lock Aspect
                </Button>
              </div>
              <Slider
                value={[selectedImage.width]}
                onValueChange={([value]) => {
                  updateImageProperty(selectedImage.id, 'width', value);
                  if (selectedImage.aspectRatio) {
                    updateImageProperty(selectedImage.id, 'height', value / selectedImage.aspectRatio);
                  }
                }}
                min={0.1}
                max={3}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Height: {selectedImage.height.toFixed(2)} (Manual)</Label>
              <Slider
                value={[selectedImage.height]}
                onValueChange={([value]) =>
                  updateImageProperty(selectedImage.id, 'height', value)
                }
                min={0.1}
                max={3}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Rotation: {selectedImage.rotation}°</Label>
              <Slider
                value={[selectedImage.rotation]}
                onValueChange={([value]) =>
                  updateImageProperty(selectedImage.id, 'rotation', value)
                }
                min={0}
                max={360}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Mirror/Flip</Label>
              <Button
                onClick={() =>
                  updateImageProperty(selectedImage.id, 'flipped', !selectedImage.flipped)
                }
                variant={selectedImage.flipped ? 'default' : 'outline'}
                className="w-full"
              >
                {selectedImage.flipped ? 'Flipped ↔️' : 'Normal ↔️'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
