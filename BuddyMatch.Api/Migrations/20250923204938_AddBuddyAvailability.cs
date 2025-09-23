using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuddyMatch.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBuddyAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Languages = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Interests = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BuddyProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MaxActiveBuddies = table.Column<int>(type: "int", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Specialties = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Availability = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuddyProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuddyProfiles_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BuddyGameProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BuddyProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalPoints = table.Column<int>(type: "int", nullable: false),
                    MonthlyPoints = table.Column<int>(type: "int", nullable: false),
                    CurrentLevel = table.Column<int>(type: "int", nullable: false),
                    StreakDays = table.Column<int>(type: "int", nullable: false),
                    LastActivityDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuddyGameProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuddyGameProfiles_BuddyProfiles_BuddyProfileId",
                        column: x => x.BuddyProfileId,
                        principalTable: "BuddyProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BuddyMatches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BuddyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NewcomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByHRId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CompatibilityScore = table.Column<double>(type: "float", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BuddyProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuddyMatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuddyMatches_BuddyProfiles_BuddyProfileId",
                        column: x => x.BuddyProfileId,
                        principalTable: "BuddyProfiles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BuddyMatches_Employees_BuddyId",
                        column: x => x.BuddyId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BuddyMatches_Employees_CreatedByHRId",
                        column: x => x.CreatedByHRId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BuddyMatches_Employees_NewcomerId",
                        column: x => x.NewcomerId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Badges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    EarnedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Badges_BuddyGameProfiles_GameProfileId",
                        column: x => x.GameProfileId,
                        principalTable: "BuddyGameProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Achievements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityType = table.Column<int>(type: "int", nullable: false),
                    PointsAwarded = table.Column<int>(type: "int", nullable: false),
                    Multiplier = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    RelatedMatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EarnedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Achievements_BuddyGameProfiles_GameProfileId",
                        column: x => x.GameProfileId,
                        principalTable: "BuddyGameProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Achievements_BuddyMatches_RelatedMatchId",
                        column: x => x.RelatedMatchId,
                        principalTable: "BuddyMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MatchFeedbacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProvidedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OverallRating = table.Column<int>(type: "int", nullable: false),
                    CommunicationRating = table.Column<int>(type: "int", nullable: false),
                    HelpfulnessRating = table.Column<int>(type: "int", nullable: false),
                    CultureIntegrationRating = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Improvements = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    WouldRecommend = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchFeedbacks_BuddyMatches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "BuddyMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchFeedbacks_Employees_ProvidedById",
                        column: x => x.ProvidedById,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_BuddyMatches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "BuddyMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Messages_Employees_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Messages_Employees_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Achievements_GameProfileId",
                table: "Achievements",
                column: "GameProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Achievements_RelatedMatchId",
                table: "Achievements",
                column: "RelatedMatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Badges_GameProfileId",
                table: "Badges",
                column: "GameProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyGameProfiles_BuddyProfileId",
                table: "BuddyGameProfiles",
                column: "BuddyProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BuddyMatches_BuddyId",
                table: "BuddyMatches",
                column: "BuddyId");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyMatches_BuddyProfileId",
                table: "BuddyMatches",
                column: "BuddyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyMatches_CreatedAt",
                table: "BuddyMatches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyMatches_CreatedByHRId",
                table: "BuddyMatches",
                column: "CreatedByHRId");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyMatches_NewcomerId",
                table: "BuddyMatches",
                column: "NewcomerId");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyMatches_Status",
                table: "BuddyMatches",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BuddyProfiles_EmployeeId",
                table: "BuddyProfiles",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Email",
                table: "Employees",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Location_Unit_Team",
                table: "Employees",
                columns: new[] { "Location", "Unit", "Team" });

            migrationBuilder.CreateIndex(
                name: "IX_MatchFeedbacks_MatchId",
                table: "MatchFeedbacks",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchFeedbacks_ProvidedById",
                table: "MatchFeedbacks",
                column: "ProvidedById");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_MatchId_SentAt",
                table: "Messages",
                columns: new[] { "MatchId", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ReceiverId",
                table: "Messages",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId",
                table: "Messages",
                column: "SenderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Achievements");

            migrationBuilder.DropTable(
                name: "Badges");

            migrationBuilder.DropTable(
                name: "MatchFeedbacks");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "BuddyGameProfiles");

            migrationBuilder.DropTable(
                name: "BuddyMatches");

            migrationBuilder.DropTable(
                name: "BuddyProfiles");

            migrationBuilder.DropTable(
                name: "Employees");
        }
    }
}
