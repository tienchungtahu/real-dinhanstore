"use client";

import { useState } from "react";
import { Database, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function DatabasePage() {
  const [status, setStatus] = useState<{ status: string; message: string; database?: string; host?: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const checkStatus = async () => {
    setLoading("status");
    try {
      const res = await fetch("/api/db/status");
      const data = await res.json();
      setStatus(data);
      setMessage({ type: data.status === "connected" ? "success" : "error", text: data.message });
    } catch {
      setMessage({ type: "error", text: "Không thể kết nối" });
    } finally {
      setLoading(null);
    }
  };

  const initDatabase = async () => {
    setLoading("init");
    setMessage(null);
    try {
      const res = await fetch("/api/db/init", { method: "POST" });
      const data = await res.json();
      setMessage({ type: res.ok ? "success" : "error", text: data.message || data.error });
    } catch {
      setMessage({ type: "error", text: "Lỗi khi tạo database" });
    } finally {
      setLoading(null);
    }
  };

  const seedDatabase = async () => {
    setLoading("seed");
    setMessage(null);
    try {
      const res = await fetch("/api/db/seed", { method: "POST" });
      const data = await res.json();
      setMessage({
        type: res.ok ? "success" : "error",
        text: data.message || data.error || `Đã tạo ${data.categories} danh mục và ${data.products} sản phẩm`,
      });
    } catch {
      setMessage({ type: "error", text: "Lỗi khi seed data" });
    } finally {
      setLoading(null);
    }
  };

  const addPlaceholderImages = async () => {
    setLoading("images");
    setMessage(null);
    try {
      const res = await fetch("/api/products/add-placeholder-images", { method: "POST" });
      const data = await res.json();
      setMessage({
        type: res.ok ? "success" : "error",
        text: data.message || data.error,
      });
    } catch {
      setMessage({ type: "error", text: "Lỗi khi thêm ảnh" });
    } finally {
      setLoading(null);
    }
  };

  const resetDatabase = async () => {
    if (!confirm("Bạn có chắc muốn xóa tất cả sản phẩm và danh mục? Hành động này không thể hoàn tác!")) {
      return;
    }
    setLoading("reset");
    setMessage(null);
    try {
      const res = await fetch("/api/db/reset", { method: "POST" });
      const data = await res.json();
      setMessage({
        type: res.ok ? "success" : "error",
        text: data.message || data.error,
      });
    } catch {
      setMessage({ type: "error", text: "Lỗi khi reset database" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Database</h1>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Trạng thái kết nối
          </h2>
          <button
            onClick={checkStatus}
            disabled={loading === "status"}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading === "status" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Kiểm tra
          </button>
        </div>
        {status && (
          <div className={`p-4 rounded-lg ${status.status === "connected" ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex items-center gap-2">
              {status.status === "connected" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={status.status === "connected" ? "text-green-700" : "text-red-700"}>
                {status.message}
              </span>
            </div>
            {status.database && (
              <p className="text-sm text-gray-600 mt-2">
                Database: {status.database} @ {status.host}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Init Database */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">1. Tạo Database</h3>
          <p className="text-gray-600 text-sm mb-4">
            Tạo database MySQL nếu chưa tồn tại. Chỉ cần chạy 1 lần.
          </p>
          <button
            onClick={initDatabase}
            disabled={loading === "init"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === "init" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            Tạo Database
          </button>
        </div>

        {/* Seed Data */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">2. Seed Data mẫu</h3>
          <p className="text-gray-600 text-sm mb-4">
            Thêm danh mục và sản phẩm mẫu vào database. Chỉ cần chạy 1 lần.
          </p>
          <button
            onClick={seedDatabase}
            disabled={loading === "seed"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === "seed" ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Seed Data
          </button>
        </div>

        {/* Add Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">3. Thêm ảnh placeholder</h3>
          <p className="text-gray-600 text-sm mb-4">
            Thêm ảnh mẫu cho các sản phẩm chưa có ảnh.
          </p>
          <button
            onClick={addPlaceholderImages}
            disabled={loading === "images"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading === "images" ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Thêm ảnh
          </button>
        </div>

        {/* Reset Database */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2 text-red-600">⚠️ Reset Data</h3>
          <p className="text-gray-600 text-sm mb-4">
            Xóa tất cả sản phẩm và danh mục. Dùng khi muốn seed lại data mới.
          </p>
          <button
            onClick={resetDatabase}
            disabled={loading === "reset"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading === "reset" ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
            Reset Data
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
