using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<FeedbackController> _logger;
        
        public FeedbackController(BuddyMatchContext context, ILogger<FeedbackController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpPost]
        public async Task<ActionResult<MatchFeedback>> SubmitFeedback(SubmitFeedbackRequest request)
        {
            var match = await _context.BuddyMatches
                .FirstOrDefaultAsync(m => m.Id == request.MatchId && m.NewcomerId == request.NewcomerId);
            
            if (match == null)
            {
                return BadRequest("Match not found or feedback can only be provided by the newcomer");
            }
            
            if (match.Status != MatchStatus.Active && match.Status != MatchStatus.Completed)
            {
                return BadRequest("Feedback can only be provided for active or completed matches");
            }
            
            // Check if feedback already exists
            var existingFeedback = await _context.MatchFeedbacks
                .FirstOrDefaultAsync(f => f.MatchId == request.MatchId && f.ProvidedById == request.NewcomerId);
            
            if (existingFeedback != null)
            {
                return Conflict("Feedback has already been provided for this match");
            }
            
            var feedback = new MatchFeedback
            {
                Id = Guid.NewGuid(),
                MatchId = request.MatchId,
                OverallRating = request.Rating,
                Comments = request.Comments ?? string.Empty,
                ProvidedById = request.NewcomerId,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.MatchFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Feedback submitted for match {MatchId} by newcomer {NewcomerId} with rating {Rating}", 
                request.MatchId, request.NewcomerId, request.Rating);
            
            return Ok(feedback);
        }
        
        [HttpGet("match/{matchId}")]
        public async Task<ActionResult<MatchFeedback>> GetFeedbackForMatch(Guid matchId)
        {
            var feedback = await _context.MatchFeedbacks
                .Include(f => f.ProvidedBy)
                .FirstOrDefaultAsync(f => f.MatchId == matchId);
            
            if (feedback == null)
            {
                return NotFound("No feedback found for this match");
            }
            
            return Ok(new
            {
                feedback.Id,
                feedback.MatchId,
                feedback.Rating,
                feedback.Comments,
                feedback.CreatedAt,
                ProvidedBy = new
                {
                    feedback.ProvidedBy.Id,
                    feedback.ProvidedBy.FirstName,
                    feedback.ProvidedBy.LastName
                }
            });
        }
        
        [HttpGet("buddy/{buddyId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetFeedbackForBuddy(Guid buddyId)
        {
            var feedbacks = await _context.MatchFeedbacks
                .Include(f => f.Match)
                    .ThenInclude(m => m.Newcomer)
                .Include(f => f.ProvidedBy)
                .Where(f => f.Match.BuddyId == buddyId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
            
            var result = feedbacks.Select(f => new
            {
                f.Id,
                f.MatchId,
                f.Rating,
                f.Comments,
                f.CreatedAt,
                Newcomer = new
                {
                    f.Match.Newcomer.Id,
                    f.Match.Newcomer.FirstName,
                    f.Match.Newcomer.LastName
                },
                MatchDuration = f.Match.AcceptedAt.HasValue ? 
                    (f.CreatedAt - f.Match.AcceptedAt.Value).Days : 0
            }).ToList();
            
            return Ok(result);
        }
        
        [HttpGet("stats/buddy/{buddyId}")]
        public async Task<ActionResult<object>> GetBuddyFeedbackStats(Guid buddyId)
        {
            var feedbacks = await _context.MatchFeedbacks
                .Include(f => f.Match)
                .Where(f => f.Match.BuddyId == buddyId)
                .ToListAsync();
            
            if (!feedbacks.Any())
            {
                return Ok(new
                {
                    TotalFeedbacks = 0,
                    AverageRating = 0.0,
                    RatingDistribution = new Dictionary<int, int>(),
                    PositiveFeedbackPercentage = 0.0
                });
            }
            
            var stats = new
            {
                TotalFeedbacks = feedbacks.Count,
                AverageRating = feedbacks.Average(f => f.Rating),
                RatingDistribution = feedbacks.GroupBy(f => f.Rating)
                    .ToDictionary(g => g.Key, g => g.Count()),
                PositiveFeedbackPercentage = (double)feedbacks.Count(f => f.Rating >= 4) / feedbacks.Count * 100,
                RecentFeedbacks = feedbacks.OrderByDescending(f => f.CreatedAt)
                    .Take(5)
                    .Select(f => new
                    {
                        f.Rating,
                        f.Comments,
                        f.CreatedAt
                    })
            };
            
            return Ok(stats);
        }
        
        [HttpGet("stats/overall")]
        public async Task<ActionResult<object>> GetOverallFeedbackStats()
        {
            var feedbacks = await _context.MatchFeedbacks
                .Include(f => f.Match)
                    .ThenInclude(m => m.Buddy)
                .ToListAsync();
            
            if (!feedbacks.Any())
            {
                return Ok(new
                {
                    TotalFeedbacks = 0,
                    AverageRating = 0.0,
                    TopRatedBuddies = new List<object>(),
                    ProgramSatisfactionScore = 0.0
                });
            }
            
            var topBuddies = feedbacks
                .GroupBy(f => new { f.Match.BuddyId, f.Match.Buddy.FirstName, f.Match.Buddy.LastName })
                .Select(g => new
                {
                    BuddyId = g.Key.BuddyId,
                    BuddyName = $"{g.Key.FirstName} {g.Key.LastName}",
                    AverageRating = g.Average(f => f.Rating),
                    FeedbackCount = g.Count()
                })
                .Where(b => b.FeedbackCount >= 2) // Only buddies with at least 2 feedbacks
                .OrderByDescending(b => b.AverageRating)
                .Take(10)
                .ToList();
            
            var stats = new
            {
                TotalFeedbacks = feedbacks.Count,
                AverageRating = feedbacks.Average(f => f.Rating),
                TopRatedBuddies = topBuddies,
                ProgramSatisfactionScore = (double)feedbacks.Count(f => f.Rating >= 4) / feedbacks.Count * 100,
                RatingDistribution = feedbacks.GroupBy(f => f.Rating)
                    .OrderBy(g => g.Key)
                    .ToDictionary(g => g.Key, g => g.Count())
            };
            
            return Ok(stats);
        }
    }
    
    public class SubmitFeedbackRequest
    {
        public Guid MatchId { get; set; }
        public Guid NewcomerId { get; set; }
        public int Rating { get; set; } // 1-5 scale
        public string? Comments { get; set; }
    }
}
