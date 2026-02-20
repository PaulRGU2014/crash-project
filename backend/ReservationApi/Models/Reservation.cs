namespace ReservationApi.Models;

public class Reservation
{
    public int Id { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "pending";
}