using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<NotificationService> _logger;
        
        public NotificationService(BuddyMatchContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        public async Task SendEmailNotificationAsync(string toEmail, string subject, string body, string? ccEmail = null)
        {
            // Mock implementation for MVP - log instead of actually sending
            _logger.LogInformation("📧 EMAIL NOTIFICATION");
            _logger.LogInformation("To: {ToEmail}", toEmail);
            if (!string.IsNullOrEmpty(ccEmail))
            {
                _logger.LogInformation("CC: {CcEmail}", ccEmail);
            }
            _logger.LogInformation("Subject: {Subject}", subject);
            _logger.LogInformation("Body: {Body}", body);
            _logger.LogInformation("────────────────────────────────");
            
            // In production, this would integrate with an email service like SendGrid, SMTP, etc.
            await Task.Delay(100); // Simulate async operation
        }
        
        public async Task SendTeamsNotificationAsync(string teamsChannelId, string message, string? title = null)
        {
            // Mock implementation for MVP - log instead of actually sending
            _logger.LogInformation("💬 TEAMS NOTIFICATION");
            _logger.LogInformation("Channel: {ChannelId}", teamsChannelId);
            if (!string.IsNullOrEmpty(title))
            {
                _logger.LogInformation("Title: {Title}", title);
            }
            _logger.LogInformation("Message: {Message}", message);
            _logger.LogInformation("────────────────────────────────");
            
            // In production, this would integrate with Microsoft Teams webhook or Graph API
            await Task.Delay(100); // Simulate async operation
        }
        
        public async Task NotifyBuddyOfNewMatchAsync(Guid matchId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.CreatedByHR)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null)
            {
                _logger.LogWarning("Match {MatchId} not found for buddy notification", matchId);
                return;
            }
            
            var subject = "🤝 New Buddy Match Request - Action Required";
            var body = $@"
Hello {match.Buddy.FirstName},

You have a new buddy match request from HR!

NEWCOMER DETAILS:
• Name: {match.Newcomer.FirstName} {match.Newcomer.LastName}
• Start Date: {match.Newcomer.StartDate:MMM dd, yyyy}
• Location: {match.Newcomer.Location}
• Unit: {match.Newcomer.Unit}
• Tech Stack: {match.Newcomer.TechStack}
• Languages: {match.Newcomer.Languages}

COMPATIBILITY SCORE: {match.CompatibilityScore:F1}%

NOTES FROM HR: {match.Notes}

Please review this request and respond within 7 days.
Visit the BuddyMatch portal to accept or decline this match.

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(match.Buddy.Email, subject, body, match.CreatedByHR.Email);
            
            // Also send Teams notification to buddy's team channel
            var teamsMessage = $"🤝 New buddy match request for {match.Buddy.FirstName}! Newcomer: {match.Newcomer.FirstName} {match.Newcomer.LastName} (Compatibility: {match.CompatibilityScore:F1}%)";
            await SendTeamsNotificationAsync($"team-{match.Buddy.Unit.ToLower()}", teamsMessage, "Buddy Match Request");
        }
        
        public async Task NotifyHROfPendingMatchAsync(Guid matchId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.CreatedByHR)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null) return;
            
            var daysPending = (DateTime.UtcNow - match.CreatedAt).Days;
            
            var subject = $"⚠️ Buddy Match Pending for {daysPending} days - Follow-up Required";
            var body = $@"
Hello HR Team,

A buddy match request has been pending for {daysPending} days and may need your attention.

MATCH DETAILS:
• Buddy: {match.Buddy.FirstName} {match.Buddy.LastName}
• Newcomer: {match.Newcomer.FirstName} {match.Newcomer.LastName}
• Created: {match.CreatedAt:MMM dd, yyyy}
• Compatibility Score: {match.CompatibilityScore:F1}%

RECOMMENDED ACTIONS:
1. Follow up with the buddy directly
2. Consider alternative buddy options
3. Check if the buddy is overloaded

Visit the BuddyMatch portal for more details and alternative matches.

Best regards,
BuddyMatch System
";
            
            await SendEmailNotificationAsync(match.CreatedByHR.Email, subject, body);
            await SendTeamsNotificationAsync("hr-buddymatch", $"⚠️ Match pending for {daysPending} days: {match.Buddy.FirstName} → {match.Newcomer.FirstName}", "Pending Match Alert");
        }
        
        public async Task NotifyHROfRejectedMatchAsync(Guid matchId, string reason)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.CreatedByHR)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null) return;
            
            var subject = "❌ Buddy Match Rejected - Alternative Needed";
            var body = $@"
