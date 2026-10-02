# 🧰 Quintus

**Quintus** je moderno web rješenje dizajnirano za lokalnu instalatersku tvrtku.  
Aplikacija primarno služi kao **digitalna vizitka i prezentacija usluga**, ali i kao **interaktivna platforma** koja klijentima omogućuje brzo slanje upita uz vizualnu dokumentaciju (fotografije). Uz to, sustav majstorima olakšava svakodnevno poslovanje kroz centralizirano upravljanje zahtjevima i **automatiziranu izradu te slanje službenih ponuda**.

---

## 🚀 Ključne funkcionalnosti

### 👨‍🔧 Za klijente
- 🏠 **Prezentacija tvrtke:** Pregled informacija, dostupnih usluga i kontakt podataka.  
- 📸 **Slanje upita:** Jednostavno podnošenje zahtjeva za majstora uz mogućnost uploada fotografija kvara ili prostora.  
- 📱 **Moderno sučelje:** Brz i responzivan dizajn prilagođen mobilnim i desktop uređajima.

### 🛡️ Za administratore i majstore
- 📬 **Centralni registar zahtjeva:** Automatsko spremanje, pregled i obrada svih pristiglih upita na backendu.  
- 💼 **Izrada ponuda (Novo!):** Kreiranje detaljnih troškovnika i službenih ponuda direktno iz pristiglog zahtjeva.  
- 📄 **Generiranje PDF-a:** Automatsko pretvaranje ponuda u profesionalni PDF format spreman za slanje klijentu ili ispis.
- 📧 **Automatska dostava:** Slanje kreiranih PDF ponuda klijentu putem e-maila direktno iz sustava.
- 👥 **Upravljanje korisnicima (Novo!):** Pregled svih registriranih korisnika uz pretragu, filtriranje po ulozi i straniciranje. Admin može dodijeliti bilo koju ulogu, dok Owner može dodijeliti samo uloge Worker i User. Admin i Owner mogu postaviti i boju kojom se korisnik prikazuje u rasporedu.
- 📅 **Raspored (Novo!):** Tjedni i mjesečni prikaz termina dostupan Adminima, Ownerima i Workerima. Novi termini se boje prema boji korisnika koji ih je kreirao, a svaki korisnik može uređivati samo svoje termine (Admin dodatno može brisati bilo koji termin).
- ⏳ **Termini na čekanju (Novo!):** Termin se može kreirati i bez datuma i vremena te ostaje na čekanju dok ga netko od Admina, Ownera ili Workera ne dovrši unosom datuma i vremena. Nakon dovršetka, termin postaje vlasništvo korisnika koji ga je dovršio.

---

## 🖥️ Tehnologije

### ⚙️ Backend
- **C# .NET 10.0** – Robusno, moderno i brzo poslužiteljsko okruženje.
- **Entity Framework Core** – Napredni ORM za efikasnu komunikaciju s bazom.
- **PostgreSQL** – Pouzdana i skalabilna relacijska baza podataka.
- **REST API** – Strukturirana i sigurna komunikacija s frontendom.

### 🎨 Frontend
- **Next.js (React)** – Moderan framework za brzo renderiranje, odlične performanse i SEO.
- **Axios** – HTTP klijent za pouzdanu komunikaciju s REST API-jem.

---

## Galerija projekata

Galeriju otvorite odabirom **Račun > Galerija projekata**. Dostupna je administratorima, vlasnicima i radnicima. Svi imaju pristup istim projektima te mogu dodavati i uređivati podatke i fotografije.

- **Novi projekt:** Unesite naziv projekta. Po želji dodajte opis radova, adresu ili lokaciju te ime kupca ili klijenta.
- **Pretraga:** Projekt pronađite upisivanjem naziva, adrese ili imena klijenta.
- **Dodavanje fotografija:** Otvorite projekt i odaberite **Dodaj fotografije**. Možete odabrati više fotografija odjednom, a svaka može imati najviše 20 MB. Ako dodavanje neke fotografije ne uspije, možete pokušati ponovno bez ponovnog dodavanja već spremljenih fotografija.
- **Pregled fotografija:** Kliknite ili dodirnite fotografiju za povećani prikaz. Ostale fotografije pregledajte strelicama ili povlačenjem prsta na mobitelu.
- **Uređivanje i brisanje:** Podatke promijenite odabirom **Uredi**. Možete obrisati pojedinu fotografiju ili cijeli projekt. Brisanjem projekta brišu se i sve njegove fotografije, a brisanje nije moguće poništiti.

**Privatnost:** Galerija je dostupna samo navedenim korisnicima, ali izravnu poveznicu na fotografiju može otvoriti svatko tko je ima. Nemojte dijeliti takve poveznice ako fotografije sadrže privatne podatke.

## Obavijesti o rasporedu

Ako ste administrator, vlasnik ili radnik, na stranici **Račun > Raspored** možete uključiti obavijesti o terminima. Odaberite želite li primati obavijesti o novim terminima, promjenama postojećih termina ili njihovom brisanju.

Kada preglednik zatraži dopuštenje za slanje obavijesti, odaberite **Dopusti**. Obavijesti uključite zasebno na svakom uređaju i u svakom pregledniku u kojem ih želite primati.

Obavijesti se odnose na promjene drugih korisnika. Za termin koji ste sami dodali, promijenili ili obrisali nećete dobiti obavijest.
