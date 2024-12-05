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
  deleteDoc,
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

FetchRootFolders();
FetchRootQuizzes();

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
      modal.style.display = "flex";
      setTimeout(() => {
        modal.classList.remove("hide");
        modal.classList.add("show");
        modal.style.opacity = "1";
      }, 0);
    }

    function closeModal() {
      modal.style.opacity = "0";
      modal.classList.remove("show");
      modal.classList.add("hide");

      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
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

// Root btn
document.addEventListener("DOMContentLoaded", () => {
  const rootBtn = document.getElementById("root");
  rootBtn.onclick = async function () {
    Clear();
    FetchRootFolders();
    FetchRootQuizzes();
  };
});

function Clear() {
  currentLocation = "Root";
  currentLocationOnId = [];

  // restores the new folder button
  newFolderBtn.style.visibility = "visible";

  // removes the directory
  const dirFolderName = document.getElementById("dirFolderName");
  dirFolderName.innerHTML = "";

  // removes the quiz on previous folder
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
}

// Folder fetch on root and quiz settings
function FetchRootFolders() {
  const itemContainer = document.getElementById("folderContainer");

  // Function to create a single item element
  function createItem(folderId, folderName) {
    const folder = document.createElement("div");

    folder.classList.add("folder"); // for css
    folder.id = `${folderId}`;

    // Folder image element
    const folderImg = document.createElement("img");
    folderImg.src = "../../images/folder.png";
    folderImg.classList.add("folder-image-ff"); // for css
    folderImg.style.pointerEvents = "none";

    // Text element
    const text = document.createElement("span");
    text.textContent = `${folderName}`;
    text.classList.add("folder-text-ff");
    text.style.pointerEvents = "none";

    // Settings image element
    const settingsImg = document.createElement("img");
    settingsImg.src = "../../images/settings.png";
    settingsImg.classList.add("settings-image-ff"); // for css
    settingsImg.id = "settingsFolder";

    // Settings clicked
    let windowDiv = null;
    settingsImg.addEventListener("click", function (event) {
      // Check if the window already exists
      if (windowDiv) {
        // If the window exists, hide it with fade out animation
        windowDiv.style.opacity = "0";
        windowDiv.style.transform = "scale(0.9)";
        setTimeout(() => {
          windowDiv.remove();
          windowDiv = null;
        }, 300);
        return;
      }

      // Create the window
      const createWindow = () => {
        windowDiv = document.createElement("div");
        windowDiv.style.width = "150px";
        windowDiv.style.border = "1px solid #ccc";
        windowDiv.style.borderRadius = "8px";
        windowDiv.style.backgroundColor = "#f9f9f9";
        windowDiv.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
        windowDiv.style.overflow = "hidden";

        // Fade in animation
        windowDiv.style.opacity = "0";
        windowDiv.style.transform = "scale(0.9)";
        windowDiv.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        // Create the window body
        const bodyDiv = document.createElement("div");
        bodyDiv.style.padding = "10px";
        bodyDiv.style.textAlign = "center";

        // Create the buttons for choices
        const choices = ["Delete", "Rename"];
        choices.forEach((choice) => {
          const button = document.createElement("button");
          button.innerHTML = choice;
          button.style.width = "100%";
          button.style.padding = "10px";
          button.style.margin = "5px 0";
          button.style.color = "black";
          button.style.backgroundColor = "#f9f9f9";
          button.style.border = "none";
          button.style.borderRadius = "4px";
          button.style.cursor = "pointer";

          // Button hover effect
          button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#4caf50";
            button.style.color = "white";
          });
          button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "#f9f9f9";
            button.style.color = "black";
          });

          // Button click event to show alert
          button.addEventListener("click", () => {
            if (choice == "Delete") {
              const isConfirmed = confirm("Are you sure you want to delete?");
              if (isConfirmed) {
                onAuthStateChanged(auth, async (user) => {
                  if (user) {
                    try {
                      const userRef = doc(db, "users", user.uid);
                      const foldersRef = collection(userRef, "folders");
                      const folderDoc = doc(foldersRef, folderId);
                      const folderRef = collection(folderDoc, "quizzes");
                      const folderSnapshot = await getDocs(folderRef);

                      // Deletes all quizzes on folder
                      folderSnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                      });

                      // Deletes the folder
                      await deleteDoc(folderDoc);

                      Clear();
                      FetchRootFolders();
                      FetchRootQuizzes();
                    } catch (error) {
                      console.error("Error deleting document: ", error);
                    }
                  }
                });
              } else {
                // Cancel deletion
              }
            }

            if (choice == "Rename") {
              var modal = document.getElementById("myRenameFolderModal");
              var cancelBtn = "renameCancelBtn"
                ? document.getElementById("renameCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }

              // Close the modal when clicking anywhere outside of the modal content
              window.addEventListener("click", function (event) {
                if (event.target === modal) {
                  closeModal();
                }
              });

              // Gets the current folder name
              let renamedFolder = document.getElementById("renameFolderInput");
              renamedFolder.value = folderName;

              RenameFolder(folderId);
            }

            // hides window
            windowDiv.style.display = "none";
            windowDiv = null;
          });

          bodyDiv.appendChild(button);
        });

        windowDiv.appendChild(bodyDiv);

        // Append the window
        document.body.appendChild(windowDiv);
        requestAnimationFrame(() => {
          windowDiv.style.opacity = "1";
          windowDiv.style.transform = "scale(1)";
        });

        // Add event listener to close the window when clicking outside
        document.addEventListener("click", function closeWindow(event) {
          if (
            !windowDiv.contains(event.target) &&
            event.target !== settingsImg
          ) {
            windowDiv.style.opacity = "0";
            windowDiv.style.transform = "scale(0.9)";
            setTimeout(() => {
              windowDiv.remove();
              windowDiv = null; // Reset the windowDiv to null to track the state
            }, 300);
            document.removeEventListener("click", closeWindow);
          }
        });

        // Update the window position based on mouse movement
        document.addEventListener("click", function (event) {
          if (
            windowDiv &&
            (windowDiv.contains(event.target) || event.target === settingsImg)
          ) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const windowWidth = windowDiv.offsetWidth;
            windowDiv.style.position = "absolute";
            windowDiv.style.top = `${mouseY}px`;
            windowDiv.style.left = `${mouseX - windowWidth}px`;
            windowDiv.style.zIndex = "1000";
          }
        });
      };

      // Call the function to create the window
      createWindow();
    });

    // Arrow image element
    const arrowImg = document.createElement("img");
    arrowImg.src = "../../images/right_arrow.png";
    arrowImg.classList.add("arrow-image-ff"); // for css
    arrowImg.style.pointerEvents = "none";

    folder.appendChild(folderImg);
    folder.appendChild(text);
    folder.appendChild(settingsImg);
    folder.appendChild(arrowImg);

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
}

