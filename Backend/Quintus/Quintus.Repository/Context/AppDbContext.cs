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
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
        public DbSet<Offer> Offers => Set<Offer>();
        public DbSet<UnitOfMeasurement> UnitsOfMeasurement => Set<UnitOfMeasurement>();
        public DbSet<Appointment> Appointments => Set<Appointment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Appointment>()
                .HasOne(appointment => appointment.CreatedByUser)
                .WithMany()
                .HasForeignKey(appointment => appointment.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasIndex(appointment => appointment.StartAt);

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = Guid.Parse("5beca67e-cf87-4ccc-b041-32a4fa4e921f"), Name = "Admin" },
                new Role { Id = Guid.Parse("a1d5f3e2-3c4b-4f6a-9f2e-8b7c6d5e4f3a"), Name = "Owner" },
                new Role { Id = Guid.Parse("c2e4f5a6-7b8c-4d9e-9f1a-2b3c4d5e6f7a"), Name = "Worker" },
                new Role { Id = Guid.Parse("ff3b9357-15f5-4d67-a173-eb3402b6dfda"), Name = "User" }
            );

            modelBuilder.Entity<UnitOfMeasurement>().HasData(
                new UnitOfMeasurement { Id = Guid.Parse("b1a3e4d7-89c2-4f6a-a5d8-3e7b9c1f2d4a"), Name = "M" },
                new UnitOfMeasurement { Id = Guid.Parse("d4f6a8c2-1b3e-4d7f-9a5c-7e2b8d0f3a6c"), Name = "KOM" }
            );
        }
    }
}