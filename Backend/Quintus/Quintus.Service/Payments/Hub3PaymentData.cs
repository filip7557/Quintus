namespace Quintus.Service.Payments
{
    public sealed record Hub3PaymentData(
        string PayerName,
        string? PayerAddress,
        string? PayerCity,
        string RecipientName,
        string RecipientAddress,
        string RecipientCity,
        string Iban,
        decimal Amount,
        string Model,
        string ReferenceNumber,
        string PurposeCode,
        string Description
    );
}