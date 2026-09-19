import { useState, useEffect } from 'react';

import DiplomaCard from "../DiplomaCard/DiplomaCard";
import DiplomaCreateModal from "./DiplomaCreateModal";
import { addDiploma } from "@/services/diplomaService";
import useCanManageSite from "@/hooks/useCanManageSite";

export default function DiplomaSection(
    { diplomas }
) {
    const [localDiplomas, setLocalDiplomas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const { canManage } = useCanManageSite();

    useEffect(() => {
        setLocalDiplomas(diplomas ?? []);
    }, [diplomas]);

    const handleCreate = async ({ title, description, image, url }) => {
        // Show the new diploma immediately; backend persistence isn't wired up yet.
        const newDiploma = {
            id: `local-${Date.now()}`,
            title,
            description,
            image: URL.createObjectURL(image),
            url,
        };
        setLocalDiplomas((prev) => [...prev, newDiploma]);

        //TODO: Wire this up to the real backend endpoint (CertificateDTO: Title, Description, Image).
        const response = await addDiploma({ title, description, image, url });
        if (response?.data) {
            setLocalDiplomas((prev) =>
                prev.map((d) => (d.id === newDiploma.id ? response.data : d))
            );
        }
    };

    return (
        <section id="diploma" className="diploma">
            <div className="diploma-header">
                <p className="diploma-subtitle">Naše kvalifikacije</p>
                <h2 className="diploma-title">Stručnost potvrđena diplomama i certifikatima</h2>
            </div>

            <div className="diploma-container">
                {!localDiplomas?.length ? 
                    <p className="diploma-empty">No diplomas available.</p> 
                    :
                    localDiplomas.map((diploma) => (
                    <div key={diploma.id} className="diploma-item">
                        {/* TODO: Make a diploma component and display it here. */}
                        <DiplomaCard diploma={diploma} />
                    </div>
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
                        Dodaj certifikat
                    </button>
                </div>
            ) : null}

            <DiplomaCreateModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreate}
            />

            <div className="diploma-cta">
                <div className="diploma-cta-copy">
                    <h3>Tražite pouzdanog izvođača radova?</h3>
                    <p>
                        Naše kvalifikacije i iskustvo jamče sigurnu i profesionalnu
                        izvedbu svih instalaterskih radova u vašem domu ili poslovnom prostoru.
                    </p>
                </div>
                <a className="diploma-cta-button" href="#contact">
                    Zatražite ponudu
                </a>
            </div>
        </section>
    );
}