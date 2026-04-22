using System.Threading.Channels;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class EmailQueue : IEmailQueue
    {
        private readonly Channel<EmailJobItem> _channel = Channel.CreateUnbounded<EmailJobItem>(
            new UnboundedChannelOptions { SingleReader = true });

        public ChannelReader<EmailJobItem> Reader => _channel.Reader;

        public void Enqueue(EmailJobItem item) => _channel.Writer.TryWrite(item);
    }
}
