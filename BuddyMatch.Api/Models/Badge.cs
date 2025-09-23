using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class Badge
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid GameProfileId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public BadgeCategory Category { get; set; }
        
        [MaxLength(200)]
        public string IconUrl { get; set; } = string.Empty;
        
        public int PointValue { get; set; }
        
        public DateTime EarnedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public BuddyGameProfile GameProfile { get; set; } = null!;
    }
    
    public enum BadgeCategory
    {
        Mentorship = 1,
        Expertise = 2,
        Special = 3,
        Achievement = 4
    }
    
    // Static badge definitions
    public static class BadgeDefinitions
    {
        public static readonly Dictionary<string, (string Name, string Description, BadgeCategory Category, int Points)> Badges = new()
        {
            // Mentorship Excellence
            ["first_steps"] = ("First Steps Guide", "Successfully onboard first newcomer", BadgeCategory.Mentorship, 100),
            ["master_mentor"] = ("Master Mentor", "5+ successful buddy relationships", BadgeCategory.Mentorship, 500),
            ["legend"] = ("Legend", "10+ successful buddy relationships", BadgeCategory.Mentorship, 1000),
            ["speed_demon"] = ("Speed Demon", "Accept match requests within 2 hours", BadgeCategory.Mentorship, 200),
            ["long_hauler"] = ("Long Hauler", "Maintain buddy relationship for full 1 year", BadgeCategory.Mentorship, 800),
            
            // Expertise Badges
            ["tech_guru"] = ("Tech Guru", "Help 3+ newcomers with same tech stack", BadgeCategory.Expertise, 300),
            ["culture_champion"] = ("Culture Champion", "Consistently high culture integration feedback", BadgeCategory.Expertise, 400),
            ["problem_solver"] = ("Problem Solver", "High problem-resolution ratings", BadgeCategory.Expertise, 350),
            ["communication_star"] = ("Communication Star", "Excellent communication feedback scores", BadgeCategory.Expertise, 300),
            
            // Special Recognition
            ["cross_team"] = ("Cross-Team Ambassador", "Successfully mentor across different teams", BadgeCategory.Special, 250),
            ["global_connector"] = ("Global Connector", "Mentor across different locations", BadgeCategory.Special, 300),
            ["feedback_master"] = ("Feedback Master", "Provide detailed, helpful feedback consistently", BadgeCategory.Special, 200)
        };
    }
}
