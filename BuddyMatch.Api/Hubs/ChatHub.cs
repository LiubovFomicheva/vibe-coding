using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<ChatHub> _logger;
        
        public ChatHub(BuddyMatchContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        public async Task JoinMatchRoom(string matchId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match_{matchId}");
            _logger.LogInformation("User {ConnectionId} joined match room {MatchId}", 
                Context.ConnectionId, matchId);
        }
        
        public async Task LeaveMatchRoom(string matchId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"match_{matchId}");
            _logger.LogInformation("User {ConnectionId} left match room {MatchId}", 
                Context.ConnectionId, matchId);
        }
        
        public async Task SendMessage(string matchId, string senderId, string content)
        {
            try
            {
                // Validate the match and sender
                var match = await _context.BuddyMatches
                    .FirstOrDefaultAsync(m => m.Id == Guid.Parse(matchId) && 
                        (m.BuddyId == Guid.Parse(senderId) || m.NewcomerId == Guid.Parse(senderId)));
                
                if (match == null || match.Status != MatchStatus.Active)
                {
                    await Clients.Caller.SendAsync("Error", "Invalid match or unauthorized sender");
                    return;
                }
                
                // Save message to database
                var message = new Message
                {
                    Id = Guid.NewGuid(),
                    MatchId = Guid.Parse(matchId),
                    SenderId = Guid.Parse(senderId),
                    Content = content,
                    SentAt = DateTime.UtcNow
                };
                
                _context.Messages.Add(message);
                await _context.SaveChangesAsync();
                
                // Load sender details
                await _context.Entry(message)
                    .Reference(m => m.Sender)
                    .LoadAsync();
                
                // Broadcast message to match room
                await Clients.Group($"match_{matchId}").SendAsync("ReceiveMessage", new
                {
                    Id = message.Id,
                    Content = message.Content,
                    SentAt = message.SentAt,
                    Sender = new
                    {
                        Id = message.Sender.Id,
                        FirstName = message.Sender.FirstName,
                        LastName = message.Sender.LastName,
                        Role = message.Sender.Role.ToString()
                    }
                });
                
                _logger.LogInformation("Real-time message sent from {SenderId} to match {MatchId}", 
                    senderId, matchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time message");
                await Clients.Caller.SendAsync("Error", "Failed to send message");
            }
        }
        
        public async Task UserTyping(string matchId, string senderId, string senderName)
        {
            // Broadcast typing indicator to other users in the match room
            await Clients.GroupExcept($"match_{matchId}", Context.ConnectionId)
                .SendAsync("UserTyping", new { SenderId = senderId, SenderName = senderName });
        }
        
        public async Task UserStoppedTyping(string matchId, string senderId)
        {
            // Broadcast stop typing indicator
            await Clients.GroupExcept($"match_{matchId}", Context.ConnectionId)
                .SendAsync("UserStoppedTyping", new { SenderId = senderId });
        }
        
        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }
        
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
