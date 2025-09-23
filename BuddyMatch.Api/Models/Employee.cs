using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class Employee
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Unit { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Team { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Location { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public EmployeeRole Role { get; set; }
        
        // Tech stack as comma-separated values
        [MaxLength(500)]
        public string TechStack { get; set; } = string.Empty;
        
        // Languages as comma-separated values
        [MaxLength(200)]
        public string Languages { get; set; } = string.Empty;
        
        // Personal interests as comma-separated values
        [MaxLength(500)]
        public string Interests { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public BuddyProfile? BuddyProfile { get; set; }
        public ICollection<BuddyMatch> BuddyMatches { get; set; } = new List<BuddyMatch>();
        public ICollection<BuddyMatch> NewcomerMatches { get; set; } = new List<BuddyMatch>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        
        // Business logic properties
        public bool IsBuddyGuide => 
            DateTime.UtcNow.Subtract(StartDate).TotalDays > (3 * 365) && 
            IsA3LevelOrAbove();
        
        public bool IsNewcomer => 
            DateTime.UtcNow.Subtract(StartDate).TotalDays <= (6 * 30);
        
        public string FullName => $"{FirstName} {LastName}";
        
        private bool IsA3LevelOrAbove()
        {
            // Simple title level check - in real system this would be more sophisticated
            var title = Title.ToLower();
            return title.Contains("senior") || 
                   title.Contains("lead") || 
                   title.Contains("principal") || 
                   title.Contains("architect") || 
                   title.Contains("manager") ||
                   title.Contains("director");
        }
    }
    
    public enum EmployeeRole
    {
        HR = 1,
        Employee = 2
    }
}
