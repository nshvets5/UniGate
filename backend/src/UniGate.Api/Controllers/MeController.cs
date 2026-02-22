using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Iam.Application.UseCases.GetCurrentUser;

namespace UniGate.Api.Controllers;

[Route("api/me")]
public sealed class MeController : ApiControllerBase
{
    private readonly GetCurrentUserUseCase _useCase;

    public MeController(GetCurrentUserUseCase useCase, IApiErrorMapper errorMapper)
        : base(errorMapper)
    {
        _useCase = useCase;
    }

    [HttpGet]
    [Authorize]
    public IActionResult Get()
        => ToActionResult(_useCase.Execute());
}
