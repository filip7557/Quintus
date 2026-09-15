using System.ComponentModel.DataAnnotations;

namespace Quintus.Model
{
    public class Item
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public required string UnitOfMeasurement { get; set; }
        public required decimal Quantity { get; set; }
        public required decimal Price { get; set; }
        public decimal DiscountPercent { get; set; } = 0;

        public decimal Total => Quantity * Price * (1 - DiscountPercent / 100);
    }

    public class ItemDTO
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public required string Name { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 1)]
        public required string UnitOfMeasurement { get; set; }

        [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
        public required decimal Quantity { get; set; }

        [Range(typeof(decimal), "-79228162514264337593543950335", "79228162514264337593543950335")]
        public required decimal Price { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal DiscountPercent { get; set; } = 0;
    }
}
