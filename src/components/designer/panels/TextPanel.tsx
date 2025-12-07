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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DesignState, TextElement } from '../Designer';
import type { Dispatch, SetStateAction } from 'react';

interface TextPanelProps {
  designState: DesignState;
  setDesignState: Dispatch<SetStateAction<DesignState>>;
}

const FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
];

export function TextPanel({ designState, setDesignState }: TextPanelProps) {
  const selectedTextId = designState.selectedElementType === 'text' ? designState.selectedElementId : null;
  const { toast } = useToast();

  const addText = () => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: 'New Text',
      x: 0,
      y: 0,
      z: designState.currentSide === 'front' ? 0.11 : -0.11,
      fontSize: 0.3,
      color: '#000000',
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      rotation: 0,
      flipped: false,
      side: designState.currentSide,
    };
    setDesignState((prev) => ({
      ...prev,
      textElements: [...prev.textElements, newText],
      selectedElementId: newText.id,
      selectedElementType: 'text',
    }));
    toast({
      title: 'Text added',
      description: 'New text element added to your design.',
    });
  };

  const updateTextProperty = <K extends keyof TextElement>(
    id: string,
    key: K,
    value: TextElement[K]
  ) => {
    setDesignState((prev) => ({
      ...prev,
      textElements: prev.textElements.map((txt) =>
        txt.id === id ? { ...txt, [key]: value } : txt
      ),
    }));
  };

  const deleteText = (id: string) => {
    setDesignState((prev) => ({
      ...prev,
      textElements: prev.textElements.filter((txt) => txt.id !== id),
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
      selectedElementType: prev.selectedElementId === id ? null : prev.selectedElementType,
    }));
  };

  const selectedText = designState.textElements.find(
    (txt) => txt.id === selectedTextId
  );

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="text-primary" />
            <span>Add Text</span>
          </CardTitle>
          <CardDescription>
            Add text to your t-shirt design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={addText} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Text
          </Button>
        </CardContent>
      </Card>

      {designState.textElements.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Your Text</CardTitle>
            <CardDescription>
              Click on text to adjust its properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {designState.textElements.map((txt) => (
              <div
                key={txt.id}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${selectedTextId === txt.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                  }`}
                onClick={() => setDesignState(prev => ({
                  ...prev,
                  selectedElementId: txt.id,
                  selectedElementType: 'text',
                }))}
              >
                <div className="flex-1 text-sm truncate">{txt.text}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteText(txt.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedText && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Text Properties</CardTitle>
            <CardDescription>
              Customize your text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Input
                value={selectedText.text}
                onChange={(e) =>
                  updateTextProperty(selectedText.id, 'text', e.target.value)
                }
                placeholder="Enter text"
              />
            </div>
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={selectedText.fontFamily}
                onValueChange={(value) =>
                  updateTextProperty(selectedText.id, 'fontFamily', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Font Style</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedText.fontWeight === 'bold' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateTextProperty(
                      selectedText.id,
                      'fontWeight',
                      selectedText.fontWeight === 'bold' ? 'normal' : 'bold'
                    )
                  }
                  className="flex-1 font-bold"
                >
                  B
                </Button>
                <Button
                  variant={selectedText.fontStyle === 'italic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateTextProperty(
                      selectedText.id,
                      'fontStyle',
                      selectedText.fontStyle === 'italic' ? 'normal' : 'italic'
                    )
                  }
                  className="flex-1 italic"
                >
                  I
                </Button>
                <Button
                  variant={selectedText.textDecoration === 'underline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateTextProperty(
                      selectedText.id,
                      'textDecoration',
                      selectedText.textDecoration === 'underline' ? 'none' : 'underline'
                    )
                  }
                  className="flex-1 underline"
                >
                  U
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) =>
                    updateTextProperty(selectedText.id, 'color', e.target.value)
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={selectedText.color}
                  onChange={(e) =>
                    updateTextProperty(selectedText.id, 'color', e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Position X: {selectedText.x.toFixed(2)}</Label>
              <Slider
                value={[selectedText.x]}
                onValueChange={([value]) =>
                  updateTextProperty(selectedText.id, 'x', value)
                }
                min={-2}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Y: {selectedText.y.toFixed(2)}</Label>
              <Slider
                value={[selectedText.y]}
                onValueChange={([value]) =>
                  updateTextProperty(selectedText.id, 'y', value)
                }
                min={-2}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Z: {selectedText.z.toFixed(2)}</Label>
              <Slider
                value={[selectedText.z]}
                onValueChange={([value]) =>
                  updateTextProperty(selectedText.id, 'z', value)
                }
                min={-0.15}
                max={0.15}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Font Size: {selectedText.fontSize.toFixed(2)}</Label>
              <Slider
                value={[selectedText.fontSize]}
                onValueChange={([value]) =>
                  updateTextProperty(selectedText.id, 'fontSize', value)
                }
                min={0.1}
                max={1}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label>Rotation: {selectedText.rotation}°</Label>
              <Slider
                value={[selectedText.rotation]}
                onValueChange={([value]) =>
                  updateTextProperty(selectedText.id, 'rotation', value)
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
                  updateTextProperty(selectedText.id, 'flipped', !selectedText.flipped)
                }
                variant={selectedText.flipped ? 'default' : 'outline'}
                className="w-full"
              >
                {selectedText.flipped ? 'Flipped ↔️' : 'Normal ↔️'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
