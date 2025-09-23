namespace BuddyMatch.Api.Services
{
    public interface INotificationService
    {
        Task SendEmailNotificationAsync(string toEmail, string subject, string body, string? ccEmail = null);
        Task SendTeamsNotificationAsync(string teamsChannelId, string message, string? title = null);
        Task NotifyBuddyOfNewMatchAsync(Guid matchId);
        Task NotifyHROfPendingMatchAsync(Guid matchId);
        Task NotifyHROfRejectedMatchAsync(Guid matchId, string reason);
        Task NotifyHROfNoAvailableBuddiesAsync(Guid newcomerId);
        Task SendMatchAcceptedNotificationAsync(Guid matchId);
        Task SendMatchCompletedNotificationAsync(Guid matchId);
        Task SendFeedbackRequestNotificationAsync(Guid matchId);
        Task SendWeeklyBuddyReminderAsync(Guid buddyId);
        Task SendNewcomerWelcomeNotificationAsync(Guid newcomerId);
    }
}
