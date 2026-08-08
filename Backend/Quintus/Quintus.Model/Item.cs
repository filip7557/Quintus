namespace Quintus.Model
{
    public class Item
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public required string UnitOfMeasurement { get; set; }
        public required int Quantity { get; set; }
        public required decimal Price { get; set; }
        public decimal DiscountPercent { get; set; } = 0;

        public decimal Total => Quantity * Price * (1 - DiscountPercent / 100);
    }

    public class ItemDTO
    {
        public required string Name { get; set; }
        public required string UnitOfMeasurement { get; set; }
        public required int Quantity { get; set; }
        public required decimal Price { get; set; }
        public decimal DiscountPercent { get; set; } = 0;
    }
}
