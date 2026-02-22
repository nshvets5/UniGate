namespace UniGate.SharedKernel.Results;

public static class ResultExtensions
{
    public static Result<TOut> Map<TIn, TOut>(this Result<TIn> result, Func<TIn, TOut> map)
        => result.IsSuccess
            ? Result<TOut>.Success(map(result.Value))
            : Result<TOut>.Failure(result.Error);

    public static async Task<Result<TOut>> Map<TIn, TOut>(this Task<Result<TIn>> task, Func<TIn, TOut> map)
        => (await task).Map(map);

    public static Result<TOut> Bind<TIn, TOut>(this Result<TIn> result, Func<TIn, Result<TOut>> bind)
        => result.IsSuccess
            ? bind(result.Value)
            : Result<TOut>.Failure(result.Error);

    public static async Task<Result<TOut>> Bind<TIn, TOut>(this Task<Result<TIn>> task, Func<TIn, Task<Result<TOut>>> bind)
    {
        var result = await task;
        return result.IsSuccess ? await bind(result.Value) : Result<TOut>.Failure(result.Error);
    }

    public static TOut Match<TIn, TOut>(this Result<TIn> result, Func<TIn, TOut> onSuccess, Func<Error, TOut> onFailure)
        => result.IsSuccess ? onSuccess(result.Value) : onFailure(result.Error);

    public static TResult Match<TResult>(this Result result, Func<TResult> onSuccess, Func<Error, TResult> onFailure)
        => result.IsSuccess ? onSuccess() : onFailure(result.Error);

    public static Result Ensure(this Result result, Func<bool> predicate, Error error)
        => result.IsSuccess && !predicate() ? Result.Failure(error) : result;

    public static Result<T> Ensure<T>(this Result<T> result, Func<T, bool> predicate, Error error)
        => result.IsSuccess && !predicate(result.Value) ? Result<T>.Failure(error) : result;
}
