"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { resendApplicationAction } from "@/lib/actions";
import { resendApplicationSchema, type ResendApplicationData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ResendApplicationForm({
  token,
  fullName,
  email,
  phone,
}: {
  token: string;
  fullName: string;
  email: string;
  phone: string;
}) {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendApplicationData>({
    resolver: zodResolver(resendApplicationSchema),
    defaultValues: { fullName, email, phone },
  });

  async function onSubmit(data: ResendApplicationData) {
    setServerError(null);
    const result = await resendApplicationAction(token, data);
    if (result.status === "error") setServerError(result.message);
    else setSuccess(result.message);
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre completo" {...register("fullName")} error={errors.fullName?.message} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Correo" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
      </div>

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="rounded-full px-5">
        {isSubmitting ? "Reenviando…" : "Reenviar para revisión"} <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
