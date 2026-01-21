"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { CheckCheck, Globe, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { localeOptionsList } from "./config";

type LocaleSwitcherProps = Omit<
  React.ComponentProps<typeof Button>,
  "value" | "onValueChange"
>;

export function LocaleDropdown({ className, ...props }: LocaleSwitcherProps) {
  const currentLocale = useLocale();
  const [isPending, setIsPending] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    setIsPending(true);

    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    // Full page reload to apply new locale
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2 px-3", className)}
          {...props}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="font-medium">
            {localeOptionsList.find((l) => l.value === currentLocale)?.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-3 w-40 mt-2">
        {localeOptionsList.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleLocaleChange(lang.value)}
            className={currentLocale === lang.value ? "bg-muted" : ""}
          >
            {lang.label}
            {currentLocale === lang.value && (
              <CheckCheck className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
