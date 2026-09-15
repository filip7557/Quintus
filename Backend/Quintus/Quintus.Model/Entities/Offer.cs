using System.ComponentModel.DataAnnotations;

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

        public int OfferNumber { get; set; }
        public int OfferYear { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public decimal Total => Items.Sum(i => i.Total);
    }

    public class OfferDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public required string BuyerName { get; set; }

        [EmailAddress]
        [StringLength(254)]
        public string? BuyerEmail { get; set; }

        [Phone]
        [StringLength(32)]
        public string? BuyerPhone { get; set; }

        [StringLength(2000)]
        public string? CustomMessage { get; set; }

        [Required]
        [MinLength(1)]
        public required List<ItemDTO> Items { get; set; }
    }
}
