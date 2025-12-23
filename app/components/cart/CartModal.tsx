"use client";

import { useState, useEffect } from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  Tag,
  MapPin,
  Plus as PlusIcon,
  Check,
  CreditCard,
  QrCode,
  Loader2,
  ShoppingBag,
  Gift,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/app/hooks/useCartStore";
import { useUser } from "@clerk/nextjs";
import { useLocale, useTranslations } from "next-intl";
import { formatPriceSimple } from "@/lib/formatPrice";

type PaymentMethod = "stripe" | "vietqr" | null;

export function CartModal() {
  const { isSignedIn } = useUser();
  const locale = useLocale();
  const t = useTranslations("cart");
  const tCheckout = useTranslations("checkout");
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    discount,
    discountCode,
    applyDiscount,
    removeDiscount,
    pointsUsed,
    userPoints,
    applyPoints,
    removePoints,
    fetchUserPoints,
    subtotal,
    discountAmount,
    pointsDiscount,
    total,
    selectedAddress,
    addresses,
    setSelectedAddress,
    fetchAddresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCart();

  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [pointsInput, setPointsInput] = useState("");
  const [pointsError, setPointsError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vietQRData, setVietQRData] = useState<{ qrUrl: string; bankInfo: string } | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    isDefault: false,
  });

  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchAddresses();
      fetchUserPoints();
    }
  }, [isOpen, isSignedIn, fetchAddresses, fetchUserPoints]);

  const handleApplyDiscount = async () => {
    setDiscountError("");
    const success = await applyDiscount(discountInput);
    if (!success) {
      setDiscountError(t("invalidCode"));
    } else {
      setDiscountInput("");
    }
  };

  const handleApplyPoints = () => {
    setPointsError("");
    const points = parseInt(pointsInput) || 0;
    if (points <= 0) {
      setPointsError(t("enterPoints"));
      return;
    }
    if (points > userPoints) {
      setPointsError(t("maxPoints", { points: userPoints.toLocaleString() }));
      return;
    }
    const success = applyPoints(points);
    if (success) {
      setPointsInput("");
    }
  };

  const handleAddAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressDetail) return;
    const newAddress = await addAddress(addressForm);
    if (newAddress) {
      setShowAddressForm(false);
      setAddressForm({ fullName: "", phone: "", province: "", district: "", ward: "", addressDetail: "", isDefault: false });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={closeCart} />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t("title")}</h2>
              <p className="text-sm text-white/80">{items.length} {t("items")}</p>
            </div>
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">{t("empty")}</p>
              <p className="text-sm text-center">{t("emptyDesc")}</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-colors">
                  <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{item.name}</h3>
                    {item.brand && <p className="text-xs text-emerald-600 font-medium mb-2">{item.brand}</p>}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600">
                        {formatPriceSimple(item.salePrice || item.price, locale)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/50">
            {/* Discount Code */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                {t("discountCode")}
              </label>
              {discountCode ? (
                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">{discountCode}</span>
                    <span className="text-emerald-600 text-sm">(-{discount}%)</span>
                  </div>
                  <button onClick={removeDiscount} className="text-emerald-600 hover:text-emerald-800 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder={t("enterDiscountCode")}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  >
                    {t("applyCode")}
                  </button>
                </div>
              )}
              {discountError && <p className="text-red-500 text-xs mt-2">{discountError}</p>}
            </div>

            {/* Points */}
            {isSignedIn && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  {t("points")}
                  <span className="text-xs font-normal text-gray-400 ml-auto">
                    {t("pointsAvailable", { points: userPoints.toLocaleString() })}
                  </span>
                </label>
                {pointsUsed > 0 ? (
                  <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-700 font-semibold">{t("pointsUsed", { points: pointsUsed.toLocaleString() })}</span>
                      <span className="text-amber-600 text-sm">(-{pointsUsed.toLocaleString()}đ)</span>
                    </div>
                    <button onClick={removePoints} className="text-amber-600 hover:text-amber-800 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : userPoints > 0 ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      placeholder={`Max ${userPoints.toLocaleString()}`}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      max={userPoints}
                    />
                    <button
                      onClick={handleApplyPoints}
                      className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                    >
                      {t("usePoints")}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t("noPoints")}</p>
                )}
                {pointsError && <p className="text-red-500 text-xs mt-2">{pointsError}</p>}
              </div>
            )}

            {/* Address */}
            {isSignedIn && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {t("shippingAddress")}
                </label>
                {selectedAddress ? (
                  <div
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setShowAddressList(true)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{selectedAddress.fullName} - {selectedAddress.phone}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{selectedAddress.addressDetail}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ) : (
                  <button
                    onClick={() => addresses.length > 0 ? setShowAddressList(true) : setShowAddressForm(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 transition-all"
                  >
                    <PlusIcon className="w-5 h-5" />
                    {t("addAddress")}
                  </button>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("subtotal")}</span>
                <span className="font-medium">{formatPriceSimple(subtotal, locale)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>{t("discount")} ({discount}%)</span>
                  <span>-{formatPriceSimple(discountAmount, locale)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>{t("points")}</span>
                  <span>-{formatPriceSimple(pointsDiscount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                <span>{t("total")}</span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {formatPriceSimple(total, locale)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-5 py-4 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-100 font-semibold transition-colors"
              >
                {t("clearCart")}
              </button>
              <button
                onClick={() => setShowPayment(true)}
                disabled={!isSignedIn || !selectedAddress}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all"
              >
                {!isSignedIn ? t("loginToOrder") : !selectedAddress ? t("selectAddress") : t("checkout")}
              </button>
            </div>
          </div>
        )}


        {/* Address List Modal */}
        {showAddressList && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <h3 className="text-lg font-bold">Chọn địa chỉ</h3>
              <button onClick={() => setShowAddressList(false)} className="p-2 hover:bg-white/20 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    selectedAddress?.id === addr.id
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddressList(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{addr.fullName} - {addr.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {addr.addressDetail}
                        {addr.ward && `, ${addr.ward}`}
                        {addr.district && `, ${addr.district}`}
                        {addr.province && `, ${addr.province}`}
                      </p>
                      {addr.isDefault && (
                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          Mặc định
                        </span>
                      )}
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                    {!addr.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDefaultAddress(addr.id); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { setShowAddressList(false); setShowAddressForm(true); }}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                Thêm địa chỉ mới
              </button>
            </div>
          </div>
        )}

        {/* Add Address Form Modal */}
        {showAddressForm && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <h3 className="text-lg font-bold">Thêm địa chỉ mới</h3>
              <button onClick={() => setShowAddressForm(false)} className="p-2 hover:bg-white/20 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên *</label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0901234567"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh/TP</label>
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="TP.HCM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quận/Huyện</label>
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="Quận 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phường/Xã</label>
                  <input
                    type="text"
                    value={addressForm.ward}
                    onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="Phường 1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ chi tiết *</label>
                <textarea
                  value={addressForm.addressDetail}
                  onChange={(e) => setAddressForm({ ...addressForm, addressDetail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  placeholder="Số nhà, tên đường..."
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={handleAddAddress}
                disabled={!addressForm.fullName || !addressForm.phone || !addressForm.addressDetail}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all"
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        {showPayment && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <h3 className="text-lg font-bold">Thanh toán</h3>
              <button
                onClick={() => { setShowPayment(false); setSelectedPayment(null); setVietQRData(null); }}
                className="p-2 hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5">
                <h4 className="font-bold text-gray-900 mb-4">Thông tin đơn hàng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số lượng sản phẩm</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span className="font-medium">{formatPriceSimple(subtotal, locale)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá</span>
                      <span>-{formatPriceSimple(discountAmount, locale)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Điểm thưởng</span>
                      <span>-{formatPriceSimple(pointsDiscount, locale)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                    <span>Tổng thanh toán</span>
                    <span className="text-purple-600">{formatPriceSimple(total, locale)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedAddress && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <MapPin className="w-4 h-4" />
                    Giao đến
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedAddress.fullName} - {selectedAddress.phone}</p>
                  <p className="text-sm text-gray-500">{selectedAddress.addressDetail}</p>
                </div>
              )}

              {/* Payment Methods */}
              <h4 className="font-bold text-gray-900">Phương thức thanh toán</h4>
              <div className="space-y-3">
                <button
                  onClick={() => { setSelectedPayment("stripe"); setVietQRData(null); }}
                  className={`w-full p-5 border-2 rounded-2xl flex items-center gap-4 transition-all ${
                    selectedPayment === "stripe"
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">Stripe</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, JCB...</p>
                  </div>
                  {selectedPayment === "stripe" && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedPayment("vietqr");
                    const bankId = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || "970418";
                    const accountNo = process.env.NEXT_PUBLIC_VIETQR_BANK_ACCOUNT || "";
                    const accountName = process.env.NEXT_PUBLIC_VIETQR_NAME || "";
                    const amount = Math.round(total);
                    const description = `DH${Date.now()}`;
                    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName || "")}`;
                    setVietQRData({ qrUrl, bankInfo: `MB Bank - ${accountNo} - ${accountName}` });
                  }}
                  className={`w-full p-5 border-2 rounded-2xl flex items-center gap-4 transition-all ${
                    selectedPayment === "vietqr"
                      ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <QrCode className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">VietQR</p>
                    <p className="text-sm text-gray-500">Quét mã QR chuyển khoản</p>
                  </div>
                  {selectedPayment === "vietqr" && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* VietQR Display */}
              {selectedPayment === "vietqr" && vietQRData && (
                <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 text-center">
                  <p className="text-sm text-gray-600 mb-4">Quét mã QR bằng ứng dụng ngân hàng</p>
                  <img src={vietQRData.qrUrl} alt="VietQR" className="w-52 h-52 mx-auto rounded-xl border shadow-lg" />
                  <p className="text-sm font-medium text-gray-900 mt-4">{vietQRData.bankInfo}</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{formatPriceSimple(total, locale)}</p>
                </div>
              )}

              {selectedPayment === "stripe" && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800">Bạn sẽ được chuyển đến trang thanh toán Stripe an toàn.</p>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={async () => {
                  if (!selectedPayment) return;
                  setIsProcessing(true);
                  try {
                    if (selectedPayment === "stripe") {
                      const res = await fetch("/api/checkout/stripe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          items, total, discount, discountCode, pointsUsed,
                          addressId: selectedAddress?.id, locale,
                          currency: locale === "en" ? "usd" : "vnd",
                        }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    } else if (selectedPayment === "vietqr") {
                      const res = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          items, total, discount, discountCode, pointsUsed,
                          addressId: selectedAddress?.id,
                          paymentMethod: "vietqr", paymentStatus: "pending",
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert("Đơn hàng đã được tạo! Vui lòng hoàn tất thanh toán.");
                        clearCart();
                        closeCart();
                      }
                    }
                  } catch (error) {
                    console.error("Payment error:", error);
                    alert("Có lỗi xảy ra. Vui lòng thử lại.");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={!selectedPayment || isProcessing}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : selectedPayment === "stripe" ? (
                  "Thanh toán với Stripe"
                ) : selectedPayment === "vietqr" ? (
                  "Xác nhận đã thanh toán"
                ) : (
                  "Chọn phương thức thanh toán"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
