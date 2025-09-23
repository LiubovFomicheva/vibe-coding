using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Data
{
    public class BuddyMatchContext : DbContext
    {
        public BuddyMatchContext(DbContextOptions<BuddyMatchContext> options) : base(options)
        {
        }
        
        public DbSet<Employee> Employees { get; set; }
        public DbSet<BuddyProfile> BuddyProfiles { get; set; }
        public DbSet<Models.BuddyMatch> BuddyMatches { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<BuddyGameProfile> BuddyGameProfiles { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<MatchFeedback> MatchFeedbacks { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Employee configuration
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasConversion<int>();
            });
            
            // BuddyProfile configuration
            modelBuilder.Entity<BuddyProfile>(entity =>
            {
                entity.HasKey(bp => bp.Id);
                entity.HasOne(bp => bp.Employee)
                      .WithOne(e => e.BuddyProfile)
                      .HasForeignKey<BuddyProfile>(bp => bp.EmployeeId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            // BuddyMatch configuration
            modelBuilder.Entity<Models.BuddyMatch>(entity =>
            {
                entity.HasKey(bm => bm.Id);
                entity.Property(bm => bm.Status).HasConversion<int>();
                
                entity.HasOne(bm => bm.Buddy)
                      .WithMany(e => e.BuddyMatches)
                      .HasForeignKey(bm => bm.BuddyId)
                      .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(bm => bm.Newcomer)
                      .WithMany(e => e.NewcomerMatches)
                      .HasForeignKey(bm => bm.NewcomerId)
                      .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(bm => bm.CreatedByHR)
                      .WithMany()
                      .HasForeignKey(bm => bm.CreatedByHRId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Message configuration
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Type).HasConversion<int>();
                
                entity.HasOne(m => m.Match)
                      .WithMany(bm => bm.Messages)
                      .HasForeignKey(m => m.MatchId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(m => m.Sender)
                      .WithMany(e => e.SentMessages)
                      .HasForeignKey(m => m.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(m => m.Receiver)
                      .WithMany(e => e.ReceivedMessages)
                      .HasForeignKey(m => m.ReceiverId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // BuddyGameProfile configuration
            modelBuilder.Entity<BuddyGameProfile>(entity =>
            {
                entity.HasKey(bgp => bgp.Id);
                entity.Property(bgp => bgp.CurrentLevel).HasConversion<int>();
                
                entity.HasOne(bgp => bgp.BuddyProfile)
                      .WithOne(bp => bp.GameProfile)
                      .HasForeignKey<BuddyGameProfile>(bgp => bgp.BuddyProfileId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Badge configuration
            modelBuilder.Entity<Badge>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Category).HasConversion<int>();
                
                entity.HasOne(b => b.GameProfile)
                      .WithMany(bgp => bgp.Badges)
                      .HasForeignKey(b => b.GameProfileId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Achievement configuration
            modelBuilder.Entity<Achievement>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.ActivityType).HasConversion<int>();
                entity.Property(a => a.Multiplier).HasPrecision(5, 2); // Fix decimal precision warning
                
                entity.HasOne(a => a.GameProfile)
                      .WithMany(bgp => bgp.Achievements)
                      .HasForeignKey(a => a.GameProfileId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(a => a.RelatedMatch)
                      .WithMany()
                      .HasForeignKey(a => a.RelatedMatchId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
            
            // MatchFeedback configuration
            modelBuilder.Entity<MatchFeedback>(entity =>
            {
                entity.HasKey(mf => mf.Id);
                
                entity.HasOne(mf => mf.Match)
                      .WithMany(bm => bm.Feedback)
                      .HasForeignKey(mf => mf.MatchId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(mf => mf.ProvidedBy)
                      .WithMany()
                      .HasForeignKey(mf => mf.ProvidedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Indexes for performance
            modelBuilder.Entity<Models.BuddyMatch>()
                .HasIndex(bm => bm.Status);
            
            modelBuilder.Entity<Models.BuddyMatch>()
                .HasIndex(bm => bm.CreatedAt);
            
            modelBuilder.Entity<Message>()
                .HasIndex(m => new { m.MatchId, m.SentAt });
            
            modelBuilder.Entity<Employee>()
                .HasIndex(e => new { e.Location, e.Unit, e.Team });
        }
        
        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }
        
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }
        
        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is Employee || e.Entity is BuddyProfile || 
                           e.Entity is Models.BuddyMatch || e.Entity is BuddyGameProfile);
            
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Modified)
                {
                    if (entry.Entity is Employee employee)
                        employee.UpdatedAt = DateTime.UtcNow;
                    else if (entry.Entity is BuddyProfile profile)
                        profile.UpdatedAt = DateTime.UtcNow;
                    else if (entry.Entity is Models.BuddyMatch match)
                        match.UpdatedAt = DateTime.UtcNow;
                    else if (entry.Entity is BuddyGameProfile gameProfile)
                        gameProfile.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}
