
import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================
// FIREBASE INITIALIZATION
// ==========================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// ==========================================
// DOM ELEMENTS
// ==========================================

const $ = (id) => document.getElementById(id);

const connectionStatus = $("connectionStatus");

const welcomePanel = $("welcomePanel");
const dashboard = $("dashboard");

const openAuthBtn = $("openAuthBtn");
const signOutBtn = $("signOutBtn");

const authModal = $("authModal");
const closeAuthBtn = $("closeAuthBtn");

const authTitle = $("authTitle");
const authDescription = $("authDescription");

const loginTab = $("loginTab");
const registerTab = $("registerTab");

const nameInput = $("nameInput");
const nameLabel = $("nameLabel");

const emailInput = $("emailInput");
const passwordInput = $("passwordInput");
const emailSubmit = $("emailSubmit");

const googleBtn = $("googleBtn");

const phoneInput = $("phoneInput");
const sendCodeBtn = $("sendCodeBtn");
const codeArea = $("codeArea");
const codeInput = $("codeInput");
const verifyCodeBtn = $("verifyCodeBtn");

const authError = $("authError");

const welcomeTitle = $("welcomeTitle");
const welcomeSub = $("welcomeSub");

const userAvatar = $("userAvatar");
const profileAvatar = $("profileAvatar");
const profileName = $("profileName");
const profileEmail = $("profileEmail");
const profileMethod = $("profileMethod");
const profileCreated = $("profileCreated");

const factTitle = $("factTitle");
const factText = $("factText");
const factCategory = $("factCategory");
const newFactBtn = $("newFactBtn");

const translateInput = $("translateInput");
const languageSelect = $("languageSelect");
const translateBtn = $("translateBtn");
const translateOutput = $("translateOutput");

// ==========================================
// APPLICATION STATE
// ==========================================

let isRegistering = false;
let recaptchaVerifier = null;
let confirmationResult = null;
let currentUser = null;

// ==========================================
// RANDOM LANGUAGE FACTS
// ==========================================

const languageFacts = [
  {
    title: "Japanese has three writing systems",
    text: "Japanese uses Hiragana, Katakana, and Kanji. They work together in the same written sentence.",
    category: "JAPANESE"
  },
  {
    title: "There are over 7,000 languages",
    text: "Languages are spoken around the world, but many have fewer than 1,000 speakers.",
    category: "LANGUAGE"
  },
  {
    title: "Spanish is spoken across continents",
    text: "Spanish is an official language in 20 countries and is spoken by hundreds of millions of people.",
    category: "SPANISH"
  },
  {
    title: "Arabic is written from right to left",
    text: "Arabic writing flows from right to left, and its letters can change shape depending on where they appear in a word.",
    category: "ARABIC"
  },
  {
    title: "Korean has a unique alphabet",
    text: "Hangul was created in the 15th century to make reading and writing more accessible.",
    category: "KOREAN"
  },
  {
    title: "French is spoken around the world",
    text: "French is spoken across Europe, Africa, North America, the Caribbean, and parts of Asia.",
    category: "FRENCH"
  },
  {
    title: "Some languages have no word for blue",
    text: "Some languages historically grouped blue and green together, showing how languages categorize colors differently.",
    category: "LINGUISTICS"
  },
  {
    title: "Mandarin uses tones",
    text: "In Mandarin Chinese, changing the tone of a syllable can change its meaning completely.",
    category: "MANDARIN"
  },
  {
    title: "English has borrowed many words",
    text: "English has borrowed vocabulary from languages including French, Latin, Norse, Greek, and many others.",
    category: "ENGLISH"
  },
  {
    title: "Papua New Guinea is incredibly diverse",
    text: "Papua New Guinea is home to hundreds of languages, making it one of the world's most linguistically diverse countries.",
    category: "COUNTRIES"
  },
  {
    title: "The longest words vary by language",
    text: "Languages can form extremely long words by combining smaller meaningful parts.",
    category: "LINGUISTICS"
  },
  {
    title: "Portuguese is spoken on multiple continents",
    text: "Portuguese is an official language in countries across Europe, South America, Africa, and Asia.",
    category: "PORTUGUESE"
  },
  {
    title: "The word 'alphabet' has Greek origins",
    text: "The word alphabet comes from the names of the first two Greek letters: alpha and beta.",
    category: "HISTORY"
  },
  {
    title: "Sign languages are complete languages",
    text: "Sign languages have their own grammar, structure, and vocabulary. They are not simply signed versions of spoken languages.",
    category: "SIGN LANGUAGES"
  },
  {
    title: "Language changes constantly",
    text: "New slang, technology, and cultural changes continuously introduce new words and meanings.",
    category: "LINGUISTICS"
  },
  {
    title: "Germany has regional dialects",
    text: "German varies significantly across regions, with differences in vocabulary, pronunciation, and grammar.",
    category: "GERMAN"
  },
  {
    title: "Italian has regional variation",
    text: "Italy has a rich variety of regional dialects and language varieties, some of which differ substantially.",
    category: "ITALIAN"
  },
  {
    title: "The world's languages are disappearing",
    text: "Many languages are endangered, and communities are working to preserve their languages and traditions.",
    category: "CULTURE"
  },
  {
    title: "A greeting can vary by culture",
    text: "Different cultures use different greetings, including bows, handshakes, cheek kisses, and verbal expressions.",
    category: "CULTURE"
  },
  {
    title: "Learning languages connects people",
    text: "Learning another language can help people communicate across cultures and understand different perspectives.",
    category: "LANGUAGE"
  }
];

