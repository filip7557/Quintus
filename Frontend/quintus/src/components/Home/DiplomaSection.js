import { useState, useEffect } from 'react';

import DiplomaCard from "../DiplomaCard/DiplomaCard";

export default function DiplomaSection(
) {
    const [diplomas, setDiplomas] = useState([]);

    const mockDiplomas = [
        {
            id: 1,
            title: "Grijanje",
            description: "Stručna potvrda za izvedbu i održavanje sustava grijanja.",
            image: "/images/diplomas/heating-flame.svg"
        },
        {
            id: 2,
            title: "Vodne instalacije",
            description: "Certificirana stručnost za sigurne i pouzdane vodne instalacije.",
            image: "/images/diplomas/water-faucet.svg"
        },
        {
            id: 3,
            title: "Hlađenje",
            description: "Osposobljenost za ugradnju i servis rashladnih sustava.",
            image: "/images/diplomas/cooling-snowflake.svg"
        },
        {
            id: 4,
            title: "A1 plinski certifikat",
            description: "Ovlaštenje za stručan i siguran rad s plinskim instalacijama.",
            image: "/images/diplomas/a1-gas-certificate.svg"
        }
    ];

    useEffect(() => {
        //TODO: Pull diplomas from backend
        setDiplomas(mockDiplomas);
    }, []);

    return (
        <section id="diploma" className="diploma">
            <div className="diploma-header">
                <p className="diploma-subtitle">Naše kvalifikacije</p>
                <h2 className="diploma-title">Stručnost potvrđena diplomama i certifikatima</h2>
            </div>

            <div className="diploma-container">
                {!diplomas?.length ? 
                    <p className="diploma-empty">No diplomas available.</p> 
                    :
                    diplomas.map((diploma) => (
                    <div key={diploma.id} className="diploma-item">
                        {/* TODO: Make a diploma component and display it here. */}
                        <DiplomaCard diploma={diploma} />
                    </div>
                ))}
            </div>

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