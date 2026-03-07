using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Files;

public interface ITextFileReader
{
    Task<Result<string>> ReadAllTextAsync(Stream stream, CancellationToken ct = default);
}