namespace Quintus.Common
{
    public class OfferFilter
    {
        public string? Search { get; set; }

        private DateTime? _dateFrom;
        public DateTime? DateFrom
        {
            get => _dateFrom;
            set => _dateFrom = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        private DateTime? _dateTo;
        public DateTime? DateTo
        {
            get => _dateTo;
            set => _dateTo = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
