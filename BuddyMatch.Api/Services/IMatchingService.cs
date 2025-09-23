using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Services
{
    public interface IMatchingService
    {
        Task<List<BuddyMatchRecommendation>> GetBuddyRecommendationsAsync(Guid newcomerId, int maxRecommendations = 5);
        Task<double> CalculateCompatibilityScoreAsync(Guid buddyId, Guid newcomerId);
        Task<Models.BuddyMatch> CreateMatchAsync(Guid buddyId, Guid newcomerId, Guid hrId, string notes = "");
        Task<bool> AcceptMatchAsync(Guid matchId, Guid buddyId);
        Task<bool> RejectMatchAsync(Guid matchId, Guid buddyId, string reason = "");
    }
    
    public class BuddyMatchRecommendation
    {
        public Guid BuddyId { get; set; }
        public string BuddyName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public double CompatibilityScore { get; set; }
        public int CurrentActiveBuddies { get; set; }
        public int MaxActiveBuddies { get; set; }
        public bool CanAcceptNewBuddy { get; set; }
        public List<string> MatchingTechStack { get; set; } = new();
        public List<string> MatchingInterests { get; set; } = new();
        public string ReasonForRecommendation { get; set; } = string.Empty;
    }
}
