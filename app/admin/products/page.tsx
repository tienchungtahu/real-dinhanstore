"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Pencil, Trash2, Search, Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const formatPriceVN = (price: number): string => {
  return price.toLocaleString("vi-VN") + "đ"
}

const formatNumberInput = (value: string): string => {
  const num = value.replace(/\D/g, "")
  return num ? Number(num).toLocaleString("vi-VN") : ""
}

const parseFormattedNumber = (value: string): number => {
  return Number(value.replace(/\D/g, "")) || 0
}

interface Category {
  id: number
  name: string
  slug: string
  subcategories?: string[]
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number
  stock: number
  brand: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  category?: Category
}

interface ProductForm {
  name: string
  description: string
  price: number
  salePrice: number
  stock: number
  brand: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  categoryId: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100")
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleSave = async (formData: ProductForm, isEdit: boolean, productId?: number) => {
    try {
      const url = isEdit ? `/api/products/${productId}` : "/api/products"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchProducts()
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Thêm sản phẩm</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Sản phẩm</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Danh mục</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Giá</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Tồn kho</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Trạng thái</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Chưa có sản phẩm nào
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">{product.category?.name || "-"}</td>
                          <td className="py-3">
                            <p className="text-sm font-medium">{formatPriceVN(Number(product.price) || 0)}</p>
                            {product.salePrice && Number(product.salePrice) > 0 && (
                              <p className="text-xs text-destructive">Sale: {formatPriceVN(Number(product.salePrice))}</p>
                            )}
                          </td>
                          <td className="py-3 text-sm">{product.stock}</td>
                          <td className="py-3">
                            <div className="flex flex-col gap-1">
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? "Đang bán" : "Ngừng bán"}
                              </Badge>
                              {product.isFeatured && <Badge variant="outline">Nổi bật</Badge>}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {filteredProducts.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">Chưa có sản phẩm nào</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category?.name || "-"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">{formatPriceVN(Number(product.price) || 0)}</span>
                            <span className="text-xs text-muted-foreground">SL: {product.stock}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                          {product.isActive ? "Đang bán" : "Ngừng bán"}
                        </Badge>
                        {product.isFeatured && <Badge variant="outline" className="text-xs">Nổi bật</Badge>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}


function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSave: (data: ProductForm, isEdit: boolean, productId?: number) => void
}) {
  const [form, setForm] = useState<ProductForm>({
    name: product?.name || "",
    description: product?.description || "",
    price: Number(product?.price) || 0,
    salePrice: Number(product?.salePrice) || 0,
    stock: product?.stock || 0,
    brand: product?.brand || "",
    images: product?.images || [],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    categoryId: product?.category?.id || categories[0]?.id || 0,
  })

  const [priceDisplay, setPriceDisplay] = useState(form.price ? form.price.toLocaleString("vi-VN") : "")
  const [salePriceDisplay, setSalePriceDisplay] = useState(form.salePrice ? form.salePrice.toLocaleString("vi-VN") : "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentCategory = categories.find((c) => c.id === form.categoryId)
  const availableSubcategories = currentCategory?.subcategories || []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.ok) {
          const data = await res.json()
          return data.url
        }
        return null
      })

      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter(Boolean) as string[]
      setForm({ ...form, images: [...form.images, ...validUrls] })
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form, !!product, product?.id)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Tên sản phẩm *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Danh mục *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value), brand: "" })}
                  className="w-full h-9 px-3 border border-input rounded-md bg-background text-sm"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Loại sản phẩm</label>
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full h-9 px-3 border border-input rounded-md bg-background text-sm"
                  disabled={availableSubcategories.length === 0}
                >
                  <option value="">Chọn loại sản phẩm</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả sản phẩm</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
                placeholder="Mô tả chi tiết về sản phẩm..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Giá gốc (VNĐ) *</label>
                <Input
                  value={priceDisplay}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value)
                    setPriceDisplay(formatted)
                    setForm({ ...form, price: parseFormattedNumber(e.target.value) })
                  }}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Giá sale (VNĐ)</label>
                <Input
                  value={salePriceDisplay}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value)
                    setSalePriceDisplay(formatted)
                    setForm({ ...form, salePrice: parseFormattedNumber(e.target.value) })
                  }}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tồn kho *</label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  required
                  min={0}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Hình ảnh sản phẩm</label>
              <div className="flex flex-wrap gap-3">
                {form.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Product ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {uploading ? (
                    <span className="text-xs">Đang tải...</span>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span className="text-xs mt-1">Thêm ảnh</span>
                    </>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Đang bán</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Sản phẩm nổi bật</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Đang lưu..." : product ? "Cập nhật" : "Thêm sản phẩm"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
