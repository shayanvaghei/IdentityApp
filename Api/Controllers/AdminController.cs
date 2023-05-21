using Api.DTOs.Admin;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet("get-members")]
        public async Task<ActionResult<IEnumerable<MemberViewDto>>> GetMembers()
        {
            List<MemberViewDto> members = new List<MemberViewDto>();
            var users = await _userManager.Users
                .Where(x => x.UserName != SD.AdminUserName)
                .ToListAsync();

            foreach(var user in users)
            {
                var memberToAdd = new MemberViewDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateCreated = user.DateCreated,
                    IsLocked = await _userManager.IsLockedOutAsync(user),
                    Roles = await _userManager.GetRolesAsync(user),
                };

                members.Add(memberToAdd);
            }

            return Ok(members);
        }

        [HttpGet("get-member/{id}")]
        public async Task<ActionResult<MemberAddEditDto>> GetMember(string id)
        {
            var user = await _userManager.Users
                .Where(x => x.UserName != SD.AdminUserName && x.Id == id)
                .FirstOrDefaultAsync();

            var member = new MemberAddEditDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = string.Join(",", await _userManager.GetRolesAsync(user))
            };

            return Ok(member);
        }

        [HttpPost("add-edit-member")]
        public async Task<IActionResult> AddEditMember(MemberAddEditDto model)
        {
            User user;

            if (string.IsNullOrEmpty(model.Id))
            {
                // adding a new member
                if (string.IsNullOrEmpty(model.Password) || model.Password.Length < 6)
                {
                    ModelState.AddModelError("errors", "Password must be at least 6 characters");
                    return BadRequest(ModelState);
                }

                user = new User
                {
                    FirstName = model.FirstName.ToLower(),
                    LastName = model.LastName.ToLower(),
                    UserName = model.UserName.ToLower(),
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded) return BadRequest(result.Errors);
            }
            else
            {
                // editing an existing member

                if (!string.IsNullOrEmpty(model.Password))
                {
                    if (model.Password.Length < 6)
                    {
                        ModelState.AddModelError("errors", "Password must be at least 6 characters");
                        return BadRequest(ModelState);
                    }
                }

                if (IsAdminUserId(model.Id))
                {
                    return BadRequest(SD.SuperAdminChangeNotAllowed);
                }

                user = await _userManager.FindByIdAsync(model.Id);
                if (user == null) return NotFound();

                user.FirstName = model.FirstName.ToLower();
                user.LastName = model.LastName.ToLower();
                user.UserName = model.UserName.ToLower();

                if (!string.IsNullOrEmpty(model.Password))
                {
                    await _userManager.RemovePasswordAsync(user);
                    await _userManager.AddPasswordAsync(user, model.Password);
                }
            }

            var userRoles = await _userManager.GetRolesAsync(user);

            // removing users' existing role(s)
            await _userManager.RemoveFromRolesAsync(user, userRoles);

            foreach(var role in model.Roles.Split(",").ToArray())
            {
                var roleToAdd = await _roleManager.Roles.FirstOrDefaultAsync(r => r.Name == role);
                if (roleToAdd != null)
                {
                    await _userManager.AddToRoleAsync(user, role);
                }
            }

            if (string.IsNullOrEmpty(model.Id))
            {
                return Ok(new JsonResult(new { title = "Member Created", message = $"{model.UserName} has been created" }));
            }
            else
            {
                return Ok(new JsonResult(new { title = "Member Edited", message = $"{model.UserName} has been updated" }));
            }
        }

        [HttpPut("lock-member/{id}")]
        public async Task<IActionResult> LockMember(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (IsAdminUserId(id))
            {
                return BadRequest(SD.SuperAdminChangeNotAllowed);
            }

            await _userManager.SetLockoutEndDateAsync(user, DateTime.UtcNow.AddDays(5));
            return NoContent();
        }

        [HttpPut("unlock-member/{id}")]
        public async Task<IActionResult> UnlockMember(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (IsAdminUserId(id))
            {
                return BadRequest(SD.SuperAdminChangeNotAllowed);
            }

            await _userManager.SetLockoutEndDateAsync(user, null);
            return NoContent();
        }

        [HttpDelete("delete-member/{id}")]
        public async Task<IActionResult> DeleteMember(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (IsAdminUserId(id))
            {
                return BadRequest(SD.SuperAdminChangeNotAllowed);
            }

            await _userManager.DeleteAsync(user);
            return NoContent();
        }

        [HttpGet("get-application-roles")]
        public async Task<ActionResult<string[]>> GetApplicationRoles()
        {
            return Ok(await _roleManager.Roles.Select(x => x.Name).ToListAsync());
        }

        private bool IsAdminUserId(string userId)
        {
            return _userManager.FindByIdAsync(userId).GetAwaiter().GetResult().UserName.Equals(SD.AdminUserName);
        }
    }
}
