'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { Header } from '@/components/layout/Header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';

interface Order {
    id: string;
    items: any[];
    totalPrice: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: any;
}

export default function UserOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
            return;
        }

        if (user) {
            // Subscribe to user's orders
            const ordersRef = query(
                ref(rtdb, 'orders'),
                orderByChild('userId'),
                equalTo(user.uid)
            );

            const unsubscribe = onValue(ordersRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const ordersData = Object.entries(data).map(([id, order]: [string, any]) => ({
                        id,
                        ...order,
                    })) as Order[];
                    // Sort by createdAt descending
                    ordersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    setOrders(ordersData);
                } else {
                    setOrders([]);
                }
                setIsLoadingOrders(false);
            });

            return () => unsubscribe();
        }
    }, [user, loading, router]);

    const getStatusInfo = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return { color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20', icon: Clock, label: 'Order Placed' };
            case 'processing':
                return { color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20', icon: Package, label: 'Processing' };
            case 'shipped':
                return { color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20', icon: Truck, label: 'Shipped' };
            case 'delivered':
                return { color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20', icon: CheckCircle, label: 'Delivered' };
            case 'cancelled':
                return { color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20', icon: XCircle, label: 'Cancelled' };
            default:
                return { color: 'bg-gray-500/10 text-gray-500', icon: Clock, label: status };
        }
    };

    if (loading || isLoadingOrders) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <p className="text-muted-foreground animate-pulse">Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-headline text-primary mb-2">
                            My Orders
                        </h1>
                        <p className="text-muted-foreground">
                            Track and manage your recent purchases
                        </p>
                    </div>

                    {orders.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    <ShoppingBag className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    Looks like you haven't placed any orders yet. Start designing your custom t-shirt today!
                                </p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
                                >
                                    Start Designing
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <Card key={order.id} className="overflow-hidden">
                                        <CardHeader className="bg-muted/30 border-b pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-base">
                                                        Order #{order.id.substring(0, 8).toUpperCase()}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline" className={`${statusInfo.color} border-none px-3 py-1`}>
                                                    <StatusIcon className="w-3 h-3 mr-2" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    {order.items.map((item: any, index: number) => (
                                                        <div key={index} className="flex gap-4">
                                                            <div className="relative h-20 w-20 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                                                                {item.thumbnail ? (
                                                                    <img
                                                                        src={item.thumbnail}
                                                                        alt="Design Preview"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                                        <ShoppingBag className="h-8 w-8" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <h4 className="font-medium">Custom T-Shirt</h4>
                                                                <div className="text-sm text-muted-foreground">
                                                                    <span className="inline-block mr-3">Size: {item.size}</span>
                                                                    <span className="inline-block">Qty: {item.quantity}</span>
                                                                </div>
                                                                <div className="font-medium">
                                                                    ${item.price.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="border-t pt-4 flex justify-between items-center">
                                                    <span className="font-medium">Total Amount</span>
                                                    <span className="text-xl font-bold text-primary">
                                                        ${order.totalPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
