using System.ComponentModel.DataAnnotations;

namespace Quintus.Common
{
    public class RoleAssignmentRequest
    {
        [Required]
        public Guid RoleId { get; set; }
    }
}