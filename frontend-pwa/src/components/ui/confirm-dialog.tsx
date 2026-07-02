import * as Dialog from "@radix-ui/react-dialog";
import type { LucideIcon } from "lucide-react";

import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  icon?: LucideIcon;
  confirmVariant?: "primary" | "danger";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  icon: Icon,
  confirmVariant = "danger",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    void Promise.resolve(onConfirm());
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <Dialog.Content
            className={cn(
              "w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-xl outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
            )}
            onPointerDownOutside={(event) => loading && event.preventDefault()}
            onEscapeKeyDown={(event) => loading && event.preventDefault()}
          >
            {Icon ? (
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    confirmVariant === "danger"
                      ? theme.feedback.error.bg
                      : theme.feedback.info.bg,
                }}
              >
                <Icon
                  className="h-7 w-7"
                  style={{
                    color:
                      confirmVariant === "danger"
                        ? theme.feedback.error.text
                        : theme.ctaPrimary,
                  }}
                />
              </div>
            ) : null}

            <Dialog.Title className="text-center font-poppins-bold text-xl text-slate-900">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-2 text-center font-poppins text-sm leading-6 text-slate-500">
                {description}
              </Dialog.Description>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <PrimaryPillButton
                fullWidth
                label={confirmLabel}
                loading={loading}
                variant={confirmVariant}
                onPress={handleConfirm}
              />
              <PrimaryPillButton
                fullWidth
                disabled={loading}
                label={cancelLabel}
                variant="outline"
                onPress={() => onOpenChange(false)}
              />
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
