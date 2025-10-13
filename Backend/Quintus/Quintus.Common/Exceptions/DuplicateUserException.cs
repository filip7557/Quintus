namespace Quintus.Common.Exceptions
{
    public class DuplicateUserException : Exception
    {
        public DuplicateUserException() : base("A user with the provided email already exists.")
        {
        }
    }
}