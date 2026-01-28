namespace Quintus.Common
{
    public class VerifyEmailResponse
    {
        public required bool Verified { get; set; }
        public string? Message { get; set; }
    }
}
