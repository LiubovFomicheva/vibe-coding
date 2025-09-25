using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Services
{
    public class MatchingService : IMatchingService
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<MatchingService> _logger;
        
        public MatchingService(BuddyMatchContext context, ILogger<MatchingService> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        public async Task<List<BuddyMatchRecommendation>> GetBuddyRecommendationsAsync(Guid newcomerId, int maxRecommendations = 5)
        {
            var newcomer = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == newcomerId);
                
            if (newcomer == null)
            {
                _logger.LogWarning("Newcomer with ID {NewcomerId} not found", newcomerId);
                return new List<BuddyMatchRecommendation>();
            }
            
            // Get all available buddy profiles
            var allBuddyProfiles = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .Include(bp => bp.BuddyMatches)
                .Where(bp => bp.IsActive)
                .ToListAsync();
                
            var availableBuddies = allBuddyProfiles
                .Where(bp => bp.Employee.IsBuddyGuide)
                .ToList();
            
            var recommendations = new List<BuddyMatchRecommendation>();
            
            foreach (var buddy in availableBuddies)
            {
                var compatibilityScore = await CalculateCompatibilityScoreAsync(buddy.EmployeeId, newcomerId);
                
                var matchingTechStack = GetMatchingItems(
                    buddy.Employee.TechStack, 
                    newcomer.TechStack
                );
                
                var matchingInterests = GetMatchingItems(
                    buddy.Employee.Interests, 
                    newcomer.Interests
                );
                
                var recommendation = new BuddyMatchRecommendation
                {
                    BuddyId = buddy.EmployeeId,
                    BuddyName = buddy.Employee.FullName,
                    Title = buddy.Employee.Title,
                    Unit = buddy.Employee.Unit,
                    Location = buddy.Employee.Location,
                    CompatibilityScore = compatibilityScore,
                    CurrentActiveBuddies = buddy.CurrentActiveBuddies,
                    MaxActiveBuddies = buddy.MaxActiveBuddies,
                    CanAcceptNewBuddy = buddy.CanAcceptNewBuddy,
                    MatchingTechStack = matchingTechStack,
                    MatchingInterests = matchingInterests,
                    ReasonForRecommendation = GenerateRecommendationReason(buddy.Employee, newcomer, compatibilityScore, matchingTechStack, matchingInterests)
                };
                
                recommendations.Add(recommendation);
            }
            
            // Sort by compatibility score and availability
            return recommendations
                .Where(r => r.CanAcceptNewBuddy)
                .OrderByDescending(r => r.CompatibilityScore)
                .ThenByDescending(r => r.MaxActiveBuddies - r.CurrentActiveBuddies)
                .Take(maxRecommendations)
                .ToList();
        }
        
        public async Task<double> CalculateCompatibilityScoreAsync(Guid buddyId, Guid newcomerId)
        {
            var buddy = await _context.Employees.FirstOrDefaultAsync(e => e.Id == buddyId);
            var newcomer = await _context.Employees.FirstOrDefaultAsync(e => e.Id == newcomerId);
            
            if (buddy == null || newcomer == null)
                return 0.0;
            
            double score = 0.0;
            
            // Tech Stack matching (40% weight - highest priority)
            var techStackScore = CalculateStringMatchScore(buddy.TechStack, newcomer.TechStack);
            score += techStackScore * 0.4;
            
            // Location matching (30% weight - second priority)
            var locationScore = buddy.Location.Equals(newcomer.Location, StringComparison.OrdinalIgnoreCase) ? 1.0 : 0.3;
            score += locationScore * 0.3;
            
            // Interests matching (20% weight - third priority)
            var interestsScore = CalculateStringMatchScore(buddy.Interests, newcomer.Interests);
            score += interestsScore * 0.2;
            
            // Language matching (10% weight)
            var languageScore = CalculateStringMatchScore(buddy.Languages, newcomer.Languages);
            score += languageScore * 0.1;
            
            // Bonus factors
            // Same team bonus
            if (buddy.Team.Equals(newcomer.Team, StringComparison.OrdinalIgnoreCase))
                score += 0.1;
            
            // Same unit bonus
            if (buddy.Unit.Equals(newcomer.Unit, StringComparison.OrdinalIgnoreCase))
                score += 0.05;
            
            // Ensure score is between 0 and 1
            return Math.Min(1.0, Math.Max(0.0, score));
        }
        
        public async Task<Models.BuddyMatch> CreateMatchAsync(Guid buddyId, Guid newcomerId, Guid hrId, string notes = "", double? compatibilityScore = null)
        {
            // Use provided compatibility score if available, otherwise calculate it
            var finalCompatibilityScore = compatibilityScore ?? await CalculateCompatibilityScoreAsync(buddyId, newcomerId);
            
            // Convert from percentage (0-100) to decimal (0-1) if needed
            if (finalCompatibilityScore > 1.0)
            {
                finalCompatibilityScore = finalCompatibilityScore / 100.0;
            }
            
            var match = new Models.BuddyMatch
            {
                Id = Guid.NewGuid(),
                BuddyId = buddyId,
                NewcomerId = newcomerId,
                CreatedByHRId = hrId,
                Status = MatchStatus.Pending,
                CompatibilityScore = finalCompatibilityScore,
                Notes = notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.BuddyMatches.Add(match);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Created match {MatchId} between buddy {BuddyId} and newcomer {NewcomerId} with score {Score} (provided: {ProvidedScore})", 
                match.Id, buddyId, newcomerId, finalCompatibilityScore, compatibilityScore);
            
            return match;
        }
        
        public async Task<bool> AcceptMatchAsync(Guid matchId, Guid buddyId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .ThenInclude(b => b.BuddyProfile)
                .FirstOrDefaultAsync(m => m.Id == matchId && m.BuddyId == buddyId);
            
            if (match == null || match.Status != MatchStatus.Pending)
                return false;
            
            // Check if buddy can still accept new matches
            if (match.Buddy.BuddyProfile?.CanAcceptNewBuddy != true)
                return false;
            
            match.Status = MatchStatus.Active;
            match.AcceptedAt = DateTime.UtcNow;
            match.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Match {MatchId} accepted by buddy {BuddyId}", matchId, buddyId);
            
            return true;
        }
        
        public async Task<bool> RejectMatchAsync(Guid matchId, Guid buddyId, string reason = "")
        {
            var match = await _context.BuddyMatches
                .FirstOrDefaultAsync(m => m.Id == matchId && m.BuddyId == buddyId);
            
            if (match == null || match.Status != MatchStatus.Pending)
                return false;
            
            match.Status = MatchStatus.Rejected;
            match.RejectedAt = DateTime.UtcNow;
            match.UpdatedAt = DateTime.UtcNow;
            match.Notes += string.IsNullOrEmpty(reason) ? "" : $"\nRejection reason: {reason}";
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Match {MatchId} rejected by buddy {BuddyId}. Reason: {Reason}", matchId, buddyId, reason);
            
            return true;
        }
        
        private double CalculateStringMatchScore(string str1, string str2)
        {
            if (string.IsNullOrWhiteSpace(str1) || string.IsNullOrWhiteSpace(str2))
                return 0.0;
            
            var items1 = str1.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().ToLowerInvariant())
                .ToHashSet();
            
            var items2 = str2.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().ToLowerInvariant())
                .ToHashSet();
            
            if (items1.Count == 0 || items2.Count == 0)
                return 0.0;
            
            var intersection = items1.Intersect(items2).Count();
            var union = items1.Union(items2).Count();
            
            // Jaccard similarity coefficient
            return union > 0 ? (double)intersection / union : 0.0;
        }
        
        private List<string> GetMatchingItems(string str1, string str2)
        {
            if (string.IsNullOrWhiteSpace(str1) || string.IsNullOrWhiteSpace(str2))
                return new List<string>();
            
            var items1 = str1.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            
            var items2 = str2.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            
            return items1.Intersect(items2, StringComparer.OrdinalIgnoreCase).ToList();
        }
        
        private string GenerateRecommendationReason(Employee buddy, Employee newcomer, double score, List<string> matchingTech, List<string> matchingInterests)
        {
            var reasons = new List<string>();
            
            if (matchingTech.Any())
                reasons.Add($"Shared tech expertise: {string.Join(", ", matchingTech.Take(3))}");
            
            if (buddy.Location.Equals(newcomer.Location, StringComparison.OrdinalIgnoreCase))
                reasons.Add("Same location");
            
            if (buddy.Team.Equals(newcomer.Team, StringComparison.OrdinalIgnoreCase))
                reasons.Add("Same team");
            else if (buddy.Unit.Equals(newcomer.Unit, StringComparison.OrdinalIgnoreCase))
                reasons.Add("Same unit");
            
            if (matchingInterests.Any())
                reasons.Add($"Common interests: {string.Join(", ", matchingInterests.Take(2))}");
            
            if (score >= 0.8)
                reasons.Add("Excellent compatibility match");
            else if (score >= 0.6)
                reasons.Add("Good compatibility match");
            
            return reasons.Any() ? string.Join(" • ", reasons) : "Available mentor";
        }
    }
}