// ==========================================
// GENERAL HELPERS
// ==========================================

function showError(message) {
  if (!authError) return;

  authError.textContent = message;
  authError.classList.remove("hidden");
}

function hideError() {
  if (!authError) return;

  authError.textContent = "";
  authError.classList.add("hidden");
}

function setLoading(button, loading, originalText) {
  if (!button) return;

  button.disabled = loading;

  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "Please wait...";
  } else {
    button.textContent =
      originalText || button.dataset.originalText || button.textContent;
  }
}

function getInitials(name) {
  if (!name) return "D";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function setConnection(message, connected = false) {
  if (!connectionStatus) return;

  connectionStatus.innerHTML = "";

  const indicator = document.createElement("i");
  indicator.className = connected ? "connected" : "";

  const text = document.createElement("span");
  text.textContent = message;

  connectionStatus.appendChild(indicator);
  connectionStatus.appendChild(text);
}

function openModal() {
  if (!authModal) return;

  authModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (emailInput) {
    setTimeout(() => emailInput.focus(), 100);
  }
}

function closeModal() {
  if (!authModal) return;

  authModal.classList.add("hidden");
  document.body.style.overflow = "";

  hideError();
}

function setAuthMode(registering) {
  isRegistering = registering;

  hideError();

  if (authTitle) {
    authTitle.textContent = registering
      ? "Create your account"
      : "Welcome back";
  }

  if (authDescription) {
    authDescription.textContent = registering
      ? "Create an account to begin your language journey."
      : "Sign in to continue your language journey.";
  }

  if (emailSubmit) {
    emailSubmit.textContent = registering
      ? "Create account"
      : "Sign in";
  }

  if (nameInput) {
    nameInput.classList.toggle("hidden", !registering);
    nameInput.required = registering;
    nameInput.value = "";
  }

  if (nameLabel) {
    nameLabel.classList.toggle("hidden", !registering);
  }

  if (loginTab) {
    loginTab.classList.toggle("active", !registering);
  }

  if (registerTab) {
    registerTab.classList.toggle("active", registering);
  }

  if (passwordInput) {
    passwordInput.autocomplete = registering
      ? "new-password"
      : "current-password";
  }
}

// ==========================================
// FIRESTORE USER PROFILE
// ==========================================

async function saveUserProfile(user, loginMethod) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const existingProfile = await getDoc(userRef);

    const profileData = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      loginMethod: loginMethod,
      lastLogin: serverTimestamp()
    };

    if (!existingProfile.exists()) {
      profileData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, profileData, {
      merge: true
    });
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
}

// ==========================================
// RANDOM FACT DISPLAY
// ==========================================

function showRandomFact() {
  if (!factTitle || !factText || !factCategory) return;

  const randomIndex = Math.floor(
    Math.random() * languageFacts.length
  );

  const fact = languageFacts[randomIndex];

  factTitle.textContent = fact.title;
  factText.textContent = fact.text;
  factCategory.textContent = fact.category;
}

// ==========================================
// DASHBOARD
// ==========================================

