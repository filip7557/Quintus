namespace Quintus.Model.Entities
{
    public class SiteSettings
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string HeroBackgroundImageUrl { get; set; } = "https://www.instalacije-quintus.hr/images/hero.webp";
        public string HeroBackgroundImageMobileUrl { get; set; } = string.Empty;
        public string Title { get; set; } = "Stručne instalaterske usluge koje nadmašuju očekivanja, bez komplikacija.";
        public string Description { get; set; } = "Primjenjujemo najnovije tehnologije u klimatizaciji, grijanju i vodoinstalacijama za maksimalnu učinkovitost i sigurnost vašeg doma ili poslovnog prostora po pristupačnim cijenama.";
        public List<Service> Services { get; set; } = new();
        public string AboutUs { get; set; } = "Naša tvrtka je nova na tržištu, ali iza nje stoji jedan iskusni majstor s gotovo 10 godina rada u klimatizaciji, grijanju i vodoinstalacijama.\r\n\r\nMajstor ulaže dodatni trud i pažnju u svaki detalj, koristi provjerene materijale te prati najnovije trendove i tehnologije u struci.\r\n\r\nVaše povjerenje nam je važno - zato svaki posao radimo kao da ga radimo za sebe. Hvala što birate lokalnog stručnjaka!";
        public string AboutUsImageUrl { get; set; } = "https://www.instalacije-quintus.hr/_next/image?url=%2Fimages%2Fabout.webp&w=640&q=75";
        public string Address { get; set; } = "Ulica Dudić X, 31500 Našice, Hrvatska";
        public string PhoneNumber { get; set; } = "+385912345678";
        public string ContactEmail { get; set; } = "info@quintus.eu";
        public string Oib { get; set; } = "XXXXXXXXXXXX";
        public string BrojObrtnice { get; set; } = "XXXXX";
        public string Iban { get; set; } = "HRXXXXXXXXXXXXXXXXXXX";
    }
}
