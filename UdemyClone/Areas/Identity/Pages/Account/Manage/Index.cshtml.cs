// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
#nullable disable

using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using UdemyClone.Models;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Common.Constants;
using Microsoft.AspNetCore.Authorization;
using UdemyClone.Common.Helpers;

namespace UdemyClone.Areas.Identity.Pages.Account.Manage
{
    [Authorize]
    public class IndexModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public IndexModel(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IUnitOfWork unitOfWork,
            IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _unitOfWork = unitOfWork;
            _webHostEnvironment = webHostEnvironment;
        }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [TempData]
        public string StatusMessage { get; set; }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [BindProperty]
        public InputModel Input { get; set; }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public class InputModel
        {
            [Required]
            [Display(Name = "First Name")]
            public string FirstName { get; set; }

            [Required]
            [Display(Name = "Last Name")]
            public string LastName { get; set; }

            /// <summary>
            ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
            ///     directly from your code. This API may change or be removed in future releases.
            /// </summary>
            [Phone]
            [Display(Name = "Phone number")]
            public string PhoneNumber { get; set; }

            // Instructor-specific fields
            [Display(Name = "Headline")]
            [StringLength(100, ErrorMessage = "The {0} must be at most {1} characters long.")]
            public string Headline { get; set; }

            [Display(Name = "Biography")]
            [StringLength(1000, ErrorMessage = "The {0} must be at most {1} characters long.")]
            public string Biography { get; set; }

            [Display(Name = "Website URL")]
            [Url(ErrorMessage = "Please enter a valid URL")]
            public string Website { get; set; }

            [Display(Name = "Profile Picture")]
            public IFormFile AvatarFile { get; set; }

            public string CurrentAvatarUrl { get; set; }
        }

        public bool IsInstructor { get; set; }

        private async Task LoadAsync(ApplicationUser user)
        {
            var userName = await _userManager.GetUserNameAsync(user);
            var phoneNumber = await _userManager.GetPhoneNumberAsync(user);
            var roles = await _userManager.GetRolesAsync(user);

            Username = userName;
            IsInstructor = roles.Contains(RoleNames.Instructor);

            var instructor = IsInstructor ? _unitOfWork.Instructor.Get(i => i.Id == user.Id) : null;

            Input = new InputModel
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = phoneNumber,
                Headline = instructor?.HeadLine,
                Biography = instructor?.Biography,
                Website = instructor?.Website,
                CurrentAvatarUrl = user.AvatarUrl
            };
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
            }

            await LoadAsync(user);
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
            }

            if (!ModelState.IsValid)
            {
                await LoadAsync(user);
                return Page();
            }

            var hasChanges = false;

            if (user.FirstName != Input.FirstName)
            {
                user.FirstName = Input.FirstName;
                hasChanges = true;
            }

            if (user.LastName != Input.LastName)
            {
                user.LastName = Input.LastName;
                hasChanges = true;
            }

            if (Input.AvatarFile != null)
            {
                try
                {
                    if (!string.IsNullOrEmpty(user.AvatarUrl))
                    {
                        FileHelper.DeleteFile(user.AvatarUrl, _webHostEnvironment);
                    }

                    var avatarUrl = await FileHelper.SaveFileAsync(Input.AvatarFile, $"img/avatars/{user.Id}", _webHostEnvironment);
                    user.AvatarUrl = avatarUrl;
                    hasChanges = true;
                }
                catch (Exception ex)
                {
                    StatusMessage = "Error: Failed to upload avatar. Please try again.";
                    await LoadAsync(user);
                    return Page();
                }
            }

            if (hasChanges)
            {
                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    StatusMessage = "Error: Unexpected error when trying to update profile.";
                    return RedirectToPage();
                }
            }

            var phoneNumber = await _userManager.GetPhoneNumberAsync(user);
            if (Input.PhoneNumber != phoneNumber)
            {
                var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, Input.PhoneNumber);
                if (!setPhoneResult.Succeeded)
                {
                    StatusMessage = "Error: Unexpected error when trying to set phone number.";
                    return RedirectToPage();
                }
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains(RoleNames.Instructor))
            {
                var instructor = _unitOfWork.Instructor.Get(i => i.Id == user.Id);
                if (instructor != null)
                {
                    instructor.HeadLine = Input.Headline;
                    instructor.Biography = Input.Biography;
                    instructor.Website = Input.Website;

                    _unitOfWork.Instructor.Update(instructor);
                    await _unitOfWork.SaveAsync();
                }
            }

            await _signInManager.RefreshSignInAsync(user);
            StatusMessage = "Your profile has been updated successfully.";
            return RedirectToPage();
        }
    }
}
