const express = require("express");
const path = require("path"); //to work with file and directories
const app = express();

const multer = require("multer");
const { body, validationResult } = require("express-validator");
const fs = require("fs");

function deleteFile(path) {
  fs.unlink(path, (err) => {
    if (err) {
      console.error("Error deleting file:", path, err);
    } else {
      console.log("Deleted file:", path);
    }
  });
}
let lastSubmittedData = null;

app.set("view engine", "ejs"); //Tell express to use ejs

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get("/", (req, res) => {
  res.render("form", {
    //shows the form.ejs file, sending two empty objects:
    errors: {}, //used to show validation messages
    formData: {}, //used to repopulate form values in case of errors
  });
});

// Create storage configuration for Multer:
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); //save all uploaded files in public/uploads/.
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname; //save it with a unique name like Date-filename
    cb(null, name);
  },
});
const upload = multer({ storage: storage }); //uses above storage configuration with multer. will use this upload variable as middleware in the post route to handle file uploads

app.post(
  "/",
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "other_pics", maxCount: 5 },
  ]),
  [
    // Validation rules
    body("username").trim().notEmpty().withMessage("Username is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("confirm_password")
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email"),

    body("gender").notEmpty().withMessage("Gender is required"),

    body("hobbies").custom((value, { req }) => {
      const h = req.body.hobbies;
      if (!h || (Array.isArray(h) && h.length === 0)) {
        throw new Error("Please select at least one hobby");
      }
      if (typeof h === "string" && h.trim() === "") {
        throw new Error("Please select at least one hobby");
      }
      return true;
    }),

    body("profile_pic").custom((value, { req }) => {
      const file = req.files?.profile_pic?.[0];
      if (!file) throw new Error("Profile picture is required");

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error("Only JPG and PNG images are allowed");
      }

      if (file.size > 1024 * 1024) {
        throw new Error("Profile picture must be less than 1MB");
      }

      return true;
    }),

    body("other_pics").custom((value, { req }) => {
      const files = req.files?.other_pics;

      if (!files || files.length === 0) {
        throw new Error("Please upload at least one other picture");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error(
            "Only JPG and PNG images are allowed for other pictures"
          );
        }
        if (file.size > 1024 * 1024) {
          throw new Error("Each other picture must be less than 1MB");
        }
      }

      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    // Normalize hobbies to an array
    if (!Array.isArray(formData.hobbies)) {
      formData.hobbies = formData.hobbies ? [formData.hobbies] : [];
    }

    // On validation error
    if (!errors.isEmpty()) {
      // Delete uploaded files if any
      if (req.files?.profile_pic) {
        deleteFile(req.files.profile_pic[0].path);
      }
      if (req.files?.other_pics) {
        req.files.other_pics.forEach((file) => deleteFile(file.path));
      }

      return res.render("form", {
        errors: errors.mapped(),
        formData,
      });
    }

    // If validation successful
    const profilePic = req.files?.profile_pic?.[0]?.filename || "";
    const otherPics = req.files?.other_pics?.map((f) => f.filename) || [];

    lastSubmittedData = {
      data: formData,
      profilePic,
      otherPics,
    };

    res.render("result", {
      data: formData,
      profilePic,
      otherPics,
    });
  }
);

app.get("/download", (req, res) => {
  if (!lastSubmittedData) {
    return res.status(400).send("No data to download.");
  }

  const { data, profilePic, otherPics } = lastSubmittedData;

  let content = `User Registration Data\n\n`;
  content += `Username: ${data.username}\n`;
  content += `Email: ${data.email}\n`;
  content += `Gender: ${data.gender}\n`;
  content += `Hobbies: ${(data.hobbies || []).join(", ")}\n`;
  content += `Profile Picture: ${profilePic}\n`;
  content += `Other Pictures: ${otherPics.join(", ")}\n`;

  const filePath = path.join(__dirname, "public", "uploads", "user_data.txt");
  fs.writeFileSync(filePath, content);

  res.download(filePath, "user_data.txt");
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
