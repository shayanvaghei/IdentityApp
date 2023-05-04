namespace Api.DTOs.Account
{
    public class FacebookResultDto
    {
        public FacebookData Data { get; set; }
    }

    public class FacebookData
    {
        public bool Is_Valid { get; set; }
        public string User_Id { get; set; }
    }
}
