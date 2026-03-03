"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import { useProducts } from "@/context/ProductContext";
import type { Product } from "@/context/ProductContext";

type Role = "manager" | "storeKeeper";

interface FormState {
  name: string;
  category: string;
  price: string;
  stock: string;
  emoji: string;
}

const categoryOptions = [
  "IoT",
  "Microcontrollers",
  "Tools",
  "Ops Hardware",
  "Networking",
  "DevOps",
  "Sensors",
];

const emojiOptions = ["🧠", "📶", "🔌", "📟", "🏷️", "🌐", "📠", "🛰️", "💾", "🖨️"];

function statusForStock(stock: number) {
  if (stock >= 20) {
    return { label: "In Stock", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
  }
  if (stock >= 5) {
    return { label: "Low Stock", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
  }
  return { label: "Critical", color: "bg-red-100 text-red-700", dot: "bg-red-500" };
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    category: categoryOptions[0],
    price: "",
    stock: "",
    emoji: emojiOptions[0],
  });

  const [toast, setToast] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setHydrated(true));
  }, []);

  const role: Role = (user?.role as Role) ?? "storeKeeper";

  const categories = useMemo(
    () => Array.from(new Set(["All", ...products.map((p) => p.category)])),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * rowsPerPage;
  const visibleProducts = filteredProducts.slice(start, start + rowsPerPage);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: "", category: categoryOptions[0], price: "", stock: "", emoji: emojiOptions[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      emoji: product.emoji,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.stock) return;

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      setFormError("Price and stock must be valid non‑negative numbers.");
      return;
    }
    setFormError(null);

    if (editingId !== null) {
      updateProduct(editingId, { ...form, price, stock });
      setToast("Product updated successfully");
    } else {
      addProduct({ ...form, price, stock });
      setToast("Product added successfully");
    }

    setIsModalOpen(false);
    setEditingId(null);
    setTimeout(() => setToast(null), 2000);
  };

  const handleDelete = (id: number) => {
    deleteProduct(id);
    setToast("Product deleted");
    setTimeout(() => setToast(null), 2000);
  };

  const formValid =
    form.name.trim() &&
    form.category.trim() &&
    form.price.trim() &&
    form.stock.trim();

  return (
    <AppShell
      accent="products"
      title="Products"
      subtitle="Manage and monitor commodity inventory"
      actions={
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <span className="text-lg">＋</span>
          Add Product
        </button>
      }
    >
      <div className="bg-white/95 dark:bg-slate-900 shadow-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full md:w-48 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {!hydrated ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm text-gray-500">
                    <th className="px-4 py-3">Commodity</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                  {visibleProducts.map((product) => {
                    const status = statusForStock(product.stock);
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{product.emoji}</span>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{product.category}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900 dark:text-gray-100">$ {product.price}</td>
                        <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{product.stock}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-emerald-400 hover:text-emerald-700 transition bg-white dark:bg-slate-900 shadow-sm"
                            >
                              ✏️
                              <span>Edit</span>
                            </button>
                            {role === "manager" && (
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition bg-white dark:bg-slate-900 shadow-sm"
                              >
                                🗑️
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleProducts.length === 0 && hydrated && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-3xl">📭</span>
                          <p className="text-sm text-gray-600">No products found. Add your first product to get started.</p>
                          <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            ＋ Add Product
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Rows per page:
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
              >
                {[5, 7, 10, 15].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 w-9 rounded-lg border border-gray-200 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 w-9 rounded-lg border ${
                    currentPage === pageNumber
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-200 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  } transition`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 w-9 rounded-lg border border-gray-200 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-[fadeIn_220ms_ease] transform transition-transform duration-200 ease-out">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingId !== null ? "Edit Product" : "Add Product"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {editingId !== null ? "Update product details" : "Create a new product entry"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Raspberry Pi"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="65"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Emoji</label>
                <select
                  value={form.emoji}
                  onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {emojiOptions.map((emo) => (
                    <option key={emo} value={emo}>{emo}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formValid}
                  className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                    formValid
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-emerald-200 text-emerald-700 cursor-not-allowed"
                  }`}
                >
                  Save
                </button>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}
    </AppShell>
  );
}
