"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type FormState = "idle" | "sending" | "sent" | "error";

export default function PolaroidContactForm() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<FormState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const canSend = useMemo(() => {
    return name.trim().length > 0 && note.trim().length > 0 && file !== null;
  }, [file, name, note]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend || !file) {
      setStatus("error");
      setStatusMessage("Add your name, a note, and a photo first.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("note", note.trim());
    formData.append("image", file);

    setStatus("sending");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setStatus("error");
        setStatusMessage(data.error ?? "Something went wrong.");
        return;
      }

      setStatus("sent");
      setStatusMessage(data.message ?? "Sent. I'll see it in my inbox.");
      setName("");
      setNote("");
      setFile(null);
    } catch {
      setStatus("error");
      setStatusMessage("Could not send right now. Try again later.");
    }
  };

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.06),_transparent_34%),linear-gradient(to_bottom,rgba(247,244,239,0.98),rgba(236,231,223,0.98))] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_34%),linear-gradient(to_bottom,rgba(10,10,12,0.98),rgba(18,18,20,0.98))]"
      id="contact"
    >
      <form
        className="relative h-[min(90vh,1080px)] w-full max-w-[1200px]"
        onSubmit={handleSubmit}
      >
        <div className="absolute inset-0 rounded-[42px] border border-black/10 bg-white/35 shadow-[0_30px_100px_rgba(0,0,0,0.14)] backdrop-blur-sm dark:border-white/10 dark:bg-black/20" />

        <div className="absolute inset-4 rounded-[36px] bg-[#0a0a0c] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:inset-6 md:p-6">
          <div className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-black">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Contact photo preview"
                fill
                unoptimized
                className="object-cover opacity-95"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06),_transparent_34%),linear-gradient(to_bottom,rgba(12,12,12,1),rgba(0,0,0,1))]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12),rgba(0,0,0,0.54))]" />

            <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center md:px-10">
              <h2 className="font-section-cursive text-[clamp(4rem,12vw,9rem)] leading-[0.9] tracking-[-0.05em] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
                Your Turn
              </h2>
            </div>

            <div className="absolute top-6 right-6 z-20">
              <label className="inline-flex cursor-pointer items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[10px] font-semibold tracking-[0.24em] text-white uppercase transition-colors hover:bg-white/12">
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null;
                    setFile(selectedFile);
                  }}
                />
              </label>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/72 p-4 backdrop-blur-xl md:p-6">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="space-y-2">
                  <span className="font-metadata-caps text-[10px] tracking-[0.22em] text-white/45 uppercase">
                    Name
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-full border border-white/10 bg-white/6 px-4 py-3 font-body-elegant text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
                  />
                </label>

                <label className="space-y-2">
                  <span className="font-metadata-caps text-[10px] tracking-[0.22em] text-white/45 uppercase">
                    Note
                  </span>
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="A short note"
                    className="w-full rounded-full border border-white/10 bg-white/6 px-4 py-3 font-body-elegant text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!canSend || status === "sending"}
                  className="rounded-full bg-white px-6 py-3 text-[10px] font-semibold tracking-[0.26em] text-black uppercase transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "sending" ? "Sending" : "Send"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/65">
                <p className="font-body-elegant">
                  {previewUrl ? "Photo ready to send." : "Choose an image to fill the frame."}
                </p>
                {statusMessage ? (
                  <p
                    className={`font-body-elegant ${
                      status === "sent"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {statusMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}