using Microsoft.EntityFrameworkCore;
using ReservationApi.Models;

namespace ReservationApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Reservation> Reservations => Set<Reservation>();
}