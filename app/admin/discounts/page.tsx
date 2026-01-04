"use client";

import { useState } from "react";
import {
  Percent,
  Tag,
  Calendar,
  Search,
  Filter,
  X,
  Trash2,
  Plus,
  Clock,
  TrendingDown,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DiscountStoreProvider,
  useDiscountStore,
  ProductWithSales,
} from "@/app/hooks/useDiscountStore";

// Format date for Vietnam timezone display
function formatDateVN(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function DiscountsContent() {
  const {
    products,
    promotions,
    isLoading,
    sortBy,
    setSortBy,
    refreshAll,
    deletePromotion,
    applyPromotions,
  } = useDiscountStore();

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const applyBulkDiscount = async (discountType: string, discountValue: number) => {
    if (selectedProducts.length === 0) return;
    setApplying(true);
    try {
      const res = await fetch("/api/products/bulk-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProducts, discountType, discountValue }),
      });
      if (res.ok) {
        refreshAll();
        setSelectedProducts([]);
        setShowBulkModal(false);
      }
    } catch (error) {
      console.error("Error applying discount:", error);
    } finally {
      setApplying(false);
    }
  };

  const clearDiscounts = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm("Xóa giảm giá của các sản phẩm đã chọn?")) return;
    setApplying(true);
    try {
      const res = await fetch("/api/products/bulk-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProducts, clearDiscount: true }),
      });
      if (res.ok) {
        refreshAll();
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error("Error clearing discounts:", error);
    } finally {
      setApplying(false);
    }
  };

  const handleDeletePromotion = async (id: number) => {
    if (!confirm("Xóa chương trình khuyến mãi này?")) return;
    await deletePromotion(id);
  };

  const handleApplyPromotions = async () => {
    setApplying(true);
    const result = await applyPromotions();
    alert(result.message + ` (${result.updated} sản phẩm)`);
    setApplying(false);
  };

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Quản lý giảm giá</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleApplyPromotions} disabled={applying}>
            {applying ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
            Áp dụng KM
          </Button>
          <Button size="sm" onClick={() => setShowPromoModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Tạo KM
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Đang giảm giá</span>
            </div>
            <p className="text-xl font-bold">{products.filter((p) => p.salePrice).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Chưa bán</span>
            </div>
            <p className="text-xl font-bold">{products.filter((p) => p.totalSold === 0).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">KM đang chạy</span>
            </div>
            <p className="text-xl font-bold">{promotions.filter((p) => p.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">KM sắp tới</span>
            </div>
            <p className="text-xl font-bold">{promotions.filter((p) => p.status === "scheduled").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chương trình khuyến mãi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{promo.name}</span>
                      <Badge
                        variant={
                          promo.status === "active"
                            ? "default"
                            : promo.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {promo.status === "active"
                          ? "Đang chạy"
                          : promo.status === "scheduled"
                          ? "Sắp tới"
                          : "Đã kết thúc"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Giảm {promo.discountValue}
                      {promo.discountType === "percent" ? "%" : "đ"} •{" "}
                      {formatDateVN(promo.startDate)} - {formatDateVN(promo.endDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePromotion(promo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sản phẩm</CardTitle>
              {selectedProducts.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={clearDiscounts}>
                    <X className="w-4 h-4 mr-1" />
                    Xóa giảm giá
                  </Button>
                  <Button size="sm" onClick={() => setShowBulkModal(true)}>
                    <Percent className="w-4 h-4 mr-1" />
                    Giảm giá ({selectedProducts.length})
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "low" | "high" | "all")}
                  className="h-9 px-3 border border-input rounded-md bg-background text-sm"
                >
                  <option value="low">Ít bán nhất</option>
                  <option value="high">Bán chạy nhất</option>
                  <option value="all">Tất cả</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={selectAll}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Chọn tất cả ({filteredProducts.length})</span>
            </label>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left w-10"></th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground w-12">STT</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Sản phẩm</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Giá gốc</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Giá sale</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Đã bán</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{formatPrice(product.price)}</td>
                    <td className="py-3">
                      {product.salePrice ? (
                        <span className="text-sm text-red-600 font-medium">
                          {formatPrice(product.salePrice)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <Badge variant={product.totalSold === 0 ? "destructive" : "secondary"}>
                        {product.totalSold}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-2">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`p-2.5 border rounded-lg transition-colors ${
                  selectedProducts.includes(product.id) ? "border-primary bg-primary/5" : "bg-card"
                }`}
                onClick={() => toggleSelectProduct(product.id)}
              >
                <div className="flex gap-2.5">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                  </div>
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs leading-tight line-clamp-2">{product.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {product.salePrice ? (
                        <>
                          <span className="text-[11px] text-muted-foreground line-through">{formatPrice(product.price)}</span>
                          <span className="text-xs font-semibold text-red-600">{formatPrice(product.salePrice)}</span>
                        </>
                      ) : (
                        <span className="text-xs font-medium">{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge 
                        variant={product.totalSold === 0 ? "destructive" : "secondary"} 
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        Bán: {product.totalSold}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Kho: {product.stock}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Discount Modal */}
      {showBulkModal && (
        <BulkDiscountModal
          count={selectedProducts.length}
          onClose={() => setShowBulkModal(false)}
          onApply={applyBulkDiscount}
          applying={applying}
        />
      )}

      {/* Create Promotion Modal */}
      {showPromoModal && (
        <PromotionModal
          onClose={() => setShowPromoModal(false)}
          onSave={() => {
            refreshAll();
            setShowPromoModal(false);
          }}
        />
      )}
    </div>
  );
}


// Bulk Discount Modal Component
function BulkDiscountModal({
  count,
  onClose,
  onApply,
  applying,
}: {
  count: number;
  onClose: () => void;
  onApply: (type: string, value: number) => void;
  applying: boolean;
}) {
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");

  const handleApply = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      alert("Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }
    if (discountType === "percent" && value > 100) {
      alert("Phần trăm giảm giá không được vượt quá 100%");
      return;
    }
    onApply(discountType, value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Giảm giá hàng loạt</CardTitle>
          <CardDescription>Áp dụng cho {count} sản phẩm đã chọn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Loại giảm giá</label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={discountType === "percent" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("percent")}
              >
                <Percent className="w-4 h-4 mr-1" />
                Phần trăm
              </Button>
              <Button
                variant={discountType === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("fixed")}
              >
                <Tag className="w-4 h-4 mr-1" />
                Số tiền
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Giá trị giảm {discountType === "percent" ? "(%)" : "(VNĐ)"}
            </label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percent" ? "VD: 20" : "VD: 50000"}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button className="flex-1" onClick={handleApply} disabled={applying}>
              {applying ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Áp dụng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Promotion Modal Component - uses context for products
function PromotionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const { products } = useDiscountStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    startDate: "",
    endDate: "",
    applyTo: "all" as "all" | "selected",
    selectedProducts: [] as number[],
  });

  // Preset events
  const presets = [
    { name: "Giáng sinh 2025", start: "2025-12-24T00:00", end: "2025-12-26T23:59" },
    { name: "Tết Nguyên Đán 2026", start: "2026-01-28T00:00", end: "2026-02-05T23:59" },
    { name: "Valentine 2026", start: "2026-02-14T00:00", end: "2026-02-14T23:59" },
    { name: "Quốc tế Phụ nữ", start: "2026-03-08T00:00", end: "2026-03-08T23:59" },
    { name: "Black Friday 2025", start: "2025-11-28T00:00", end: "2025-11-30T23:59" },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setForm({
      ...form,
      name: `Khuyến mãi ${preset.name}`,
      startDate: preset.start,
      endDate: preset.end,
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.discountValue || !form.startDate || !form.endDate) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          productIds: form.applyTo === "selected" ? form.selectedProducts : null,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        alert("Lỗi khi tạo khuyến mãi");
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg my-8">
        <CardHeader>
          <CardTitle>Tạo chương trình khuyến mãi</CardTitle>
          <CardDescription>Đặt lịch giảm giá cho ngày đặc biệt (UTC+7)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div>
            <label className="text-sm font-medium">Ngày đặc biệt</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tên chương trình *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Khuyến mãi Giáng sinh"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn về chương trình"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Loại giảm giá</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed" })}
                className="w-full h-9 px-3 border border-input rounded-md bg-background text-sm mt-1"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Giá trị *</label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === "percent" ? "20" : "50000"}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bắt đầu *</label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Kết thúc *</label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Áp dụng cho</label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={form.applyTo === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setForm({ ...form, applyTo: "all" })}
              >
                Tất cả sản phẩm
              </Button>
              <Button
                variant={form.applyTo === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setForm({ ...form, applyTo: "selected" })}
              >
                Chọn sản phẩm
              </Button>
            </div>
          </div>

          {form.applyTo === "selected" && (
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Đang tải sản phẩm...</p>
              ) : (
                products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.selectedProducts.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, selectedProducts: [...form.selectedProducts, p.id] });
                        } else {
                          setForm({ ...form, selectedProducts: form.selectedProducts.filter((id) => id !== p.id) });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm truncate flex-1">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.price.toLocaleString()}đ</span>
                  </label>
                ))
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Tạo khuyến mãi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with Provider wrapper
export default function DiscountsPage() {
  return (
    <DiscountStoreProvider>
      <DiscountsContent />
    </DiscountStoreProvider>
  );
}
