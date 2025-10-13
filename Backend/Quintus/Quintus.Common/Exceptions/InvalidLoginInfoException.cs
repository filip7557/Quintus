namespace Quintus.Common.Exceptions
{
    public class InvalidLoginInfoException : Exception
    {
        public InvalidLoginInfoException() : base("Invalid login information provided.")
        {
        }
    }
}