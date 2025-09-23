using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<AnalyticsController> _logger;
        
        public AnalyticsController(BuddyMatchContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetHRDashboard()
        {
            var now = DateTime.UtcNow;
            var thisMonth = new DateTime(now.Year, now.Month, 1);
            var lastMonth = thisMonth.AddMonths(-1);
            
            // Get all employees with related data
            var allEmployees = await _context.Employees
                .Include(e => e.BuddyProfile)
                .ToListAsync();
            
            var buddyGuides = allEmployees.Where(e => e.IsBuddyGuide).ToList();
            var newcomers = allEmployees.Where(e => e.IsNewcomer).ToList();
            
            // Get matches data
            var allMatches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .ToListAsync();
            
            var activeMatches = allMatches.Where(m => m.Status == MatchStatus.Active).ToList();
            var pendingMatches = allMatches.Where(m => m.Status == MatchStatus.Pending).ToList();
            var completedMatches = allMatches.Where(m => m.Status == MatchStatus.Completed).ToList();
            
            // Get feedback data
            var allFeedback = await _context.MatchFeedbacks.ToListAsync();
            var recentFeedback = allFeedback.Where(f => f.CreatedAt >= lastMonth).ToList();
            
            var dashboard = new
            {
                Overview = new
                {
                    TotalEmployees = allEmployees.Count,
                    TotalBuddyGuides = buddyGuides.Count,
                    TotalNewcomers = newcomers.Count,
                    ActiveMatches = activeMatches.Count,
                    PendingMatches = pendingMatches.Count,
                    CompletedMatches = completedMatches.Count,
                    AverageFeedbackRating = allFeedback.Any() ? allFeedback.Average(f => f.Rating) : 0
                },
                
                MonthlyTrends = new
                {
                    NewMatchesThisMonth = allMatches.Count(m => m.CreatedAt >= thisMonth),
                    NewMatchesLastMonth = allMatches.Count(m => m.CreatedAt >= lastMonth && m.CreatedAt < thisMonth),
                    CompletedThisMonth = allMatches.Count(m => m.CompletedAt >= thisMonth),
                    FeedbackThisMonth = recentFeedback.Count
                },
                
                BuddyUtilization = buddyGuides.Select(bg => new
                {
                    BuddyId = bg.Id,
                    Name = $"{bg.FirstName} {bg.LastName}",
                    Location = bg.Location,
                    Unit = bg.Unit,
                    ActiveMatches = activeMatches.Count(m => m.BuddyId == bg.Id),
                    TotalMatches = allMatches.Count(m => m.BuddyId == bg.Id),
                    MaxCapacity = bg.BuddyProfile?.MaxActiveBuddies ?? 3,
                    UtilizationRate = bg.BuddyProfile?.MaxActiveBuddies > 0 ? 
                        (double)activeMatches.Count(m => m.BuddyId == bg.Id) / (bg.BuddyProfile?.MaxActiveBuddies ?? 3) * 100 : 0,
                    AverageRating = allFeedback.Where(f => allMatches.Any(m => m.Id == f.MatchId && m.BuddyId == bg.Id))
                        .Any() ? allFeedback.Where(f => allMatches.Any(m => m.Id == f.MatchId && m.BuddyId == bg.Id))
                        .Average(f => f.Rating) : 0
                }).OrderByDescending(b => b.UtilizationRate),
                
                LocationDistribution = allEmployees.GroupBy(e => e.Location)
                    .Select(g => new
                    {
                        Location = g.Key,
                        TotalEmployees = g.Count(),
                        BuddyGuides = g.Count(e => e.IsBuddyGuide),
                        Newcomers = g.Count(e => e.IsNewcomer),
                        ActiveMatches = activeMatches.Count(m => g.Any(e => e.Id == m.BuddyId || e.Id == m.NewcomerId))
                    }),
                
                TechStackMatching = allMatches.Where(m => m.Status == MatchStatus.Active || m.Status == MatchStatus.Completed)
                    .GroupBy(m => new
                    {
                        BuddyTechStack = m.Buddy.TechStack,
                        NewcomerTechStack = m.Newcomer.TechStack
                    })
                    .Select(g => new
                    {
                        BuddyTechStack = g.Key.BuddyTechStack,
                        NewcomerTechStack = g.Key.NewcomerTechStack,
                        MatchCount = g.Count(),
                        AverageCompatibility = g.Average(m => m.CompatibilityScore),
                        SuccessRate = allFeedback.Where(f => g.Any(m => m.Id == f.MatchId)).Any() ?
                            allFeedback.Where(f => g.Any(m => m.Id == f.MatchId)).Average(f => f.Rating) : 0
                    }),
                
                PendingMatchesRequiringAttention = pendingMatches
                    .Where(m => m.CreatedAt <= DateTime.UtcNow.AddDays(-7)) // Pending for more than a week
                    .Select(m => new
                    {
                        m.Id,
                        BuddyName = $"{m.Buddy.FirstName} {m.Buddy.LastName}",
                        NewcomerName = $"{m.Newcomer.FirstName} {m.Newcomer.LastName}",
                        DaysPending = (DateTime.UtcNow - m.CreatedAt).Days,
                        m.CompatibilityScore
                    })
                    .OrderByDescending(m => m.DaysPending),
                
                NewcomerProgress = newcomers.Select(n => new
                {
                    NewcomerId = n.Id,
                    Name = $"{n.FirstName} {n.LastName}",
                    StartDate = n.StartDate,
                    DaysAtCompany = (DateTime.UtcNow - n.StartDate).Days,
                    HasActiveBuddy = activeMatches.Any(m => m.NewcomerId == n.Id),
                    HasCompletedMatch = completedMatches.Any(m => m.NewcomerId == n.Id),
                    HasProvidedFeedback = allFeedback.Any(f => allMatches.Any(m => m.Id == f.MatchId && m.NewcomerId == n.Id)),
                    Unit = n.Unit,
                    Location = n.Location
                }).OrderBy(n => n.StartDate)
            };
            
            return Ok(dashboard);
        }
        
        [HttpGet("matching-performance")]
        public async Task<ActionResult<object>> GetMatchingPerformance()
        {
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .ToListAsync();
            
            var feedback = await _context.MatchFeedbacks.ToListAsync();
            
            var performance = new
            {
                OverallStats = new
                {
                    TotalMatches = matches.Count,
                    AcceptanceRate = matches.Any() ? 
                        (double)matches.Count(m => m.Status == MatchStatus.Active || m.Status == MatchStatus.Completed) / matches.Count * 100 : 0,
                    AverageResponseTime = matches.Where(m => m.AcceptedAt.HasValue)
                        .Any() ? matches.Where(m => m.AcceptedAt.HasValue)
                        .Average(m => (m.AcceptedAt!.Value - m.CreatedAt).TotalHours) : 0,
                    AverageCompatibilityScore = matches.Any() ? matches.Average(m => m.CompatibilityScore) : 0
                },
                
                CompatibilityAnalysis = matches.Where(m => m.Status == MatchStatus.Completed && 
                    feedback.Any(f => f.MatchId == m.Id))
                    .Select(m => new
                    {
                        CompatibilityScore = m.CompatibilityScore,
                        FeedbackRating = feedback.FirstOrDefault(f => f.MatchId == m.Id)?.Rating ?? 0,
                        TechStackMatch = m.Buddy.TechStack.Contains(m.Newcomer.TechStack.Split(',')[0]) ? "High" : "Low",
                        LocationMatch = m.Buddy.Location == m.Newcomer.Location ? "Same" : "Different"
                    }),
                
                MonthlyPerformance = matches.GroupBy(m => new { m.CreatedAt.Year, m.CreatedAt.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        TotalMatches = g.Count(),
                        AcceptedMatches = g.Count(m => m.Status == MatchStatus.Active || m.Status == MatchStatus.Completed),
                        RejectedMatches = g.Count(m => m.Status == MatchStatus.Rejected),
                        PendingMatches = g.Count(m => m.Status == MatchStatus.Pending),
                        AverageCompatibility = g.Average(m => m.CompatibilityScore)
                    })
                    .OrderBy(g => g.Year).ThenBy(g => g.Month)
            };
            
            return Ok(performance);
        }
        
        [HttpGet("buddy-workload")]
        public async Task<ActionResult<object>> GetBuddyWorkloadAnalysis()
        {
            var allEmployees = await _context.Employees
                .Include(e => e.BuddyProfile)
                .ToListAsync();
            
            var buddyGuides = allEmployees.Where(e => e.IsBuddyGuide).ToList();
            
            var matches = await _context.BuddyMatches.ToListAsync();
            var feedback = await _context.MatchFeedbacks.ToListAsync();
            
            var workloadAnalysis = new
            {
                WorkloadDistribution = buddyGuides.Select(bg => new
                {
                    BuddyId = bg.Id,
                    Name = $"{bg.FirstName} {bg.LastName}",
                    Location = bg.Location,
                    Unit = bg.Unit,
                    TechStack = bg.TechStack,
                    MaxCapacity = bg.BuddyProfile?.MaxActiveBuddies ?? 3,
                    CurrentActive = matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Active),
                    TotalCompleted = matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Completed),
                    PendingRequests = matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Pending),
                    OverallRating = feedback.Where(f => matches.Any(m => m.Id == f.MatchId && m.BuddyId == bg.Id))
                        .Any() ? feedback.Where(f => matches.Any(m => m.Id == f.MatchId && m.BuddyId == bg.Id))
                        .Average(f => f.Rating) : 0,
                    IsAtCapacity = matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Active) >= 
                        (bg.BuddyProfile?.MaxActiveBuddies ?? 3),
                    YearsOfExperience = (DateTime.UtcNow - bg.StartDate).TotalDays / 365
                }),
                
                CapacityRecommendations = new
                {
                    OverloadedBuddies = buddyGuides.Where(bg => 
                        matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Active) > 
                        (bg.BuddyProfile?.MaxActiveBuddies ?? 3)).Count(),
                    
                    UnderutilizedBuddies = buddyGuides.Where(bg => 
                        matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Active) < 
                        ((bg.BuddyProfile?.MaxActiveBuddies ?? 3) / 2)).Count(),
                    
                    AvailableBuddies = buddyGuides.Where(bg => 
                        matches.Count(m => m.BuddyId == bg.Id && m.Status == MatchStatus.Active) < 
                        (bg.BuddyProfile?.MaxActiveBuddies ?? 3)).Count()
                }
            };
            
            return Ok(workloadAnalysis);
        }
        
        [HttpGet("reports/monthly/{year}/{month}")]
        public async Task<ActionResult<object>> GetMonthlyReport(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);
            
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Where(m => m.CreatedAt >= startDate && m.CreatedAt < endDate)
                .ToListAsync();
            
            var feedback = await _context.MatchFeedbacks
                .Where(f => f.CreatedAt >= startDate && f.CreatedAt < endDate)
                .ToListAsync();
            
            var report = new
            {
                Period = $"{year}-{month:00}",
                Summary = new
                {
                    NewMatches = matches.Count,
                    SuccessfulMatches = matches.Count(m => m.Status == MatchStatus.Active || m.Status == MatchStatus.Completed),
                    RejectedMatches = matches.Count(m => m.Status == MatchStatus.Rejected),
                    PendingMatches = matches.Count(m => m.Status == MatchStatus.Pending),
                    FeedbackReceived = feedback.Count,
                    AverageFeedbackRating = feedback.Any() ? feedback.Average(f => f.Rating) : 0
                },
                
                TopPerformers = matches.Where(m => feedback.Any(f => f.MatchId == m.Id))
                    .GroupBy(m => new { m.BuddyId, m.Buddy.FirstName, m.Buddy.LastName })
                    .Select(g => new
                    {
                        BuddyName = $"{g.Key.FirstName} {g.Key.LastName}",
                        MatchesCreated = g.Count(),
                        AverageRating = feedback.Where(f => g.Any(m => m.Id == f.MatchId)).Average(f => f.Rating)
                    })
                    .OrderByDescending(b => b.AverageRating)
                    .Take(5),
                
                Challenges = new
                {
                    LongPendingMatches = matches.Where(m => m.Status == MatchStatus.Pending && 
                        (DateTime.UtcNow - m.CreatedAt).Days > 7).Count(),
                    LowRatedMatches = feedback.Count(f => f.Rating <= 2),
                    UnmatchedNewcomers = await _context.Employees
                        .Where(e => e.IsNewcomer && !matches.Any(m => m.NewcomerId == e.Id))
                        .CountAsync()
                }
            };
            
            return Ok(report);
        }
    }
}
