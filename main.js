// ==========================================
// DOCLINGO - MAIN APPLICATION
// Firebase Authentication + Firestore
// Language Facts + Translation
// ==========================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

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
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================
// INITIALIZATION
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

const dashboard = $("dashboard");
const welcomeTitle = $("welcomeTitle");
const welcomeSub = $("welcomeSub");

const openAuthBtn = $("openAuthBtn");
const heroGetStarted = $("heroGetStarted");
const authModal = $("authModal");
const closeAuthBtn = $("closeAuthBtn");

const loginTab = $("loginTab");
const registerTab = $("registerTab");

const authTitle = $("authTitle");
const authDescription = $("authDescription");

const nameInput = $("nameInput");
const nameGroup = $("nameGroup");
const nameLabel = $("nameLabel");

const emailInput = $("emailInput");
const passwordInput = $("passwordInput");

const emailSubmit = $("emailSubmit");
const googleBtn = $("googleBtn");

const authError = $("authError");

const phoneInput = $("phoneInput");
const sendCodeBtn = $("sendCodeBtn");
const codeArea = $("codeArea");
const codeInput = $("codeInput");
const verifyCodeBtn = $("verifyCodeBtn");

const signOutBtn = $("signOutBtn");

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
// STATE
// ==========================================

let isRegistering = true;
let confirmationResult = null;
let recaptchaVerifier = null;
let previousFactIndex = -1;

// ==========================================
// LANGUAGE & COUNTRY FACTS
// ==========================================

const facts = [
  {
    category: "LANGUAGE FACT",
    title: "There are thousands of languages.",
    text: "There are approximately 7,000 languages spoken around the world. However, many are endangered and could disappear within the next century."
  },
  {
    category: "JAPAN",
    title: "Japanese has three writing systems.",
    text: "Japanese uses Hiragana, Katakana, and Kanji. All three can appear together in the same sentence."
  },
  {
    category: "LANGUAGE FACT",
    title: "The longest English word depends on the dictionary.",
    text: "Some technical chemical names are extraordinarily long, but most dictionaries exclude them from their standard word lists."
  },
  {
    category: "SPAIN",
    title: "Spanish is spoken across multiple continents.",
    text: "Spanish is the official language of many countries in Europe, North America, Central America, South America, and Africa."
  },
  {
    category: "LANGUAGE FACT",
    title: "Some languages have no written form.",
    text: "Many languages around the world are traditionally passed down through speaking, storytelling, songs, and oral history."
  },
  {
    category: "FRANCE",
    title: "French is spoken all around the world.",
    text: "French is spoken in Europe, Africa, North America, the Caribbean, and many other regions."
  },
  {
    category: "LANGUAGE FACT",
    title: "Mandarin has tones.",
    text: "Mandarin Chinese uses tones to distinguish words. Changing the pitch of a syllable can change its meaning completely."
  },
  {
    category: "SOUTH KOREA",
    title: "Hangul was designed to be easy to learn.",
    text: "The Korean writing system Hangul was created during the 15th century under King Sejong. Its letters were designed to represent the shapes made by the mouth and tongue."
  },
  {
    category: "LANGUAGE FACT",
    title: "Language shapes how we see the world.",
    text: "Languages can describe colors, relationships, directions, and emotions in ways that differ from one another."
  },
  {
    category: "BRAZIL",
    title: "Brazil is the largest Portuguese-speaking country.",
    text: "Brazil has more Portuguese speakers than any other country in the world."
  },
  {
    category: "LANGUAGE FACT",
    title: "The word alphabet comes from Greek.",
    text: "The word alphabet comes from the names of the first two Greek letters: Alpha and Beta."
  },
  {
    category: "GERMANY",
    title: "German words can be very long.",
    text: "German can combine multiple words into a single compound word, creating some impressively long vocabulary."
  },
  {
    category: "LANGUAGE FACT",
    title: "Sign languages are full languages.",
    text: "Sign languages have their own grammar, vocabulary, and regional variations. They are not simply gestures representing spoken languages."
  },
  {
    category: "ITALY",
    title: "Italian has regional varieties.",
    text: "Italy has many regional dialects and language varieties, reflecting centuries of local history and cultural differences."
  },
  {
    category: "LANGUAGE FACT",
    title: "English borrows words from many languages.",
    text: "English vocabulary includes words from Latin, French, Germanic languages, Greek, Arabic, and many other languages."
  },
  {
    category: "INDIA",
    title: "India is incredibly multilingual.",
    text: "India is home to hundreds of languages and language varieties, with numerous languages recognized in its constitution."
  },
  {
    category: "LANGUAGE FACT",
    title: "Some languages are written from right to left.",
    text: "Arabic and Hebrew are examples of languages whose writing systems generally run from right to left."
  },
  {
    category: "ICELAND",
    title: "Icelandic preserves many old words.",
    text: "Icelandic has maintained many features of its historical language, allowing modern speakers to read some older Icelandic texts."
  },
  {
    category: "LANGUAGE FACT",
    title: "Learning a language connects you to culture.",
    text: "Language can reveal traditions, history, humor, and ways of thinking that may not translate directly into another language."
  },
  {
    category: "SWITZERLAND",
    title: "Switzerland has four national languages.",
    text: "German, French, Italian, and Romansh are recognized as national languages in Switzerland."
  },
  {
    category: "LANGUAGE FACT",
    title: "The same word can mean different things.",
    text: "Words can have completely different meanings depending on the language, region, context, and pronunciation."
  },
  {
    category: "TURKEY",
    title: "Turkish uses a different alphabet from Arabic.",
    text: "Modern Turkish uses a Latin-based alphabet, introduced as part of major language reforms in the 1920s."
  },
  {
    category: "LANGUAGE FACT",
    title: "Children learn languages naturally.",
    text: "Children can develop language skills through regular exposure, conversation, play, and social interaction."
  },
  {
    category: "MEXICO",
    title: "Mexico has many indigenous languages.",
    text: "Mexico recognizes dozens of indigenous language groups, including Nahuatl and several Mayan languages."
  },
  {
    category: "LANGUAGE FACT",
    title: "Translation is more than replacing words.",
    text: "Good translation considers context, cultural meaning, tone, and expressions that may not have direct equivalents."
  }
];

