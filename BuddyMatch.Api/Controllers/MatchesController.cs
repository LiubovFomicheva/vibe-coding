using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly BuddyMatchContext _context;
    private readonly ILogger<MatchesController> _logger;

    public MatchesController(BuddyMatchContext context, ILogger<MatchesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/matches
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Models.BuddyMatch>>> GetAllMatches()
    {
        try
        {
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} matches", matches.Count);
            return Ok(matches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving matches");
            return StatusCode(500, new { Message = "Error retrieving matches", Error = ex.Message });
        }
    }

    // GET: api/matches/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Models.BuddyMatch>> GetMatch(Guid id)
    {
        try
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.Messages)
                .Include(m => m.Feedback)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (match == null)
            {
                _logger.LogWarning("Match with ID {MatchId} not found", id);
                return NotFound(new { Message = $"Match with ID {id} not found" });
            }

            _logger.LogInformation("Retrieved match {MatchId} between {Buddy} and {Newcomer}", 
                id, match.Buddy.FullName, match.Newcomer.FullName);

            return Ok(match);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving match {MatchId}", id);
            return StatusCode(500, new { Message = "Error retrieving match", Error = ex.Message });
        }
    }

    // GET: api/matches/buddy/{buddyId}
    [HttpGet("buddy/{buddyId}")]
    public async Task<ActionResult<IEnumerable<Models.BuddyMatch>>> GetMatchesByBuddy(Guid buddyId)
    {
        try
        {
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.CreatedByHR)
                .Where(m => m.BuddyId == buddyId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} matches for buddy {BuddyId}", matches.Count, buddyId);
            return Ok(matches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving matches for buddy {BuddyId}", buddyId);
            return StatusCode(500, new { Message = "Error retrieving matches for buddy", Error = ex.Message });
        }
    }

    // GET: api/matches/newcomer/{newcomerId}
    [HttpGet("newcomer/{newcomerId}")]
    public async Task<ActionResult<IEnumerable<Models.BuddyMatch>>> GetMatchesByNewcomer(Guid newcomerId)
    {
        try
        {
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Where(m => m.NewcomerId == newcomerId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} matches for newcomer {NewcomerId}", matches.Count, newcomerId);
            return Ok(matches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving matches for newcomer {NewcomerId}", newcomerId);
            return StatusCode(500, new { Message = "Error retrieving matches for newcomer", Error = ex.Message });
        }
    }

    // GET: api/matches/status/{status}
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<Models.BuddyMatch>>> GetMatchesByStatus(MatchStatus status)
    {
        try
        {
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Where(m => m.Status == status)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} matches with status {Status}", matches.Count, status);
            return Ok(matches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving matches with status {Status}", status);
            return StatusCode(500, new { Message = "Error retrieving matches by status", Error = ex.Message });
        }
    }

    // PUT: api/matches/{id}/status
    [HttpPut("{id}/status")]
    public async Task<ActionResult<Models.BuddyMatch>> UpdateMatchStatus(Guid id, UpdateMatchStatusRequest request)
    {
        try
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (match == null)
            {
                _logger.LogWarning("Match with ID {MatchId} not found for status update", id);
                return NotFound(new { Message = $"Match with ID {id} not found" });
            }

            var oldStatus = match.Status;
            match.Status = request.Status;

            // Update timestamps based on status
            switch (request.Status)
            {
                case MatchStatus.Active:
                    match.AcceptedAt = DateTime.UtcNow;
                    break;
                case MatchStatus.Rejected:
                    match.RejectedAt = DateTime.UtcNow;
                    break;
                case MatchStatus.Completed:
                    match.CompletedAt = DateTime.UtcNow;
                    break;
            }

            match.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated match {MatchId} status from {OldStatus} to {NewStatus}", 
                id, oldStatus, request.Status);

            return Ok(match);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating match {MatchId} status", id);
            return StatusCode(500, new { Message = "Error updating match status", Error = ex.Message });
        }
    }

    // GET: api/matches/active
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<Models.BuddyMatch>>> GetActiveMatches()
    {
        try
        {
            var activeMatches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Where(m => m.Status == MatchStatus.Active)
                .OrderByDescending(m => m.AcceptedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} active matches", activeMatches.Count);
            return Ok(activeMatches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active matches");
            return StatusCode(500, new { Message = "Error retrieving active matches", Error = ex.Message });
        }
    }

    // GET: api/matches/pending
    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<Models.BuddyMatch>>> GetPendingMatches()
    {
        try
        {
            var pendingMatches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Where(m => m.Status == MatchStatus.Pending)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} pending matches", pendingMatches.Count);
            return Ok(pendingMatches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending matches");
            return StatusCode(500, new { Message = "Error retrieving pending matches", Error = ex.Message });
        }
    }
}

// Request DTOs
public class UpdateMatchStatusRequest
{
    public MatchStatus Status { get; set; }
    public string? Reason { get; set; }
}
