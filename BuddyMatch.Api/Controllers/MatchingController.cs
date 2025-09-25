using Microsoft.AspNetCore.Mvc;
using BuddyMatch.Api.Services;

namespace BuddyMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchingController : ControllerBase
    {
        private readonly IMatchingService _matchingService;
        private readonly ILogger<MatchingController> _logger;
        
        public MatchingController(IMatchingService matchingService, ILogger<MatchingController> logger)
        {
            _matchingService = matchingService;
            _logger = logger;
        }
        
        [HttpGet("recommendations/{newcomerId}")]
        public async Task<ActionResult<List<BuddyMatchRecommendation>>> GetRecommendations(Guid newcomerId, int maxRecommendations = 5)
        {
            var recommendations = await _matchingService.GetBuddyRecommendationsAsync(newcomerId, maxRecommendations);
            return Ok(recommendations);
        }
        
        [HttpGet("compatibility/{buddyId}/{newcomerId}")]
        public async Task<ActionResult<double>> GetCompatibilityScore(Guid buddyId, Guid newcomerId)
        {
            var score = await _matchingService.CalculateCompatibilityScoreAsync(buddyId, newcomerId);
            return Ok(new { CompatibilityScore = score });
        }
        
        [HttpPost("create")]
        public async Task<ActionResult> CreateMatch(CreateMatchRequest request)
        {
            var match = await _matchingService.CreateMatchAsync(
                request.BuddyId, 
                request.NewcomerId, 
                request.HRId, 
                request.Notes ?? string.Empty,
                request.CompatibilityScore
            );
            
            return Ok(new { MatchId = match.Id, CompatibilityScore = match.CompatibilityScore });
        }
        
        [HttpPost("accept/{matchId}")]
        public async Task<ActionResult> AcceptMatch(Guid matchId, AcceptMatchRequest request)
        {
            var success = await _matchingService.AcceptMatchAsync(matchId, request.BuddyId);
            
            if (!success)
            {
                return BadRequest("Unable to accept match. Match may not exist, already be processed, or buddy may be at capacity.");
            }
            
            return Ok(new { Message = "Match accepted successfully" });
        }
        
        [HttpPost("reject/{matchId}")]
        public async Task<ActionResult> RejectMatch(Guid matchId, RejectMatchRequest request)
        {
            var success = await _matchingService.RejectMatchAsync(matchId, request.BuddyId, request.Reason ?? string.Empty);
            
            if (!success)
            {
                return BadRequest("Unable to reject match. Match may not exist or already be processed.");
            }
            
            return Ok(new { Message = "Match rejected successfully" });
        }
    }
    
    public class CreateMatchRequest
    {
        public Guid BuddyId { get; set; }
        public Guid NewcomerId { get; set; }
        public Guid HRId { get; set; }
        public string? Notes { get; set; }
        public double? CompatibilityScore { get; set; }
    }
    
    public class AcceptMatchRequest
    {
        public Guid BuddyId { get; set; }
    }
    
    public class RejectMatchRequest
    {
        public Guid BuddyId { get; set; }
        public string? Reason { get; set; }
    }
}
