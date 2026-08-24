"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useCanManageSite from "@/hooks/useCanManageSite";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import EditButton from "@/components/Common/EditButton";
import {
  patchBrojObrtnice,
  patchIban,
  patchOib,
} from "@/services/siteSettingsClientService";
import { useToast } from "@/components/Common/ToastProvider";

export default function FooterSettingsEditor({ settingsId, oib, brojObrtnice, iban, onSettingsChanged }) {
  const router = useRouter();
  const { canManage } = useCanManageSite();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [o, setO] = useState("");
  const [b, setB] = useState("");
  const [i, setI] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    setO(oib || "");
    setB(brojObrtnice || "");
    setI(iban || "");
    setError("");
  }, [open, oib, brojObrtnice, iban]);

  if (!canManage) return null;

  const onClose = () => {
    if (submitting) return;
    setOpen(false);
  };

  const onSave = async () => {
    setError("");
    setSubmitting(true);
    try {
      if ((o ?? "") !== (oib ?? "")) {
        const resp = await patchOib(o ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if ((b ?? "") !== (brojObrtnice ?? "")) {
        const resp = await patchBrojObrtnice(b ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if ((i ?? "") !== (iban ?? "")) {
        const resp = await patchIban(i ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      setOpen(false);
      showToast({ type: "success", title: "Spremljeno", message: "Footer je ažuriran." });
      await onSettingsChanged?.();
      router.refresh();
    } catch (err) {
      const msg = err?.message || "Greška pri spremanju postavki.";
      setError(msg);
      showToast({ type: "error", title: "Greška", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <EditButton onClick={() => setOpen(true)} />

      {open ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(ev) => {
            if (submitting) return;
            if (ev.target === ev.currentTarget) onClose();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>Uredi Podatke obrta</h3>
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Zatvori"
                disabled={submitting}
              >
                ×
              </button>
            </div>

            {error ? <div className="modal-error">{error}</div> : null}

            <div className="modal-body">
              <label className="modal-label">
                OIB
                <input
                  className="modal-input"
                  value={o}
                  onChange={(ev) => setO(ev.target.value)}
                />
              </label>

              <label className="modal-label">
                Broj obrtnice
                <input
                  className="modal-input"
                  value={b}
                  onChange={(ev) => setB(ev.target.value)}
                />
              </label>

              <label className="modal-label">
                IBAN
                <input
                  className="modal-input"
                  value={i}
                  onChange={(ev) => setI(ev.target.value)}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Odustani
              </button>
              <button
                type="button"
                className="modal-primary"
                onClick={onSave}
                disabled={submitting}
              >
                {submitting ? "Spremanje..." : "Spremi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
