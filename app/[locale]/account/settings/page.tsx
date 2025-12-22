"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Bell, Globe, Shield, Save, MapPin, Plus, Pencil, Trash2, Star, X, Loader2 } from "lucide-react";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const { isLoaded } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    promotions: true,
  });
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressDetail: "",
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province || "",
      district: address.district || "",
      ward: address.ward || "",
      addressDetail: address.addressDetail,
      isDefault: address.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressDetail) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSavingAddress(true);
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      if (res.ok) {
        await fetchAddresses();
        setShowAddressModal(false);
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: "PUT" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Addresses */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
              <p className="text-sm text-gray-500">Quản lý địa chỉ nhận hàng</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm địa chỉ
          </button>
        </div>

        {loadingAddresses ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có địa chỉ nào</p>
            <p className="text-sm">Thêm địa chỉ để đặt hàng nhanh hơn</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 ${
                  address.isDefault ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{address.fullName}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">{address.phone}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {address.addressDetail}
                      {address.ward && `, ${address.ward}`}
                      {address.district && `, ${address.district}`}
                      {address.province && `, ${address.province}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Đặt làm mặc định"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(address)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
            <p className="text-sm text-gray-500">Quản lý cài đặt thông báo</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Thông báo qua Email</p>
              <p className="text-sm text-gray-500">Nhận cập nhật đơn hàng qua email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Thông báo SMS</p>
              <p className="text-sm text-gray-500">Nhận tin nhắn về đơn hàng</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Khuyến mãi</p>
              <p className="text-sm text-gray-500">Nhận thông tin ưu đãi và khuyến mãi</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ngôn ngữ</h2>
            <p className="text-sm text-gray-500">Chọn ngôn ngữ hiển thị</p>
          </div>
        </div>

        <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bảo mật</h2>
            <p className="text-sm text-gray-500">Quản lý bảo mật tài khoản</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Đổi mật khẩu</p>
            <p className="text-sm text-gray-500">Cập nhật mật khẩu đăng nhập</p>
          </button>
          <button className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Xác thực 2 bước</p>
            <p className="text-sm text-gray-500">Bảo vệ tài khoản với xác thực 2 bước</p>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        <Save className="w-5 h-5" />
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập họ tên người nhận"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập tỉnh/thành phố"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <input
                  type="text"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập quận/huyện"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                <input
                  type="text"
                  value={addressForm.ward}
                  onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập phường/xã"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addressForm.addressDetail}
                  onChange={(e) => setAddressForm({ ...addressForm, addressDetail: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={2}
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
