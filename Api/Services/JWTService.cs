using Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Api.Services
{
    public class JWTService
    {
        private readonly IConfiguration _config;
        private readonly UserManager<User> _userManager;
        private readonly SymmetricSecurityKey _jwtKey;

        public JWTService(IConfiguration config, UserManager<User> userManager)
        {
            _config = config;
            _userManager = userManager;

            // jwtKey is used for both encripting and decripting the JWT token
            _jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Key"]));
        }
        public async Task<string> CreateJWT(User user)
        {
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.UserName),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName)
            };

            var roles = await _userManager.GetRolesAsync(user);
            userClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var creadentials = new SigningCredentials(_jwtKey, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(userClaims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["JWT:ExpiresInMinutes"])),
                SigningCredentials = creadentials,
                Issuer = _config["JWT:Issuer"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(jwt);
        }

        public RefreshToken CreateRefreshToken(User user)
        {
            var token = new byte[32];
            using var randomNumberGenerator = RandomNumberGenerator.Create();
            randomNumberGenerator.GetBytes(token);

            var refreshToken = new RefreshToken()
            {
                Token = Convert.ToBase64String(token),
                User = user,
                DateExpiresUtc = DateTime.UtcNow.AddDays(int.Parse(_config["JWT:RefreshTokenExpiresInDays"]))
            };

            return refreshToken;
        }
    }
}
