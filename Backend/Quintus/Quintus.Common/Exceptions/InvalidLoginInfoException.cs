namespace Quintus.Common.Exceptions
{
    public class InvalidLoginInfoException : Exception
    {
        public InvalidLoginInfoException() : base("Pogrešan email ili lozinka.")
        {
        }
    }
}