Hello HR Team,

A buddy match request has been rejected and requires your attention.

MATCH DETAILS:
• Buddy: {match.Buddy.FirstName} {match.Buddy.LastName}
• Newcomer: {match.Newcomer.FirstName} {match.Newcomer.LastName}
• Rejection Reason: {reason}
• Rejected At: {DateTime.UtcNow:MMM dd, yyyy HH:mm}

NEXT STEPS:
Please find an alternative buddy for {match.Newcomer.FirstName} {match.Newcomer.LastName}.

The system will provide new recommendations when you visit the matching portal.

Best regards,
BuddyMatch System
";
            
            await SendEmailNotificationAsync(match.CreatedByHR.Email, subject, body);
            await SendTeamsNotificationAsync("hr-buddymatch", $"❌ Match rejected: {match.Buddy.FirstName} declined {match.Newcomer.FirstName}. Reason: {reason}", "Match Rejected");
        }
        
        public async Task NotifyHROfNoAvailableBuddiesAsync(Guid newcomerId)
        {
            var newcomer = await _context.Employees.FindAsync(newcomerId);
            if (newcomer == null) return;
            
            var hrUsers = await _context.Employees
                .Where(e => e.Role == EmployeeRole.HR)
                .ToListAsync();
            
            var subject = "🚨 No Available Buddies - Urgent Action Required";
            var body = $@"
Hello HR Team,

URGENT: We have a newcomer without available buddy options.

NEWCOMER DETAILS:
• Name: {newcomer.FirstName} {newcomer.LastName}
• Start Date: {newcomer.StartDate:MMM dd, yyyy}
• Location: {newcomer.Location}
• Unit: {newcomer.Unit}
• Tech Stack: {newcomer.TechStack}

RECOMMENDED ACTIONS:
1. Review buddy capacity limits
2. Recruit new buddy volunteers
3. Consider cross-team/cross-location matches
4. Temporarily increase buddy capacity

This situation requires immediate attention to ensure proper onboarding support.

Best regards,
BuddyMatch System
";
            
            foreach (var hrUser in hrUsers)
            {
                await SendEmailNotificationAsync(hrUser.Email, subject, body);
            }
            
            await SendTeamsNotificationAsync("hr-buddymatch", $"🚨 URGENT: No available buddies for newcomer {newcomer.FirstName} {newcomer.LastName}", "Critical Buddy Shortage");
        }
        
        public async Task SendMatchAcceptedNotificationAsync(Guid matchId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.CreatedByHR)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null) return;
            
            // Notify newcomer
            var newcomerSubject = "🎉 Your Buddy Has Been Assigned!";
            var newcomerBody = $@"
Hello {match.Newcomer.FirstName},

Great news! Your buddy has accepted the match and is ready to help you settle in.

YOUR BUDDY:
• Name: {match.Buddy.FirstName} {match.Buddy.LastName}
• Location: {match.Buddy.Location}
• Unit: {match.Buddy.Unit}
• Email: {match.Buddy.Email}
• Years at Company: {(DateTime.UtcNow - match.Buddy.StartDate).TotalDays / 365:F1}

NEXT STEPS:
1. Your buddy will reach out to you soon
2. You can also message them through the BuddyMatch portal
3. Schedule your first meeting within the next week

We're excited to have you on board and hope this buddy relationship helps you settle in quickly!

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(match.Newcomer.Email, newcomerSubject, newcomerBody, match.CreatedByHR.Email);
            
            // Notify HR
            var hrSubject = "✅ Buddy Match Accepted";
            var hrBody = $@"
Good news! A buddy match has been accepted.

MATCH DETAILS:
• Buddy: {match.Buddy.FirstName} {match.Buddy.LastName}
• Newcomer: {match.Newcomer.FirstName} {match.Newcomer.LastName}
• Accepted: {DateTime.UtcNow:MMM dd, yyyy HH:mm}
• Compatibility Score: {match.CompatibilityScore:F1}%

The match is now active and both parties have been notified.

Best regards,
BuddyMatch System
";
            
            await SendEmailNotificationAsync(match.CreatedByHR.Email, hrSubject, hrBody);
            await SendTeamsNotificationAsync("hr-buddymatch", $"✅ Match accepted: {match.Buddy.FirstName} ↔ {match.Newcomer.FirstName}", "Match Success");
        }
        
        public async Task SendMatchCompletedNotificationAsync(Guid matchId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null) return;
            
            var subject = "🏆 Buddy Match Completed - Feedback Requested";
            var body = $@"
