'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, push, set } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { DesignState } from '@/components/designer/Designer';

export interface CartItem {
  id: string;
  designState: DesignState;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  price: number;
  thumbnail: string;
  timestamp: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'timestamp'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  checkout: (userId: string, userEmail: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tshirtly-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tshirtly-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'id' | 'timestamp'>) => {
    const newItem: CartItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const checkout = async (userId: string, userEmail: string) => {
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    console.log('🛒 Starting checkout...', { 
      userId, 
      userEmail, 
      itemCount: items.length,
      totalPrice: getTotalPrice() 
    });

    try {
      // Verify RTDB is initialized
      if (!rtdb) {
        console.error('❌ Firebase RTDB is not initialized!');
        throw new Error('Database connection not available');
      }

      console.log('✅ RTDB instance available');
      console.log('🔗 RTDB URL:', rtdb.app.options.databaseURL);

      // Create order in Realtime Database with simpler structure for testing
      const ordersRef = ref(rtdb, 'orders');
      console.log('📝 Creating order reference at: orders/');
      
      const newOrderRef = push(ordersRef);
      console.log('🆕 Generated order key:', newOrderRef.key);
      
      const orderData = {
        userId: userId || 'anonymous',
        userEmail: userEmail || 'no-email',
        items: items.map(item => ({
          designState: JSON.parse(JSON.stringify(item.designState)), // Deep clone to remove circular refs
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: getTotalPrice(),
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log('💾 Order data prepared:', {
        orderId: newOrderRef.key,
        userId: orderData.userId,
        itemCount: orderData.items.length,
        total: orderData.totalPrice,
        path: newOrderRef.toString()
      });

      // Use set to write data with timeout
      console.log('⏳ Attempting to write to RTDB...');
      const writePromise = set(newOrderRef, orderData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Write operation timed out after 10 seconds')), 10000)
      );

      try {
        await Promise.race([writePromise, timeoutPromise]);
        console.log('✅ Order saved successfully to RTDB!', {
          orderId: newOrderRef.key,
          path: `orders/${newOrderRef.key}`
        });
      } catch (e) {
        console.warn('⚠️ RTDB write via WebSocket/SDK failed, falling back to REST...', e);

        // REST fallback using authenticated ID token
        const idToken = await (await import('firebase/auth')).getIdToken((await import('firebase/auth')).getAuth().currentUser!, true);
        const dbUrl = rtdb.app.options.databaseURL;
        const restUrl = `${dbUrl}/orders.json?auth=${idToken}`;

        console.log('🌐 REST fallback POST:', restUrl);
        const res = await fetch(restUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('❌ REST fallback failed:', res.status, text);
          throw new Error(`REST write failed: ${res.status} ${text}`);
        }

        const json = await res.json();
        console.log('✅ REST write succeeded. New key:', json?.name);
      }

      // Clear cart after successful checkout
      clearCart();
      console.log('🧹 Cart cleared');
    } catch (error: any) {
      console.error('❌ Checkout error details:', {
        message: error?.message,
        code: error?.code,
        serverResponse: error?.serverResponse,
        stack: error?.stack,
        name: error?.name,
        fullError: error
      });
      
      // Provide more specific error messages
      if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
        console.error('🔒 Permission denied - Check Firebase Console:');
        console.error('1. Go to https://console.firebase.google.com/');
        console.error('2. Select project: studio-5802405481-68643');
        console.error('3. Go to Realtime Database > Rules');
        console.error('4. Ensure authenticated users can write to /orders/');
        throw new Error('Permission denied. Please check database rules in Firebase Console. See console for details.');
      } else if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        console.error('⏱️ Write operation timed out - Possible causes:');
        console.error('1. Database rules blocking the write');
        console.error('2. Network connectivity issues');
        console.error('3. Database not created in Firebase Console');
        throw new Error('Write operation timed out. The database may not be properly configured. Check Firebase Console.');
      } else if (error?.message?.includes('network') || error?.message?.includes('Failed to get document')) {
        throw new Error('Network error. Please check your internet connection and Firebase configuration.');
      } else if (error?.code === 'DATABASE_URL_INVALID') {
        throw new Error('Database URL is invalid. Please check your Firebase configuration.');
      } else {
        throw new Error(error?.message || 'Failed to save order. Please try again.');
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
