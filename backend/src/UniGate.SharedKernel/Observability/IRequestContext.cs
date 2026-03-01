namespace UniGate.SharedKernel.Observability;

public interface IRequestContext
{
    string? CorrelationId { get; }
    string? TraceId { get; }
    string? Ip { get; }
    string? UserAgent { get; }
}
