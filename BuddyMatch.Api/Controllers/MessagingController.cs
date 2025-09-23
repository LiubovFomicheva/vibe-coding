using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagingController : ControllerBase
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<MessagingController> _logger;
        
        public MessagingController(BuddyMatchContext context, ILogger<MessagingController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpGet("match/{matchId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessagesForMatch(Guid matchId)
        {
            var match = await _context.BuddyMatches
                .Include(m => m.Messages)
                    .ThenInclude(msg => msg.Sender)
                .FirstOrDefaultAsync(m => m.Id == matchId);
            
            if (match == null)
            {
                return NotFound("Match not found");
            }
            
            var messages = match.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.SentAt,
                    Sender = new
                    {
                        m.Sender.Id,
                        m.Sender.FirstName,
                        m.Sender.LastName,
                        m.Sender.Role
                    }
                })
                .ToList();
            
            return Ok(messages);
        }
        
        [HttpPost("send")]
        public async Task<ActionResult<Message>> SendMessage(SendMessageRequest request)
        {
            var match = await _context.BuddyMatches
                .FirstOrDefaultAsync(m => m.Id == request.MatchId && 
                    (m.BuddyId == request.SenderId || m.NewcomerId == request.SenderId));
            
            if (match == null)
            {
                return BadRequest("Match not found or sender is not part of this match");
            }
            
            if (match.Status != MatchStatus.Active)
            {
                return BadRequest("Cannot send messages to inactive matches");
            }
            
            var message = new Message
            {
                Id = Guid.NewGuid(),
                MatchId = request.MatchId,
                SenderId = request.SenderId,
                Content = request.Content,
                SentAt = DateTime.UtcNow
            };
            
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            
            // Load sender details for response
            await _context.Entry(message)
                .Reference(m => m.Sender)
                .LoadAsync();
            
            _logger.LogInformation("Message sent from {SenderId} to match {MatchId}", 
                request.SenderId, request.MatchId);
            
            return Ok(new
            {
                message.Id,
                message.Content,
                message.SentAt,
                Sender = new
                {
                    message.Sender.Id,
                    message.Sender.FirstName,
                    message.Sender.LastName,
                    message.Sender.Role
                }
            });
        }
        
        [HttpGet("conversations/{employeeId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetConversations(Guid employeeId)
        {
            var matches = await _context.BuddyMatches
                .Include(m => m.Buddy)
                .Include(m => m.Newcomer)
                .Include(m => m.Messages)
                .Where(m => (m.BuddyId == employeeId || m.NewcomerId == employeeId) && 
                           m.Status == MatchStatus.Active)
                .ToListAsync();
            
            var conversations = matches.Select(m => new
            {
                MatchId = m.Id,
                OtherPerson = m.BuddyId == employeeId ? 
                    new { m.Newcomer.Id, m.Newcomer.FirstName, m.Newcomer.LastName, m.Newcomer.Role } :
                    new { m.Buddy.Id, m.Buddy.FirstName, m.Buddy.LastName, m.Buddy.Role },
                LastMessage = m.Messages
                    .OrderByDescending(msg => msg.SentAt)
                    .FirstOrDefault(),
                UnreadCount = m.Messages.Count(msg => msg.SenderId != employeeId && msg.SentAt > DateTime.UtcNow.AddDays(-7)), // Mock unread logic
                MatchStatus = m.Status.ToString()
            }).ToList();
            
            return Ok(conversations);
        }
        
        [HttpPost("mark-read")]
        public Task<ActionResult> MarkMessagesAsRead(MarkReadRequest request)
        {
            // This would typically update a read status, but for MVP we'll just return success
            // In a full implementation, we'd have a MessageRead table or ReadAt field
            
            _logger.LogInformation("Messages marked as read for match {MatchId} by user {UserId}", 
                request.MatchId, request.UserId);
            
            return Task.FromResult<ActionResult>(Ok(new { Message = "Messages marked as read" }));
        }
    }
    
    public class SendMessageRequest
    {
        public Guid MatchId { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
    
    public class MarkReadRequest
    {
        public Guid MatchId { get; set; }
        public Guid UserId { get; set; }
    }
}
