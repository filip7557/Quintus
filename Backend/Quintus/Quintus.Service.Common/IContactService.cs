using Quintus.Common;

namespace Quintus.Service.Common
{
    public interface IContactService
    {
        Task SendContactAsync(ContactFormRequest request);
    }
}