// Quiz fetch on root and quiz settings
function FetchRootQuizzes() {
  const itemContainer = document.getElementById("itemContainer");

  // Function to create a single item element
  function createItem(quizId, quizName) {
    const item = document.createElement("div");

    item.classList.add("item"); // for css
    item.id = `${quizId}`;

    // Quiz image element
    const img = document.createElement("img");
    img.src = "../../images/item.png";
    img.alt = `${quizId}`;
    img.classList.add("item-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `${quizName}`;
    text.classList.add("item-text-ff");

    // Settings image element
    const settingsImg = document.createElement("img");
    settingsImg.src = "../../images/settings.png";
    settingsImg.classList.add("settings-image-ff"); // for css

    // Settings clicked
    let windowDiv = null;
    settingsImg.addEventListener("click", function () {
      // Check if the window already exists
      if (windowDiv) {
        // If the window exists, hide it with fade out animation
        windowDiv.style.opacity = "0";
        windowDiv.style.transform = "scale(0.9)";
        setTimeout(() => {
          windowDiv.remove();
          windowDiv = null;
        }, 300);
        return;
      }

      // Create the window
      const createWindow = () => {
        // Create the window div
        windowDiv = document.createElement("div");
        windowDiv.style.width = "150px";
        windowDiv.style.border = "1px solid #ccc";
        windowDiv.style.borderRadius = "8px";
        windowDiv.style.backgroundColor = "#f9f9f9";
        windowDiv.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
        windowDiv.style.overflow = "hidden";

        // Create the window body
        const bodyDiv = document.createElement("div");
        bodyDiv.style.padding = "10px";
        bodyDiv.style.textAlign = "center";

        // Fade in animation
        windowDiv.style.opacity = "0";
        windowDiv.style.transform = "scale(0.9)";
        windowDiv.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        // Create the buttons for choices
        const choices = ["Cut", "Copy", "Delete", "Rename"];
        choices.forEach((choice) => {
          const button = document.createElement("button");
          button.innerHTML = choice;
          button.style.width = "100%";
          button.style.padding = "10px";
          button.style.margin = "5px 0";
          button.style.color = "black";
          button.style.backgroundColor = "#f9f9f9";
          button.style.border = "none";
          button.style.borderRadius = "4px";
          button.style.cursor = "pointer";

          // Button hover effect
          button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#4caf50";
            button.style.color = "white";
          });
          button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "#f9f9f9";
            button.style.color = "black";
          });

          // Button click event to show alert
          button.addEventListener("click", () => {
            if (choice == "Cut") {
              var modal = document.getElementById("myCopyQuizModal");
              var cancelBtn = "copyQuizCancelBtn"
                ? document.getElementById("copyQuizCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }

              CutQuiz(quizId, quizName);
            }

            if (choice == "Copy") {
              var modal = document.getElementById("myCopyQuizModal");
              var cancelBtn = "copyQuizCancelBtn"
                ? document.getElementById("copyQuizCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }

              CopyQuiz(quizId, quizName);
            }

            if (choice == "Delete") {
              const isConfirmed = confirm("Are you sure you want to delete?");
              if (isConfirmed) {
                onAuthStateChanged(auth, async (user) => {
                  if (user) {
                    try {
                      const userRef = doc(db, "users", user.uid);
                      const quizzesRef = collection(userRef, "quizzes");
                      const quizRef = doc(quizzesRef, quizId);

                      await deleteDoc(quizRef);

                      Clear();
                      FetchRootFolders();
                      FetchRootQuizzes();
                    } catch (error) {
                      console.error("Error deleting document: ", error);
                    }
                  }
                });
              } else {
                // Cancel deletion
              }
            }

            if (choice == "Rename") {
              var modal = document.getElementById("myRenameQuizModal");
              var cancelBtn = "renameQuizCancelBtn"
                ? document.getElementById("renameQuizCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }

              // Close the modal when clicking anywhere outside of the modal content
              window.addEventListener("click", function (event) {
                if (event.target === modal) {
                  closeModal();
                }
              });

              // Gets the current quiz name
              let renamedQuiz = document.getElementById("renameQuizInput");
              renamedQuiz.value = quizName;

              RenameQuiz(quizId);
            }

            // hides window
            windowDiv.style.display = "none";
            windowDiv = null;
          });

          bodyDiv.appendChild(button);
        });

        windowDiv.appendChild(bodyDiv);

        // Append the window
        document.body.appendChild(windowDiv);
        requestAnimationFrame(() => {
          windowDiv.style.opacity = "1";
          windowDiv.style.transform = "scale(1)";
        });

        // Add event listener to close the window when clicking outside
        document.addEventListener("click", function closeWindow(event) {
          if (
            !windowDiv.contains(event.target) &&
            event.target !== settingsImg
          ) {
            windowDiv.style.opacity = "0";
            windowDiv.style.transform = "scale(0.9)";
            setTimeout(() => {
              windowDiv.remove();
              windowDiv = null; // Reset the windowDiv to null to track the state
            }, 300);
            document.removeEventListener("click", closeWindow);
          }
        });

        // Update the window position based on mouse movement
        document.addEventListener("click", function (event) {
          if (
            windowDiv &&
            (windowDiv.contains(event.target) || event.target === settingsImg)
          ) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const windowWidth = windowDiv.offsetWidth;
            windowDiv.style.position = "absolute";
            windowDiv.style.top = `${mouseY}px`;
            windowDiv.style.left = `${mouseX - windowWidth}px`;
            windowDiv.style.zIndex = "1000";
          }
        });
      };

      // Call the function to create the window
      createWindow();
    });

    // Share image element
    const shareImg = document.createElement("img");
    shareImg.src = "../../images/share.png";
    shareImg.classList.add("share-image-ff"); // for css

    // Share clicked
    shareImg.addEventListener("click", function () {
      var modal = document.getElementById("myShareQuizModal");
      var cancelBtn = "shareQuizCancelBtn"
        ? document.getElementById("shareQuizCancelBtn")
        : null;
      var shareQuizText = document.getElementById("shareQuizText");
      shareQuizText.innerHTML = "Share " + '"' + quizName + '"';

      modal.style.display = "flex";
      setTimeout(() => {
        modal.classList.remove("hide");
        modal.classList.add("show");
        modal.style.opacity = "1";
      }, 0);

      function closeModal() {
        modal.style.opacity = "0";
        modal.classList.remove("show");
        modal.classList.add("hide");

        setTimeout(() => {
          modal.style.display = "none";
        }, 300);
      }

      // Closes the modal when the cancel button is clicked
      if (cancelBtn) {
        cancelBtn.onclick = closeModal;
      }

      // Close the modal when clicking anywhere outside of the modal content
      window.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeModal();
        }
      });
    });

    // Start image element
    const startImg = document.createElement("img");
    startImg.src = "../../images/start.png";
    startImg.classList.add("start-image-ff"); // for css

    item.appendChild(img);
    item.appendChild(text);
    item.appendChild(settingsImg);
    item.appendChild(shareImg);
    item.appendChild(startImg);

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
}

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

      await CreateFolder(folderName);

      async function CreateFolder(name) {
        try {
          const userRef = doc(db, "users", user.uid);
          const foldersRef = collection(userRef, "folders");

          const date = new Date();

          await addDoc(foldersRef, {
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

// quiz copy on firestore
async function CopyQuiz(quizId, quizName, inFolderId) {
  const pasteBtn = document.getElementById("copyQuizBtn");

  pasteBtn.onclick = async function () {
    // closes the modal
    var modal = document.getElementById("myCopyQuizModal");
    modal.style.opacity = "0";
    modal.classList.remove("show");
    modal.classList.add("hide");

    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // If its copied from the folder
          if (inFolderId) {
            // Copied Quiz
            const userDoc = doc(db, "users", user.uid);
            const rootFoldersRef = collection(userDoc, "folders");
            const folderRef = doc(rootFoldersRef, inFolderId);
            const quizzesRef = collection(folderRef, "quizzes");
            const quiz1Ref = doc(quizzesRef, quizId);

            const docSnap = await getDoc(quiz1Ref);

            // If its pasting on the Root
            if (currentLocationOnId == "") {
              if (docSnap.exists()) {
                const docData = docSnap.data();

                var uniqueName = await getUniqueQuizName(quizName); // Get a unique name

                // Add the UniqueName to the document data
                docData.quizName = uniqueName;

                // Paste location
                const rootQuizzessRef = collection(userDoc, "quizzes");
                await addDoc(rootQuizzessRef, docData);
                Clear();
                FetchRootFolders();
                FetchRootQuizzes();
              } else {
                console.log("No such document!");
              }
            }

            //If its pasting on the Folder
            else {
              // target folder ref
              const foldersRef = collection(userDoc, "folders");
              const targetFolderRef = doc(foldersRef, currentLocationOnId);
              const targetQuizRef = collection(targetFolderRef, "quizzes");

              if (docSnap.exists()) {
                const docData = docSnap.data();

                // checks the uniqueness of the quiz name
                const querySnapshot = await getDocs(targetQuizRef);
                const existingNames = new Set(
                  querySnapshot.docs.map((doc) => doc.data().quizName)
                );

                let uniqueName = quizName;
                let counter = 1;

                while (existingNames.has(uniqueName)) {
                  uniqueName = `${quizName} (${counter++})`;
                }

                var UniqueName = uniqueName;

                // Add the UniqueName to the document data
                docData.quizName = UniqueName;

                await addDoc(targetQuizRef, docData);
                fetchQuizOnFolder();
              } else {
                console.log("No such document!");
              }
            }
          }

          // Copied from the root
          else {
            // copied quiz
            const userDoc = doc(db, "users", user.uid);
            const quizzesRef = collection(userDoc, "quizzes");
            const quizRef = doc(quizzesRef, quizId);

            const docSnap = await getDoc(quizRef);

            // If its pasting on the Root
            if (currentLocationOnId == "") {
              // copied quiz ref
              if (docSnap.exists()) {
                const docData = docSnap.data();

                var uniqueName = await getUniqueQuizName(quizName); // Get a unique name

                // Add the UniqueName to the document data
                docData.quizName = uniqueName;

                await addDoc(quizzesRef, docData);
                Clear();
                FetchRootFolders();
                FetchRootQuizzes();
              } else {
                console.log("No such document!");
              }
            }

            //If its pasting on the Folder
            else {
              // target folder ref
              const foldersRef = collection(userDoc, "folders");
              const targetFolderRef = doc(foldersRef, currentLocationOnId);
              const targetQuizRef = collection(targetFolderRef, "quizzes");

              if (docSnap.exists()) {
                const docData = docSnap.data();

                // checks the uniqueness of the quiz name
                const querySnapshot = await getDocs(targetQuizRef);
                const existingNames = new Set(
                  querySnapshot.docs.map((doc) => doc.data().quizName)
                );

                let uniqueName = quizName;
                let counter = 1;

                while (existingNames.has(uniqueName)) {
                  uniqueName = `${quizName} (${counter++})`;
                }

                var UniqueName = uniqueName;

                // Add the UniqueName to the document data
                docData.quizName = UniqueName;

                await addDoc(targetQuizRef, docData);
                fetchQuizOnFolder();
              } else {
                console.log("No such document!");
              }
            }
          }
        } catch (error) {
          console.error("Error copying document: ", error);
        }
      }
    });
  };
}