function showDashboard(user) {
  if (!user) return;

  currentUser = user;

  if (welcomePanel) {
    welcomePanel.classList.add("hidden");
  }

  if (dashboard) {
    dashboard.classList.remove("hidden");
  }

  if (signOutBtn) {
    signOutBtn.classList.remove("hidden");
  }

  if (welcomeTitle) {
    welcomeTitle.textContent = user.displayName
      ? `Welcome back, ${user.displayName}!`
      : "Welcome back!";
  }

  if (welcomeSub) {
    welcomeSub.textContent =
      "Here's a little discovery for your language journey.";
  }

  const initials = getInitials(user.displayName);

  if (userAvatar) {
    userAvatar.textContent = initials;
  }

  if (profileAvatar) {
    profileAvatar.textContent = initials;
  }

  if (profileName) {
    profileName.textContent =
      user.displayName || "DocLingo user";
  }

  if (profileEmail) {
    profileEmail.textContent = user.email || "Phone account";
  }

  if (profileMethod) {
    profileMethod.textContent = user.providerData?.[0]?.providerId === "google.com"
      ? "Google Authentication"
      : user.providerData?.[0]?.providerId === "phone"
        ? "Phone Authentication"
        : "Email Authentication";
  }

  if (profileCreated) {
    profileCreated.textContent = "Member";
  }

  showRandomFact();
}

function showWelcomePage() {
  currentUser = null;

  if (welcomePanel) {
    welcomePanel.classList.remove("hidden");
  }

  if (dashboard) {
    dashboard.classList.add("hidden");
  }

  if (signOutBtn) {
    signOutBtn.classList.add("hidden");
  }

  setConnection("Connected", true);
}

// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    setConnection("Connected", true);

    await saveUserProfile(
      user,
      user.providerData?.[0]?.providerId === "google.com"
        ? "Google"
        : user.providerData?.[0]?.providerId === "phone"
          ? "Phone"
          : "Email"
    );

    showDashboard(user);
    closeModal();
  } else {
    showWelcomePage();
  }
});

// ==========================================
// MODAL BUTTONS
// ==========================================

if (openAuthBtn) {
  openAuthBtn.addEventListener("click", () => {
    setAuthMode(false);
    openModal();
  });
}

if (closeAuthBtn) {
  closeAuthBtn.addEventListener("click", closeModal);
}

if (authModal) {
  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
      closeModal();
    }
  });
}

if (loginTab) {
  loginTab.addEventListener("click", () => {
    setAuthMode(false);
  });
}

if (registerTab) {
  registerTab.addEventListener("click", () => {
    setAuthMode(true);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// ==========================================
// EMAIL AUTHENTICATION
// ==========================================

const emailForm = $("emailForm");

if (emailForm) {
  emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideError();

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const name = nameInput?.value.trim() || "";

    if (!email || !password) {
      showError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    if (isRegistering && !name) {
      showError("Please enter your name.");
      return;
    }

    setLoading(emailSubmit, true);

    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(result.user, {
          displayName: name
        });

        await saveUserProfile(result.user, "Email");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
    } catch (error) {
      console.error("Email authentication error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          showError("This email already has an account. Please sign in.");
          break;

        case "auth/invalid-email":
          showError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          showError("Your password is too weak.");
          break;

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          showError("Incorrect email or password.");
          break;

        case "auth/too-many-requests":
          showError("Too many attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          showError("Network error. Check your internet connection.");
          break;

        default:
          showError(error.message || "Authentication failed.");
      }
    } finally {
      setLoading(emailSubmit, false);
    }
  });
}

// ==========================================
// GOOGLE AUTHENTICATION
// ==========================================

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    hideError();

    setLoading(googleBtn, true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        showError("The sign-in window was closed.");
      } else if (error.code === "auth/popup-blocked") {
        showError("Please allow popups for Google sign-in.");
      } else if (error.code === "auth/unauthorized-domain") {
        showError("This website is not authorized in Firebase.");
      } else {
        showError(error.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(googleBtn, false);
    }
  });
}

// ==========================================
// PHONE AUTHENTICATION
// ==========================================

function setupRecaptcha() {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  const recaptchaContainer = $("recaptcha-container");

  if (!recaptchaContainer) {
    throw new Error("reCAPTCHA container is missing.");
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "normal",
      callback: () => {
        console.log("reCAPTCHA verified.");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired.");
      }
    }
  );

  return recaptchaVerifier;
}

