"use client";

import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";

export type Role = "manager" | "storeKeeper";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  emoji: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (data: Omit<Product, "id">) => void;
  updateProduct: (id: number, data: Omit<Product, "id">) => void;
  deleteProduct: (id: number) => void;
  stats: {
    totalProducts: number;
    lowStock: number;
    criticalStock: number;
    totalUnits: number;
  };
  lowItems: Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  { id: 1, name: "Raspberry Pi 5", category: "IoT", stock: 26, price: 65, emoji: "🧠" },
  { id: 2, name: "ESP32 Dev Kit", category: "IoT", stock: 14, price: 12, emoji: "📶" },
  { id: 3, name: "Arduino Uno R4", category: "Microcontrollers", stock: 32, price: 28, emoji: "🔌" },
  { id: 4, name: "Fluke Multimeter", category: "Tools", stock: 7, price: 110, emoji: "📟" },
  { id: 5, name: "Label Printer", category: "Ops Hardware", stock: 4, price: 85, emoji: "🏷️" },
  { id: 6, name: "Network Switch", category: "Networking", stock: 19, price: 140, emoji: "🌐" },
  { id: 7, name: "Barcode Scanner", category: "Ops Hardware", stock: 22, price: 55, emoji: "📠" },
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return initialProducts;
    const stored = localStorage.getItem("sloozeProducts");
    return stored ? (JSON.parse(stored) as Product[]) : initialProducts;
  });

  const addProduct = (data: Omit<Product, "id">) => {
    setProducts((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      return [...prev, { id: nextId, ...data }];
    });
  };

  const updateProduct = (id: number, data: Omit<Product, "id">) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { id, ...data } : p)));
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // persist whenever products change (client only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sloozeProducts", JSON.stringify(products));
    }
  }, [products]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stock < 20).length;
    const criticalStock = products.filter((p) => p.stock < 5).length;
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    return { totalProducts, lowStock, criticalStock, totalUnits };
  }, [products]);

  const lowItems = useMemo(
    () => products.filter((p) => p.stock < 20).sort((a, b) => a.stock - b.stock),
    [products]
  );

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, stats, lowItems }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
}
