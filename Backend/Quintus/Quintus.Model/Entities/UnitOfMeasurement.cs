namespace Quintus.Model.Entities
{
    public class UnitOfMeasurement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
    }
}
