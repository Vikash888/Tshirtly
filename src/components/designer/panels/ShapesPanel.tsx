'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Circle, Square, Triangle, Star, Heart, Hexagon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DesignState, ImageElement } from '../Designer';
import type { Dispatch, SetStateAction } from 'react';

interface ShapesPanelProps {
  designState: DesignState;
  setDesignState: Dispatch<SetStateAction<DesignState>>;
}

interface ShapeOption {
  name: string;
  icon: React.ReactNode;
  svg: string;
}

const SHAPES: ShapeOption[] = [
  {
    name: 'Circle',
    icon: <Circle className="w-6 h-6" />,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>',
  },
  {
    name: 'Square',
    icon: <Square className="w-6 h-6" />,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="currentColor"/></svg>',
  },
  {
    name: 'Triangle',
    icon: <Triangle className="w-6 h-6" />,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="currentColor"/></svg>',
  },
  {
    name: 'Star',
    icon: <Star className="w-6 h-6" />,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 61,35 88,35 67,52 77,78 50,62 23,78 33,52 12,35 39,35" fill="currentColor"/></svg>',
  },
  {
    name: 'Heart',
    icon: <Heart className="w-6 h-6" />,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,90 C50,90 10,65 10,40 C10,25 20,15 30,15 C40,15 50,25 50,25 C50,25 60,15 70,15 C80,15 90,25 90,40 C90,65 50,90 50,90 Z" fill="currentColor"/></svg>',
  },
  {
    name: 'Hexagon',
    icon: <Hexagon className="w-6 h-6" />,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="currentColor"/></svg>',
  },
];

export function ShapesPanel({ designState, setDesignState }: ShapesPanelProps) {
  const selectedShapeId = designState.selectedElementType === 'image' ? designState.selectedElementId : null;
  const { toast } = useToast();
  const [shapeColor, setShapeColor] = React.useState('#3b82f6');

  const addShape = (shape: ShapeOption) => {
    // Convert SVG to data URL
    const coloredSvg = shape.svg.replace('currentColor', shapeColor);
    const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 200, 200);
        const dataUrl = canvas.toDataURL('image/png');
        
        const newShape: ImageElement = {
          id: Date.now().toString(),
          url: dataUrl,
          x: 0,
          y: 0,
          z: designState.currentSide === 'front' ? -0.11 : 0.11,
          width: 0.8,
          height: 0.8,
          rotation: 0,
          flipped: false,
          side: designState.currentSide,
          aspectRatio: 1,
        };
        
        setDesignState((prev) => ({
          ...prev,
          imageElements: [...prev.imageElements, newShape],
          selectedElementId: newShape.id,
          selectedElementType: 'image',
        }));
        
        toast({
          title: 'Shape added',
          description: `${shape.name} added to your design.`,
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const selectedShape = designState.imageElements.find(
    (img) => img.id === selectedShapeId
  );

  const updateShapeProperty = <K extends keyof ImageElement>(
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

  const deleteShape = (id: string) => {
    setDesignState((prev) => ({
      ...prev,
      imageElements: prev.imageElements.filter((img) => img.id !== id),
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
      selectedElementType: prev.selectedElementId === id ? null : prev.selectedElementType,
    }));
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="text-primary" />
            <span>Add Shapes</span>
          </CardTitle>
          <CardDescription>
            Choose a shape and add it to your design
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Shape Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={shapeColor}
                onChange={(e) => setShapeColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={shapeColor}
                onChange={(e) => setShapeColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SHAPES.map((shape) => (
              <Button
                key={shape.name}
                variant="outline"
                className="h-20 flex flex-col gap-1"
                onClick={() => addShape(shape)}
              >
                {shape.icon}
                <span className="text-xs">{shape.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedShape && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Shape Properties</CardTitle>
            <CardDescription>
              Adjust size and rotation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Position X: {selectedShape.x.toFixed(2)}</Label>
              <Slider
                value={[selectedShape.x]}
                onValueChange={([value]) =>
                  updateShapeProperty(selectedShape.id, 'x', value)
                }
                min={-2}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Y: {selectedShape.y.toFixed(2)}</Label>
              <Slider
                value={[selectedShape.y]}
                onValueChange={([value]) =>
                  updateShapeProperty(selectedShape.id, 'y', value)
                }
                min={-2}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Z: {selectedShape.z.toFixed(2)}</Label>
              <Slider
                value={[selectedShape.z]}
                onValueChange={([value]) =>
                  updateShapeProperty(selectedShape.id, 'z', value)
                }
                min={-0.15}
                max={0.15}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Size: {selectedShape.width.toFixed(2)}</Label>
              <Slider
                value={[selectedShape.width]}
                onValueChange={([value]) => {
                  updateShapeProperty(selectedShape.id, 'width', value);
                  updateShapeProperty(selectedShape.id, 'height', value);
                }}
                min={0.1}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Rotation: {selectedShape.rotation}°</Label>
              <Slider
                value={[selectedShape.rotation]}
                onValueChange={([value]) =>
                  updateShapeProperty(selectedShape.id, 'rotation', value)
                }
                min={0}
                max={360}
                step={1}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => deleteShape(selectedShape.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Shape
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