// quiz cut on firestore
async function CutQuiz(quizId, quizName, inFolderId) {
  const pasteBtn = document.getElementById("copyQuizBtn");

  pasteBtn.onclick = async function () {
    // Closes the modal
    var modal = document.getElementById("myCopyQuizModal");
    modal.style.opacity = "0";
    modal.classList.remove("show");
    modal.classList.add("hide");

    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // If its copied from the folder
          if (inFolderId) {
            // Copied Quiz
            const userDoc = doc(db, "users", user.uid);
            const rootFoldersRef = collection(userDoc, "folders");
            const folderRef = doc(rootFoldersRef, inFolderId);
            const quizzesRef = collection(folderRef, "quizzes");
            const quiz1Ref = doc(quizzesRef, quizId);

            const docSnap = await getDoc(quiz1Ref);

            // If its pasting on the Root
            if (currentLocationOnId == "") {
              if (docSnap.exists()) {
                const docData = docSnap.data();

                var uniqueName = await getUniqueQuizName(quizName); // Get a unique name

                // Add the UniqueName to the document data
                docData.quizName = uniqueName;

                // Paste location
                const rootQuizzessRef = collection(userDoc, "quizzes");
                await addDoc(rootQuizzessRef, docData);

                await deleteDoc(quiz1Ref);
                Clear();
                FetchRootFolders();
                FetchRootQuizzes();
              } else {
                console.log("No such document!");
              }
            }
            // if its in the same location
            else if (currentLocationOnId == inFolderId) {
              // do nothing
            }

            //If its pasting on the Folder
            else {
              // target folder ref
              const foldersRef = collection(userDoc, "folders");
              const targetFolderRef = doc(foldersRef, currentLocationOnId);
              const targetQuizRef = collection(targetFolderRef, "quizzes");

              if (docSnap.exists()) {
                const docData = docSnap.data();

                // checks the uniqueness of the quiz name
                const querySnapshot = await getDocs(targetQuizRef);
                const existingNames = new Set(
                  querySnapshot.docs.map((doc) => doc.data().quizName)
                );

                let uniqueName = quizName;
                let counter = 1;

                while (existingNames.has(uniqueName)) {
                  uniqueName = `${quizName} (${counter++})`;
                }

                var UniqueName = uniqueName;

                // Add the UniqueName to the document data
                docData.quizName = UniqueName;

                await addDoc(targetQuizRef, docData);

                await deleteDoc(quiz1Ref);
                fetchQuizOnFolder();
              } else {
                console.log("No such document!");
              }
            }
          }

          // Copied from the root
          else {
            // copied quiz
            const userDoc = doc(db, "users", user.uid);
            const quizzesRef = collection(userDoc, "quizzes");
            const quizRef = doc(quizzesRef, quizId);

            const docSnap = await getDoc(quizRef);

            // If its pasting on the Root
            if (currentLocationOnId == "") {
              // do nothing
            }

            //If its pasting on the Folder
            else {
              // target folder ref
              const foldersRef = collection(userDoc, "folders");
              const targetFolderRef = doc(foldersRef, currentLocationOnId);
              const targetQuizRef = collection(targetFolderRef, "quizzes");

              if (docSnap.exists()) {
                const docData = docSnap.data();

                // checks the uniqueness of the quiz name
                const querySnapshot = await getDocs(targetQuizRef);
                const existingNames = new Set(
                  querySnapshot.docs.map((doc) => doc.data().quizName)
                );

                let uniqueName = quizName;
                let counter = 1;

                while (existingNames.has(uniqueName)) {
                  uniqueName = `${quizName} (${counter++})`;
                }

                var UniqueName = uniqueName;

                // Add the UniqueName to the document data
                docData.quizName = UniqueName;

                await addDoc(targetQuizRef, docData);

                // deletes the quiz
                await deleteDoc(quizRef);
                fetchQuizOnFolder();
              } else {
                console.log("No such document!");
              }
            }
          }
        } catch (error) {
          console.error("Error copying document: ", error);
        }
      }
    });
  };
}

