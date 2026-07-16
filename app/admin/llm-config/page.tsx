"use client";

import { useEffect, useRef, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, Search, Check, Plus } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  listLLMProviders,
  createLLMProvider,
  listLLMModels,
  updateLLMConfig,
  ApiError,
  type LLMProvider,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_ONLY_ROLES = ["admin"];

// พิมพ์ชื่อ model เองได้อิสระ หรือค้นหา/เลือกจากรายชื่อที่ fetch มาจริงในกล่อง dropdown ก็ได้
function ModelCombobox({
  value,
  onChange,
  models,
  loading,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  models: string[];
  loading: boolean;
  disabled: boolean;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? models.filter((m) => m.toLowerCase().includes(query.trim().toLowerCase()))
    : models;

  const exactMatch = models.some((m) => m.toLowerCase() === query.trim().toLowerCase());
  const showCustomOption = query.trim() !== "" && !exactMatch;

  function handleOpenChange(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next) {
      setQuery("");
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }

  function selectValue(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm shadow-black/5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
        >
          <span className={`truncate ${value ? "" : "text-muted-foreground/70"}`}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground/80 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-input bg-popover shadow-lg shadow-black/10 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden"
        >
          <div className="relative border-b border-slate-100 p-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/70" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model..."
              className="w-full rounded-md bg-slate-50 pl-7 pr-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {loading ? (
              <p className="text-xs text-slate-400 px-3 py-3 text-center">กำลังโหลด model...</p>
            ) : (
              <>
                {filtered.map((m) => {
                  const isSelected = m === value;
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => selectValue(m)}
                      className={`w-full flex items-center justify-between gap-2 text-left text-sm px-3 py-2 rounded-md ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">{m}</span>
                      {isSelected && <Check className="size-4 shrink-0" />}
                    </button>
                  );
                })}
                {filtered.length === 0 && !showCustomOption && (
                  <p className="text-xs text-slate-400 px-3 py-3 text-center">
                    {models.length === 0
                      ? "ไม่พบ model จาก provider นี้"
                      : "ไม่พบ model ที่ตรงกับที่พิมพ์"}
                  </p>
                )}
                {showCustomOption && (
                  <button
                    type="button"
                    onClick={() => selectValue(query.trim())}
                    className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-md text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1 pt-2.5"
                  >
                    <Plus className="size-3.5 shrink-0" />
                    <span className="truncate">
                      ใช้ &ldquo;{query.trim()}&rdquo; เป็นค่าที่กำหนดเอง
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export default function LLMConfigPage() {
  const { user, token, loading } = useRequireAuth("/login/admin", ADMIN_ONLY_ROLES);

  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);

  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  function loadProviders() {
    if (!token) return;
    setProvidersLoading(true);
    listLLMProviders(token)
      .then((data) => {
        const list = data.providers ?? [];
        setProviders(list);
        const active = list.find((p) => p.is_active);
        setSelectedProviderId(active ? String(active.id) : "");
        setSelectedModel(active ? active.active_model : "");
      })
      .catch((err) =>
        setProvidersError(err instanceof ApiError ? err.message : "โหลดรายชื่อ provider ไม่สำเร็จ")
      )
      .finally(() => setProvidersLoading(false));
  }

  useEffect(() => {
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedProviderId) {
      setModels([]);
      return;
    }
    setModelsLoading(true);
    setModelsError(null);
    listLLMModels(token, Number(selectedProviderId))
      .then((data) => setModels(data.models ?? []))
      .catch((err) =>
        setModelsError(err instanceof ApiError ? err.message : "โหลดรายชื่อ model ไม่สำเร็จ")
      )
      .finally(() => setModelsLoading(false));
  }, [token, selectedProviderId]);

  async function handleSync() {
    if (!token || !selectedProviderId || !selectedModel) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateLLMConfig(token, {
        provider_id: Number(selectedProviderId),
        active_model: selectedModel,
      });
      setSaveSuccess(true);
      loadProviders();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "ซิงค์การตั้งค่าไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddProvider(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setAddSubmitting(true);
    setAddError(null);
    try {
      await createLLMProvider(token, {
        name: newName,
        base_url: newBaseUrl,
        api_key: newApiKey,
      });
      setNewName("");
      setNewBaseUrl("");
      setNewApiKey("");
      setAddOpen(false);
      loadProviders();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "เพิ่ม provider ไม่สำเร็จ");
    } finally {
      setAddSubmitting(false);
    }
  }

  if (loading || !user || !ADMIN_ONLY_ROLES.includes(user.role)) return null;

  const selectedProvider = providers.find((p) => String(p.id) === selectedProviderId);

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">ตั้งค่า LLM Model</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              เลือก provider และ model ที่ใช้สำหรับ Voice AI / แชทบอท
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className="p-8 space-y-6">
          {/* การ์ดเลือก provider / model ที่ใช้งานอยู่ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-server text-slate-400 text-sm" />
                Provider ที่ใช้งานอยู่
              </h3>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <button className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 self-start sm:self-auto">
                    <i className="fa-solid fa-plus" />
                    เพิ่ม Provider
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่ม LLM Provider ใหม่</DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลจาก LLM provider ที่ต้องการเชื่อมต่อ
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProvider} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-name">ชื่อ Provider</Label>
                      <Input
                        id="provider-name"
                        placeholder="เช่น ThaiLLM2"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-base-url">Base URL</Label>
                      <Input
                        id="provider-base-url"
                        placeholder="http://thaillm.or.th/api/v1"
                        required
                        value={newBaseUrl}
                        onChange={(e) => setNewBaseUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-api-key">API Key</Label>
                      <Input
                        id="provider-api-key"
                        type="password"
                        placeholder="API key ของ provider นี้"
                        required
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                      />
                    </div>
                    {addError && (
                      <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                        {addError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={addSubmitting}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                    >
                      {addSubmitting ? "กำลังเพิ่ม..." : "เพิ่ม Provider"}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {providersLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">กำลังโหลด...</p>
            ) : providersError ? (
              <p className="text-sm text-rose-500 py-6 text-center">{providersError}</p>
            ) : providers.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                ยังไม่มี provider — กด &ldquo;เพิ่ม Provider&rdquo; ด้านบนเพื่อเริ่มตั้งค่า
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Provider</Label>
                  <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} {p.is_active && "· กำลังใช้งาน"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Model</Label>
                  <ModelCombobox
                    value={selectedModel}
                    onChange={setSelectedModel}
                    models={models}
                    loading={modelsLoading}
                    disabled={!selectedProviderId}
                    placeholder={!selectedProviderId ? "เลือก provider ก่อน" : "พิมพ์หรือเลือกชื่อ model"}
                  />
                  {modelsError && (
                    <p className="text-xs font-semibold text-rose-500">
                      {modelsError} — พิมพ์ชื่อ model เองได้เลย
                    </p>
                  )}
                </div>
              </div>
            )}

            {providers.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-slate-400 break-all">
                  {selectedProvider?.base_url && (
                    <span className="font-mono">{selectedProvider.base_url}</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <i className="fa-solid fa-circle-check" /> ซิงค์สำเร็จ
                    </span>
                  )}
                  {saveError && (
                    <span className="text-xs font-bold text-rose-500">{saveError}</span>
                  )}
                  <button
                    onClick={handleSync}
                    disabled={saving || !selectedProviderId || !selectedModel}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <i className={`fa-solid ${saving ? "fa-spinner fa-spin" : "fa-rotate"}`} />
                    {saving ? "กำลังซิงค์..." : "ซิงค์การตั้งค่า"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* รายชื่อ provider ทั้งหมด */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-slate-400 text-sm" />
              Provider ทั้งหมด
            </h3>

            {providersLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">กำลังโหลด...</p>
            ) : providers.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">ยังไม่มี provider</p>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">
                        {p.base_url}
                      </p>
                      {p.is_active && (
                        <p className="text-xs text-slate-500 mt-1">
                          Model: <span className="font-semibold">{p.active_model}</span>
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-lg whitespace-nowrap self-start sm:self-center ${
                        p.is_active
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.is_active ? "กำลังใช้งาน" : "ยังไม่ใช้งาน"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
