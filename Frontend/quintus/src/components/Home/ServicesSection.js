"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ServiceCard from "@/components/Home/ServiceCard";
import ServiceCreateModal from "@/components/Home/ServiceCreateModal";
import ImageRemovalModal from "@/components/Home/ImageRemovalModal";
import useCanManageSite from "@/hooks/useCanManageSite";
import { useToast } from "@/components/Common/ToastProvider";
import { createService, deleteService, patchService } from "@/services/serviceService";
import { slugify } from "@/lib/slugify";

export default function ServicesSection({ services }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [localServices, setLocalServices] = useState(services);
  const { canManage } = useCanManageSite();
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingWithImageRemoval, setEditingWithImageRemoval] = useState(null);
  const [removingImageUrl, setRemovingImageUrl] = useState(null);
  const [rotationStep, setRotationStep] = useState(0);

  useEffect(() => {
    // Copy array to avoid accidental mutations and make debugging simpler.
    setLocalServices(Array.isArray(services) ? [...services] : services);
  }, [services]);

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setRotationStep((step) => step + 1);
    }, 4500);

    return () => window.clearInterval(rotationTimer);
  }, []);

  const servicesToRender = useMemo(
    () => (Array.isArray(localServices) ? localServices : []),
    [localServices]
  );

  const getServiceId = (service) => service?.Id ?? service?.id;

  const dedupedServicesToRender = useMemo(() => {
    // Defensive: if API/serialization accidentally duplicates entries, don’t render duplicates.
    const list = Array.isArray(servicesToRender) ? servicesToRender : [];
    const seen = new Set();
    const out = [];

    for (const s of list) {
      const id = getServiceId(s);
      const title = s?.Title ?? s?.title;
      const key = id ? `id:${id}` : title ? `title:${String(title).trim()}` : null;
      if (!key) {
        out.push(s);
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }

    return out.sort((a, b) => {
      const aId = getServiceId(a);
      const bId = getServiceId(b);

      if (aId == null && bId == null) return 0;
      if (aId == null) return 1;
      if (bId == null) return -1;

      const aNum = Number(aId);
      const bNum = Number(bId);
      const bothNumeric = Number.isFinite(aNum) && Number.isFinite(bNum);

      if (bothNumeric) {
        return aNum - bNum;
      }

      return String(aId).localeCompare(String(bId));
    });
  }, [servicesToRender]);

  return (
    <section id="services" className="services">
      <div className="services-header">
        <h2 className="services-title">Usluge</h2>
        <p className="services-subtitle">
          Pouzdana ugradnja, servis i održavanje — brzo i kvalitetno.
        </p>
      </div>

      {!dedupedServicesToRender.length ? (
        <p className="services-empty">
          {canManage ? "Još nema usluga. Dodajte prvu." : "Trenutno nema dostupnih usluga."}
        </p>
      ) : null}

      <div className="services-container">
        {dedupedServicesToRender.map((service, idx) => (
          <ServiceCard
            key={`${getServiceId(service) ?? "no-id"}:${service.Title ?? service.title ?? "no-title"}:${idx}`}
            serviceId={getServiceId(service)}
            slug={slugify(service.Title ?? service.title)}
            title={service.Title ?? service.title}
            description={service.Description ?? service.description}
            imageUrls={service.ImageUrls ?? service.imageUrls}
            keywords={service.KeyWords ?? service.keyWords ?? service.keywords}
            rotationStep={rotationStep}
            canEdit={canManage}
            onEdit={() => {
              setEditing(service);
              setEditingWithImageRemoval(null);
              setEditOpen(true);
            }}
            isEditing={editingWithImageRemoval?.Id === getServiceId(service) || editingWithImageRemoval?.id === getServiceId(service)}
            onRemoveImage={(imageUrl) => {
              setEditingWithImageRemoval(service);
              setRemovingImageUrl(imageUrl);
            }}
          />
        ))}
      </div>

      {canManage ? (
        <div className="services-admin-footer">
          <button
            type="button"
            className="edit-button"
            onClick={() => setModalOpen(true)}
          >
            <span className="edit-button-icon" aria-hidden="true">
              +
            </span>
            Dodaj uslugu
          </button>
        </div>
      ) : null}

      {removingImageUrl && editingWithImageRemoval ? (
        <ImageRemovalModal
          open={!!removingImageUrl}
          imageUrl={removingImageUrl}
          serviceName={editingWithImageRemoval.Title ?? editingWithImageRemoval.title}
          onConfirm={async () => {
            const serviceId = getServiceId(editingWithImageRemoval);
            const currentImages =
              editingWithImageRemoval.ImageUrls ?? editingWithImageRemoval.imageUrls ?? [];

            const response = await patchService(serviceId, {
              title: editingWithImageRemoval.Title ?? editingWithImageRemoval.title,
              description:
                editingWithImageRemoval.Description ??
                editingWithImageRemoval.description,
              keyWords:
                editingWithImageRemoval.KeyWords ??
                editingWithImageRemoval.keyWords ??
                editingWithImageRemoval.keywords ??
                [],
              images: [],
              existingImageUrls: currentImages.filter((url) => url !== removingImageUrl),
              deletedImageUrls: [removingImageUrl],
            });

            const ok = response?.status === 200 || response?.status === 204;
            if (!ok) {
              const msg = response?.data?.message || "Greška pri brisanju slike.";
              showToast({ type: "error", title: "Neuspješno", message: msg });
              setRemovingImageUrl(null);
              setEditingWithImageRemoval(null);
              return;
            }

            showToast({
              type: "success",
              title: "Obrisano",
              message: "Slika je obrisana.",
            });
            setRemovingImageUrl(null);
            setEditingWithImageRemoval(null);
            router.refresh();
          }}
          onCancel={() => {
            setRemovingImageUrl(null);
            setEditingWithImageRemoval(null);
          }}
        />
      ) : null}

      <ServiceCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        heading="Dodaj uslugu"
        submitLabel="Dodaj"
        modalClassName="modal service-modal"
        onSubmit={async ({ title, description, keyWords, images }) => {
          const response = await createService({
            title,
            description,
            keyWords,
            images,
          });

          if (response?.status === 200 || response?.status === 201) {
            // Homepage data is sourced from /SiteSettings.
            router.refresh();
          }

          return response;
        }}
      />

      <ServiceCreateModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        heading="Uredi uslugu"
        submitLabel="Spremi"
        modalClassName="modal service-modal"
        deleteId={editing?.Id || editing?.id}
        onDelete={async (id) => {
          const response = await deleteService(id);
          if (response?.status === 200 || response?.status === 204) {
            router.refresh();
          }
          return response;
        }}
        onRemoveImageInstant={async (imageUrl) => {
          const serviceId = editing?.Id || editing?.id;
          const currentImages = editing?.ImageUrls ?? editing?.imageUrls ?? [];

          const response = await patchService(serviceId, {
            title: editing?.Title ?? editing?.title,
            description: editing?.Description ?? editing?.description,
            keyWords: editing?.KeyWords ?? editing?.keyWords ?? editing?.keywords ?? [],
            images: [],
            existingImageUrls: currentImages.filter((url) => url !== imageUrl),
            deletedImageUrls: [imageUrl],
          });

          const ok = response?.status === 200 || response?.status === 204;
          if (!ok) {
            throw new Error(response?.data?.message || "Greška pri brisanju slike.");
          }

          // Update local editing state to remove the image
          setEditing((prev) => {
            if (!prev) return prev;
            const key = prev.ImageUrls ? "ImageUrls" : "imageUrls";
            return {
              ...prev,
              [key]: prev[key].filter((url) => url !== imageUrl),
            };
          });

          router.refresh();
        }}
        initial={
          editing
            ? {
                id: editing.Id ?? editing.id,
                title: editing.Title ?? editing.title,
                description: editing.Description ?? editing.description,
                keyWords:
                  editing.KeyWords ?? editing.keyWords ?? editing.keywords ?? [],
                existingImageUrls:
                  editing.ImageUrls ?? editing.imageUrls ?? [],
              }
            : undefined
        }
        onSubmit={async ({ title, description, keyWords, images, existingImageUrls, deletedImageUrls }) => {
          const id = editing?.Id || editing?.id;
          if (!id) {
            return { status: 400, data: { message: "Uslugu nije moguće spremiti." } };
          }

          const response = await patchService(id, {
            title,
            description,
            keyWords,
            images,
            existingImageUrls,
            deletedImageUrls,
          });

          if (response?.status === 200 || response?.status === 204) {
            // Homepage data is sourced from /SiteSettings.
            router.refresh();
          }

          return response;
        }}
      />
    </section>
  );
}
