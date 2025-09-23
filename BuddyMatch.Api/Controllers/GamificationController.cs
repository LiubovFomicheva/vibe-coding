using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamificationController : ControllerBase
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<GamificationController> _logger;
        
        public GamificationController(BuddyMatchContext context, ILogger<GamificationController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpGet("profile/{buddyProfileId}")]
        public async Task<ActionResult<object>> GetGameProfile(Guid buddyProfileId)
        {
            var gameProfile = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                    .ThenInclude(bp => bp.Employee)
                .Include(bgp => bgp.Badges)
                .Include(bgp => bgp.Achievements)
                .FirstOrDefaultAsync(bgp => bgp.BuddyProfileId == buddyProfileId);
            
            if (gameProfile == null)
            {
                return NotFound("Game profile not found");
            }
            
            var response = new
            {
                gameProfile.Id,
                gameProfile.TotalPoints,
                gameProfile.MonthlyPoints,
                CurrentLevel = gameProfile.CurrentLevel.ToString(),
                gameProfile.StreakDays,
                gameProfile.LastActivityDate,
                PointsToNextLevel = gameProfile.PointsToNextLevel,
                LevelProgress = gameProfile.LevelProgress,
                
                BuddyInfo = new
                {
                    gameProfile.BuddyProfile.Employee.FirstName,
                    gameProfile.BuddyProfile.Employee.LastName,
                    gameProfile.BuddyProfile.Employee.Location,
                    gameProfile.BuddyProfile.Employee.Unit
                },
                
                Badges = gameProfile.Badges.Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Description,
                    b.IconUrl,
                    Category = b.Category.ToString(),
                    b.PointValue,
                    b.EarnedDate
                }).OrderByDescending(b => b.EarnedDate),
                
                RecentAchievements = gameProfile.Achievements
                    .OrderByDescending(a => a.EarnedDate)
                    .Take(5)
                    .Select(a => new
                    {
                        a.Id,
                        ActivityType = a.ActivityType.ToString(),
                        a.PointsAwarded,
                        a.Multiplier,
                        a.EarnedDate,
                        a.Description
                    })
            };
            
            return Ok(response);
        }
        
        [HttpGet("leaderboard/monthly")]
        public async Task<ActionResult<object>> GetMonthlyLeaderboard()
        {
            var currentMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            
            var leaderboard = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                    .ThenInclude(bp => bp.Employee)
                .Include(bgp => bgp.Achievements)
                .ToListAsync();
            
            // Calculate monthly points from achievements
            var monthlyLeaders = leaderboard.Select(bgp => new
            {
                BuddyId = bgp.BuddyProfile.EmployeeId,
                Name = $"{bgp.BuddyProfile.Employee.FirstName} {bgp.BuddyProfile.Employee.LastName}",
                Location = bgp.BuddyProfile.Employee.Location,
                Unit = bgp.BuddyProfile.Employee.Unit,
                MonthlyPoints = bgp.Achievements
                    .Where(a => a.EarnedDate >= currentMonth)
                    .Sum(a => a.PointsAwarded),
                TotalPoints = bgp.TotalPoints,
                CurrentLevel = bgp.CurrentLevel.ToString(),
                BadgeCount = bgp.Badges.Count
            })
            .OrderByDescending(b => b.MonthlyPoints)
            .Take(20)
            .ToList();
            
            var response = new
            {
                Title = "Top Mentors This Month",
                Period = currentMonth.ToString("MMMM yyyy"),
                Leaders = monthlyLeaders.Select((leader, index) => new
                {
                    Rank = index + 1,
                    leader.BuddyId,
                    leader.Name,
                    leader.Location,
                    leader.Unit,
                    leader.MonthlyPoints,
                    leader.TotalPoints,
                    leader.CurrentLevel,
                    leader.BadgeCount
                })
            };
            
            return Ok(response);
        }
        
        [HttpGet("leaderboard/all-time")]
        public async Task<ActionResult<object>> GetAllTimeLeaderboard()
        {
            var leaderboard = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                    .ThenInclude(bp => bp.Employee)
                .Include(bgp => bgp.Badges)
                .OrderByDescending(bgp => bgp.TotalPoints)
                .Take(20)
                .ToListAsync();
            
            var response = new
            {
                Title = "Hall of Fame - All Time Top Mentors",
                Leaders = leaderboard.Select((bgp, index) => new
                {
                    Rank = index + 1,
                    BuddyId = bgp.BuddyProfile.EmployeeId,
                    Name = $"{bgp.BuddyProfile.Employee.FirstName} {bgp.BuddyProfile.Employee.LastName}",
                    Location = bgp.BuddyProfile.Employee.Location,
                    Unit = bgp.BuddyProfile.Employee.Unit,
                    TotalPoints = bgp.TotalPoints,
                    CurrentLevel = bgp.CurrentLevel.ToString(),
                    BadgeCount = bgp.Badges.Count,
                    StreakDays = bgp.StreakDays,
                    LastActivity = bgp.LastActivityDate
                })
            };
            
            return Ok(response);
        }
        
        [HttpGet("leaderboard/rising-stars")]
        public async Task<ActionResult<object>> GetRisingStarsLeaderboard()
        {
            var lastMonth = DateTime.UtcNow.AddMonths(-1);
            var currentMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            
            var profiles = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                    .ThenInclude(bp => bp.Employee)
                .Include(bgp => bgp.Achievements)
                .ToListAsync();
            
            var risingStars = profiles.Select(bgp => new
            {
                BuddyId = bgp.BuddyProfile.EmployeeId,
                Name = $"{bgp.BuddyProfile.Employee.FirstName} {bgp.BuddyProfile.Employee.LastName}",
                Location = bgp.BuddyProfile.Employee.Location,
                Unit = bgp.BuddyProfile.Employee.Unit,
                CurrentMonthPoints = bgp.Achievements
                    .Where(a => a.EarnedDate >= currentMonth)
                    .Sum(a => a.PointsAwarded),
                LastMonthPoints = bgp.Achievements
                    .Where(a => a.EarnedDate >= lastMonth && a.EarnedDate < currentMonth)
                    .Sum(a => a.PointsAwarded),
                TotalPoints = bgp.TotalPoints,
                CurrentLevel = bgp.CurrentLevel.ToString()
            })
            .Where(b => b.LastMonthPoints > 0) // Only include those who were active last month
            .Select(b => new
            {
                b.BuddyId,
                b.Name,
                b.Location,
                b.Unit,
                b.CurrentMonthPoints,
                b.LastMonthPoints,
                b.TotalPoints,
                b.CurrentLevel,
                PointsIncrease = b.CurrentMonthPoints - b.LastMonthPoints,
                GrowthPercentage = b.LastMonthPoints > 0 ? 
                    ((double)(b.CurrentMonthPoints - b.LastMonthPoints) / b.LastMonthPoints) * 100 : 0
            })
            .OrderByDescending(b => b.PointsIncrease)
            .Take(10)
            .ToList();
            
            var response = new
            {
                Title = "Rising Stars - Biggest Point Increase",
                Period = $"Growth from {lastMonth:MMM} to {DateTime.UtcNow:MMM yyyy}",
                Leaders = risingStars.Select((star, index) => new
                {
                    Rank = index + 1,
                    star.BuddyId,
                    star.Name,
                    star.Location,
                    star.Unit,
                    star.CurrentMonthPoints,
                    star.LastMonthPoints,
                    star.PointsIncrease,
                    GrowthPercentage = Math.Round(star.GrowthPercentage, 1),
                    star.CurrentLevel
                })
            };
            
            return Ok(response);
        }
        
        [HttpGet("leaderboard/consistency")]
        public async Task<ActionResult<object>> GetConsistencyLeaderboard()
        {
            var leaderboard = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                    .ThenInclude(bp => bp.Employee)
                .OrderByDescending(bgp => bgp.StreakDays)
                .Take(15)
                .ToListAsync();
            
            var response = new
            {
                Title = "Consistency Champions - Longest Activity Streaks",
                Leaders = leaderboard.Select((bgp, index) => new
                {
                    Rank = index + 1,
                    BuddyId = bgp.BuddyProfile.EmployeeId,
                    Name = $"{bgp.BuddyProfile.Employee.FirstName} {bgp.BuddyProfile.Employee.LastName}",
                    Location = bgp.BuddyProfile.Employee.Location,
                    Unit = bgp.BuddyProfile.Employee.Unit,
                    StreakDays = bgp.StreakDays,
                    LastActivity = bgp.LastActivityDate,
                    TotalPoints = bgp.TotalPoints,
                    CurrentLevel = bgp.CurrentLevel.ToString()
                })
            };
            
            return Ok(response);
        }
        
        [HttpGet("leaderboard/newcomer-heroes")]
        public async Task<ActionResult<object>> GetNewcomerHeroesLeaderboard()
        {
            // Get buddy feedback ratings
            var buddyRatings = await _context.MatchFeedbacks
                .Include(f => f.Match)
                    .ThenInclude(m => m.Buddy)
                .Where(f => f.Rating >= 4) // Only high ratings (4-5)
                .GroupBy(f => new 
                { 
                    BuddyId = f.Match.BuddyId,
                    BuddyName = $"{f.Match.Buddy.FirstName} {f.Match.Buddy.LastName}",
                    Location = f.Match.Buddy.Location,
                    Unit = f.Match.Buddy.Unit
                })
                .Select(g => new
                {
                    g.Key.BuddyId,
                    g.Key.BuddyName,
                    g.Key.Location,
                    g.Key.Unit,
                    HighRatingCount = g.Count(),
                    AverageRating = g.Average(f => f.Rating),
                    TotalFeedbacks = g.Count()
                })
                .Where(b => b.TotalFeedbacks >= 2) // At least 2 feedbacks
                .OrderByDescending(b => b.AverageRating)
                .ThenByDescending(b => b.HighRatingCount)
                .Take(10)
                .ToListAsync();
            
            // Get game profile info for these buddies
            var gameProfiles = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                .Where(bgp => buddyRatings.Any(br => br.BuddyId == bgp.BuddyProfile.EmployeeId))
                .ToListAsync();
            
            var heroes = buddyRatings.Select((buddy, index) => new
            {
                Rank = index + 1,
                buddy.BuddyId,
                Name = buddy.BuddyName,
                buddy.Location,
                buddy.Unit,
                AverageRating = Math.Round(buddy.AverageRating, 2),
                buddy.HighRatingCount,
                buddy.TotalFeedbacks,
                SatisfactionScore = Math.Round((buddy.HighRatingCount / (double)buddy.TotalFeedbacks) * 100, 1),
                CurrentLevel = gameProfiles.FirstOrDefault(gp => gp.BuddyProfile.EmployeeId == buddy.BuddyId)?.CurrentLevel.ToString() ?? "Bronze"
            }).ToList();
            
            var response = new
            {
                Title = "Newcomer Heroes - Highest Satisfaction Scores",
                Description = "Buddies with the best newcomer feedback ratings",
                Leaders = heroes
            };
            
            return Ok(response);
        }
        
        [HttpGet("leaderboard/team-champions")]
        public async Task<ActionResult<object>> GetTeamChampionsLeaderboard()
        {
            var teamPerformance = await _context.BuddyGameProfiles
                .Include(bgp => bgp.BuddyProfile)
                    .ThenInclude(bp => bp.Employee)
                .ToListAsync();
            
            var teamStats = teamPerformance
                .GroupBy(bgp => bgp.BuddyProfile.Employee.Unit)
                .Select(g => new
                {
                    Unit = g.Key,
                    TotalMembers = g.Count(),
                    TotalPoints = g.Sum(bgp => bgp.TotalPoints),
                    AveragePoints = g.Average(bgp => bgp.TotalPoints),
                    TopPerformer = g.OrderByDescending(bgp => bgp.TotalPoints).First(),
                    DiamondMembers = g.Count(bgp => bgp.CurrentLevel == BuddyLevel.Diamond),
                    PlatinumMembers = g.Count(bgp => bgp.CurrentLevel == BuddyLevel.Platinum),
                    ActiveMembers = g.Count(bgp => bgp.LastActivityDate >= DateTime.UtcNow.AddDays(-30))
                })
                .OrderByDescending(t => t.AveragePoints)
                .Take(10)
                .ToList();
            
            var response = new
            {
                Title = "Team Champions - Best Performing Units",
                Description = "Teams ranked by average buddy points per member",
                Leaders = teamStats.Select((team, index) => new
                {
                    Rank = index + 1,
                    TeamName = team.Unit,
                    team.TotalMembers,
                    team.TotalPoints,
                    AveragePoints = Math.Round(team.AveragePoints, 0),
                    TopPerformer = $"{team.TopPerformer.BuddyProfile.Employee.FirstName} {team.TopPerformer.BuddyProfile.Employee.LastName}",
                    TopPerformerPoints = team.TopPerformer.TotalPoints,
                    team.DiamondMembers,
                    team.PlatinumMembers,
                    team.ActiveMembers,
                    ActivityRate = Math.Round((team.ActiveMembers / (double)team.TotalMembers) * 100, 1)
                })
            };
            
            return Ok(response);
        }
        
        [HttpPost("award-points")]
        public async Task<ActionResult> AwardPoints(AwardPointsRequest request)
        {
            var gameProfile = await _context.BuddyGameProfiles
                .FirstOrDefaultAsync(bgp => bgp.BuddyProfileId == request.BuddyProfileId);
            
            if (gameProfile == null)
            {
                return NotFound("Game profile not found");
            }
            
            // Create achievement record
            var achievement = new Achievement
            {
                Id = Guid.NewGuid(),
                GameProfileId = gameProfile.Id,
                ActivityType = request.ActivityType,
                PointsAwarded = request.Points,
                Multiplier = request.Multiplier,
                Description = request.Description ?? GetDefaultActivityDescription(request.ActivityType),
                EarnedDate = DateTime.UtcNow,
                RelatedMatchId = request.RelatedMatchId
            };
            
            _context.Achievements.Add(achievement);
            
            // Update game profile points
            var totalPoints = (int)(request.Points * request.Multiplier);
            gameProfile.TotalPoints += totalPoints;
            gameProfile.MonthlyPoints += totalPoints;
            gameProfile.LastActivityDate = DateTime.UtcNow;
            gameProfile.UpdateLevel(); // Update level based on new points
            gameProfile.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Awarded {Points} points (x{Multiplier}) to buddy profile {BuddyProfileId} for {ActivityType}", 
                request.Points, request.Multiplier, request.BuddyProfileId, request.ActivityType);
            
            return Ok(new
            {
                Message = "Points awarded successfully",
                PointsAwarded = totalPoints,
                NewTotalPoints = gameProfile.TotalPoints,
                NewLevel = gameProfile.CurrentLevel.ToString(),
                AchievementId = achievement.Id
            });
        }
        
        private static string GetDefaultActivityDescription(AchievementType activityType)
        {
            return activityType switch
            {
                AchievementType.MatchAccept => "Accepted a new buddy match",
                AchievementType.SuccessfulCompletion => "Successfully completed a buddy relationship",
                AchievementType.MonthlyFeedback => "Received feedback from newcomer",
                AchievementType.FiveStarRating => "Received high rating from newcomer",
                AchievementType.ThreeMonthRelationship => "Maintained consistent activity",
                AchievementType.PerfectMonth => "Reached an important milestone",
                _ => "Earned points for buddy activity"
            };
        }
    }
    
    public class AwardPointsRequest
    {
        public Guid BuddyProfileId { get; set; }
        public AchievementType ActivityType { get; set; }
        public int Points { get; set; }
        public decimal Multiplier { get; set; } = 1.0m;
        public string? Description { get; set; }
        public Guid? RelatedMatchId { get; set; }
    }
}
