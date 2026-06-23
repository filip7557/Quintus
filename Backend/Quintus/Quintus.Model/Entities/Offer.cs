namespace Quintus.Model.Entities
{
    public class Offer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string BuyerName { get; set; }
        public string? BuyerEmail { get; set; }
        public string? BuyerPhone { get; set; }
        public string? CustomMessage { get; set; }
        public required List<Item> Items { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public decimal Total => Items.Sum(i => i.Total);
    }

    public class OfferDTO
    {
        public required string BuyerName { get; set; }
        public string? BuyerEmail { get; set; }
        public string? BuyerPhone { get; set; }
        public string? CustomMessage { get; set; }
        public required List<ItemDTO> Items { get; set; }
    }
}
