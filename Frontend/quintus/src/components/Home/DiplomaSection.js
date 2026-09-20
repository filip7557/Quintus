import { useState, useEffect } from 'react';

import DiplomaCard from "../DiplomaCard/DiplomaCard";
import DiplomaCreateModal from "./DiplomaCreateModal";
import { addDiploma, updateDiploma, updateDiplomaImage, getDiplomas } from "@/services/diplomaService";
import useCanManageSite from "@/hooks/useCanManageSite";

export default function DiplomaSection(
    { diplomas }
) {
    const [localDiplomas, setLocalDiplomas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDiploma, setEditingDiploma] = useState(null);
    const { canManage } = useCanManageSite();

    useEffect(() => {
        setLocalDiplomas(diplomas ?? []);
    }, [diplomas]);

    const handleCreate = async ({ title, description, image, url }) => {
        //TODO: Wire this up to the real backend endpoint (CertificateDTO: Title, Description, Image).
        await addDiploma({ title, description, image, url });

        const newDiplomas = await getDiplomas();
        setLocalDiplomas(newDiplomas.data);
    };

    const handleUpdate = async ({ title, description, image, url }) => {
        //TODO: Wire this up to the real backend endpoint (CertificateDTO: Title, Description, Image).
        await updateDiploma({ id: editingDiploma.id, title, description, url });
        if (image) {
            await updateDiplomaImage({ diplomaId: editingDiploma.id, image });
        }

        const newDiplomas = await getDiplomas();
        setLocalDiplomas(newDiplomas.data);
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
                        <DiplomaCard diploma={diploma} setEditingDiploma={setEditingDiploma} setModalOpen={setModalOpen} canManage={canManage}/>
                    </div>
                ))}
            </div>

            {canManage ? (
                <div className="services-admin-footer">
                    <button
                        type="button"
                        className="edit-button"
                        onClick={() => {
                            setEditingDiploma(null);
                            setModalOpen(true);
                        }}
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
                onSubmit={editingDiploma ? handleUpdate : handleCreate}
                diploma={editingDiploma}
                setLocalDiplomas={setLocalDiplomas}
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