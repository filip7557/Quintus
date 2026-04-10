namespace Quintus.Model
{
    public class Item
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public required string UnitOfMeasurement { get; set; }
        public required int Quantity { get; set; }
        public required decimal Price { get; set; }

        public decimal Total => Quantity * Price;
    }

    public class ItemDTO
    {
        public required string Name { get; set; }
        public required string UnitOfMeasurement { get; set; }
        public required int Quantity { get; set; }
        public required decimal Price { get; set; }
    }
}
