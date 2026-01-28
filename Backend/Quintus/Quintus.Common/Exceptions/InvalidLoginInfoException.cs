namespace Quintus.Common.Exceptions
{
    public class InvalidLoginInfoException : Exception
    {
        public InvalidLoginInfoException() : base("Pogrešan email ili lozinka.")
        {
        }

        public InvalidLoginInfoException(string message) : base(message)
        {
        }
    }
}