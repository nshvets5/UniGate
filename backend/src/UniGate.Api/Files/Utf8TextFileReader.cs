using System.Text;
using UniGate.SharedKernel.Files;
using UniGate.SharedKernel.Results;

namespace UniGate.Api.Files;

public sealed class Utf8TextFileReader : ITextFileReader
{
    public async Task<Result<string>> ReadAllTextAsync(Stream stream, CancellationToken ct = default)
    {
        try
        {
            if (stream is null)
                return Result<string>.Failure(UniGate.SharedKernel.Results.Errors.Validation.Failed("File stream is required."));

            using var reader = new StreamReader(
                stream,
                encoding: new UTF8Encoding(encoderShouldEmitUTF8Identifier: false),
                detectEncodingFromByteOrderMarks: true,
                leaveOpen: false);

            var text = await reader.ReadToEndAsync(ct);

            if (string.IsNullOrWhiteSpace(text))
                return Result<string>.Failure(new Error("file.empty", "File is empty."));

            return Result<string>.Success(text);
        }
        catch (Exception ex)
        {
            return Result<string>.Failure(new Error("file.read_failed", ex.Message));
        }
    }
}