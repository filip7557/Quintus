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
        public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
        public DbSet<PushNotificationJob> PushNotificationJobs => Set<PushNotificationJob>();
        public DbSet<Certificate> Certificates => Set<Certificate>();

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

            modelBuilder.Entity<PushSubscription>()
                .HasOne(subscription => subscription.User)
                .WithMany()
                .HasForeignKey(subscription => subscription.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PushSubscription>()
                .HasIndex(subscription => subscription.Endpoint)
                .IsUnique();

            modelBuilder.Entity<PushSubscription>()
                .HasIndex(subscription => subscription.UserId);

            modelBuilder.Entity<PushNotificationJob>()
                .HasOne(job => job.ActorUser)
                .WithMany()
                .HasForeignKey(job => job.ActorUserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PushNotificationJob>()
                .HasIndex(job => new { job.CompletedAt, job.NextAttemptAt, job.ProcessingStartedAt });

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

            modelBuilder.Entity<Certificate>().HasData(
                new Certificate
                {
                    Id = Guid.Parse("31993434-7c6d-4071-83a5-e063b457ac81"),
                    Title = "Majstor instalater",
                    Description = "Ovlašteni majstor vodoinstalater, instalater grijanja i klimatizacije",
                    CreatedDateTime = DateTimeOffset.ParseExact("2026-09-21 01:11:36.092 +0200", "yyyy-MM-dd HH:mm:ss.fff zzz", System.Globalization.CultureInfo.InvariantCulture).UtcDateTime,
                    ImageUrl = "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789945894/quintus_images/pbfc7fb3nxyzwbbdfyqd.png",
                    Url = "https://quintus-files.s3.eu-south-mil.io.cloud.ovh.net/d6719da15d444d38b4160d5558bc7316.pdf"
                },
                new Certificate
                {
                    Id = Guid.Parse("210562a4-052f-4fb6-add0-dcfb55516bc5"),
                    Title = "Majstor plinoinstalater",
                    Description = "Ovlašteni majstor plinoinstalater",
                    CreatedDateTime = DateTimeOffset.ParseExact("2026-09-21 01:17:26.992 +0200", "yyyy-MM-dd HH:mm:ss.fff zzz", System.Globalization.CultureInfo.InvariantCulture).UtcDateTime,
                    ImageUrl = "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789946245/quintus_images/r3lt8gemsgydxowfnyqb.png",
                    Url = "https://quintus-files.s3.eu-south-mil.io.cloud.ovh.net/3bedd3d343904e88ab108e869370d1b1.pdf"
                },
                new Certificate
                {
                    Id = Guid.Parse("44a532f0-8072-4727-9577-aecf9d12921f"),
                    Title = "Majstor instalater",
                    Description = "Ovlašteni majstor za vodovod, grijanje i klimatizaciju (Kategorija A1).",
                    CreatedDateTime = DateTimeOffset.ParseExact("2026-09-20 13:57:18.389 +0200", "yyyy-MM-dd HH:mm:ss.fff zzz", System.Globalization.CultureInfo.InvariantCulture).UtcDateTime,
                    ImageUrl = "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789905438/quintus_images/gfjnfyhvrwgn6spvyfqs.webp",
                    Url = "https://quintus-files.s3.eu-south-mil.io.cloud.ovh.net/a4f0bcd1dbdc43efba36b95ace84c83a.pdf"
                },
                new Certificate
                {
                    Id = Guid.Parse("80f17497-8c63-4459-be9c-65f471de95fc"),
                    Title = "Vaillant Partner",
                    Description = "Vaillant Excellence Partner (VEP) je Vaillantova elitna mreža certificiranih partnera instalatera.",
                    CreatedDateTime = DateTimeOffset.ParseExact("2026-09-21 01:16:43.785 +0200", "yyyy-MM-dd HH:mm:ss.fff zzz", System.Globalization.CultureInfo.InvariantCulture).UtcDateTime,
                    ImageUrl = "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789946203/quintus_images/ibed5jn1gbyagzlv6zgr.png",
                    Url = null
                }
            );
        }
    }
}