'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shirt, Check } from 'lucide-react';
import type { DesignState, MaterialType } from '../Designer';
import type { Dispatch, SetStateAction } from 'react';

interface MaterialPanelProps {
  designState: DesignState;
  setDesignState: Dispatch<SetStateAction<DesignState>>;
}

interface MaterialInfo {
  type: MaterialType;
  name: string;
  description: string;
  roughness: number;
  metalness: number;
  icon: string;
}

const MATERIALS: MaterialInfo[] = [
  {
    type: 'cotton',
    name: 'Cotton',
    description: 'Soft, breathable, and comfortable',
    roughness: 0.8,
    metalness: 0.0,
    icon: '🌿',
  },
  {
    type: 'wool',
    name: 'Wool',
    description: 'Warm, textured, and cozy',
    roughness: 0.9,
    metalness: 0.0,
    icon: '🐑',
  },
  {
    type: 'polyester',
    name: 'Polyester',
    description: 'Durable, wrinkle-resistant',
    roughness: 0.5,
    metalness: 0.1,
    icon: '✨',
  },
  {
    type: 'silk',
    name: 'Silk',
    description: 'Smooth, luxurious, and shiny',
    roughness: 0.2,
    metalness: 0.3,
    icon: '💎',
  },
  {
    type: 'nylon',
    name: 'Nylon',
    description: 'Strong, lightweight, and sleek',
    roughness: 0.4,
    metalness: 0.2,
    icon: '⚡',
  },
];

export function MaterialPanel({ designState, setDesignState }: MaterialPanelProps) {
  const selectMaterial = (material: MaterialType) => {
    setDesignState((prev) => ({
      ...prev,
      material,
    }));
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="text-primary" />
          <span>Fabric Material</span>
        </CardTitle>
        <CardDescription>
          Choose the fabric type for your t-shirt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {MATERIALS.map((material) => (
          <button
            key={material.type}
            onClick={() => selectMaterial(material.type)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              designState.material === material.type
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{material.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-base font-semibold cursor-pointer">
                    {material.name}
                  </Label>
                  {designState.material === material.type && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {material.description}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Texture: {(material.roughness * 100).toFixed(0)}%</span>
                  <span>Shine: {(material.metalness * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export { MATERIALS };
