namespace Quintus.Worker
{
    public class PushNotificationOptions
    {
        public string PublicKey { get; set; } = string.Empty;
        public string PrivateKey { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;

        public bool IsConfigured => !string.IsNullOrWhiteSpace(PublicKey) &&
            !string.IsNullOrWhiteSpace(PrivateKey) &&
            !string.IsNullOrWhiteSpace(Subject);
    }
}