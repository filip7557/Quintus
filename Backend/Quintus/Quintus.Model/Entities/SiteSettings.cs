namespace Quintus.Model.Entities
{
    public class SiteSettings
    {
        public required Guid Id { get; set; } = new Guid();
        public required string HeroBackgroundImageUrl { get; set; } = "https://quintus.fcuric.eu/images/hero.webp";
        public required string Title { get; set; } = "Stručne instalaterske usluge koje nadmašuju očekivanja, bez komplikacija.";
        public required string Description { get; set; } = "Primjenjujemo najnovije tehnologije u klimatizaciji, grijanju i vodoinstalacijama za maksimalnu učinkovitost i sigurnost vašeg doma ili poslovnog prostora po pristupačnim cijenama.";
        public required List<Service> Services { get; set; } = new List<Service>()
        {
            new Service
            {
                Title = "Klimatizacija",
                Description = "Precizan pristup svakoj instalaciji - od odabira idealnog položaja do završnog testiranja rada. Naše dugogodišnje iskustvo osigurava optimalno hlađenje uz minimalni trošak.",
                ImageUrls =  new List<string> { "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Fklima.webp&w=256&q=75" },
                KeyWords = new List<string> { "Garancija na ugradnju", "Servis", "Savjetovanje" }
            },
        };
        public required string AboutUs { get; set; } = "Naša tvrtka je nova na tržištu, ali iza nje stoji jedan iskusni majstor s gotovo 10 godina rada u klimatizaciji, grijanju i vodoinstalacijama.\r\n\r\nMajstor ulaže dodatni trud i pažnju u svaki detalj, koristi provjerene materijale te prati najnovije trendove i tehnologije u struci.\r\n\r\nVaše povjerenje nam je važno - zato svaki posao radimo kao da ga radimo za sebe. Hvala što birate lokalnog stručnjaka!";
        public required string AboutUsImageUrl { get; set; } = "https://quintus.fcuric.eu/_next/image?url=%2Fimages%2Fabout.webp&w=640&q=75";
        public required string Address { get; set; } = "Ulica Dudić X, 31500 Našice, Hrvatska";
        public required string PhoneNumber { get; set; } = "+385912345678";
        public required string ContactEmail { get; set; } = "info@quintus.eu";
        public required string Oib { get; set; } = "XXXXXXXXXXXX";
        public required string BrojObrtnice { get; set; } = "XXXXX";
        public required string Iban { get; set; } = "HRXXXXXXXXXXXXXXXXXXX";
    }
}
