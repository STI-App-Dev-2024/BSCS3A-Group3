// Import Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
import { firebaseConfig } from "../firebase.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Drag and Drop functionality
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".upload-box")
    .addEventListener("dragover", function (event) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.add("dragover");
    });

  document
    .querySelector(".upload-box")
    .addEventListener("dragleave", function (event) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.remove("dragover");
    });

  document
    .querySelector(".upload-box")
    .addEventListener("drop", function (event) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.remove("dragover");

      const file = event.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        alert(`File "${file.name}" dropped. Ready to convert!`);

        convertPdfToQuiz(file);
      } else {
        alert("Please drop a valid PDF file.");
      }
    });

  // Trigger when Click the upload Box
  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("fileInput");
  const fileDetails = document.getElementById("fileDetails");
  const fileName = document.getElementById("fileName");
  const pdfIcon = document.getElementById("pdfIcon");

  if (!uploadBox || !fileInput || !fileDetails || !fileName || !pdfIcon) {
    console.error("One or more elements not found");
    return;
  }

  uploadBox.addEventListener("click", () => {
    fileInput.click();

    fileInput.addEventListener("change", (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        const selectedFile = files[0];
        if (selectedFile.type === "application/pdf") {
          fileName.textContent = selectedFile.name;
          fileDetails.style.display = "flex";
        } else {
          fileName.textContent = "Please upload a PDF file.";
          fileDetails.style.display = "none";
        }
      } else {
        fileDetails.style.display = "none";
      }
    });
  });
});

// Tab function
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));
      // Hide all tab contents
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");
      // Show the corresponding tab content
      document
        .getElementById(tab.getAttribute("data-tab"))
        .classList.add("active");
    });
  });
});

// New folder button mouseover
var newFolderBtn = document.getElementById("openNewFolderBtn");
var newFolderIcon = document.getElementById("newfolderIcon");
newFolderBtn.onmouseover = function (event) {
  newFolderIcon.src = "../../images/newfoldergreen.png";
  newFolderBtn.style.color = "#4caf50";
};

// New folder button mouseout
var newFolderBtn = document.getElementById("openNewFolderBtn");
var newFolderIcon = document.getElementById("newfolderIcon");
newFolderBtn.onmouseout = function (event) {
  newFolderIcon.src = "../../images/newfolder.png";
  newFolderBtn.style.color = "";
};