// ==========================================
// RANDOM FACT FUNCTION
// ==========================================

function showRandomFact() {
  let index;

  do {
    index = Math.floor(Math.random() * facts.length);
  } while (index === previousFactIndex && facts.length > 1);

  previousFactIndex = index;

  const fact = facts[index];

  if (factTitle) factTitle.textContent = fact.title;
  if (factText) factText.textContent = fact.text;
  if (factCategory) factCategory.textContent = fact.category;
}

// ==========================================
// UI HELPERS
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
    button.textContent = "Please wait...";
  } else {
    button.textContent = originalText;
  }
}

function openModal() {
  if (!authModal) return;

  authModal.classList.remove("hidden");
  hideError();
}

function closeModal() {
  if (!authModal) return;

  authModal.classList.add("hidden");
  hideError();
}

function setAuthMode(register) {
  isRegistering = register;

  if (register) {
    authTitle.textContent = "Welcome to DocLingo";
    authDescription.textContent = "Create an account to start exploring.";
    emailSubmit.textContent = "Create Account";

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    nameGroup.classList.remove("hidden");
    nameInput.required = true;

    passwordInput.autocomplete = "new-password";
  } else {
    authTitle.textContent = "Welcome back";
    authDescription.textContent = "Log in to continue your journey.";
    emailSubmit.textContent = "Log In";

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    nameGroup.classList.add("hidden");
    nameInput.required = false;

    passwordInput.autocomplete = "current-password";
  }

  hideError();
}

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

async function saveUserProfile(user, method) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  const existingProfile = await getDoc(userRef);

  const profileData = {
    uid: user.uid,
    displayName: user.displayName || "Language Explorer",
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    photoURL: user.photoURL || null,
    signInMethod: method,
    lastLogin: serverTimestamp()
  };

  if (!existingProfile.exists()) {
    profileData.createdAt = serverTimestamp();
  }

  await setDoc(userRef, profileData, { merge: true });
}

