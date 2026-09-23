using System.ComponentModel.DataAnnotations;

namespace Quintus.Model.Entities
{
    public class Estimate
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string BuyerName { get; set; }
        public string? BuyerEmail { get; set; }
        public string? BuyerPhone { get; set; }
        public required List<Item> Items { get; set; }
        public required bool IsTransactional { get; set; }
        public int Number { get; set; }
        public int Year { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public decimal Total => Items.Sum(i => i.Total);
    }

    public class EstimateDTO
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

        [Required]
        [MinLength(1)]
        public required List<ItemDTO> Items { get; set; }

        [Required]
        public required bool IsTransactional { get; set; }
    }
}
