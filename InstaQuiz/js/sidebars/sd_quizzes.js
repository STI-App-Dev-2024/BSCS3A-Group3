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
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
import { firebaseConfig } from "../firebase.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentLocation = ["Root"];
let currentLocationOnId = [];

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

// Folder fetch on root
document.addEventListener("DOMContentLoaded", () => {
  const itemContainer = document.getElementById("folderContainer");

  // Function to create a single item element
  function createItem(folderId, folderName) {
    const folder = document.createElement("div");

    folder.classList.add("folder"); // for css
    folder.id = `${folderId}`;

    // Folder image element
    const img = document.createElement("img");
    img.src = "../../images/folder.png";
    img.alt = `${folderId}`;
    img.classList.add("folder-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `${folderName}`;
    text.classList.add("folder-text-ff");

    folder.appendChild(img);
    folder.appendChild(text);

    return folder;
  }

  // Fetch folders in Firestore
  const getRootFolders = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const root = collection(userRef, "folders");

          const folderNameSnapshot = await getDocs(root);

          const folderNameList = [];

          folderNameSnapshot.forEach((doc) => {
            // Push the folder data to the array
            folderNameList.push({ id: doc.id, ...doc.data() });
          });

          // Loop through the folder list and append to itemContainer
          folderNameList.forEach((folder) => {
            const { id, folderName } = folder;
            itemContainer.appendChild(createItem(id, folderName));
          });

          return folderNameList;
        } catch (error) {
          console.error("Error retrieving folders: ", error.message);
        }
      }
    });
  };

  getRootFolders();

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

// Quiz fetch on root
document.addEventListener("DOMContentLoaded", () => {
  const itemContainer = document.getElementById("itemContainer");

  // Function to create a single item element
  function createItem(folderId, quizName) {
    const item = document.createElement("div");

    item.classList.add("item"); // for css

    // Quiz image element
    const img = document.createElement("img");
    img.src = "../../images/item.png";
    img.alt = `${folderId}`;
    img.classList.add("item-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `${quizName}`;
    text.classList.add("item-text-ff");

    item.appendChild(img);
    item.appendChild(text);

    return item;
  }

  // Fetch folders in Firestore
  const getRootQuiz = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const root = collection(userRef, "quizzes");

          const quizNameSnapshot = await getDocs(root);

          const quizNameList = [];

          quizNameSnapshot.forEach((doc) => {
            // Push the folder data to the array
            quizNameList.push({ id: doc.id, ...doc.data() });
          });

          quizNameList.forEach((item) => {
            const { id, quizName } = item;
            itemContainer.appendChild(createItem(id, quizName));
          });

          return quizNameList;
        } catch (error) {
          console.error("Error retrieving folders: ", error.message);
        }
      }
    });
  };

  getRootQuiz();

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

// folder creation on firestore
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

          const date = new Date();

          // Use setDoc to add a new document to the folders collection
          await addDoc(foldersRef, {
            parent: "root",
            folderName: folderName,
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

// create dummy quiz item creation on firestore
document.getElementById("dummyBtn").onclick = async () => {
  if (currentLocation == "Root") {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const quizzesRef = collection(userRef, "quizzes");

          const date = new Date();

          await addDoc(quizzesRef, {
            quizName: "quiz item dummy",
            quizCreatedDate: `${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${date
              .getDate()
              .toString()
              .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`, // Format as MM/DD/YY
            quizCreatedTime: `${date.getHours()}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}:${date
              .getSeconds()
              .toString()
              .padStart(2, "0")}`, // Format as HH:MM:SS
          });
          location.reload();
        } catch (error) {
          console.error("Error adding quiz: ", error.message);
          console.error("Error adding quiz: ", error);
          alert("Failed to create quiz.");
        }
      }
    });
  } else {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const quizzesRef = collection(userDocRef, "folders");
          const folderRef = doc(quizzesRef, currentLocationOnId);
          const folderQuizzesRef = collection(folderRef, "quizzes");

          const date = new Date();

          await addDoc(folderQuizzesRef, {
            quizName: "quiz item dummy",
            quizCreatedDate: `${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${date
              .getDate()
              .toString()
              .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`, // Format as MM/DD/YY
            quizCreatedTime: `${date.getHours()}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}:${date
              .getSeconds()
              .toString()
              .padStart(2, "0")}`, // Format as HH:MM:SS
          });
          fetchQuizOnFolder();
        } catch (error) {
          console.error("Error adding quiz: ", error.message);
          console.error("Error adding quiz: ", error);
          alert("Failed to create quiz.");
        }
      }
    });
  }
};