// folder rename on firestore
function RenameFolder(folderId) {
  onAuthStateChanged(auth, (user) => {
    const renameFolder = document.getElementById("renameBtn");
    if (user) {
      renameFolder.onclick = async function () {
        let renamedFolder = document.getElementById("renameFolderInput").value;

        // Use a unique folder name based on the user input
        if (renamedFolder == "") {
          renamedFolder = "Untitled folder"; // Default name if input is empty
        }
        renamedFolder = await getUniqueFolderName(renamedFolder); // Get a unique name

        await CheckRenameFolder(renamedFolder);

        async function CheckRenameFolder(name) {
          try {
            const userRef = doc(db, "users", user.uid);
            const foldersRef = collection(userRef, "folders");
            const folderRef = doc(foldersRef, folderId);

            await setDoc(
              folderRef,
              { folderName: renamedFolder },
              { merge: true }
            );
            location.reload();
          } catch (error) {
            console.error("Error renaming folder: ", error.message);
            console.error("Error renaming folder: ", error);
            alert("Failed to rename folder.");
          }
        }
      };
    }
  });
}

// quiz rename on firestore
function RenameQuiz(quizId, inFolderId) {
  onAuthStateChanged(auth, (user) => {
    const renamedQuiz = document.getElementById("renameQuizBtn");
    if (user) {
      renamedQuiz.onclick = async function () {
        let renamedQuiz = document.getElementById("renameQuizInput").value;

        // Use a unique folder name based on the user input
        if (renamedQuiz == "") {
          renamedQuiz = "Untitled quiz"; // Default name if input is empty
        }
        await CheckRenameQuiz(renamedQuiz);

        async function CheckRenameQuiz() {
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              try {
                if (inFolderId) {
                  const userRef = doc(db, "users", user.uid);
                  const foldersRef = collection(userRef, "folders");
                  const quizDoc = doc(foldersRef, currentLocationOnId);
                  const quizRef = collection(quizDoc, "quizzes");
                  const quizRef1 = doc(quizRef, quizId);

                  await setDoc(
                    quizRef1,
                    { quizName: renamedQuiz },
                    { merge: true }
                  );
                  fetchQuizOnFolder();
                } else {
                  const userRef = doc(db, "users", user.uid);
                  const quizzesRef = collection(userRef, "quizzes");
                  const quizRef = doc(quizzesRef, quizId);

                  await setDoc(
                    quizRef,
                    { quizName: renamedQuiz },
                    { merge: true }
                  );

                  Clear();
                  FetchRootFolders();
                  FetchRootQuizzes();
                }
              } catch (error) {
                console.error("Error renaming quiz: ", error.message);
                console.error("Error renaming quiz: ", error);
                alert("Failed to renaming quiz.");
              }

              var modal = document.getElementById("myRenameQuizModal");

              modal.style.opacity = "0";
              modal.classList.remove("show");
              modal.classList.add("hide");

              setTimeout(() => {
                modal.style.display = "none";
              }, 300);
            }
          });
        }
      };
    }
  });
}

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

