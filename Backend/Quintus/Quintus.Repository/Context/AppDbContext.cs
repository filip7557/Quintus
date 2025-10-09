using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;

namespace Quintus.Repository.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Image> Images => Set<Image>();
        public DbSet<Request> Requests => Set<Request>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = Guid.Parse("5beca67e-cf87-4ccc-b041-32a4fa4e921f"), Name = "Admin" },
                new Role { Id = Guid.Parse("ff3b9357-15f5-4d67-a173-eb3402b6dfda"), Name = "User" }
            );
        }
    }
}