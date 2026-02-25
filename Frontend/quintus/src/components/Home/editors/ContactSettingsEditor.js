"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useCanManageSite from "@/hooks/useCanManageSite";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import EditButton from "@/components/Common/EditButton";
import {
  patchAddress,
  patchContactEmail,
  patchPhoneNumber,
} from "@/services/siteSettingsClientService";
import { useToast } from "@/components/Common/ToastProvider";

export default function ContactSettingsEditor({
  settingsId,
  address,
  phoneNumber,
  contactEmail,
}) {
  const router = useRouter();
  const { canManage } = useCanManageSite();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [a, setA] = useState("");
  const [p, setP] = useState("");
  const [e, setE] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    setA(address || "");
    setP(phoneNumber || "");
    setE(contactEmail || "");
    setError("");
  }, [open, address, phoneNumber, contactEmail]);

  if (!canManage) return null;

  const onClose = () => {
    if (submitting) return;
    setOpen(false);
  };

  const onSave = async () => {
    setError("");
    setSubmitting(true);
    try {
      if ((a ?? "") !== (address ?? "")) {
        const resp = await patchAddress(a ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if ((p ?? "") !== (phoneNumber ?? "")) {
        const resp = await patchPhoneNumber(p ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      if ((e ?? "") !== (contactEmail ?? "")) {
        const resp = await patchContactEmail(e ?? "");
        const ok = resp?.status === 200 || resp?.status === 204;
        if (!ok) throw new Error(resp?.data?.message || "Greška pri spremanju postavki.");
      }

      setOpen(false);
      showToast({ type: "success", title: "Spremljeno", message: "Kontakt je ažuriran." });
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
              <h3>Uredi Kontakt</h3>
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
                Adresa
                <input
                  className="modal-input"
                  value={a}
                  onChange={(ev) => setA(ev.target.value)}
                />
              </label>

              <label className="modal-label">
                Telefon
                <input
                  className="modal-input"
                  value={p}
                  onChange={(ev) => setP(ev.target.value)}
                />
              </label>

              <label className="modal-label">
                Email
                <input
                  className="modal-input"
                  value={e}
                  onChange={(ev) => setE(ev.target.value)}
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
