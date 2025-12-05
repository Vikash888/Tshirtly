'use client';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Paintbrush, Image as ImageIcon, Type, Shirt, Shapes } from 'lucide-react';
import type { DesignState } from './Designer';
import type { Dispatch, SetStateAction } from 'react';
import { ColorPanel } from './panels/ColorPanel';
import { ImagePanel } from './panels/ImagePanel';
import { TextPanel } from './panels/TextPanel';
import { MaterialPanel } from './panels/MaterialPanel';
import { ShapesPanel } from './panels/ShapesPanel';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomizationPanelProps {
  designState: DesignState;
  setDesignState: Dispatch<SetStateAction<DesignState>>;
}

export function CustomizationPanel({
  designState,
  setDesignState,
}: CustomizationPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-headline text-primary mb-4">
          Customize Your Tee
        </h2>
        <Tabs defaultValue="color" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 h-12">
            <TabsTrigger value="color" className="flex-col sm:flex-row gap-1">
              <Paintbrush className="w-5 h-5" />
              <span className="text-xs">Color</span>
            </TabsTrigger>
            <TabsTrigger value="material" className="flex-col sm:flex-row gap-1">
              <Shirt className="w-5 h-5" />
              <span className="text-xs">Material</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex-col sm:flex-row gap-1">
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">Images</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-col sm:flex-row gap-1">
              <Type className="w-5 h-5" />
              <span className="text-xs">Text</span>
            </TabsTrigger>
            <TabsTrigger value="shapes" className="flex-col sm:flex-row gap-1">
              <Shapes className="w-5 h-5" />
              <span className="text-xs">Shapes</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="color" className="mt-4">
            <ColorPanel
              designState={designState}
              setDesignState={setDesignState}
            />
          </TabsContent>
          <TabsContent value="material" className="mt-4">
            <MaterialPanel
              designState={designState}
              setDesignState={setDesignState}
            />
          </TabsContent>
          <TabsContent value="images" className="mt-4">
            <ImagePanel
              designState={designState}
              setDesignState={setDesignState}
            />
          </TabsContent>
          <TabsContent value="text" className="mt-4">
            <TextPanel
              designState={designState}
              setDesignState={setDesignState}
            />
          </TabsContent>
          <TabsContent value="shapes" className="mt-4">
            <ShapesPanel
              designState={designState}
              setDesignState={setDesignState}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
