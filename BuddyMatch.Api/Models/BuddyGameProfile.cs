using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class BuddyGameProfile
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid BuddyProfileId { get; set; }
        
        public int TotalPoints { get; set; } = 0;
        public int MonthlyPoints { get; set; } = 0;
        public BuddyLevel CurrentLevel { get; set; } = BuddyLevel.Bronze;
        public int StreakDays { get; set; } = 0;
        public DateTime LastActivityDate { get; set; } = DateTime.UtcNow;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public BuddyProfile BuddyProfile { get; set; } = null!;
        public ICollection<Badge> Badges { get; set; } = new List<Badge>();
        public ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
        
        // Business logic
        public int PointsToNextLevel => GetPointsToNextLevel();
        public double LevelProgress => GetLevelProgress();
        
        private int GetPointsToNextLevel()
        {
            return CurrentLevel switch
            {
                BuddyLevel.Bronze => 500 - TotalPoints,
                BuddyLevel.Silver => 1500 - TotalPoints,
                BuddyLevel.Gold => 3000 - TotalPoints,
                BuddyLevel.Platinum => 5000 - TotalPoints,
                BuddyLevel.Diamond => 0, // Max level
                _ => 0
            };
        }
        
        private double GetLevelProgress()
        {
            var (currentThreshold, nextThreshold) = CurrentLevel switch
            {
                BuddyLevel.Bronze => (0, 500),
                BuddyLevel.Silver => (500, 1500),
                BuddyLevel.Gold => (1500, 3000),
                BuddyLevel.Platinum => (3000, 5000),
                BuddyLevel.Diamond => (5000, 5000),
                _ => (0, 500)
            };
            
            if (nextThreshold == currentThreshold) return 1.0;
            return (double)(TotalPoints - currentThreshold) / (nextThreshold - currentThreshold);
        }
        
        public void UpdateLevel()
        {
            CurrentLevel = TotalPoints switch
            {
                >= 5000 => BuddyLevel.Diamond,
                >= 3000 => BuddyLevel.Platinum,
                >= 1500 => BuddyLevel.Gold,
                >= 500 => BuddyLevel.Silver,
                _ => BuddyLevel.Bronze
            };
        }
    }
    
    public enum BuddyLevel
    {
        Bronze = 1,
        Silver = 2,
        Gold = 3,
        Platinum = 4,
        Diamond = 5
    }
}
