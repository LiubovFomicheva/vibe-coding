using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuddiesController : ControllerBase
{
    private readonly BuddyMatchContext _context;
    private readonly ILogger<BuddiesController> _logger;

    public BuddiesController(BuddyMatchContext context, ILogger<BuddiesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/buddies
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BuddyProfile>>> GetBuddyProfiles()
    {
        try
        {
            var buddyProfiles = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .Include(bp => bp.GameProfile)
                    .ThenInclude(gp => gp!.Badges)
                .Include(bp => bp.BuddyMatches)
                .Where(bp => bp.IsActive)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} buddy profiles", buddyProfiles.Count);
            return Ok(buddyProfiles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving buddy profiles");
            return StatusCode(500, new { Message = "Error retrieving buddy profiles", Error = ex.Message });
        }
    }

    // GET: api/buddies/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<BuddyProfile>> GetBuddyProfile(Guid id)
    {
        try
        {
            var buddyProfile = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .Include(bp => bp.GameProfile)
                    .ThenInclude(gp => gp!.Badges)
                .Include(bp => bp.BuddyMatches)
                    .ThenInclude(bm => bm.Newcomer)
                .FirstOrDefaultAsync(bp => bp.Id == id);

            if (buddyProfile == null)
            {
                _logger.LogWarning("Buddy profile with ID {BuddyProfileId} not found", id);
                return NotFound(new { Message = $"Buddy profile with ID {id} not found" });
            }

            _logger.LogInformation("Retrieved buddy profile for {EmployeeName}", 
                $"{buddyProfile.Employee.FirstName} {buddyProfile.Employee.LastName}");
            
            return Ok(buddyProfile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving buddy profile {BuddyProfileId}", id);
            return StatusCode(500, new { Message = "Error retrieving buddy profile", Error = ex.Message });
        }
    }

    // POST: api/buddies/employee/{employeeId}
    [HttpPost("employee/{employeeId}")]
    public async Task<ActionResult<BuddyProfile>> CreateBuddyProfile(Guid employeeId, [FromBody] CreateBuddyProfileRequest request)
    {
        try
        {
            _logger.LogInformation("Creating buddy profile for employee ID: {EmployeeId}", employeeId);

            // Check if employee exists
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                return NotFound(new { Message = $"Employee with ID {employeeId} not found" });
            }

            // Check if buddy profile already exists
            var existingProfile = await _context.BuddyProfiles.FirstOrDefaultAsync(bp => bp.EmployeeId == employeeId);
            if (existingProfile != null)
            {
                return Conflict(new { Message = "Buddy profile already exists for this employee" });
            }

            // Create new buddy profile
            var buddyProfile = new BuddyProfile
            {
                Id = Guid.NewGuid(),
                EmployeeId = employeeId,
                Bio = request.Bio,
                Specialties = request.Specialties,
                BuddyLocation = string.IsNullOrWhiteSpace(request.BuddyLocation) ? null : request.BuddyLocation,
                BuddyUnit = string.IsNullOrWhiteSpace(request.BuddyUnit) ? null : request.BuddyUnit,
                BuddyTechStack = string.IsNullOrWhiteSpace(request.BuddyTechStack) ? null : request.BuddyTechStack,
                Interests = string.IsNullOrWhiteSpace(request.Interests) ? null : request.Interests,
                Availability = request.Availability,
                MaxActiveBuddies = request.MaxActiveBuddies,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BuddyProfiles.Add(buddyProfile);
            await _context.SaveChangesAsync();

            // Reload with includes
            var createdProfile = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .Include(bp => bp.GameProfile)
                    .ThenInclude(gp => gp!.Badges)
                .FirstAsync(bp => bp.Id == buddyProfile.Id);

            _logger.LogInformation("Successfully created buddy profile {ProfileId} for employee {EmployeeId}", buddyProfile.Id, employeeId);
            return CreatedAtAction(
                nameof(GetBuddyProfile), 
                new { id = buddyProfile.Id }, 
                createdProfile
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating buddy profile for employee ID: {EmployeeId}", employeeId);
            return StatusCode(500, new { Message = "Error creating buddy profile", Error = ex.Message });
        }
    }

    // PUT: api/buddies/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<BuddyProfile>> UpdateBuddyProfile(Guid id, UpdateBuddyProfileRequest request)
    {
        try
        {
            var buddyProfile = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .FirstOrDefaultAsync(bp => bp.Id == id);

            if (buddyProfile == null)
            {
                _logger.LogWarning("Buddy profile with ID {BuddyProfileId} not found for update", id);
                return NotFound(new { Message = $"Buddy profile with ID {id} not found" });
            }

            // Update properties
            if (!string.IsNullOrEmpty(request.Bio))
                buddyProfile.Bio = request.Bio;
            
            if (!string.IsNullOrEmpty(request.Specialties))
                buddyProfile.Specialties = request.Specialties;
            
            if (request.BuddyLocation != null)
                buddyProfile.BuddyLocation = request.BuddyLocation;
            
            if (request.BuddyUnit != null)
                buddyProfile.BuddyUnit = request.BuddyUnit;
            
            if (request.BuddyTechStack != null)
                buddyProfile.BuddyTechStack = request.BuddyTechStack;
            
            if (request.Interests != null)
                buddyProfile.Interests = request.Interests;
            
            if (request.Availability.HasValue)
                buddyProfile.Availability = request.Availability.Value;
            
            if (request.MaxActiveBuddies.HasValue)
                buddyProfile.MaxActiveBuddies = request.MaxActiveBuddies.Value;
            
            if (request.IsActive.HasValue)
                buddyProfile.IsActive = request.IsActive.Value;

            buddyProfile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated buddy profile for {EmployeeName}", 
                $"{buddyProfile.Employee.FirstName} {buddyProfile.Employee.LastName}");

            return Ok(buddyProfile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating buddy profile {BuddyProfileId}", id);
            return StatusCode(500, new { Message = "Error updating buddy profile", Error = ex.Message });
        }
    }

    // GET: api/buddies/available
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<BuddyProfile>>> GetAvailableBuddies()
    {
        try
        {
            var activeMatches = await _context.BuddyMatches
                .Where(m => m.Status == MatchStatus.Active)
                .GroupBy(m => m.BuddyId)
                .Select(g => new { BuddyId = g.Key, ActiveCount = g.Count() })
                .ToListAsync();

            var availableBuddies = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .Include(bp => bp.GameProfile)
                .Where(bp => bp.IsActive)
                .ToListAsync();

            // Filter buddies who haven't reached their max capacity
            var result = availableBuddies.Where(bp =>
            {
                var activeCount = activeMatches.FirstOrDefault(am => am.BuddyId == bp.EmployeeId)?.ActiveCount ?? 0;
                return activeCount < bp.MaxActiveBuddies && bp.Employee.IsBuddyGuide;
            }).ToList();

            _logger.LogInformation("Found {Count} available buddies out of {Total} total buddy profiles", 
                result.Count, availableBuddies.Count);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving available buddies");
            return StatusCode(500, new { Message = "Error retrieving available buddies", Error = ex.Message });
        }
    }

    // GET: api/buddies/employee/{employeeId}
    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<BuddyProfile>> GetBuddyProfileByEmployeeId(Guid employeeId)
    {
        try
        {
            var buddyProfile = await _context.BuddyProfiles
                .Include(bp => bp.Employee)
                .Include(bp => bp.GameProfile)
                    .ThenInclude(gp => gp!.Badges)
                .Include(bp => bp.BuddyMatches)
                .FirstOrDefaultAsync(bp => bp.EmployeeId == employeeId);

            if (buddyProfile == null)
            {
                _logger.LogWarning("No buddy profile found for employee {EmployeeId}", employeeId);
                return NotFound(new { Message = $"No buddy profile found for employee {employeeId}" });
            }

            return Ok(buddyProfile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving buddy profile for employee {EmployeeId}", employeeId);
            return StatusCode(500, new { Message = "Error retrieving buddy profile", Error = ex.Message });
        }
    }
}

// Request DTOs
public class CreateBuddyProfileRequest
{
    public string Bio { get; set; } = string.Empty;
    public string Specialties { get; set; } = string.Empty;
    public string? BuddyLocation { get; set; }
    public string? BuddyUnit { get; set; }
    public string? BuddyTechStack { get; set; }
    public string? Interests { get; set; }
    public BuddyAvailability Availability { get; set; }
    public int MaxActiveBuddies { get; set; } = 3;
    public bool IsActive { get; set; } = true;
}

public class UpdateBuddyProfileRequest
{
    public string? Bio { get; set; }
    public string? Specialties { get; set; }
    public string? BuddyLocation { get; set; }
    public string? BuddyUnit { get; set; }
    public string? BuddyTechStack { get; set; }
    public string? Interests { get; set; }
    public BuddyAvailability? Availability { get; set; }
    public int? MaxActiveBuddies { get; set; }
    public bool? IsActive { get; set; }
}
