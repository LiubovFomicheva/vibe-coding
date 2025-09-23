using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public enum BuddyAvailability
    {
        Low = 1,
        Medium = 2,
        High = 3,
        VeryHigh = 4
    }
    public class BuddyProfile
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid EmployeeId { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [Range(1, 5)]
        public int MaxActiveBuddies { get; set; } = 3;
        
        [MaxLength(1000)]
        public string Bio { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Specialties { get; set; } = string.Empty;
        
        // Buddy-specific location (can override employee location)
        [MaxLength(100)]
        public string? BuddyLocation { get; set; }
        
        // Buddy-specific unit/team (can override employee unit)
        [MaxLength(100)]
        public string? BuddyUnit { get; set; }
        
        // Buddy-specific tech stack (can override employee tech stack)
        [MaxLength(500)]
        public string? BuddyTechStack { get; set; }
        
        // Personal interests for buddy matching
        [MaxLength(500)]
        public string? Interests { get; set; }
        
        public BuddyAvailability Availability { get; set; } = BuddyAvailability.Medium;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Employee Employee { get; set; } = null!;
        public ICollection<BuddyMatch> BuddyMatches { get; set; } = new List<BuddyMatch>();
        public BuddyGameProfile? GameProfile { get; set; }
        
        // Business logic
        public int CurrentActiveBuddies => 
            BuddyMatches.Count(m => m.Status == MatchStatus.Active);
        
        public bool CanAcceptNewBuddy => 
            IsActive && CurrentActiveBuddies < MaxActiveBuddies;
        
        public double AvailabilityScore => 
            MaxActiveBuddies > 0 ? (double)(MaxActiveBuddies - CurrentActiveBuddies) / MaxActiveBuddies : 0;
        
        // Computed properties for effective values (buddy-specific or fallback to employee)
        public string EffectiveLocation => BuddyLocation ?? Employee?.Location ?? string.Empty;
        public string EffectiveUnit => BuddyUnit ?? Employee?.Unit ?? string.Empty;
        public string EffectiveTechStack => BuddyTechStack ?? Employee?.TechStack ?? string.Empty;
        public string EffectiveInterests => Interests ?? Employee?.Interests ?? string.Empty;
    }
}
