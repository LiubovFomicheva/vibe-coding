using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuddyMatch.Api.Data;
using BuddyMatch.Api.Models;

namespace BuddyMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly BuddyMatchContext _context;
        private readonly ILogger<EmployeesController> _logger;
        
        public EmployeesController(BuddyMatchContext context, ILogger<EmployeesController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees
                .Include(e => e.BuddyProfile)
                .ToListAsync();
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(Guid id)
        {
            var employee = await _context.Employees
                .Include(e => e.BuddyProfile)
                .FirstOrDefaultAsync(e => e.Id == id);
            
            if (employee == null)
            {
                return NotFound();
            }
            
            return employee;
        }
        
        [HttpGet("buddy-guides")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetBuddyGuides()
        {
            var allEmployees = await _context.Employees
                .Include(e => e.BuddyProfile)
                .ToListAsync();
            
            var buddyGuides = allEmployees.Where(e => e.IsBuddyGuide).ToList();
            
            return buddyGuides;
        }
        
        [HttpGet("newcomers")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetNewcomers()
        {
            var allEmployees = await _context.Employees.ToListAsync();
            var newcomers = allEmployees.Where(e => e.IsNewcomer).ToList();
            
            return newcomers;
        }
        
        [HttpPost]
        public async Task<ActionResult<Employee>> CreateEmployee(CreateEmployeeRequest request)
        {
            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Title = request.Title,
                Unit = request.Unit,
                Team = request.Team,
                Location = request.Location,
                StartDate = request.StartDate,
                Role = request.Role,
                TechStack = request.TechStack ?? string.Empty,
                Languages = request.Languages ?? string.Empty,
                Interests = request.Interests ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }
        
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Employee>>> SearchEmployees(
            [FromQuery] string? location = null,
            [FromQuery] string? unit = null,
            [FromQuery] string? techStack = null,
            [FromQuery] string? interests = null,
            [FromQuery] string? languages = null,
            [FromQuery] string? role = null,
            [FromQuery] bool? buddyGuidesOnly = null,
            [FromQuery] bool? newcomersOnly = null,
            [FromQuery] bool? availableBuddiesOnly = null)
        {
            var allEmployees = await _context.Employees
                .Include(e => e.BuddyProfile)
                .ToListAsync();
            
            var filteredEmployees = allEmployees.AsEnumerable();
            
            // Apply role-based filters first
            if (buddyGuidesOnly == true)
            {
                filteredEmployees = filteredEmployees.Where(e => e.IsBuddyGuide);
            }
            else if (newcomersOnly == true)
            {
                filteredEmployees = filteredEmployees.Where(e => e.IsNewcomer);
            }
            
            // Apply text-based filters
            if (!string.IsNullOrWhiteSpace(location))
            {
                filteredEmployees = filteredEmployees.Where(e => 
                    e.Location.Contains(location, StringComparison.OrdinalIgnoreCase));
            }
            
            if (!string.IsNullOrWhiteSpace(unit))
            {
                filteredEmployees = filteredEmployees.Where(e => 
                    e.Unit.Contains(unit, StringComparison.OrdinalIgnoreCase));
            }
            
            if (!string.IsNullOrWhiteSpace(techStack))
            {
                filteredEmployees = filteredEmployees.Where(e => 
                    e.TechStack.Contains(techStack, StringComparison.OrdinalIgnoreCase));
            }
            
            if (!string.IsNullOrWhiteSpace(interests))
            {
                filteredEmployees = filteredEmployees.Where(e => 
                    e.Interests.Contains(interests, StringComparison.OrdinalIgnoreCase));
            }
            
            if (!string.IsNullOrWhiteSpace(languages))
            {
                filteredEmployees = filteredEmployees.Where(e => 
                    e.Languages.Contains(languages, StringComparison.OrdinalIgnoreCase));
            }
            
            if (!string.IsNullOrWhiteSpace(role))
            {
                if (Enum.TryParse<EmployeeRole>(role, true, out var parsedRole))
                {
                    filteredEmployees = filteredEmployees.Where(e => e.Role == parsedRole);
                }
            }
            
            // Filter for available buddies (not at capacity)
            if (availableBuddiesOnly == true)
            {
                var activeMatches = await _context.BuddyMatches
                    .Where(m => m.Status == MatchStatus.Active)
                    .ToListAsync();
                
                filteredEmployees = filteredEmployees.Where(e => 
                    e.IsBuddyGuide && 
                    e.BuddyProfile != null && 
                    activeMatches.Count(m => m.BuddyId == e.Id) < e.BuddyProfile.MaxActiveBuddies);
            }
            
            var result = filteredEmployees.ToList();
            
            _logger.LogInformation("Employee search returned {Count} results with filters: location={Location}, unit={Unit}, techStack={TechStack}, role={Role}", 
                result.Count, location, unit, techStack, role);
            
            return Ok(result);
        }
        
        [HttpGet("filters/options")]
        public async Task<ActionResult<object>> GetFilterOptions()
        {
            var employees = await _context.Employees.ToListAsync();
            
            var filterOptions = new
            {
                Locations = employees.Select(e => e.Location).Distinct().OrderBy(l => l).ToList(),
                Units = employees.Select(e => e.Unit).Distinct().OrderBy(u => u).ToList(),
                TechStacks = employees.SelectMany(e => e.TechStack.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(ts => ts.Trim())
                    .Distinct()
                    .OrderBy(ts => ts)
                    .ToList(),
                Languages = employees.SelectMany(e => e.Languages.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(l => l.Trim())
                    .Distinct()
                    .OrderBy(l => l)
                    .ToList(),
                Interests = employees.SelectMany(e => e.Interests.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(i => i.Trim())
                    .Distinct()
                    .OrderBy(i => i)
                    .ToList(),
                Roles = Enum.GetNames<EmployeeRole>().ToList()
            };
            
            return Ok(filterOptions);
        }
    }
    
    public class CreateEmployeeRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string Team { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public EmployeeRole Role { get; set; }
        public string? TechStack { get; set; }
        public string? Languages { get; set; }
        public string? Interests { get; set; }
    }
    
}