if (sendCodeBtn) {
  sendCodeBtn.addEventListener("click", async () => {
    hideError();

    const phoneNumber = phoneInput?.value.trim() || "";

    if (!phoneNumber) {
      showError("Enter your phone number with country code.");
      return;
    }

    setLoading(sendCodeBtn, true);

    try {
      const verifier = setupRecaptcha();

      confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );

      if (codeArea) {
        codeArea.classList.remove("hidden");
      }

      showError("Verification code sent. Check your phone.");
    } catch (error) {
      console.error("Phone authentication error:", error);

      showError(error.message || "Failed to send verification code.");

      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {}

        recaptchaVerifier = null;
      }
    } finally {
      setLoading(sendCodeBtn, false);
    }
  });
}

if (verifyCodeBtn) {
  verifyCodeBtn.addEventListener("click", async () => {
    hideError();

    const code = codeInput?.value.trim() || "";

    if (!confirmationResult) {
      showError("Please request a verification code first.");
      return;
    }

    if (!code) {
      showError("Enter the verification code.");
      return;
    }

    setLoading(verifyCodeBtn, true);

    try {
      await confirmationResult.confirm(code);
    } catch (error) {
      console.error("Code verification error:", error);

      showError("Invalid verification code. Please try again.");
    } finally {
      setLoading(verifyCodeBtn, false);
    }
  });
}

// ==========================================
// SIGN OUT
// ==========================================

if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  });
}

// ==========================================
// RANDOM FACT BUTTON
// ==========================================

if (newFactBtn) {
  newFactBtn.addEventListener("click", showRandomFact);
}

// ==========================================
// TRANSLATION
// ==========================================

const languageCodes = {
  Spanish: "es",
  French: "fr",
  Japanese: "ja",
  German: "de",
  Korean: "ko",
  Italian: "it",
  Portuguese: "pt",
  Chinese: "zh",
  Russian: "ru",
  Arabic: "ar"
};

async function translateText(text, targetLanguage) {
  const targetCode = languageCodes[targetLanguage];

  if (!targetCode) {
    throw new Error("Unsupported language.");
  }

  const url =
    "https://api.mymemory.translated.net/get" +
    "?q=" + encodeURIComponent(text) +
    "&langpair=en|" + targetCode;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Translation service unavailable.");
  }

  const data = await response.json();

  if (!data.responseData?.translatedText) {
    throw new Error("Unable to translate this text.");
  }

  return data.responseData.translatedText;
}

if (translateBtn) {
  translateBtn.addEventListener("click", async () => {
    const text = translateInput?.value.trim() || "";
    const targetLanguage = languageSelect?.value || "Spanish";

    if (!text) {
      if (translateOutput) {
        translateOutput.textContent = "Please enter text to translate.";
        translateOutput.classList.remove("hidden");
      }
      return;
    }

    if (text.length > 5000) {
      if (translateOutput) {
        translateOutput.textContent =
          "Please keep your text under 5,000 characters.";
        translateOutput.classList.remove("hidden");
      }
      return;
    }

    setLoading(translateBtn, true, "Translate ↗");

    if (translateOutput) {
      translateOutput.textContent = "Translating...";
      translateOutput.classList.remove("hidden");
    }

    try {
      const translated = await translateText(
        text,
        targetLanguage
      );

      if (!translateOutput) return;

      translateOutput.innerHTML = "";

      const result = document.createElement("div");
      result.textContent = translated;

      const copyButton = document.createElement("button");
      copyButton.className = "btn btn-secondary";
      copyButton.textContent = "Copy translation";

      copyButton.style.marginTop = "15px";

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(translated);
          copyButton.textContent = "Copied!";

          setTimeout(() => {
            copyButton.textContent = "Copy translation";
          }, 2000);
        } catch {
          copyButton.textContent = "Unable to copy";
        }
      });

      translateOutput.appendChild(result);
      translateOutput.appendChild(copyButton);
      translateOutput.classList.remove("hidden");
    } catch (error) {
      console.error("Translation error:", error);

      if (translateOutput) {
        translateOutput.textContent =
          error.message || "Translation failed.";
        translateOutput.classList.remove("hidden");
      }
    } finally {
      setLoading(translateBtn, false, "Translate ↗");
    }
  });
}

// ==========================================
// INITIALIZATION
// ==========================================

setAuthMode(false);

setConnection("Connecting...", false);

console.log("DocLingo initialized successfully.");
