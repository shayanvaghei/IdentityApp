using Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Api.Data
{
    public class Context : IdentityDbContext<User>
    {
        public Context(DbContextOptions<Context> options) :base(options)
        {

        }

        public DbSet<RefreshToken> RefreshTokens { get; set; }
    }
}
