import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  saving,
  onDelete,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string | undefined;
  formId: string;
  saving?: boolean;
  onDelete?: (() => void) | undefined;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-deep/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-[28px] bg-background shadow-float outline-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88dvh] md:w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95"
          aria-describedby={undefined}
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-input md:hidden" />
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-3 pt-3 md:pt-5">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-display text-lg font-bold">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="secondary" size="icon" aria-label="Fechar">
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
          <div className="flex items-center gap-2 border-t border-border bg-card px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            {onDelete ? (
              <Button
                type="button"
                variant="danger"
                size="icon"
                aria-label="Excluir"
                onClick={onDelete}
              >
                <Trash2 />
              </Button>
            ) : null}
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="secondary" className="flex-1 md:flex-none">
                Cancelar
              </Button>
            </DialogPrimitive.Close>
            <Button
              type="submit"
              form={formId}
              className="flex-[2] md:ml-auto md:flex-none md:px-8"
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin" /> : null}
              Salvar
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
