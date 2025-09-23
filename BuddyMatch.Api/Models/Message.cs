using System.ComponentModel.DataAnnotations;

namespace BuddyMatch.Api.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid MatchId { get; set; }
        
        [Required]
        public Guid SenderId { get; set; }
        
        [Required]
        public Guid ReceiverId { get; set; }
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
        
        public MessageType Type { get; set; } = MessageType.Text;
        
        public bool IsRead { get; set; } = false;
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        // Navigation properties
        public BuddyMatch Match { get; set; } = null!;
        public Employee Sender { get; set; } = null!;
        public Employee Receiver { get; set; } = null!;
    }
    
    public enum MessageType
    {
        Text = 1,
        MeetingScheduled = 2,
        SystemNotification = 3
    }
}
