// Import Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
import { firebaseConfig } from "../js/firebase.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fetch user details on profile and update UI
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userId = user.uid;
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // fetch user's name
      const firstName = userData.firstName;
      const capitalizedFirstName = capitalizeFirstLetter(firstName);
      firstNameInput.value = capitalizedFirstName;

      // fetch user's middle name
      const middleName = userData.middleName;
      const capitalizedMiddleName = capitalizeFirstLetter(middleName);
      middleNameInput.value = capitalizedMiddleName;

      // fetch user's last name
      const lastName = userData.lastName;
      const capitalizedLastName = capitalizeFirstLetter(lastName);
      lastNameInput.value = capitalizedLastName;

      // fetch user's email address
      const email = userData.email;
      emailAddressInput.value = email;

      // Display the user's name on the homepage
      document.querySelector(
        ".user-name"
      ).textContent = `${capitalizedFirstName} ${capitalizedMiddleName} ${capitalizedLastName}`;
    } else {
      console.error("No such document in Firestore!");
    }
  } else {
    window.location.href = "signin.html";
  }
});

//capitalize the first letter
function capitalizeFirstLetter(string) {
  if (!string) return " ";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// JavaScript to toggle profile drawer
let isClicked = false;
document
  .querySelector(".user-profile")
  .addEventListener("click", function (event) {
    const profileDrawer = document.getElementById("profileDrawer");
    const downArrowImage = document.querySelector(".arrow-icon img");
    const userName = this.querySelector(".user-name");

    if (
      profileDrawer.style.display === "none" ||
      profileDrawer.style.display === ""
    ) {
      profileDrawer.style.display = "block";
      downArrowImage.src = "../images/up_arrow.png";
      userName.style.color = "#4caf50"; // Set color to green on click
      isClicked = true;
    } else {
      profileDrawer.style.display = "none";
      isClicked = false;
      if (!isClicked) {
        userName.style.color = "";
        downArrowImage.src = "../images/down_arrow.png";
      }
    }
  });

// Change color on mouse over
document
  .querySelector(".user-profile")
  .addEventListener("mouseover", function () {
    const userName = this.querySelector(".user-name");
    if (!isClicked) {
      userName.style.color = "#4caf50";
    }
  });

// Reset color on mouse out
document
  .querySelector(".user-profile")
  .addEventListener("mouseout", function () {
    const userName = this.querySelector(".user-name");
    if (!isClicked) {
      userName.style.color = "";
    }
  });

// Hide the drawer if clicked outside of it
document.addEventListener("click", function (event) {
  const profileDrawer = document.getElementById("profileDrawer");
  const downArrowImage = document.querySelector(".arrow-icon img");
  const userProfile = document.querySelector(".user-profile");

  if (!userProfile.contains(event.target)) {
    profileDrawer.style.display = "none";
    downArrowImage.src = "../images/down_arrow.png";
    const userName = userProfile.querySelector(".user-name");
    userName.style.color = "";
    isClicked = false;
  }
});

// Profile
function createModal() {
  // Modal div
  var modal = document.createElement("div");
  modal.id = "myModal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.zIndex = "1";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.overflow = "auto";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.opacity = "0";
  modal.style.transition = "opacity 0.5s";

  // Modal content div
  var modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.margin = "1.5% auto";
  modalContent.style.padding = "40px 50px";
  modalContent.style.border = "1px solid #888";
  modalContent.style.borderRadius = "10px";
  modalContent.style.width = "32%";
  modalContent.style.boxSizing = "border-box";
  modalContent.style.boxShadow = "0px 0px 50px rgba(0, 0, 0, 0.4)";

  // Close button (span)
  var closeButton = document.createElement("span");
  closeButton.innerHTML = "&times;";
  closeButton.style.color = "#aaa";
  closeButton.style.float = "right";
  closeButton.style.fontSize = "28px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.cursor = "pointer";

  // Default profile image
  var default_profile = document.createElement("img");
  default_profile.src = "../images/default_profile.png";
  default_profile.alt = "Profile Image";
  default_profile.style.margin = "0 auto";
  default_profile.style.display = "block";
  default_profile.style.marginBottom = "10px";
  default_profile.style.width = "50%";
  default_profile.style.height = "auto";

  // Track shape profile
  var trackShapeYourProfile = document.createElement("img");
  trackShapeYourProfile.src = "../images/trackshapeyourprofile.png";
  trackShapeYourProfile.style.marginTop = "20px";
  trackShapeYourProfile.style.marginBottom = "25px";
  trackShapeYourProfile.style.width = "100%";
  trackShapeYourProfile.style.height = "auto";

  // Track shape change password
  var trackShapeChangePassword = document.createElement("img");
  trackShapeChangePassword.src = "../images/trackshapechangepassword.png";
  trackShapeChangePassword.style.display = "none";
  trackShapeChangePassword.style.marginTop = "25px";
  trackShapeChangePassword.style.marginBottom = "30px";
  trackShapeChangePassword.style.width = "100%";
  trackShapeChangePassword.style.height = "auto";

  // First name label
  var firstNameLabel = document.createElement("label");
  firstNameLabel.innerHTML = "First Name";
  firstNameLabel.style.display = "block";
  firstNameLabel.style.marginBottom = "10px";

  // First name input field
  var firstNameInput = document.createElement("input");
  firstNameInput.type = "text";
  firstNameInput.id = "firstNameInput";
  firstNameInput.style.fontSize = "15px";
  firstNameInput.style.width = "100%";
  firstNameInput.style.padding = "8px";
  firstNameInput.style.marginBottom = "20px";
  firstNameInput.style.border = "1px solid #ccc";
  firstNameInput.style.borderRadius = "4px";
  firstNameInput.style.boxSizing = "border-box";
  firstNameInput.disabled = true;

  // Middle name label
  var middleNameLabel = document.createElement("label");
  middleNameLabel.innerHTML = "Middle Name";
  middleNameLabel.style.display = "block";
  middleNameLabel.style.marginBottom = "10px";

  // Middle name input field
  var middleNameInput = document.createElement("input");
  middleNameInput.type = "text";
  middleNameInput.id = "middleNameInput";
  middleNameInput.style.fontSize = "15px";
  middleNameInput.style.width = "100%";
  middleNameInput.style.padding = "8px";
  middleNameInput.style.marginBottom = "20px";
  middleNameInput.style.border = "1px solid #ccc";
  middleNameInput.style.borderRadius = "4px";
  middleNameInput.style.boxSizing = "border-box";
  middleNameInput.disabled = true;

  // Last name label
  var lastNameLabel = document.createElement("label");
  lastNameLabel.innerHTML = "Last Name";
  lastNameLabel.style.display = "block";
  lastNameLabel.style.marginBottom = "10px";

  // Last name input field
  var lastNameInput = document.createElement("input");
  lastNameInput.type = "text";
  lastNameInput.id = "lastNameInput";
  lastNameInput.style.fontSize = "15px";
  lastNameInput.style.width = "100%";
  lastNameInput.style.padding = "8px";
  lastNameInput.style.marginBottom = "20px";
  lastNameInput.style.border = "1px solid #ccc";
  lastNameInput.style.borderRadius = "4px";
  lastNameInput.style.boxSizing = "border-box";
  lastNameInput.disabled = true;

  // email address label
  var emailAddressLabel = document.createElement("label");
  emailAddressLabel.innerHTML = "Email Address";
  emailAddressLabel.style.display = "block";
  emailAddressLabel.style.marginBottom = "10px";

  // email address input field
  var emailAddressInput = document.createElement("input");
  emailAddressInput.type = "text";
  emailAddressInput.id = "emailAddressInput";
  emailAddressInput.style.fontSize = "15px";
  emailAddressInput.style.width = "100%";
  emailAddressInput.style.padding = "8px";
  emailAddressInput.style.marginBottom = "20px";
  emailAddressInput.style.border = "1px solid #ccc";
  emailAddressInput.style.borderRadius = "4px";
  emailAddressInput.style.boxSizing = "border-box";
  emailAddressInput.disabled = true;

  // password label
  var currentPasswordLabel = document.createElement("label");
  currentPasswordLabel.innerHTML = "Current Password";
  currentPasswordLabel.style.display = "block";
  currentPasswordLabel.style.marginBottom = "10px";

  // password input field
  var currentPasswordInput = document.createElement("input");
  currentPasswordInput.type = "text";
  currentPasswordInput.id = "currentPasswordInput";
  currentPasswordInput.value = "••••••••";
  currentPasswordInput.placeholder = "Enter current password";
  currentPasswordInput.type = "password";
  currentPasswordInput.style.fontSize = "15px";
  currentPasswordInput.style.width = "100%";
  currentPasswordInput.style.padding = "8px";
  currentPasswordInput.style.marginBottom = "20px";
  currentPasswordInput.style.border = "1px solid #ccc";
  currentPasswordInput.style.borderRadius = "4px";
  currentPasswordInput.style.boxSizing = "border-box";
  currentPasswordInput.disabled = true;

  // new password label
  var newPasswordLabel = document.createElement("label");
  newPasswordLabel.innerHTML = "New Password";
  newPasswordLabel.style.display = "block";
  newPasswordLabel.style.marginBottom = "10px";

  // new password input field (if edit profile is clicked)
  var newPasswordInput = document.createElement("input");
  newPasswordInput.type = "text";
  newPasswordInput.id = "newPasswordInput";
  newPasswordInput.placeholder = "Enter new password here";
  newPasswordInput.type = "password";
  newPasswordInput.style.fontSize = "15px";
  newPasswordInput.style.width = "100%";
  newPasswordInput.style.padding = "8px";
  newPasswordInput.style.marginBottom = "20px";
  newPasswordInput.style.border = "1px solid #757575";
  newPasswordInput.style.borderRadius = "4px";
  newPasswordInput.style.boxSizing = "border-box";

  // confirm password label
  var confirmPasswordLabel = document.createElement("label");
  confirmPasswordLabel.innerHTML = "Confirm New Password";
  confirmPasswordLabel.style.display = "block";
  confirmPasswordLabel.style.marginBottom = "10px";

  // confirm password input field (if edit profile is clicked)
  var confirmPasswordInput = document.createElement("input");
  confirmPasswordInput.type = "text";
  confirmPasswordInput.id = "confirmPasswordInput";
  confirmPasswordInput.placeholder = "Confirm new password here";
  confirmPasswordInput.type = "password";
  confirmPasswordInput.style.fontSize = "15px";
  confirmPasswordInput.style.width = "100%";
  confirmPasswordInput.style.padding = "8px";
  confirmPasswordInput.style.marginBottom = "20px";
  confirmPasswordInput.style.border = "1px solid #757575";
  confirmPasswordInput.style.borderRadius = "4px";
  confirmPasswordInput.style.boxSizing = "border-box";

  // Edit profile button
  var editProfileButton = document.createElement("button");
  editProfileButton.style.boxSizing = "border-box";
  editProfileButton.style.display = "flex";
  editProfileButton.style.padding = "12px 20px";
  editProfileButton.style.justifyContent = "center";
  editProfileButton.style.border = "none";
  editProfileButton.style.borderRadius = "10px";
  editProfileButton.style.backgroundColor = "#fff";
  editProfileButton.style.border = "2px solid #4caf50";
  editProfileButton.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.2)";
  editProfileButton.style.color = "#000";
  editProfileButton.style.fontSize = "18px";
  editProfileButton.style.cursor = "pointer";
  editProfileButton.style.transition = "all 0.3s ease";
  editProfileButton.innerHTML = "Edit Profile";

  // Edit profile button hovered color
  editProfileButton.onmouseover = function () {
    editProfileButton.style.backgroundColor = "#4caf50";
    editProfileButton.style.color = "#fff";
    editProfileButton.style.boxShadow = "0px 6px 20px rgba(0, 0, 0, 0.4)";
  };

  // Edit profile button hovered out color
  editProfileButton.onmouseout = function () {
    editProfileButton.style.backgroundColor = "#fff";
    editProfileButton.style.color = "#000";
    editProfileButton.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.2)";
  };

  // Change password button
  var changePasswordButton = document.createElement("button");
  changePasswordButton.style.boxSizing = "border-box";
  changePasswordButton.style.display = "flex";
  changePasswordButton.style.justifyContent = "center";
  changePasswordButton.style.alignItems = "center";
  changePasswordButton.style.padding = "12px 20px";
  changePasswordButton.style.backgroundColor = "#4caf50";
  changePasswordButton.style.borderRadius = "10px";
  changePasswordButton.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.4)";
  changePasswordButton.style.color = "#fff";
  changePasswordButton.style.fontSize = "18px";
  changePasswordButton.style.cursor = "pointer";
  changePasswordButton.style.border = "none";
  changePasswordButton.innerHTML = "Change Password";
  changePasswordButton.style.transition = "all 0.3s ease";

  // Change password button hover effects
  changePasswordButton.onmouseover = function () {
    changePasswordButton.style.backgroundColor = "#73c777";
    changePasswordButton.style.color = "#fff";
    changePasswordButton.style.boxShadow = "0px 6px 20px rgba(0, 0, 0, 0.4)";
  };

  // Change password button hovered out color
  changePasswordButton.onmouseout = function () {
    changePasswordButton.style.backgroundColor = "#4caf50";
    changePasswordButton.style.color = "#fff";
    changePasswordButton.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.3)";
  };

  // Accept changes button
  var acceptChangesButton = document.createElement("button");
  acceptChangesButton.style.boxSizing = "border-box";
  acceptChangesButton.style.display = "block";
  acceptChangesButton.style.margin = "0 auto";
  acceptChangesButton.style.marginTop = "10px";
  acceptChangesButton.style.padding = "12px 20px";
  acceptChangesButton.style.border = "none";
  acceptChangesButton.style.backgroundColor = "#4caf50";
  acceptChangesButton.style.borderRadius = "10px";
  acceptChangesButton.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.4)";
  acceptChangesButton.style.color = "#fff";
  acceptChangesButton.style.fontSize = "18px";
  acceptChangesButton.style.cursor = "pointer";
  acceptChangesButton.innerHTML = "Accept Changes";
  acceptChangesButton.style.transition = "all 0.3s ease";

  // Accept changes button hovered color
  acceptChangesButton.onmouseover = function () {
    acceptChangesButton.style.backgroundColor = "#73c777";
    acceptChangesButton.style.color = "#fff";
    acceptChangesButton.style.boxShadow = "0px 6px 20px rgba(0, 0, 0, 0.4)";
  };

  // Accept changes button hovered out color
  acceptChangesButton.onmouseout = function () {
    acceptChangesButton.style.backgroundColor = "#4caf50";
    acceptChangesButton.style.color = "#fff";
    acceptChangesButton.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.3)";
  };

  // Set new password button
  var saveNewPaswordButton = document.createElement("button");
  saveNewPaswordButton.style.boxSizing = "border-box";
  saveNewPaswordButton.style.display = "block";
  saveNewPaswordButton.style.margin = "0 auto";
  saveNewPaswordButton.style.marginTop = "10px";
  saveNewPaswordButton.style.padding = "12px 20px";
  saveNewPaswordButton.style.border = "none";
  saveNewPaswordButton.style.backgroundColor = "#4caf50";
  saveNewPaswordButton.style.borderRadius = "10px";
  saveNewPaswordButton.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.4)";
  saveNewPaswordButton.style.color = "#fff";
  saveNewPaswordButton.style.fontSize = "18px";
  saveNewPaswordButton.style.cursor = "pointer";
  saveNewPaswordButton.innerHTML = "Save New Password";
  saveNewPaswordButton.style.transition = "all 0.3s ease";

  // Accept changes button hovered color
  saveNewPaswordButton.onmouseover = function () {
    saveNewPaswordButton.style.backgroundColor = "#73c777";
    saveNewPaswordButton.style.color = "#fff";
    saveNewPaswordButton.style.boxShadow = "0px 6px 20px rgba(0, 0, 0, 0.4)";
  };

  // Accept changes button hovered out color
  saveNewPaswordButton.onmouseout = function () {
    saveNewPaswordButton.style.backgroundColor = "#4caf50";
    saveNewPaswordButton.style.color = "#fff";
    saveNewPaswordButton.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.3)";
  };

  // Edit profile & Change password button container
  var button1Container = document.createElement("div");
  button1Container.style.display = "flex";
  button1Container.style.justifyContent = "center";
  button1Container.style.gap = "30px"; // spacing between buttons
  button1Container.style.marginTop = "10px";
  button1Container.appendChild(editProfileButton);
  button1Container.appendChild(changePasswordButton);

  // Append all fields
  modalContent.appendChild(closeButton);
  modalContent.appendChild(default_profile);
  modalContent.appendChild(trackShapeYourProfile);
  modalContent.appendChild(trackShapeChangePassword);
  modalContent.appendChild(firstNameLabel);
  modalContent.appendChild(firstNameInput);
  modalContent.appendChild(middleNameLabel);
  modalContent.appendChild(middleNameInput);
  modalContent.appendChild(lastNameLabel);
  modalContent.appendChild(lastNameInput);
  modalContent.appendChild(emailAddressLabel);
  modalContent.appendChild(emailAddressInput);
  modalContent.appendChild(currentPasswordLabel);
  modalContent.appendChild(currentPasswordInput);
  modalContent.appendChild(button1Container);

  // Append the modal content to the modal
  modal.appendChild(modalContent);

  // Append the modal to the body
  document.body.appendChild(modal);

  // Open the modal when the button is clicked
  document.querySelector(".profile").onclick = function () {
    modal.style.display = "block";
    setTimeout(function () {
      modal.style.opacity = "1";
    }, 10);
  };

  // Close the modal with fade-out effect
  closeButton.onclick = function () {
    modal.style.opacity = "0"; // Fade out effect
    setTimeout(function () {
      modal.style.display = "none";
      location.reload();
    }, 500);
  };

  // Close the modal when clicking anywhere outside of the modal content
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.opacity = "0";
      setTimeout(function () {
        modal.style.display = "none";
        location.reload();
      }, 500);
    }
  });

  // Edit profile button when clicked
  editProfileButton.onclick = function () {
    // Enable fields
    firstNameInput.disabled = false;
    firstNameInput.style.border = "1px solid #757575";
    middleNameInput.disabled = false;
    middleNameInput.style.border = "1px solid #757575";
    lastNameInput.disabled = false;
    lastNameInput.style.border = "1px solid #757575";

    // Hides email address and button
    emailAddressLabel.style.display = "none";
    emailAddressInput.style.display = "none";
    currentPasswordLabel.style.display = "none";
    currentPasswordInput.style.display = "none";
    button1Container.style.display = "none";

    // Append new fields
    modalContent.appendChild(acceptChangesButton);
  };

  // Change password button when clicked
  changePasswordButton.onclick = function () {
    // Enable fields
    trackShapeChangePassword.style.display = "block";
    currentPasswordInput.disabled = false;
    currentPasswordInput.value = "";
    currentPasswordInput.style.border = "1px solid #757575";

    // Hides email address and button
    default_profile.style.display = "none";
    trackShapeYourProfile.style.display = "none";
    firstNameLabel.style.display = "none";
    firstNameInput.style.display = "none";
    middleNameLabel.style.display = "none";
    middleNameInput.style.display = "none";
    lastNameLabel.style.display = "none";
    lastNameInput.style.display = "none";
    emailAddressLabel.style.display = "none";
    emailAddressInput.style.display = "none";
    button1Container.style.display = "none";

    // Append new fields
    modalContent.appendChild(newPasswordLabel);
    modalContent.appendChild(newPasswordInput);
    modalContent.appendChild(confirmPasswordLabel);
    modalContent.appendChild(confirmPasswordInput);
    modalContent.appendChild(saveNewPaswordButton);

    // Sets modal/window size
    modalContent.style.margin = "10% auto";
    modalContent.style.paddingTop = "25px";
    modalContent.style.paddingBottom = "35px";
  };

  // Accept changes button when clicked
  acceptChangesButton.onclick = async function () {
    onAuthStateChanged(auth, async (user) => {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // this checks if there are any changes on names
      if (
        firstNameInput.value.trim() === userData.firstName.trim() &&
        middleNameInput.value.trim() === userData.middleName.trim() &&
        lastNameInput.value.trim() === userData.lastName.trim()
      ) {
        alert("No changes to the information.");
        location.reload();
      } else {
        // Check for empty fields
        if (
          firstNameInput.value.trim() === "" ||
          lastNameInput.value.trim() === ""
        ) {
          alert("Please fill out all required fields.");
        } else {
          try {
            var updates = {
              firstName: firstNameInput.value.trim(),
              middleName: middleNameInput.value.trim(),
              lastName: lastNameInput.value.trim(),
            };

            // update to database
            await updateDoc(userDocRef, updates);
            alert("Information updated successfully!");
            location.reload();
          } catch (error) {
            console.error("Error updating document: ", error);
            alert("Error updating document: " + error.message);
          }
        }
      }
    });
  };

  // Set new password button when clicked
  saveNewPaswordButton.onclick = async function () {
    onAuthStateChanged(auth, async (user) => {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // checks if all the input fields are filled. (all password inputs must be filled)
      if (
        currentPasswordInput.value !== "" &&
        newPasswordInput.value !== "" &&
        confirmPasswordInput.value !== ""
      ) {
        // checks if new password is matched.
        if (newPasswordInput.value === confirmPasswordInput.value) {
          // Function to change the user's password
          async function changePassword(currentPassword, newPassword) {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
              const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
              );

              try {
                // Re-authenticate the user
                await reauthenticateWithCredential(user, credential);
                // Update the password in the database
                await updatePassword(user, newPassword);

                alert("Password updated successfully!");
                location.reload();
              } catch (error) {
                alert(
                  "The current password you entered is incorrect. Please try again."
                );
              }
            } else {
              alert("No user is currently logged in.");
            }
          }

          // Gets the value on user input
          const currentPasswordValue = currentPasswordInput.value;
          const newPasswordValue = newPasswordInput.value;
          changePassword(currentPasswordValue, newPasswordValue);
        } else {
          // Else for if password match checker
          alert("New password doesn't match!");
        }
      } else {
        // Else for if fields are empty
        alert("Please fill out all password fields.");
      }
    });
  };
}

// Call the function to create the profile modal
createModal();

// logout function
document.querySelector(".logout").addEventListener("click", function (event) {
  event.preventDefault();
  // confirm logout action
  if (confirm("Are you sure you want to logout?")) {
    // log out from Firebase
    auth
      .signOut()
      .then(() => {
        // Delay the success alert for 1 second (1000 milliseconds)
        setTimeout(() => {
          alert("Logged out successfully!");
          window.location.href = "../html/welcome.html";
        }, 3000);
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Error logging out. Please try again.");
      });
  }
});

