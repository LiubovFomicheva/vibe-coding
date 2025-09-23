using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class Achievement
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid GameProfileId { get; set; }
        
        [Required]
        public AchievementType ActivityType { get; set; }
        
        public int PointsAwarded { get; set; }
        public decimal Multiplier { get; set; } = 1.0m;
        
        public Guid? RelatedMatchId { get; set; }
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime EarnedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public BuddyGameProfile GameProfile { get; set; } = null!;
        public BuddyMatch? RelatedMatch { get; set; }
    }
    
    public enum AchievementType
    {
        ProfileComplete = 1,
        MatchAccept = 2,
        FirstWeekCheckIn = 3,
        MonthlyFeedback = 4,
        FiveStarRating = 5,
        ThreeMonthRelationship = 6,
        SuccessfulCompletion = 7,
        CrossTeamMentoring = 8,
        HighPriorityMatch = 9,
        PerfectMonth = 10
    }
    
    // Point system definitions
    public static class PointSystem
    {
        public static readonly Dictionary<AchievementType, int> BasePoints = new()
        {
            [AchievementType.ProfileComplete] = 50,
            [AchievementType.MatchAccept] = 100,
            [AchievementType.FirstWeekCheckIn] = 75,
            [AchievementType.MonthlyFeedback] = 100,
            [AchievementType.FiveStarRating] = 200,
            [AchievementType.ThreeMonthRelationship] = 300,
            [AchievementType.SuccessfulCompletion] = 500,
            [AchievementType.CrossTeamMentoring] = 150, // 1.5x multiplier applied
            [AchievementType.HighPriorityMatch] = 200, // 2x multiplier applied
            [AchievementType.PerfectMonth] = 125 // 1.25x multiplier applied
        };
        
        public static readonly Dictionary<AchievementType, decimal> Multipliers = new()
        {
            [AchievementType.CrossTeamMentoring] = 1.5m,
            [AchievementType.HighPriorityMatch] = 2.0m,
            [AchievementType.PerfectMonth] = 1.25m
        };
    }
}
