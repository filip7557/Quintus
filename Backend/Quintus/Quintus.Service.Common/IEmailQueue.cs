using System.Threading.Channels;

namespace Quintus.Service.Common
{
    public record EmailJobItem(Guid OfferId);

    public interface IEmailQueue
    {
        void Enqueue(EmailJobItem item);
        ChannelReader<EmailJobItem> Reader { get; }
    }
}
