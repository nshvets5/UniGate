namespace UniGate.SharedKernel.Auth;

public interface ICurrentUserEmailVerification
{
    bool EmailVerified { get; }
}