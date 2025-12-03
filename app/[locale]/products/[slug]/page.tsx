"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Check,
  Loader2,
  Package,
  Zap,
} from "lucide-react";
import { useCart } from "@/app/hooks/useCartStore";
import { formatPriceSimple } from "@/lib/formatPrice";
import { ProductCard } from "@/app/components/ui/ProductCard";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("product");
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const slug = params.slug as string;
        const res = await fetch(`/api/products/slug/${slug}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setError("Không tìm thấy sản phẩm");
          } else {
            setError("Đã xảy ra lỗi khi tải sản phẩm");
          }
          return;
        }

        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        setError("Không thể kết nối đến server");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images?.[0] || "",
        brand: product.brand,
        stock: product.stock,
      });
    }
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${locale}/checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Không tìm thấy sản phẩm"}</h2>
          <p className="text-gray-500 mb-6">Sản phẩm có thể đã bị xóa hoặc không tồn tại</p>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const numPrice = Number(product.price);
  const numSalePrice = product.salePrice ? Number(product.salePrice) : undefined;
  const hasDiscount = numSalePrice && numSalePrice < numPrice;
  const discountPercent = hasDiscount ? Math.round((1 - numSalePrice / numPrice) * 100) : 0;
  const images = product.images?.length > 0 ? product.images : ["/placeholder.png"];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href={`/${locale}`} className="text-gray-500 hover:text-emerald-600 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link href={`/${locale}/products`} className="text-gray-500 hover:text-emerald-600 transition-colors">
              Sản phẩm
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <Link
                  href={`/${locale}/products?category=${product.category.slug}`}
                  className="text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
                    -{discountPercent}%
                  </span>
                </div>
              )}
              
              {product.isFeatured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Zap className="w-3 h-3" />
                    HOT
                  </span>
                </div>
              )}

              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-200" viewBox="0 0 100 100" fill="currentColor">
                    <ellipse cx="50" cy="35" rx="25" ry="30" />
                    <rect x="45" y="60" width="10" height="35" />
                  </svg>
                </div>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-emerald-500 shadow-lg shadow-emerald-500/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-contain p-2 bg-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Category */}
            <div className="flex items-center gap-3">
              {product.brand && (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">4.8 (128 đánh giá)</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-emerald-600 font-medium">Đã bán 256</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
              <div className="flex items-end gap-4">
                {hasDiscount && numSalePrice ? (
                  <>
                    <span className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      {formatPriceSimple(numSalePrice, locale)}
                    </span>
                    <span className="text-xl text-gray-400 line-through mb-1">
                      {formatPriceSimple(numPrice, locale)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full mb-1">
                      Tiết kiệm {formatPriceSimple(numPrice - numSalePrice, locale)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPriceSimple(numPrice, locale)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-600 font-medium">
                    {t("inStock")} ({product.stock} sản phẩm)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-medium">{t("outOfStock")}</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">{t("quantity")}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 h-12 text-center font-semibold border-x border-gray-200 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Tối đa {product.stock} sản phẩm
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all ${
                  addedToCart
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                    : product.stock > 0
                    ? "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {t("addToCart")}
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all"
              >
                {t("buyNow")}
              </button>
            </div>

            {/* Extra Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isLiked
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">Yêu thích</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Chia sẻ</span>
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs font-medium text-gray-600">Miễn phí ship</p>
                <p className="text-xs text-gray-400">Đơn từ 500K</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-600">Bảo hành</p>
                <p className="text-xs text-gray-400">Chính hãng</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-gray-600">Đổi trả</p>
                <p className="text-xs text-gray-400">Trong 30 ngày</p>
              </div>
            </div>
          </div>
        </div>


        {/* Tabs Section */}
        <div className="mt-12">
          {/* Tab Headers */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "description"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("description")}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "specs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("specifications")}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "reviews"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("reviews")} (128)
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {activeTab === "description" && (
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Chưa có mô tả cho sản phẩm này."}
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-500">{t("brand")}</span>
                    <span className="font-semibold text-gray-900">{product.brand || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-500">{t("category")}</span>
                    <span className="font-semibold text-gray-900">{product.category?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-500">{t("sku")}</span>
                    <span className="font-semibold text-gray-900">SKU-{product.id.toString().padStart(6, "0")}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-500">{t("stock")}</span>
                    <span className="font-semibold text-gray-900">{product.stock} sản phẩm</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-600">4.8</div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">128 đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-3">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : 3}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8">
                          {rating === 5 ? "70%" : rating === 4 ? "20%" : rating === 3 ? "7%" : "3%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[
                    { name: "Nguyễn Văn A", rating: 5, date: "2 ngày trước", comment: "Sản phẩm rất tốt, đóng gói cẩn thận. Giao hàng nhanh!" },
                    { name: "Trần Thị B", rating: 4, date: "1 tuần trước", comment: "Chất lượng tốt, đúng mô tả. Sẽ ủng hộ shop tiếp." },
                    { name: "Lê Văn C", rating: 5, date: "2 tuần trước", comment: "Mình rất hài lòng với sản phẩm này. Recommend cho mọi người!" },
                  ].map((review, index) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          Đã mua hàng
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  Xem tất cả đánh giá
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t("relatedProducts")}</h2>
              <Link
                href={`/${locale}/products?category=${product.category?.slug || ""}`}
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  slug={relatedProduct.slug}
                  price={relatedProduct.price}
                  salePrice={relatedProduct.salePrice}
                  image={relatedProduct.images?.[0] || ""}
                  brand={relatedProduct.brand}
                  stock={relatedProduct.stock}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