// Function to get a unique folder name based on user input
async function getUniqueFolderName(baseName) {
  const userRef = doc(db, "users", auth.currentUser.uid);
  const foldersRef = collection(userRef, "folders");

  const querySnapshot = await getDocs(foldersRef);
  const existingNames = querySnapshot.docs.map((doc) => doc.data().folderName); // Get folder names

  let uniqueName = baseName;
  let counter = 1;

  // Check if the name exists, and append a counter if it does
  while (existingNames.includes(uniqueName)) {
    uniqueName = `${baseName} (${counter})`;
    counter++;
  }

  return uniqueName;
}

// fetch quiz on folder function (used this function to fetch quizzes on current folder location)
const fetchQuizOnFolder = async () => {
  // Function to create a single item element
  function createItem(folderName, quizName) {
    const item = document.createElement("div");

    item.classList.add("item"); // for css
    item.id = `${folderName}`;

    // Folder image element
    const img = document.createElement("img");
    img.src = "../../images/item.png";
    img.alt = `${folderName}`;
    img.classList.add("item-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `${quizName}`;
    text.classList.add("item-text-ff");

    item.appendChild(img);
    item.appendChild(text);

    return item;
  }

  // Fetch clicked folders
  const getClickedFolders = async () => {
    const folderContainer = document.getElementById("folderContainer");
    const itemContainer = document.getElementById("itemContainer");
    // Remove all folders from the previous folder
    while (folderContainer.firstChild) {
      folderContainer.removeChild(folderContainer.firstChild);
    }
    // Remove all quiz from the previous folder
    while (itemContainer.firstChild) {
      itemContainer.removeChild(itemContainer.firstChild);
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const root = collection(userRef, "folders");
          const folderDocRef = doc(root, currentLocationOnId);
          const rootClickedFolder = collection(folderDocRef, "quizzes");

          const quizNameSnapshot = await getDocs(rootClickedFolder);

          const quizNameList = [];

          quizNameSnapshot.forEach((doc) => {
            quizNameList.push({ id: doc.id, ...doc.data() });
          });

          quizNameList.forEach((item) => {
            const { id, quizName } = item;
            itemContainer.appendChild(createItem(id, quizName));
          });

          return quizNameList;
        } catch (error) {
          console.error("Error retrieving item: ", error.message);
        }
      }
    });
  };

  getClickedFolders();
};

// Function to handle click events
function handleClick(event) {
  const elementId = event.target.id;
  const folderName = event.target.textContent;

  if (elementId == "folderContainer") {
    // do nothing
  } else {
    currentLocation = folderName;
    currentLocationOnId = elementId;
    fetchQuizOnFolder();

    // create greater than sign
    const newH2 = document.createElement("h2");
    newH2.textContent = ">";
    newH2.style.marginLeft = "8px";
    newH2.style.marginRight = "8px";

    // create a directory for folder name clicked
    const dirFolderName = document.getElementById("dirFolderName");
    dirFolderName.textContent = folderName;
    dirFolderName.parentNode.insertBefore(newH2, dirFolderName);
  }
}

const element = document.getElementById("folderContainer");
element.addEventListener("click", handleClick);
