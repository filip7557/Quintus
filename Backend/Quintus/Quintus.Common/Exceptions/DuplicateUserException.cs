namespace Quintus.Common.Exceptions
{
    public class DuplicateUserException : Exception
    {
        public DuplicateUserException() : base("Račun s ovom email adresom već postoji.")
        {
        }
    }
}