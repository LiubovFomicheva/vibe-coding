using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class BuddyMatch
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid BuddyId { get; set; }
        
        [Required]
        public Guid NewcomerId { get; set; }
        
        [Required]
        public Guid CreatedByHRId { get; set; }
        
        [Required]
        public MatchStatus Status { get; set; } = MatchStatus.Pending;
        
        public double CompatibilityScore { get; set; }
        
        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AcceptedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Auto-end dates based on business rules
        public DateTime ExpectedEndDate => CreatedAt.AddMonths(3); // 3 months active period
        public DateTime MaxEndDate => CreatedAt.AddYears(1); // 1 year maximum
        
        // Navigation properties
        public Employee Buddy { get; set; } = null!;
        public Employee Newcomer { get; set; } = null!;
        public Employee CreatedByHR { get; set; } = null!;
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<MatchFeedback> Feedback { get; set; } = new List<MatchFeedback>();
        
        // Business logic
        public bool IsActive => Status == MatchStatus.Active;
        public bool IsPending => Status == MatchStatus.Pending;
        public bool IsExpired => DateTime.UtcNow > MaxEndDate;
        public bool ShouldAutoEnd => DateTime.UtcNow > ExpectedEndDate;
        
        public int DurationInDays => 
            AcceptedAt.HasValue ? (int)(DateTime.UtcNow - AcceptedAt.Value).TotalDays : 0;
    }
    
    public enum MatchStatus
    {
        Pending = 1,
        Active = 2,
        Rejected = 3,
        Completed = 4,
        Expired = 5
    }
}
