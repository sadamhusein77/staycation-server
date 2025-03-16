const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Item = require("../models/Item");
const Image = require("../models/Image");
const Feature = require("../models/Feature");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Member = require("../models/Member");
const Users = require("../models/Users");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcryptjs");

module.exports = {
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      if (!req.session.user) {
        res.render("index", {
          alert,
          title: "Staycation | Login",
        });
      } else {
        res.redirect("/admin/dashboard");
      }
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("/admin/signin");
    }
  },
  actionSignin: async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(req.body);
      const user = await Users.findOne({ username: username });
      if (!user) {
        req.flash("alertMessage", "User not found");
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/signin");
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        req.flash("alertMessage", "Password not match");
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/signin");
      }

      req.session.user = {
        id: user.id,
        username: user.username,
      };

      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("/admin/signin");
    }
  },
  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/admin/signin");
  },
  viewDashboard: async (req, res) => {
    try {
      const member = await Member.find();
      const booking = await Booking.find();
      const item = await Item.find();
      res.render("admin/dashboard/view_dashboard", {
        title: "Staycation | Dashboard",
        user: req.session.user,
        member,
        booking,
        item
      });
    } catch (error) {
      res.redirect("/admin/dashboard");
    }
  },
  viewCategory: async (req, res) => {
    try {
      const category = await Category.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/category/view_category", {
        category,
        alert,
        title: "Staycation | Category",
        user: req.session.user,
      });
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("/admin/category");
    }
  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.create({ name });
      req.flash("alertMessage", "Success Add Category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("/admin/category");
    }
  },
  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body;
      const category = await Category.findOne({ _id: id });
      if (category) {
        category.name = name;
        category.save();
        req.flash("alertMessage", "Success Update Category");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect("/admin/category");
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      res.redirect("/admin/category");
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ _id: id });
      if (category) {
        await category.remove();
        req.flash("alertMessage", "Success Delete Category");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect("/admin/category");
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      res.redirect("/admin/category");
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
    }
  },
  viewBank: async (req, res) => {
    try {
      const bank = await Bank.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/bank/view_bank", {
        bank,
        alert,
        title: "Staycation | Bank",
        user: req.session.user,
      });
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("admin/bank");
    }
  },
  addBank: async (req, res) => {
    try {
      const { nameBank, nomorRekening, name } = req.body;
      await Bank.create({
        nameBank,
        nomorRekening,
        name,
        imageUrl: `images/${req.file.filename}`,
      });
      req.flash("alertMessage", "Success Add Bank");
      req.flash("alertStatus", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("/admin/bank");
    }
  },
  editBank: async (req, res) => {
    try {
      const { id, nameBank, nomorRekening, name } = req.body;
      const bank = await Bank.findOne({ _id: id });
      if (bank) {
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        bank.name = name;
        if (req.file) {
          await fs.unlink(path.join(`public/${bank.imageUrl}`));
          bank.imageUrl = `images/${req.file.filename}`;
        }
        await bank.save();
        req.flash("alertMessage", "Success Update Bank");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect("/admin/bank");
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/bank");
    }
  },
  deleteBank: async (req, res) => {
    try {
      const { id } = req.params;
      const bank = await Bank.findOne({ _id: id });
      if (bank) {
        await bank.remove();
        await fs.unlink(path.join(`public/${bank.imageUrl}`));
        req.flash("alertMessage", "Success Delete bank");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect("/admin/bank");
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      res.redirect("/admin/bank");
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
    }
  },
  viewItem: async (req, res) => {
    try {
      const item = await Item.find()
        .populate({ path: "imageId", select: "id imageUrl" })
        .populate({ path: "categoryId", select: "id name" });
      const category = await Category.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/item/view_item", {
        item,
        category,
        alert,
        title: "Staycation | Item",
        action: "view",
        user: req.session.user,
      });
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("admin/item");
    }
  },
  addItem: async (req, res) => {
    try {
      const { categoryId, title, price, city, about } = req.body;
      if (req.files.length > 0) {
        const category = await Category.findOne({ _id: categoryId });
        const item = await Item.create({
          categoryId: category._id,
          title,
          description: about,
          price,
          city,
        });
        category.itemId.push({ _id: item._id });
        await category.save();
        for (let i = 0; i < req.files.length; i++) {
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`,
          });
          item.imageId.push({ _id: imageSave._id });
          await item.save();
        }
        req.flash("alertMessage", "Success Add Item");
        req.flash("alertStatus", "success");
        res.redirect("/admin/item");
      }
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect("/admin/item");
    }
  },
  showImageItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id }).populate({
        path: "imageId",
        select: "id imageUrl",
      });
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/item/view_item", {
        item,
        alert,
        title: "Staycation | Show Image Item",
        action: "show image",
        user: req.session.user,
      });
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/item");
    }
  },
  showEditItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({
          path: "imageId",
          select: "id imageUrl",
        })
        .populate({
          path: "categoryId",
          select: "id name",
        });
      const category = await Category.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/item/view_item", {
        item,
        category,
        alert,
        title: "Staycation | Show Edit Item",
        action: "edit",
        user: req.session.user,
      });
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/item");
    }
  },
  editItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, title, price, city, about } = req.body;
      const item = await Item.findOne({ _id: id })
        .populate({
          path: "imageId",
          select: "id imageUrl",
        })
        .populate({
          path: "categoryId",
          select: "id name",
        });
      if (item) {
        item.title = title;
        item.price = price;
        item.city = city;
        item.description = about;
        item.categoryId = categoryId;
        if (req.files.length > 0) {
          for (let i = 0; i < item.imageId.length; i++) {
            const imageUpdate = await Image.findOne({
              _id: item.imageId[i].id,
            });
            await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
            imageUpdate.imageUrl = `images/${req.files[i].filename}`;
            await imageUpdate.save();
          }
        }
        await item.save();
        req.flash("alertMessage", "Success Update Item");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect("/admin/item");
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/item");
    }
  },
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the item and populate the associated image data
      const item = await Item.findOne({ _id: id }).populate("imageId");

      if (!item) {
        req.flash("alertMessage", "Item not found");
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/item");
      }

      // Use Promise.all to handle multiple asynchronous operations
      await Promise.all(
        item.imageId.map(async (image) => {
          // Find the image and unlink the file
          const foundImage = await Image.findOne({ _id: image._id });
          if (foundImage) {
            await fs.promises.unlink(
              path.join(`public/${foundImage.imageUrl}`)
            ); // Use fs.promises.unlink for a promise-based approach
            await foundImage.remove();
          }
        })
      );

      // Delete the item
      await item.remove();

      req.flash("alertMessage", "Success Delete Item");
      req.flash("alertStatus", "success");
      res.redirect("/admin/item");
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/item");
    }
  },
  viewDetailItem: async (req, res) => {
    const { itemId } = req.params;
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      const feature = await Feature.find({ itemId });
      console.log("item", itemId);
      console.log("feature", feature);
      const activity = await Activity.find({ itemId });
      res.render("admin/item/detail_item/view_detail_item", {
        itemId,
        feature,
        activity,
        alert,
        title: "Staycation | Detail Item",
        user: req.session.user,
      });
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;
    try {
      if (!req.file) {
        req.flash("alertMessage", "Image Not Found");
        req.flash("alertStatus", "danger");
        return res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      const item = await Item.findOne({ _id: itemId });
      item.featureId.push({ _id: feature._id });
      await item.save();

      req.flash("alertMessage", "Success Add Feature");
      req.flash("alertStatus", "success");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  editFeature: async (req, res) => {
    const { id, name, qty, itemId } = req.body;
    try {
      const feature = await Feature.findOne({ _id: id });
      if (feature) {
        feature.name = name;
        feature.qty = qty;
        if (req.file) {
          await fs.unlink(path.join(`public/${feature.imageUrl}`));
          feature.imageUrl = `images/${req.file.filename}`;
        }
        await feature.save();
        req.flash("alertMessage", "Success Update Feature");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const feature = await Feature.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId }).populate("featureId");

      if (feature && item) {
        for (let i = 0; i < item.featureId.length; i++) {
          if (item.featureId[i]._id.toString() === feature._id.toString()) {
            item.featureId.pull({ _id: feature._id });
            await item.save();
          }
        }
        await feature.remove();
        await fs.unlink(path.join(`public/${feature.imageUrl}`));
        req.flash("alertMessage", "Success Delete Feature");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
    }
  },
  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body;
    try {
      if (!req.file) {
        req.flash("alertMessage", "Image Not Found");
        req.flash("alertStatus", "danger");
        return res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      const activity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      const item = await Item.findOne({ _id: itemId });
      item.activityId.push({ _id: activity._id });
      await item.save();

      req.flash("alertMessage", "Success Add Activity");
      req.flash("alertStatus", "success");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.error(error.message);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // res.status(500).send('Server Error');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  editActivity: async (req, res) => {
    const { id, name, type, itemId } = req.body;
    try {
      const activity = await Activity.findOne({ _id: id });
      if (activity) {
        activity.name = name;
        activity.type = type;
        if (req.file) {
          await fs.unlink(path.join(`public/${activity.imageUrl}`));
          activity.imageUrl = `images/${req.file.filename}`;
        }
        await activity.save();
        req.flash("alertMessage", "Success Update Activity");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const activity = await Activity.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId }).populate("activityId");

      if (activity && item) {
        for (let i = 0; i < item.activityId.length; i++) {
          if (item.activityId[i]._id.toString() === activity._id.toString()) {
            item.activityId.pull({ _id: activity._id });
            await item.save();
          }
        }
        await activity.remove();
        await fs.unlink(path.join(`public/${activity.imageUrl}`));
        req.flash("alertMessage", "Success Delete activity");
        req.flash("alertStatus", "success");
      } else {
        console.error("id not found");
      }

      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server Error');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
    }
  },
  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find()
        .populate("memberId")
        .populate("bankId");
      res.render("admin/booking/view_booking", {
        booking,
        title: "Staycation | Booking",
        user: req.session.user,
      });
    } catch (error) {
      res.render("admin/booking");
    }
  },
  showDetailBooking: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id })
        .populate("memberId")
        .populate("bankId");
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      res.render("admin/booking/show_detail_booking", {
        booking,
        alert,
        title: "Staycation | Detail Booking",
        user: req.session.user,
      });
    } catch (error) {
      res.render("admin/booking");
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = "Accept";
      await booking.save();
      req.flash("alertMessage", "Success Confirmation Payment");
      req.flash("alertStatus", "success");

      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = "Reject";
      await booking.save();
      req.flash("alertMessage", "Success Reject Payment");
      req.flash("alertStatus", "success");

      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },
};
