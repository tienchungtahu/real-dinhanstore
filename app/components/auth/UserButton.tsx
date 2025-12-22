"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { User, LogOut, Settings, ShoppingBag, Gift } from "lucide-react";
import { AuthModal } from "./AuthModal";
import Link from "next/link";

export function UserButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const t = useTranslations("auth");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [showDropdown, setShowDropdown] = useState(false);
  const [points, setPoints] = useState<number>(0);

  // Fetch user points
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.points !== undefined) {
            setPoints(data.points);
          }
        })
        .catch(console.error);
    }
  }, [isSignedIn, isLoaded]);

  const openSignIn = () => {
    setAuthMode("sign-in");
    setShowAuthModal(true);
  };

  const openSignUp = () => {
    setAuthMode("sign-up");
    setShowAuthModal(true);
  };

  if (isSignedIn) {
    return (
      <div className="relative flex">
        {/* Points display */}
        {points > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
            <Gift className="w-3.5 h-3.5" />
            <span>{points.toLocaleString()}</span>
          </div>
        )}
        
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-gray-900 truncate">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                {points > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-amber-600">
                    <Gift className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{points.toLocaleString()} {t("points")}</span>
                  </div>
                )}
              </div>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                <ShoppingBag className="w-4 h-4" />
                {t("myOrders")}
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4" />
                {t("settings")}
              </Link>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  {t("signOut")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openSignIn}
          className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
        >
          {t("signIn")}
        </button>
        <button
          onClick={openSignUp}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
        >
          {t("signUp")}
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
}