// Modals & functions
document.addEventListener("DOMContentLoaded", () => {
  // Function to handle opening and closing modals
  function setupModal(modalId, buttonId, cancelBtnId = null) {
    var modal = document.getElementById(modalId);
    var btn = document.getElementById(buttonId);
    var cancelBtn = cancelBtnId ? document.getElementById(cancelBtnId) : null;

    function openModal() {
      // Ensure the modal is initially set to display none
      modal.style.display = "flex"; // Show modal for animation
      setTimeout(() => {
        modal.classList.remove("hide");
        modal.classList.add("show");
        modal.style.opacity = "1"; // Start fade-in
      }, 0); // Timeout to allow display to take effect
    }

    function closeModal() {
      modal.style.opacity = "0"; // Start fade-out
      modal.classList.remove("show");
      modal.classList.add("hide");

      setTimeout(() => {
        modal.style.display = "none"; // Hide modal after transition
      }, 300); // Match with CSS transition duration
    }

    // Open the modal when the button is clicked
    btn.onclick = function () {
      openModal();
    };

    // Closes the modal when the cancel button is clicked, if it exists
    if (cancelBtn) {
      cancelBtn.onclick = closeModal;
    }

    // Close the modal when clicking anywhere outside of the modal content
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  // Opens the New Folder modal
  setupModal("myNewFolderModal", "openNewFolderBtn", "cancelBtn");

  // Opens the Create Quiz modal
  setupModal("myCreateQuizModal", "openCreateQuizBtn");
});

// Folder creation function
onAuthStateChanged(auth, (user) => {
  const createFolder = document.getElementById("createBtn");
  if (user) {
    createFolder.onclick = async function () {
      let folderName = document.getElementById("newFolderInput").value;

      // Use a unique folder name based on the user input
      if (folderName == "") {
        folderName = "Untitled folder"; // Default name if input is empty
      }
      folderName = await getUniqueFolderName(folderName); // Get a unique name

      await CreateFolder(folderName); // Pass the folderName to CreateFolder

      async function CreateFolder(name) {
        try {
          const userRef = doc(db, "users", user.uid);
          const foldersRef = collection(userRef, "folders");

          const folderDocRef = doc(foldersRef, name);
          const date = new Date();

          // Use setDoc to add a new document to the folders collection
          await setDoc(folderDocRef, {
            folderCreatedDate: `${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${date
              .getDate()
              .toString()
              .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`, // Format as MM/DD/YY
            folderCreatedTime: `${date.getHours()}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}:${date
              .getSeconds()
              .toString()
              .padStart(2, "0")}`, // Format as HH:MM:SS
          });
          location.reload();
        } catch (error) {
          console.error("Error adding folder: ", error.message);
          console.error("Error adding folder: ", error);
          alert("Failed to create folder.");
        }
      }
    };
  }
});

// Function to get a unique folder name based on user input
async function getUniqueFolderName(baseName) {
  const userRef = doc(db, "users", auth.currentUser.uid);
  const foldersRef = collection(userRef, "folders");

  const querySnapshot = await getDocs(foldersRef);
  const existingNames = querySnapshot.docs.map((doc) => doc.id);

  let uniqueName = baseName;
  let counter = 1;

  // Check for existing folder names and create a unique name
  while (existingNames.includes(uniqueName)) {
    uniqueName = `${baseName} (${counter})`;
    counter++;
  }

  return uniqueName;
}

// Folder fetch and create function
document.addEventListener("DOMContentLoaded", () => {
  const itemContainer = document.getElementById("folderContainer");

  // Function to create a single item element
  function createItem(index) {
    const folder = document.createElement("div");

    folder.classList.add("folder"); // for css

    // Folder image element
    const img = document.createElement("img");
    img.src = "../../images/folder.png";
    img.alt = `${index}`;
    img.classList.add("folder-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `${index}`;
    text.classList.add("folder-text-ff");

    folder.appendChild(img);
    folder.appendChild(text);

    return folder;
  }

  // Fetch folders in firestore
  const getFolders = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const foldersRef = collection(userRef, "folders");

          // Fetch all folder documents
          const folderNameSnapshot = await getDocs(foldersRef);
          const folderNameList = [];

          folderNameSnapshot.forEach((doc) => {
            // Push the folder data to the array
            folderNameList.push({ id: doc.id });
          });

          const folderIdsArray = folderNameList.map((folder) => folder.id);
          // Loop through each ID in the array and append it to itemContainer
          folderIdsArray.forEach((folderId) => {
            itemContainer.appendChild(createItem(folderId));
          });

          // You can also update the UI or perform other actions with the folderList
          return folderNameList; // Return or process the folderList as needed
        } catch (error) {
          console.error("Error retrieving folders: ", error.message);
        }
      }
    });
  };

  // Call the getFolders function to retrieve and log folders
  getFolders();

  // Event listener for infinite scrolling
  function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = itemContainer;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      addItems(10); // Load 10 more items when reaching the bottom
    }
  }

  // Initialize the list with initial items and set up scroll listener
  itemContainer.addEventListener("scroll", handleScroll);
});

// item creation function
document.addEventListener("DOMContentLoaded", () => {
  const itemContainer = document.getElementById("itemContainer");

  // Function to create a single item element
  function createItem(index) {
    const item = document.createElement("div");
    item.classList.add("item");

    // Folder image element
    const img = document.createElement("img");
    img.src = "../../images/item.png";
    img.alt = `Item ${index + 1} Image`;
    img.classList.add("item-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `Item ${index + 1}`;
    text.classList.add("item-text-ff");

    item.appendChild(img);
    item.appendChild(text);

    return item;
  }

  // Function to add multiple items to the container
  function addItems(count = 3) {
    const currentCount = itemContainer.childElementCount;
    for (let i = 0; i < count; i++) {
      itemContainer.appendChild(createItem(currentCount + i));
    }
  }
  addItems();

  // Event listener for infinite scrolling
  function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = itemContainer;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      addItems(10); // Load 10 more items when reaching the bottom
    }
  }

  // Initialize the list with initial items and set up scroll listener
  itemContainer.addEventListener("scroll", handleScroll);
});
