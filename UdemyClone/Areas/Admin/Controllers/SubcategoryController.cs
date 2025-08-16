using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = RoleNames.Admin)]
    public class SubCategoryController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public SubCategoryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public IActionResult Index()
        {
            var subcategories = _unitOfWork.Subcategory.GetAll(includeProperties: "Category");
            return View(subcategories);
        }

        public IActionResult UpSert(string? id)
        {
            SubcategoryViewModel subCategoryVM = new SubcategoryViewModel()
            {
                Subcategory = new Subcategory(),
                CategoryList = _unitOfWork.Category.GetAll().Select(c => new SelectListItem
                {
                    Text = c.Name,
                    Value = c.Id
                })
            };

            if (id == null)
            {
                return View(subCategoryVM);
            }
            else
            {
                subCategoryVM.Subcategory = _unitOfWork.Subcategory.Get(s => s.Id == id);
                if (subCategoryVM.Subcategory == null)
                {
                    return NotFound();
                }
                return View(subCategoryVM);
            }
        }

        [HttpPost]
        public IActionResult UpSert(SubcategoryViewModel subcategoryViewModel)
        {
            if (ModelState.IsValid)
            {

                if(subcategoryViewModel.Subcategory.Id == null)
                {
                    subcategoryViewModel.Subcategory.Id = Guid.NewGuid().ToString();
                    _unitOfWork.Subcategory.Add(subcategoryViewModel.Subcategory);
                }
                else
                {
                    _unitOfWork.Subcategory.Update(subcategoryViewModel.Subcategory);
                }
                _unitOfWork.Save();
                return RedirectToAction("Index");
            }
            subcategoryViewModel.CategoryList = _unitOfWork.Category.GetAll().Select(i => new SelectListItem
            {
                Text = i.Name,
                Value = i.Id
            });
            return View(subcategoryViewModel);
        }

        [HttpDelete]
        public IActionResult Delete(string? id)
        {
            if(id == null)
            {
                return NotFound();
            }

            var subCategory = _unitOfWork.Subcategory.Get(i => i.Id == id);
            if(subCategory != null)
            {
                _unitOfWork.Subcategory.Remove(subCategory);
                _unitOfWork.Save();
                return Json(new {success = true, message = "Subcategory deleted successfully"});
            }
            else
            {
                return Json(new { success = false, message = "Error while deleting" });
            }
        }
    }
}
