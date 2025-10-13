namespace Quintus.Common.Exceptions
{
    public class InvalidPasswordException : Exception
    {
        public InvalidPasswordException(string message) : base(message)
        {
        }

        public InvalidPasswordException() : base("The provided password does not meet the required criteria.")
        {
        }
    }
}