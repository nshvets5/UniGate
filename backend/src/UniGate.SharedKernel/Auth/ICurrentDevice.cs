namespace UniGate.SharedKernel.Auth;

public interface ICurrentDevice
{
    bool IsAuthenticated { get; }

    Guid? ReaderId { get; }

    string? ReaderCode { get; }
}