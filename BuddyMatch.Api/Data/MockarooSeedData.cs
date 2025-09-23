using BuddyMatch.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BuddyMatch.Api.Data
{
    public static class MockarooSeedData
    {
        public static async Task InitializeAsync(BuddyMatchContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();
            
            // Check if data already exists
            if (await context.Employees.AnyAsync())
            {
                return; // Database has been seeded
            }
            
            // Create HR users (3 realistic HR professionals)
            var hrUsers = new List<Employee>
            {
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Sarah",
                    LastName = "Johnson",
                    Email = "sarah.johnson@epam.com",
                    Title = "Senior HR Manager",
                    Unit = "Human Resources",
                    Team = "Talent Management",
                    Role = EmployeeRole.HR,
                    Location = "New York, NY",
                    TechStack = "HRIS, Workday, Excel, Tableau, PowerBI",
                    StartDate = DateTime.UtcNow.AddYears(-6),
                    Languages = "English, Spanish, French",
                    Interests = "Team building, Employee engagement, Recruiting, Leadership development"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Michael",
                    LastName = "Chen",
                    Email = "michael.chen@epam.com",
                    Title = "HR Business Partner",
                    Unit = "Human Resources", 
                    Team = "Business Partnership",
                    Role = EmployeeRole.HR,
                    Location = "San Francisco, CA",
                    TechStack = "SAP SuccessFactors, Tableau, PowerBI, JIRA, Slack",
                    StartDate = DateTime.UtcNow.AddYears(-4),
                    Languages = "English, Mandarin, Cantonese",
                    Interests = "Employee engagement, Data analytics, Process improvement, Diversity & Inclusion"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Elena",
                    LastName = "Rodriguez",
                    Email = "elena.rodriguez@epam.com",
                    Title = "HR Director",
                    Unit = "Human Resources",
                    Team = "Strategic HR",
                    Role = EmployeeRole.HR,
                    Location = "Austin, TX",
                    TechStack = "Workday, SAP HCM, Oracle, PowerBI, Tableau",
                    StartDate = DateTime.UtcNow.AddYears(-8),
                    Languages = "English, Spanish, Portuguese",
                    Interests = "Strategic planning, Change management, Employee wellness, Global HR operations"
                }
            };
            
            // Create buddy guide employees (8 experienced professionals)
            var buddyGuides = new List<Employee>
            {
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Alexander",
                    LastName = "Rodriguez",
                    Email = "alex.rodriguez@epam.com",
                    Title = "Senior Software Engineer",
                    Unit = "Engineering",
                    Team = "Platform Development",
                    Role = EmployeeRole.Employee,
                    Location = "New York, NY",
                    TechStack = ".NET Core, C#, React, TypeScript, Azure, SQL Server",
                    StartDate = DateTime.UtcNow.AddYears(-5),
                    Languages = "English, Spanish, Italian",
                    Interests = "Full-stack development, Microservices, Cloud architecture, Code reviews"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Emily",
                    LastName = "Watson",
                    Email = "emily.watson@epam.com",
                    Title = "Principal Frontend Developer",
                    Unit = "Engineering",
                    Team = "User Experience",
                    Role = EmployeeRole.Employee,
                    Location = "San Francisco, CA",
                    TechStack = "React, TypeScript, Next.js, Tailwind CSS, Figma, Storybook",
                    StartDate = DateTime.UtcNow.AddYears(-7),
                    Languages = "English, French, German",
                    Interests = "UI/UX design, Frontend architecture, Accessibility, Design systems"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "David",
                    LastName = "Kim",
                    Email = "david.kim@epam.com",
                    Title = "Lead DevOps Engineer",
                    Unit = "Engineering",
                    Team = "Infrastructure",
                    Role = EmployeeRole.Employee,
                    Location = "Seattle, WA",
                    TechStack = "Azure, Docker, Kubernetes, Terraform, Python, Jenkins, Git",
                    StartDate = DateTime.UtcNow.AddYears(-6),
                    Languages = "English, Korean, Japanese",
                    Interests = "Cloud infrastructure, CI/CD pipelines, Automation, Security"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Lisa",
                    LastName = "Thompson",
                    Email = "lisa.thompson@epam.com",
                    Title = "Senior Product Manager",
                    Unit = "Product",
                    Team = "Digital Solutions",
                    Role = EmployeeRole.Employee,
                    Location = "Austin, TX",
                    TechStack = "JIRA, Confluence, Figma, Tableau, Analytics, Agile, Scrum",
                    StartDate = DateTime.UtcNow.AddYears(-4),
                    Languages = "English, Portuguese, Spanish",
                    Interests = "Product strategy, User research, Agile methodologies, Data-driven decisions"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "James",
                    LastName = "Wilson",
                    Email = "james.wilson@epam.com",
                    Title = "Senior Full Stack Developer",
                    Unit = "Engineering",
                    Team = "Enterprise Solutions",
                    Role = EmployeeRole.Employee,
                    Location = "Chicago, IL",
                    TechStack = ".NET, C#, React, Node.js, PostgreSQL, MongoDB, AWS",
                    StartDate = DateTime.UtcNow.AddYears(-5),
                    Languages = "English, French, Dutch",
                    Interests = "Backend architecture, Database optimization, API design, Performance tuning"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Maria",
                    LastName = "Garcia",
                    Email = "maria.garcia@epam.com",
                    Title = "Senior Data Engineer",
                    Unit = "Data & Analytics",
                    Team = "Data Platform",
                    Role = EmployeeRole.Employee,
                    Location = "Miami, FL",
                    TechStack = "Python, Spark, Kafka, Snowflake, dbt, Airflow, SQL",
                    StartDate = DateTime.UtcNow.AddYears(-4),
                    Languages = "English, Spanish, Catalan",
                    Interests = "Data pipelines, Machine learning, ETL processes, Data visualization"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Robert",
                    LastName = "Anderson",
                    Email = "robert.anderson@epam.com",
                    Title = "Lead Solutions Architect",
                    Unit = "Engineering",
                    Team = "Architecture",
                    Role = EmployeeRole.Employee,
                    Location = "Boston, MA",
                    TechStack = "Enterprise Architecture, .NET, Java, Azure, AWS, Microservices",
                    StartDate = DateTime.UtcNow.AddYears(-8),
                    Languages = "English, German, Russian",
                    Interests = "System design, Enterprise patterns, Cloud migration, Technical leadership"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Jennifer",
                    LastName = "Lee",
                    Email = "jennifer.lee@epam.com",
                    Title = "Senior QA Engineer",
                    Unit = "Quality Assurance",
                    Team = "Test Automation",
                    Role = EmployeeRole.Employee,
                    Location = "Los Angeles, CA",
                    TechStack = "Selenium, Cypress, TestNG, Postman, Jenkins, Python, Java",
                    StartDate = DateTime.UtcNow.AddYears(-5),
                    Languages = "English, Korean, Mandarin",
                    Interests = "Test automation, Performance testing, Quality processes, Continuous testing"
                }
            };
            
            // Create newcomers (7 junior employees)
            var newcomers = new List<Employee>
            {
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Anna",
                    LastName = "Kowalski",
                    Email = "anna.kowalski@epam.com",
                    Title = "Junior Software Engineer",
                    Unit = "Engineering",
                    Team = "Web Development",
                    Role = EmployeeRole.Employee,
                    Location = "New York, NY",
                    TechStack = ".NET, C#, JavaScript, HTML, CSS, SQL",
                    StartDate = DateTime.UtcNow.AddMonths(-2),
                    Languages = "English, Polish, German",
                    Interests = "Web development, Learning new technologies, Open source, Coding challenges"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Raj",
                    LastName = "Patel",
                    Email = "raj.patel@epam.com",
                    Title = "Frontend Developer",
                    Unit = "Engineering",
                    Team = "User Interface",
                    Role = EmployeeRole.Employee,
                    Location = "San Francisco, CA",
                    TechStack = "React, TypeScript, JavaScript, CSS, Figma, Git",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    Languages = "English, Hindi, Gujarati",
                    Interests = "Frontend frameworks, UI/UX design, Mobile development, Design patterns"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Sophie",
                    LastName = "Martin",
                    Email = "sophie.martin@epam.com",
                    Title = "Junior Data Analyst",
                    Unit = "Data & Analytics",
                    Team = "Business Intelligence",
                    Role = EmployeeRole.Employee,
                    Location = "Austin, TX",
                    TechStack = "SQL, Python, Tableau, Excel, Power BI, R",
                    StartDate = DateTime.UtcNow.AddMonths(-3),
                    Languages = "English, French, Spanish",
                    Interests = "Data analysis, Statistics, Machine learning, Data visualization, Business intelligence"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Carlos",
                    LastName = "Mendoza",
                    Email = "carlos.mendoza@epam.com",
                    Title = "Junior Backend Developer",
                    Unit = "Engineering",
                    Team = "API Development",
                    Role = EmployeeRole.Employee,
                    Location = "Miami, FL",
                    TechStack = "Node.js, JavaScript, MongoDB, Express, REST APIs, Git",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    Languages = "English, Spanish, Portuguese",
                    Interests = "Backend development, API design, Database design, Cloud computing"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Aisha",
                    LastName = "Johnson",
                    Email = "aisha.johnson@epam.com",
                    Title = "Junior DevOps Engineer",
                    Unit = "Engineering",
                    Team = "Infrastructure",
                    Role = EmployeeRole.Employee,
                    Location = "Seattle, WA",
                    TechStack = "Docker, Git, Linux, Bash, Python, Jenkins",
                    StartDate = DateTime.UtcNow.AddMonths(-2),
                    Languages = "English, Arabic, French",
                    Interests = "DevOps practices, Automation, Cloud platforms, Containerization"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Kevin",
                    LastName = "Chang",
                    Email = "kevin.chang@epam.com",
                    Title = "Junior Product Analyst",
                    Unit = "Product",
                    Team = "Product Analytics",
                    Role = EmployeeRole.Employee,
                    Location = "Los Angeles, CA",
                    TechStack = "SQL, Python, Tableau, Google Analytics, Excel, JIRA",
                    StartDate = DateTime.UtcNow.AddMonths(-3),
                    Languages = "English, Mandarin, Cantonese",
                    Interests = "Product analytics, User behavior, A/B testing, Market research"
                },
                new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Emma",
                    LastName = "Nielsen",
                    Email = "emma.nielsen@epam.com",
                    Title = "Junior QA Analyst",
                    Unit = "Quality Assurance",
                    Team = "Manual Testing",
                    Role = EmployeeRole.Employee,
                    Location = "Chicago, IL",
                    TechStack = "Manual Testing, Selenium, Postman, JIRA, TestRail, Git",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    Languages = "English, Danish, Swedish",
                    Interests = "Software testing, Quality assurance, Test automation, Bug tracking"
                }
            };
            
            // Add ONE more buddy guide WITHOUT a profile for demo
            var newBuddyGuide = new Employee
            {
                Id = Guid.NewGuid(),
                FirstName = "Diana",
                LastName = "Foster",
                Email = "diana.foster@epam.com",
                Title = "Principal Software Architect",
                Unit = "Engineering",
                Team = "Enterprise Architecture",
                Role = EmployeeRole.Employee,
                Location = "Remote, Seattle WA",
                TechStack = "C#, .NET, Azure, React, TypeScript, Microservices",
                StartDate = DateTime.UtcNow.AddYears(-6),
                Languages = "English, German",
                Interests = "Software architecture, Mentoring, Tech conferences, Rock climbing"
            };
            
            // Add all employees (including the new buddy guide)
            var allEmployees = hrUsers.Concat(buddyGuides).Concat(newcomers).Append(newBuddyGuide).ToList();
            await context.Employees.AddRangeAsync(allEmployees);
            await context.SaveChangesAsync();
            
            // Create buddy profiles for buddy guides
            var buddyProfiles = new List<BuddyProfile>();
            foreach (var guide in buddyGuides)
            {
                var profile = new BuddyProfile
                {
                    Id = Guid.NewGuid(),
                    EmployeeId = guide.Id,
                    MaxActiveBuddies = 3,
                    Bio = GenerateBio(guide),
                    Specialties = guide.TechStack,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                buddyProfiles.Add(profile);
            }
            
            await context.BuddyProfiles.AddRangeAsync(buddyProfiles);
            await context.SaveChangesAsync();
            
            // Create game profiles for buddy guides
            var gameProfiles = new List<BuddyGameProfile>();
            foreach (var buddyProfile in buddyProfiles)
            {
                var gameProfile = new BuddyGameProfile
                {
                    Id = Guid.NewGuid(),
                    BuddyProfileId = buddyProfile.Id,
                    TotalPoints = Random.Shared.Next(500, 2500),
                    CurrentLevel = (BuddyLevel)Random.Shared.Next(1, 5),
                    MonthlyPoints = Random.Shared.Next(100, 500),
                    LastActivityDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
                    StreakDays = Random.Shared.Next(1, 45),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Achievements = new List<Achievement>()
                };
                gameProfiles.Add(gameProfile);
            }
            
            await context.BuddyGameProfiles.AddRangeAsync(gameProfiles);
            await context.SaveChangesAsync();
            
            // Create badges for game profiles
            var allBadges = new List<Badge>();
            foreach (var gameProfile in gameProfiles)
            {
                var badges = GenerateRandomBadges(gameProfile.Id);
                allBadges.AddRange(badges);
            }
            
            await context.Badges.AddRangeAsync(allBadges);
            await context.SaveChangesAsync();
        }
        
        private static string GenerateBio(Employee employee)
        {
            var bios = new[]
            {
                $"Hi! I'm {employee.FirstName}, a {employee.Title} with {DateTime.UtcNow.Year - employee.StartDate.Year}+ years of experience in {employee.TechStack.Split(',')[0].Trim()}. I love mentoring and helping newcomers navigate their career journey. Let's connect and grow together!",
                $"Welcome! As a {employee.Title}, I'm passionate about {employee.Interests.Split(',')[0].Trim()} and {employee.Interests.Split(',')[1].Trim()}. I've been with the company for {DateTime.UtcNow.Year - employee.StartDate.Year} years and enjoy sharing knowledge with new team members.",
                $"Hey there! I'm {employee.FirstName} from the {employee.Team} team. My expertise includes {employee.TechStack.Split(',')[0].Trim()} and {employee.TechStack.Split(',')[1].Trim()}. I believe in collaborative learning and would love to help you succeed in your role!",
                $"Hello! I'm a {employee.Title} who's been working with {employee.TechStack.Split(',')[0].Trim()} for several years. I'm enthusiastic about {employee.Interests.Split(',')[0].Trim()} and always excited to mentor newcomers. Looking forward to working together!"
            };
            
            return bios[Random.Shared.Next(bios.Length)];
        }
        
        private static List<Badge> GenerateRandomBadges(Guid gameProfileId)
        {
            var badges = new List<Badge>
            {
                new Badge
                {
                    Id = Guid.NewGuid(),
                    GameProfileId = gameProfileId,
                    Name = "First Match",
                    Description = "Successfully completed your first buddy match",
                    IconUrl = "🎯",
                    Category = BadgeCategory.Achievement,
                    PointValue = 100,
                    EarnedDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 180))
                },
                new Badge
                {
                    Id = Guid.NewGuid(),
                    GameProfileId = gameProfileId,
                    Name = "Mentor",
                    Description = "Helped 3 newcomers successfully integrate",
                    IconUrl = "🌟",
                    Category = BadgeCategory.Achievement,
                    PointValue = 250,
                    EarnedDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(10, 90))
                },
                new Badge
                {
                    Id = Guid.NewGuid(),
                    GameProfileId = gameProfileId,
                    Name = "Team Player",
                    Description = "Received excellent feedback from buddies",
                    IconUrl = "🤝",
                    Category = BadgeCategory.Special,
                    PointValue = 150,
                    EarnedDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(5, 60))
                }
            };
            
            // Return 1-3 random badges
            return badges.Take(Random.Shared.Next(1, 4)).ToList();
        }
    }
}
