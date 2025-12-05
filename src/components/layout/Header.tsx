'use client';

import Link from 'next/link';
import { Shirt, ShoppingCart } from 'lucide-react';
import { UserNav } from './UserNav';
import { isAdmin } from '@/lib/admin';
import { useCart } from '@/providers/CartProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { items, getTotalItems, getTotalPrice, removeFromCart, updateQuantity, checkout } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to complete your order',
        variant: 'destructive',
      });
      return;
    }

    console.log('🔐 User authenticated:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    setIsCheckingOut(true);
    try {
      await checkout(user.uid, user.email || 'no-email@example.com');
      toast({
        title: 'Order placed!',
        description: 'Your order has been successfully placed.',
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('❌ Checkout failed in Header:', error);
      toast({
        title: 'Checkout failed',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shirt className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg sm:text-xl">
              TShirtly
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user && isAdmin(user.email) && (
            <Link href="/admin/orders" className="hidden sm:inline-flex">
              <Button variant="secondary" size="sm">Manage Orders</Button>
            </Link>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
                <SheetDescription>
                  {getTotalItems()} item(s) in your cart
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Custom T-Shirt</p>
                                <p className="text-sm text-muted-foreground">
                                  Size: {item.size}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Material: {item.designState.material}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              {items.length > 0 && (
                <SheetFooter className="flex-col space-y-4">
                  <div className="flex justify-between text-lg font-semibold w-full">
                    <span>Total:</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Proceed to Buy'}
                  </Button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