Hello {match.Newcomer.FirstName},

Your buddy relationship with {match.Buddy.FirstName} {match.Buddy.LastName} has officially completed!

We hope this experience has been valuable in helping you settle into your role and the company culture.

PLEASE PROVIDE FEEDBACK:
Your feedback helps us improve the buddy program and recognize outstanding mentors.
Visit the BuddyMatch portal to rate your experience and leave comments.

Thank you for participating in the BuddyMatch program!

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(match.Newcomer.Email, subject, body);
            
            // Notify buddy of completion
            var buddySubject = "🏆 Buddy Match Completed - Thank You!";
            var buddyBody = $@"
Hello {match.Buddy.FirstName},

Your buddy relationship with {match.Newcomer.FirstName} {match.Newcomer.LastName} has officially completed.

Thank you for your dedication and support in helping a newcomer integrate into our company!

Your contribution to the BuddyMatch program is greatly appreciated and helps create a welcoming environment for all new employees.

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(match.Buddy.Email, buddySubject, buddyBody);
        }
        
        public async Task SendFeedbackRequestNotificationAsync(Guid matchId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null) return;
            
            var subject = "📝 Buddy Program Feedback Request";
            var body = $@"
Hello {match.Newcomer.FirstName},

We'd love to hear about your experience with your buddy {match.Buddy.FirstName} {match.Buddy.LastName}!

Your feedback is valuable and helps us:
• Improve the buddy program
• Recognize outstanding mentors
• Better match future newcomers

Please take a few minutes to rate your experience and share any comments.
Visit the BuddyMatch portal to submit your feedback.

Thank you for your time!

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(match.Newcomer.Email, subject, body);
        }
        
        public async Task SendWeeklyBuddyReminderAsync(Guid buddyId)
        {
            var buddy = await _context.Employees
                .Include(e => e.BuddyProfile)
                .FirstOrDefaultAsync(e => e.Id == buddyId);
            
            if (buddy == null) return;
            
            var activeMatches = await _context.BuddyMatches
                .Include(m => m.Newcomer)
                .Where(m => m.BuddyId == buddyId && m.Status == MatchStatus.Active)
                .ToListAsync();
            
            if (!activeMatches.Any()) return;
            
            var subject = "📅 Weekly Buddy Reminder - Check in with Your Newcomers";
            var body = $@"
Hello {buddy.FirstName},

This is your weekly reminder to check in with your active newcomers:

YOUR CURRENT NEWCOMERS:
{string.Join("\n", activeMatches.Select(m => $"• {m.Newcomer.FirstName} {m.Newcomer.LastName} - Started {m.Newcomer.StartDate:MMM dd}"))}

SUGGESTED ACTIVITIES:
• Send a quick message to see how they're doing
• Schedule a coffee chat or lunch
• Share helpful resources or team insights
• Introduce them to other team members

Your support makes a real difference in their onboarding experience!

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(buddy.Email, subject, body);
        }
        
        public async Task SendNewcomerWelcomeNotificationAsync(Guid newcomerId)
        {
            var newcomer = await _context.Employees.FindAsync(newcomerId);
            if (newcomer == null) return;
            
            var subject = "🎉 Welcome to the BuddyMatch Program!";
            var body = $@"
Hello {newcomer.FirstName},

Welcome to the company! We're excited to have you join our team.

You've been enrolled in our BuddyMatch program, which will pair you with an experienced colleague who will help you:
• Navigate your first few months
• Understand company culture
• Answer questions about processes and tools
• Introduce you to key team members
• Provide general support and guidance

WHAT HAPPENS NEXT:
1. Our HR team will match you with a suitable buddy
2. Your buddy will reach out to introduce themselves
3. You can communicate through email or our internal messaging system
4. At the end of the program, we'll ask for your feedback

If you have any questions about the buddy program, please don't hesitate to reach out to HR.

Welcome aboard!

Best regards,
HR Team
";
            
            await SendEmailNotificationAsync(newcomer.Email, subject, body);
            await SendTeamsNotificationAsync("hr-buddymatch", $"🎉 New newcomer enrolled: {newcomer.FirstName} {newcomer.LastName} ({newcomer.Unit})", "New Participant");
        }
    }
}
