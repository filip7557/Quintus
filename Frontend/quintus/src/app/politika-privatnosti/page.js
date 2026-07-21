import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Politika privatnosti | Quintus",
  description:
    "Informacije o načinu pohrane tokena, registracijskim podacima i zaštiti privatnosti korisnika.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Quintus</p>
          <h1 className={styles.title}>Politika privatnosti</h1>
          <p className={styles.lead}>
            Ova stranica objašnjava na koji način koristimo localStorage u
            sklopu prijave korisnika, koje podatke korisnik unosi prilikom
            registracije te kako se svi prikupljeni podaci koriste isključivo
            za siguran i funkcionalan rad korisničkog računa.
          </p>

          <section className={styles.section}>
            <h2>Koje podatke pohranjujemo</h2>
            <p>
              Nakon uspješne prijave aplikacija u vaš preglednik može pohraniti
              pristupni token (access token) i token za osvježavanje sesije
              (refresh token). Ti se podaci spremaju u localStorage i služe samo
              za prepoznavanje prijavljenog korisnika unutar aplikacije.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Podaci koje korisnik unosi pri registraciji</h2>
            <p>
              Prilikom registracije korisnik može unijeti ime, prezime, broj
              telefona, email adresu i lozinku. Ti podaci služe za otvaranje i
              upravljanje korisničkim računom, komunikaciju vezanu uz račun te
              sigurnu prijavu u sustav.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Svrha obrade registracijskih podataka</h2>
            <p>
              Registracijski podaci koriste se za izradu korisničkog profila,
              potvrdu identiteta korisnika, slanje verifikacijskih i servisnih
              obavijesti te za omogućavanje pristupa funkcionalnostima koje su
              dostupne prijavljenim korisnicima.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Zašto koristimo localStorage</h2>
            <p>
              Pohrana tokena omogućuje da ostanete prijavljeni i nakon
              osvježavanja stranice, da se zaštićeni API pozivi pravilno
              autoriziraju te da se sesija po potrebi može obnoviti bez ponovne
              prijave, dok god je to dopušteno pravilima autentikacije sustava.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Koliko dugo podaci ostaju pohranjeni</h2>
            <p>
              Tokeni ostaju u localStorage-u dok se ne odjavite, dok ih ručno ne
              uklonite iz preglednika ili dok više ne vrijede prema pravilima
              poslužitelja. Nakon isteka ili neuspješnog osvježavanja sesije
              pristup zaštićenim funkcijama više nije moguć bez nove prijave.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Zaštita i čuvanje podataka</h2>
            <p>
              Podaci koje korisnik unese obrađuju se isključivo u svrhe
              povezane s radom korisničkog računa i pružanjem usluge. Pristup
              tim podacima imaju samo ovlašteni sustavi i osobe kada je to
              potrebno za tehničko održavanje, sigurnost ili izvršavanje
              funkcionalnosti usluge.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Kako se podaci koriste</h2>
            <p>
              Pohranjeni tokeni koriste se isključivo za autentikaciju korisnika
              i autorizaciju zahtjeva prema aplikacijskim servisima. Ne koriste
              se za oglašavanje, profiliranje ni za dijeljenje s trećim stranama
              izvan funkcionalnosti potrebnih za rad same usluge.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Prava korisnika</h2>
            <p>
              Korisnik može zatražiti informacije o svojim podacima, ispravak
              netočnih podataka te, kada je to primjenjivo, brisanje korisničkog
              računa ili podataka povezanih s računom. Za takve upite potrebno
              je javiti se putem kontakt podataka objavljenih na ovoj web
              stranici.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Preporuka korisnicima</h2>
            <p>
              Ako koristite zajednički ili javni uređaj, preporučujemo da se po
              završetku rada odjavite i zatvorite preglednik. Time smanjujete
              mogućnost da druga osoba pristupi vašoj aktivnoj sesiji.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Kontakt i dodatne informacije</h2>
            <p>
              Ako imate pitanja vezana uz privatnost, obradu podataka ili način
              rada korisničke prijave, javite se putem kontakt podataka
              objavljenih na ovoj web stranici.
            </p>
          </section>

          <div className={styles.actions}>
            <p className={styles.actionsNote}>
              Za povratak na početnu stranicu koristite plutajući gumb u dnu
              zaslona.
            </p>
          </div>
        </div>
      </div>

      <Link href="/" className={styles.backLink}>
        Povratak na početnu stranicu
      </Link>
    </main>
  );
}