// Function to get a unique quiz name based on user input
async function getUniqueQuizName(baseName) {
  const userRef = doc(db, "users", auth.currentUser.uid);
  const quizzesRef = collection(userRef, "quizzes");

  const querySnapshot = await getDocs(quizzesRef);
  const existingNames = querySnapshot.docs.map((doc) => doc.data().quizName); // Get quiz names

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
  function createItem(quizId, quizName) {
    const item = document.createElement("div");

    item.classList.add("item"); // for css
    item.id = `${quizId}`;

    // Folder image element
    const img = document.createElement("img");
    img.src = "../../images/item.png";
    img.alt = `${quizId}`;
    img.classList.add("item-image-ff"); // for css

    // Text element
    const text = document.createElement("span");
    text.textContent = `${quizName}`;
    text.classList.add("item-text-ff");

    // Settings image element
    const settingsImg = document.createElement("img");
    settingsImg.src = "../../images/settings.png";
    settingsImg.classList.add("settings-image-ff"); // for css

    // Settings clicked
    let windowDiv = null; // Variable to hold the created window
    settingsImg.addEventListener("click", function (event) {
      // Check if the window already exists
      if (windowDiv) {
        // If the window exists, hide it
        windowDiv.style.display = "none";
        windowDiv = null;
        return;
      }

      // Create the window
      const createWindow = () => {
        // Create the window div
        windowDiv = document.createElement("div");
        windowDiv.style.width = "150px";
        windowDiv.style.border = "1px solid #ccc";
        windowDiv.style.borderRadius = "8px";
        windowDiv.style.backgroundColor = "#f9f9f9";
        windowDiv.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
        windowDiv.style.overflow = "hidden";

        // Create the window body
        const bodyDiv = document.createElement("div");
        bodyDiv.style.padding = "10px";
        bodyDiv.style.textAlign = "center";

        // Create the buttons for choices
        const choices = ["Cut", "Copy", "Delete", "Rename"];
        choices.forEach((choice) => {
          const button = document.createElement("button");
          button.innerHTML = choice;
          button.style.width = "100%";
          button.style.padding = "10px";
          button.style.margin = "5px 0";
          button.style.color = "black";
          button.style.backgroundColor = "#f9f9f9";
          button.style.border = "none";
          button.style.borderRadius = "4px";
          button.style.cursor = "pointer";

          // Button hover effect
          button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#4caf50";
            button.style.color = "white";
          });
          button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "#f9f9f9";
            button.style.color = "black";
          });

          // Button click event to show alert
          button.addEventListener("click", () => {
            if (choice == "Cut") {
              var modal = document.getElementById("myCopyQuizModal");
              var cancelBtn = "copyQuizCancelBtn"
                ? document.getElementById("copyQuizCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }
              var inFolderId = currentLocationOnId;
              CutQuiz(quizId, quizName, inFolderId);
            }

            if (choice == "Copy") {
              var modal = document.getElementById("myCopyQuizModal");
              var cancelBtn = "copyQuizCancelBtn"
                ? document.getElementById("copyQuizCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }
              var inFolderId = currentLocationOnId;
              CopyQuiz(quizId, quizName, inFolderId);
            }

            if (choice == "Delete") {
              console.log(currentLocationOnId, quizId);
              const isConfirmed = confirm("Are you sure you want to delete?");
              if (isConfirmed) {
                onAuthStateChanged(auth, async (user) => {
                  if (user) {
                    try {
                      const userRef = doc(db, "users", user.uid);
                      const foldersRef = collection(userRef, "folders");
                      const folderRef = doc(foldersRef, currentLocationOnId);
                      const quizzesRef = collection(folderRef, "quizzes");
                      const quiz1Ref = doc(quizzesRef, quizId);

                      await deleteDoc(quiz1Ref);

                      fetchQuizOnFolder();
                    } catch (error) {
                      console.error("Error deleting document: ", error);
                    }
                  }
                });
              } else {
                // Cancel deletion
              }
            }

            if (choice == "Rename") {
              var modal = document.getElementById("myRenameQuizModal");
              var cancelBtn = "renameQuizCancelBtn"
                ? document.getElementById("renameQuizCancelBtn")
                : null;

              modal.style.display = "flex";
              setTimeout(() => {
                modal.classList.remove("hide");
                modal.classList.add("show");
                modal.style.opacity = "1";
              }, 0);

              function closeModal() {
                modal.style.opacity = "0";
                modal.classList.remove("show");
                modal.classList.add("hide");

                setTimeout(() => {
                  modal.style.display = "none";
                }, 300);
              }

              // Closes the modal when the cancel button is clicked
              if (cancelBtn) {
                cancelBtn.onclick = closeModal;
              }

              // Close the modal when clicking anywhere outside of the modal content
              window.addEventListener("click", function (event) {
                if (event.target === modal) {
                  closeModal();
                }
              });

              // Gets the current quiz name
              let renamedQuiz = document.getElementById("renameQuizInput");
              renamedQuiz.value = quizName;

              var inFolderId = true;
              RenameQuiz(quizId, inFolderId);
            }

            // hides window
            windowDiv.style.display = "none";
            windowDiv = null;
          });

          bodyDiv.appendChild(button);
        });

        windowDiv.appendChild(bodyDiv);

        // Add the window to the document body
        document.body.appendChild(windowDiv);

        // Add event listener to close the window when clicking outside
        document.addEventListener("click", function closeWindow(event) {
          if (
            !windowDiv.contains(event.target) &&
            event.target !== settingsImg
          ) {
            windowDiv.style.display = "none";
            windowDiv = null; // Reset the windowDiv to null after closing
            document.removeEventListener("click", closeWindow); // Remove the event listener after closing
          }
        });

        // Update the window position based on mouse movement
        document.addEventListener("click", function (event) {
          const mouseX = event.clientX;
          const mouseY = event.clientY;
          const windowWidth = windowDiv.offsetWidth;
          windowDiv.style.position = "absolute";
          windowDiv.style.top = `${mouseY}px`;
          windowDiv.style.left = `${mouseX - windowWidth}px`;
          windowDiv.style.zIndex = "1000";
        });
      };

      // Call the function to create the window
      createWindow();
    });

    // Share image element
    const shareImg = document.createElement("img");
    shareImg.src = "../../images/share.png";
    shareImg.classList.add("share-image-ff"); // for css

    // Start image element
    const startImg = document.createElement("img");
    startImg.src = "../../images/start.png";
    startImg.classList.add("start-image-ff"); // for css

    item.appendChild(img);
    item.appendChild(text);
    item.appendChild(settingsImg);
    item.appendChild(shareImg);
    item.appendChild(startImg);

    return item;
  }

  // Fetch clicked folders
  const getClickedFolders = async () => {
    const folderContainer = document.getElementById("folderContainer");
    const itemContainer = document.getElementById("itemContainer");

    // hides the new folder button
    newFolderBtn.style.visibility = "hidden";

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

// Function to handle click events on folder
const folderContainer = document.getElementById("folderContainer");
function handleClickOnFolder(event) {
  const elementId = event.target.id;
  const folderName = event.target.textContent;

  if (elementId !== "folderContainer" && elementId !== "settingsFolder") {
    currentLocation = folderName;
    currentLocationOnId = elementId;
    fetchQuizOnFolder();

    // create a directory for folder name clicked
    const dirFolderName = document.getElementById("dirFolderName");
    dirFolderName.innerHTML =
      "&nbsp;&nbsp;" + " > " + "&nbsp;&nbsp;" + folderName;

    dirFolderName.value = dirFolderName;
  } else {
    // do nothing
  }
}
folderContainer.addEventListener("click", handleClickOnFolder);

// Function to handle click events on quiz
import { displayQuestions } from "../convert_function/convertPDF.js";
const itemContainer = document.getElementById("itemContainer");
function handleClickOnItem(event) {
  const elementId = event.target.id;

  if (elementId !== "itemContainer" && elementId !== "settingsFolder") {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid);

          // root
          if (currentLocationOnId == "") {
            const quizzesRef = collection(userDoc, "quizzes");
            const quizDoc = doc(quizzesRef, elementId);
            const docSnap = await getDoc(quizDoc);
            if (docSnap.exists()) {
              const docData = docSnap.data();
              displayQuestions(docData.questions);
            }
          }
          // folder
          else if (currentLocationOnId !== "") {
            const folderRef = collection(userDoc, "folders");
            const folderDoc = doc(folderRef, currentLocationOnId);
            const quizzesRef = collection(folderDoc, "quizzes");
            const quizDoc = doc(quizzesRef, elementId);
            const docSnap = await getDoc(quizDoc);

            if (docSnap.exists()) {
              const docData = docSnap.data();
              displayQuestions(docData.questions);
            }
          }
        } catch (error) {}
      }
    });
  } else {
    // do nothing
  }
}
itemContainer.addEventListener("click", handleClickOnItem);
