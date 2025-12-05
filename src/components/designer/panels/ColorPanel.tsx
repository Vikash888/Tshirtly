'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DesignState } from '../Designer';
import type { Dispatch, SetStateAction } from 'react';

const presetColors = [
  '#FFFFFF', '#1E1E1E', '#D22B2B', '#2B65D2', '#2BD263', '#D2D02B',
  '#B42BD2', '#D2782B', '#808080', '#F5A9B8', '#ADD8E6', '#90EE90',
];

interface ColorPanelProps {
  designState: DesignState;
  setDesignState: Dispatch<SetStateAction<DesignState>>;
}

export function ColorPanel({ designState, setDesignState }: ColorPanelProps) {
  const handleColorChange = (color: string) => {
    setDesignState((prevState) => ({ ...prevState, color }));
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>T-Shirt Color</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="font-semibold text-muted-foreground">Presets</Label>
          <div className="grid grid-cols-6 gap-3 pt-2">
            {presetColors.map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  designState.color.toLowerCase() === color.toLowerCase()
                    ? 'border-primary ring-2 ring-primary ring-offset-background'
                    : 'border-muted'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        <div>
          <Label className="font-semibold text-muted-foreground">Custom</Label>
          <div className="flex items-center gap-4 pt-2">
            <div className="relative">
              <Input
                id="custom-color"
                type="color"
                value={designState.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 p-1 appearance-none bg-transparent border-2 cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={designState.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-28 font-mono"
              aria-label="Hex color code"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
