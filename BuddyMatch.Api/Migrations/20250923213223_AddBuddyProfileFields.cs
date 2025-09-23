using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuddyMatch.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBuddyProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BuddyLocation",
                table: "BuddyProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuddyTechStack",
                table: "BuddyProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuddyUnit",
                table: "BuddyProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Interests",
                table: "BuddyProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BuddyLocation",
                table: "BuddyProfiles");

            migrationBuilder.DropColumn(
                name: "BuddyTechStack",
                table: "BuddyProfiles");

            migrationBuilder.DropColumn(
                name: "BuddyUnit",
                table: "BuddyProfiles");

            migrationBuilder.DropColumn(
                name: "Interests",
                table: "BuddyProfiles");
        }
    }
}
