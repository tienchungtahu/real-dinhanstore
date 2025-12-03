"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/app/hooks/useCartStore";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { formatPriceSimple } from "@/lib/formatPrice";
import { useState } from "react";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  name: string;
  slug?: string;
  price: number;
  salePrice?: number;
  image: string;
  brand?: string;
  stock: number;
}

export function ProductCard({ id, name, slug, price, salePrice, image, brand, stock }: ProductCardProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const numPrice = Number(price);
  const numSalePrice = salePrice ? Number(salePrice) : undefined;
  const hasDiscount = numSalePrice && numSalePrice < numPrice;
  const discountPercent = hasDiscount ? Math.round((1 - numSalePrice / numPrice) * 100) : 0;

  // Generate slug from name if not provided
  const productSlug = slug || name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      slug: productSlug,
      price: numPrice,
      salePrice: numSalePrice,
      image: image || "",
      brand: brand || "",
      stock,
    });
  };

  return (
    <Link
      href={`/${locale}/products/${productSlug}`}
      className="group relative bg-white rounded-3xl overflow-hidden card-hover border border-gray-100 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Stock badge */}
        {stock <= 5 && stock > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Còn {stock}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isLiked ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 shadow-lg">
            <Eye className="w-5 h-5" />
          </span>
        </div>

        {/* Product image */}
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-24 h-24 text-gray-300 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
              <ellipse cx="50" cy="35" rx="25" ry="30" />
              <rect x="45" y="60" width="10" height="35" />
            </svg>
          </div>
        )}

        {/* Quick add overlay */}
        <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 btn-shine ${
              stock > 0
                ? "bg-white text-gray-900 hover:bg-gray-100"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {stock > 0 ? t("addToCart") : t("outOfStock")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between mb-2">
          {brand && (
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-full">
              {brand}
            </span>
          )}
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-medium text-gray-600">4.8</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 min-h-[3rem] group-hover:text-emerald-600 transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-end gap-2">
          {hasDiscount && numSalePrice ? (
            <>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                {formatPriceSimple(numSalePrice, locale)}
              </span>
              <span className="text-sm text-gray-400 line-through mb-1">
                {formatPriceSimple(numPrice, locale)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900">
              {formatPriceSimple(numPrice, locale)}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </Link>
  );
}
