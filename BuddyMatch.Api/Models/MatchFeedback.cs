using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class MatchFeedback
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid MatchId { get; set; }
        
        [Required]
        public Guid ProvidedById { get; set; }
        
        [Range(1, 5)]
        public int OverallRating { get; set; }
        
        [Range(1, 5)]
        public int CommunicationRating { get; set; }
        
        [Range(1, 5)]
        public int HelpfulnessRating { get; set; }
        
        [Range(1, 5)]
        public int CultureIntegrationRating { get; set; }
        
        [MaxLength(2000)]
        public string Comments { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Improvements { get; set; } = string.Empty;
        
        public bool WouldRecommend { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public BuddyMatch Match { get; set; } = null!;
        public Employee ProvidedBy { get; set; } = null!;
        
        // Business logic
        public double AverageRating => 
            (OverallRating + CommunicationRating + HelpfulnessRating + CultureIntegrationRating) / 4.0;
        
        // Alias for compatibility with controllers
        public int Rating => OverallRating;
        
        public bool IsPositiveFeedback => AverageRating >= 4.0;
        public bool IsExcellentFeedback => AverageRating >= 4.5;
    }
}
