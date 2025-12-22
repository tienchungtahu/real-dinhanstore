"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SignIn, SignUp } from "@clerk/nextjs";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "sign-in" | "sign-up";
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-20 p-2 bg-white text-gray-500 hover:text-gray-700 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {mode === "sign-in" ? (
          <SignIn routing="hash" />
        ) : (
          <SignUp routing="hash" />
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
