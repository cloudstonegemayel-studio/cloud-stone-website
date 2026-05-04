"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface ProjectFormData {
  title:       string;
  slug:        string;
  category:    string;
  year:        string;
  location:    string;
  area:        string;
  description: string;
  content:     string;
  published:   boolean;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  projectId?:  string;
  onDelete?:   () => void;
}

export function ProjectForm({ initialData, projectId, onDelete }: ProjectFormProps) {
  const router = useRouter();
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,   setError]   = useState("");

  const [data, setData] = useState<ProjectFormData>({
    title:       initialData?.title       ?? "",
    slug:        initialData?.slug        ?? "",
    category:    initialData?.category    ?? "",
    year:        initialData?.year        ?? new Date().getFullYear().toString(),
    location:    initialData?.location    ?? "",
    area:        initialData?.area        ?? "",
    description: initialData?.description ?? "",
    content:     initialData?.content     ?? "",
    published:   initialData?.published   ?? false,
  });

  function field(key: keyof ProjectFormData) {
    return {
      value: data[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        projectId ? `/api/admin/projects/${projectId}` : "/api/admin/projects",
        {
          method:  projectId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!projectId || !confirm("Delete this project?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <Input
            label="Title"
            placeholder="Studio Twenty Seven"
            {...field("title")}
            onChange={(e) => {
              setData((d) => ({
                ...d,
                title: e.target.value,
                slug: d.slug || autoSlug(e.target.value),
              }));
            }}
          />
        </div>
        <Input
          label="Slug"
          placeholder="studio-twenty-seven"
          {...field("slug")}
        />
        <Input label="Category" placeholder="Commercial – Showroom" {...field("category")} />
        <Input label="Year"     placeholder="2025"                   {...field("year")}     />
        <Input label="Location" placeholder="Tribeca, New York City"  {...field("location")} />
        <div className="col-span-2">
          <Input label="Area / Size" placeholder="2,800 sq ft"       {...field("area")}     />
        </div>
        <div className="col-span-2">
          <Textarea
            label="Short description"
            rows={2}
            placeholder="A secret library — a sanctuary of books, art, and quiet density..."
            {...field("description")}
          />
        </div>
        <div className="col-span-2">
          <Textarea
            label="Full content"
            rows={6}
            placeholder="Long-form project narrative..."
            {...field("content")}
          />
        </div>
      </div>

      {/* Published toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          role="switch"
          aria-checked={data.published}
          onClick={() => setData((d) => ({ ...d, published: !d.published }))}
          className={`relative w-10 h-5 rounded-full transition-colors duration-[250ms] ${
            data.published ? "bg-[#392D2B]" : "bg-[#392D2B]/20"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-[transform] duration-[250ms] ${
              data.published ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#392D2B]/60 font-sans">
          {data.published ? "Published" : "Draft"}
        </span>
      </label>

      {error && (
        <p className="text-[12px] text-red-500 font-sans">{error}</p>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-[#392D2B]/10">
        <Button type="submit" variant="primary" isLoading={saving}>
          {projectId ? "Save changes" : "Create project"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/projects")}
        >
          Cancel
        </Button>
        {projectId && (
          <Button
            type="button"
            variant="ghost"
            isLoading={deleting}
            onClick={handleDelete}
            className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
