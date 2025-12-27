'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useLanguage } from "@/components/language-provider"

export function UserAuthBtn() {
  const { data: session } = useSession();
  const { t } = useLanguage()

  if (session && session.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback>{session.user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem onClick={() => signOut()}>
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => signIn("google")}>
      {t("login")}
    </Button>
  );
}