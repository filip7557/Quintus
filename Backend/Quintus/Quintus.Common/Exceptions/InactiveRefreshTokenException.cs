namespace Quintus.Common.Exceptions
{
    public class InactiveRefreshTokenException : Exception
    {
        public InactiveRefreshTokenException() : base("Inactive refresh token provided.")
        {
        }
    }
}