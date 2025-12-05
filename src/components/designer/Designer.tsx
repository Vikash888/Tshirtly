'use client';

import { useState, useEffect, useRef } from 'react';
import { TshirtCanvas } from './TshirtCanvas';
import { CustomizationPanel } from './CustomizationPanel';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCart } from '@/providers/CartProvider';
import { useToast } from '@/hooks/use-toast';

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  rotation: number;
  flipped: boolean;
  side: 'front' | 'back';
}

export interface ImageElement {
  id: string;
  url: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotation: number;
  flipped: boolean;
  side: 'front' | 'back';
  aspectRatio?: number;
}

export type MaterialType = 'cotton' | 'wool' | 'polyester' | 'silk' | 'nylon';

export interface DesignState {
  color: string;
  material: MaterialType;
  textElements: TextElement[];
  imageElements: ImageElement[];
  selectedElementId: string | null;
  selectedElementType: 'text' | 'image' | null;
  currentSide: 'front' | 'back';
}

export function Designer() {
  const [designState, setDesignState] = useState<DesignState>({
    color: '#ffffff',
    material: 'cotton',
    textElements: [],
    imageElements: [],
    selectedElementId: null,
    selectedElementType: null,
    currentSide: 'front',
  });
  
  const canvasExportRef = useRef<(() => void) | null>(null);
  const [size, setSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [quantity, setQuantity] = useState(1);
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleExport = () => {
    if (canvasExportRef.current) {
      canvasExportRef.current();
    }
  };

  const handleAddToCart = () => {
    // Calculate price based on quantity and customization
    const basePrice = 29.99;
    const customizationPrice = (designState.textElements.length + designState.imageElements.length) * 2;
    const totalPrice = basePrice + customizationPrice;

    addToCart({
      designState,
      size,
      quantity,
      price: totalPrice,
      thumbnail: '', // Will be generated from canvas
    });

    toast({
      title: 'Added to cart!',
      description: `${quantity} custom t-shirt(s) added to your cart.`,
    });

    setIsCartDialogOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected element with Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && designState.selectedElementId) {
        e.preventDefault();
        if (designState.selectedElementType === 'text') {
          setDesignState(prev => ({
            ...prev,
            textElements: prev.textElements.filter(el => el.id !== prev.selectedElementId),
            selectedElementId: null,
            selectedElementType: null,
          }));
        } else if (designState.selectedElementType === 'image') {
          setDesignState(prev => ({
            ...prev,
            imageElements: prev.imageElements.filter(el => el.id !== prev.selectedElementId),
            selectedElementId: null,
            selectedElementType: null,
          }));
        }
      }
      
      // Deselect with Escape
      if (e.key === 'Escape' && designState.selectedElementId) {
        setDesignState(prev => ({
          ...prev,
          selectedElementId: null,
          selectedElementType: null,
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [designState.selectedElementId, designState.selectedElementType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-3.5rem)] w-full">
      <div className="lg:col-span-2 bg-gradient-to-br from-background to-muted/20 h-full w-full flex items-center justify-center relative">
        <TshirtCanvas 
          designState={designState} 
          setDesignState={setDesignState}
          onExportReady={(exportFn) => { canvasExportRef.current = exportFn; }}
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            onClick={() => setDesignState(prev => ({
              ...prev,
              currentSide: prev.currentSide === 'front' ? 'back' : 'front',
              selectedElementId: null,
              selectedElementType: null,
            }))}
            variant="outline"
            size="lg"
            className="shadow-lg bg-background"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            {designState.currentSide === 'front' ? 'Show Back' : 'Show Front'}
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="shadow-lg bg-background"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Export
          </Button>
          <Dialog open={isCartDialogOpen} onOpenChange={setIsCartDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg" size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Cart</DialogTitle>
                <DialogDescription>
                  Choose size and quantity for your custom t-shirt
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={size} onValueChange={(value: any) => setSize(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Base Price:</span>
                    <span>$29.99</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Customization:</span>
                    <span>${((designState.textElements.length + designState.imageElements.length) * 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total:</span>
                    <span>${((29.99 + (designState.textElements.length + designState.imageElements.length) * 2) * quantity).toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={handleAddToCart} className="w-full" size="lg">
                  Add to Cart
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="lg:col-span-1 bg-background border-l h-[calc(100vh-3.5rem)]">
        <CustomizationPanel
          designState={designState}
          setDesignState={setDesignState}
        />
      </div>
    </div>
  );
}
