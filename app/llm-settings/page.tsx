"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";

type Provider = {
  id: number;
  name: string;
  base_url: string;
  is_active: boolean;
  active_model: string | null;
};

export default function AdminLLMConfigPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelOptions, setModelOptions] = useState<string[]>([]);

  const [isOpenProviderDropdown, setIsOpenProviderDropdown] = useState(false);
  const [isOpenModelDropdown, setIsOpenModelDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) ?? null;

  // 🔌 โหลดรายชื่อ providers จาก API ตอนเปิดหน้า
  const loadProviders = useCallback(async () => {
    setIsLoadingProviders(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/llm/providers");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "โหลด providers ไม่สำเร็จ");

      const list: Provider[] = json.data.providers;
      setProviders(list);

      // เลือก provider ที่ active อยู่เป็นค่าเริ่มต้น ถ้าไม่มีเลือกตัวแรก
      const active = list.find((p) => p.is_active) ?? list[0];
      if (active) {
        setSelectedProviderId(active.id);
        setSelectedModel(active.active_model ?? "");
      }
    } catch (err) {
      setErrorMessage("ไม่สามารถโหลดข้อมูล providers ได้ กรุณาลองใหม่");
      console.error(err);
    } finally {
      setIsLoadingProviders(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // ปิด Dropdown เมื่อคลิกข้างนอกกล่อง
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        providerDropdownRef.current &&
        !providerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenProviderDropdown(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenModelDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // เมื่อเปลี่ยน provider ในลิสต์ ให้ auto-fill model เดิมของ provider นั้น
  const handleSelectProvider = (provider: Provider) => {
    setSelectedProviderId(provider.id);
    setSelectedModel(provider.active_model ?? "");
    setIsOpenProviderDropdown(false);
    setModelOptions([]); // เคลียร์ลิสต์เก่า ให้กด fetch ใหม่ตาม provider ที่เพิ่งเลือก
  };

  // 🔍 กดปุ่ม "Fetch model อัตโนมัติ" → ยิงไปที่ /api/v1/llm/models
  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/llm/models");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "ดึงรายชื่อโมเดลไม่สำเร็จ");

      const names: string[] = json.data.models.map((m: { name: string }) => m.name);
      setModelOptions(names);
      setIsOpenModelDropdown(true);
    } catch (err) {
      setErrorMessage("ไม่สามารถดึงรายชื่อโมเดลได้ กรุณาลองใหม่");
      console.error(err);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const filteredModels = modelOptions.filter((model) =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 💾 กดปุ่ม "อัปเดตโมเดลระบบ" → ยิง PUT ไปที่ /api/v1/llm/config
  const handleSaveConfig = async () => {
    if (!selectedProviderId) return;
    setIsSaving(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/llm/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: selectedProviderId,
          active_model: selectedModel,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "อัปเดตไม่สำเร็จ");

      alert(`🎉 อัปเดตโมเดลเป็น: ${selectedModel} เรียบร้อยแล้วค่ะ!`);
      loadProviders(); // โหลดใหม่ให้ข้อมูลตรงกับ backend ล่าสุด
    } catch (err) {
      setErrorMessage("บันทึกการตั้งค่าไม่สำเร็จ กรุณาลองใหม่");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto p-4 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl font-bold text-slate-900">ตั้งค่าโมเดลภาษา (LLM Configuration)</h1>
          <p className="text-xs text-slate-400 mt-0.5">เลือกปรับเปลี่ยน ค้นหา หรือพิมพ์ระบุโมเดลสมองกลสำหรับระบบ Voice Bot</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 max-w-2xl space-y-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-slate-500" /> ตัวเลือกโมดูลภาษาปัจจุบัน
          </h3>

          {errorMessage && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {/* ค่ายผู้ให้บริการ — ดึงจาก GET /api/v1/llm/providers */}
            <div className="space-y-1.5 relative" ref={providerDropdownRef}>
              <label className="block text-xs font-bold text-slate-500">ค่ายผู้ให้บริการ (Provider)</label>
              <button
                type="button"
                onClick={() => setIsOpenProviderDropdown(!isOpenProviderDropdown)}
                disabled={isLoadingProviders}
                className="w-full bg-white border border-slate-200 text-xs font-medium rounded-xl p-2.5 text-left outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 shadow-sm flex items-center justify-between disabled:opacity-50"
              >
                <span>{isLoadingProviders ? "กำลังโหลด..." : selectedProvider?.name ?? "เลือก provider"}</span>
                <i className={`fa-solid ${isOpenProviderDropdown ? "fa-chevron-up" : "fa-chevron-down"} text-slate-400 text-[10px]`} />
              </button>

              {isOpenProviderDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto p-2 space-y-0.5">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProvider(p)}
                      className={`w-full text-left text-[11px] px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                        selectedProviderId === p.id
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{p.name}</span>
                      {selectedProviderId === p.id && <i className="fa-solid fa-check text-[9px]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* เวอร์ชันโมเดล — พิมพ์เองได้ หรือกด Fetch จาก GET /api/v1/llm/models */}
            <div className="space-y-1.5 relative" ref={modelDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500">เวอร์ชันโมเดล (Model)</label>
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={isFetchingModels}
                  className="text-[10px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <i className={`fa-solid fa-rotate ${isFetchingModels ? "animate-spin" : ""}`} />
                  {isFetchingModels ? "กำลังดึง..." : "Fetch model อัตโนมัติ"}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)} // พิมพ์ระบุเองได้ตรง ๆ
                  onClick={() => modelOptions.length > 0 && setIsOpenModelDropdown(true)}
                  placeholder="พิมพ์ระบุเอง หรือกด Fetch model อัตโนมัติ..."
                  className="w-full bg-white border border-slate-200 text-xs font-medium rounded-xl p-2.5 pr-10 outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 shadow-sm"
                />
                {modelOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsOpenModelDropdown(!isOpenModelDropdown)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <i className={`fa-solid ${isOpenModelDropdown ? "fa-chevron-up" : "fa-chevron-down"}`} />
                  </button>
                )}
              </div>

              {isOpenModelDropdown && modelOptions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto p-2 space-y-2">
                  <div className="relative bg-slate-50 rounded-lg border border-slate-200/80 px-2.5 py-1.5 flex items-center gap-2">
                    <i className="fa-solid fa-magnifying-glass text-slate-400 text-[10px]" />
                    <input
                      type="text"
                      placeholder="Search model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent text-[11px] outline-none w-full text-slate-700"
                    />
                  </div>

                  <div className="space-y-0.5">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model);
                            setIsOpenModelDropdown(false);
                            setSearchTerm("");
                          }}
                          className={`w-full text-left text-[11px] px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                            selectedModel === model
                              ? "bg-slate-900 text-white font-bold"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{model}</span>
                          {selectedModel === model && <i className="fa-solid fa-check text-[9px]" />}
                        </button>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 text-center py-2">
                        ไม่พบโมเดล (คุณสามารถพิมพ์ชื่อโมเดลเองได้ที่ช่องด้านบน)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving || !selectedProviderId}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? "กำลังบันทึก..." : "อัปเดตโมเดลระบบ"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}