// ==========================================
// DASHBOARD
// ==========================================

function showDashboard(user) {
  if (!user) return;

  dashboard.classList.remove("hidden");

  // Hide the landing page sections when signed in.
  document.querySelector(".hero")?.classList.add("hidden");
  document.querySelector("#features")?.classList.add("hidden");
  document.querySelector("#languages")?.classList.add("hidden");

  const name =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Language Explorer";

  const firstName = name.split(" ")[0];

  welcomeTitle.textContent = `Welcome back, ${firstName}!`;
  welcomeSub.textContent = "Ready to discover something new today?";

  profileName.textContent = name;
  profileEmail.textContent =
    user.email || user.phoneNumber || "Account connected";

  profileAvatar.textContent =
    name.charAt(0).toUpperCase();

  profileMethod.textContent =
    user.phoneNumber
      ? "Phone"
      : user.providerData.some(p => p.providerId === "google.com")
        ? "Google"
        : "Email";

  profileCreated.textContent = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "Recently";

  profileAvatar.textContent = name.charAt(0).toUpperCase();

  showRandomFact();

  closeModal();

  openAuthBtn.classList.add("hidden");

  // Scroll to dashboard after login.
  setTimeout(() => {
    dashboard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 200);
}

function showLandingPage() {
  dashboard.classList.add("hidden");

  document.querySelector(".hero")?.classList.remove("hidden");
  document.querySelector("#features")?.classList.remove("hidden");
  document.querySelector("#languages")?.classList.remove("hidden");

  openAuthBtn.classList.remove("hidden");
}

// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const provider = user.providerData[0]?.providerId;

      let method = "Email";

      if (provider === "google.com") {
        method = "Google";
      } else if (provider === "phone") {
        method = "Phone";
      }

      await saveUserProfile(user, method);

      showDashboard(user);

      if (connectionStatus) {
        connectionStatus.innerHTML = `
          <span class="status-dot" style="background:#22c55e"></span>
          Connected
        `;
      }
    } catch (error) {
      console.error("Profile error:", error);

      showDashboard(user);
    }
  } else {
    showLandingPage();

    if (connectionStatus) {
      connectionStatus.innerHTML = `
        <span class="status-dot" style="background:#22c55e"></span>
        Ready
      `;
    }
  }
});

// ==========================================
// EMAIL AUTHENTICATION
// ==========================================

emailSubmit.addEventListener("click", async () => {
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const name = nameInput.value.trim();

  if (!email || !password) {
    showError("Please enter your email and password.");
    return;
  }

  if (password.length < 6) {
    showError("Your password must be at least 6 characters.");
    return;
  }

  if (isRegistering && !name) {
    showError("Please enter your name.");
    return;
  }

  const originalText = isRegistering
    ? "Create Account"
    : "Log In";

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
    console.error(error);

    switch (error.code) {
      case "auth/email-already-in-use":
        showError("This email already has an account. Try logging in.");
        break;

      case "auth/invalid-email":
        showError("Please enter a valid email address.");
        break;

      case "auth/weak-password":
        showError("Please choose a stronger password.");
        break;

      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        showError("Incorrect email or password.");
        break;

      case "auth/too-many-requests":
        showError("Too many attempts. Please try again later.");
        break;

      default:
        showError(error.message || "Something went wrong.");
    }
  } finally {
    setLoading(emailSubmit, false, originalText);
  }
});

// ==========================================
// GOOGLE LOGIN
// ==========================================

googleBtn.addEventListener("click", async () => {
  hideError();

  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error(error);

    if (error.code === "auth/popup-closed-by-user") {
      showError("Login window was closed.");
    } else if (error.code === "auth/popup-blocked") {
      showError("Please allow popups for Google login.");
    } else {
      showError(error.message || "Google login failed.");
    }
  }
});

// ==========================================
// PHONE AUTHENTICATION
// ==========================================

function setupRecaptcha() {
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "normal",
      callback: () => {
        console.log("reCAPTCHA verified");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired");
      }
    }
  );

  return recaptchaVerifier;
}

