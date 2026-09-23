using System.Threading.Channels;

namespace Quintus.Service.Common
{
    public record EmailJobItem(Guid entityId, EmailJobType jobType);

    public enum EmailJobType
    {
        Offer,
        Estimate,
    }

    public interface IEmailQueue
    {
        void Enqueue(EmailJobItem item);
        ChannelReader<EmailJobItem> Reader { get; }
    }
}
