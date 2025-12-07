'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { LogOut, Package, User, Cog, Brush, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { isAdmin } from '@/lib/admin';

export function UserNav() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (!user) {
    return <Button onClick={signInWithGoogle}>Sign in with Google</Button>;
  }

  const userIsAdmin = isAdmin(user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.photoURL ?? ''}
              alt={user.displayName ?? 'User'}
            />
            <AvatarFallback>
              {user.displayName?.charAt(0).toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/designs">
              <Brush className="mr-2 h-4 w-4" />
              <span>My Designs</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders">
              <Package className="mr-2 h-4 w-4" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          {userIsAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Package className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/orders">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Manage Orders</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Cog className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
