using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UniGate.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    [HttpGet("ping")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult Ping()
    {
        return Ok("Admin access granted");
    }
}