sendCodeBtn.addEventListener("click", async () => {
  hideError();

  const phoneNumber = phoneInput.value.trim();

  if (!phoneNumber) {
    showError("Enter your phone number including country code.");
    return;
  }

  try {
    const verifier = setupRecaptcha();

    await verifier.render();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier
    );

    codeArea.classList.remove("hidden");

    sendCodeBtn.textContent = "Code Sent!";
    sendCodeBtn.disabled = true;

    showError("Verification code sent to your phone.");

    authError.style.background =
      "rgba(34,197,94,0.08)";

    authError.style.borderColor =
      "rgba(34,197,94,0.2)";

    authError.style.color =
      "#86efac";

  } catch (error) {
    console.error(error);

    showError(
      error.message ||
      "Unable to send verification code."
    );
  }
});

verifyCodeBtn.addEventListener("click", async () => {
  hideError();

  const code = codeInput.value.trim();

  if (!code) {
    showError("Enter the verification code.");
    return;
  }

  if (!confirmationResult) {
    showError("Please request a verification code first.");
    return;
  }

  try {
    await confirmationResult.confirm(code);
  } catch (error) {
    console.error(error);

    showError("Invalid verification code. Please try again.");
  }
});

// ==========================================
// SIGN OUT
// ==========================================

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

// ==========================================
// MODAL CONTROLS
// ==========================================

openAuthBtn.addEventListener("click", () => {
  setAuthMode(true);
  openModal();
});

heroGetStarted.addEventListener("click", () => {
  setAuthMode(true);
  openModal();
});

closeAuthBtn.addEventListener("click", closeModal);

authModal.addEventListener("click", (event) => {
  if (event.target === authModal) {
    closeModal();
  }
});

loginTab.addEventListener("click", () => {
  setAuthMode(false);
});

registerTab.addEventListener("click", () => {
  setAuthMode(true);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// ==========================================
// RANDOM FACT BUTTON
// ==========================================

newFactBtn.addEventListener("click", showRandomFact);

// ==========================================
// TRANSLATOR
// ==========================================

const languageCodes = {
  Spanish: "es",
  French: "fr",
  Japanese: "ja",
  German: "de",
  Korean: "ko",
  Portuguese: "pt",
  Italian: "it",
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

  if (
    !data.responseData ||
    !data.responseData.translatedText
  ) {
    throw new Error("Unable to translate this text.");
  }

  return data.responseData.translatedText;
}

translateBtn.addEventListener("click", async () => {
  const text = translateInput.value.trim();
  const targetLanguage = languageSelect.value;

  if (!text) {
    translateOutput.textContent =
      "Please enter some text to translate.";
    return;
  }

  if (text.length > 5000) {
    translateOutput.textContent =
      "Please keep your text under 5,000 characters.";
    return;
  }

  translateBtn.disabled = true;
  translateBtn.textContent = "Translating...";

  translateOutput.textContent =
    "Working on your translation...";

  try {
    const translated = await translateText(
      text,
      targetLanguage
    );

    translateOutput.innerHTML = "";

    const result = document.createElement("div");
    result.textContent = translated;

    const copyButton = document.createElement("button");
    copyButton.className = "btn btn-secondary";
    copyButton.textContent = "Copy Translation";
    copyButton.style.marginTop = "15px";

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(translated);

        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy Translation";
        }, 2000);
      } catch {
        copyButton.textContent = "Unable to copy";
      }
    });

    translateOutput.appendChild(result);
    translateOutput.appendChild(copyButton);

  } catch (error) {
    console.error(error);

    translateOutput.textContent =
      error.message ||
      "Translation failed. Please try again.";
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate →";
  }
});

// ==========================================
// ENTER KEY SUPPORT
// ==========================================

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    emailSubmit.click();
  }
});

codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    verifyCodeBtn.click();
  }
});

// ==========================================
// INITIAL UI
// ==========================================

showRandomFact();

setAuthMode(true);

console.log("DocLingo initialized successfully.");
