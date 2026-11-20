import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,
  signOut, updateProfile, RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const facts = [
  {title:"Japanese has three writing systems",text:"Japanese uses hiragana, katakana, and kanji together. Each system has a different role, and they can appear in the same sentence.",category:"JAPAN · WRITING"},
  {title:"Spanish is spoken across 20 countries",text:"Spanish is an official language in 20 countries, making it one of the world's most geographically widespread languages.",category:"SPANISH · GEOGRAPHY"},
  {title:"The Welsh word for a butterfly is beautiful",text:"The Welsh word “glöyn byw” literally means something like “living coal,” a poetic name for a butterfly.",category:"WALES · WORDS"},
  {title:"Arabic is read from right to left",text:"Arabic script flows from right to left, while numbers within the text are generally written left to right.",category:"ARABIC · WRITING"},
  {title:"Papua New Guinea is incredibly multilingual",text:"Papua New Guinea is home to more than 800 languages, making it one of the most linguistically diverse places on Earth.",category:"PAPUA NEW GUINEA · LANGUAGES"},
  {title:"Korean has a remarkably systematic alphabet",text:"Hangul was designed in the 15th century. Its letters are grouped into syllable blocks, and several consonant shapes reflect how the mouth forms sounds.",category:"KOREA · ALPHABET"},
  {title:"Swahili has Arabic influences",text:"Swahili is a Bantu language with many loanwords from Arabic, reflecting centuries of trade along East Africa's coast.",category:"EAST AFRICA · LANGUAGE"},
  {title:"A greeting can be a whole sentence",text:"In Māori, “kia ora” can express hello, thanks, or a wish for wellbeing, depending on context.",category:"NEW ZEALAND · GREETINGS"},
  {title:"French has regional varieties around the world",text:"French is spoken across Europe, Africa, the Americas, the Caribbean, and the Pacific, with distinct local vocabulary and accents.",category:"FRENCH · CULTURE"},
  {title:"The Turkish alphabet uses a dotted and dotless I",text:"Turkish distinguishes İ/i from I/ı. The dot is not just decoration—it changes which vowel the letter represents.",category:"TURKEY · ALPHABET"}
];
let app, auth, db, googleProvider, currentUser, isRegister=false, confirmationResult, recaptcha;
const configReady = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("PASTE_") && firebaseConfig.appId && !firebaseConfig.appId.includes("PASTE_");

function showError(message){$("authError").textContent=message||"";}
function setAuthMode(register){
  isRegister=register;
  $("loginTab").classList.toggle("active",!register);
  $("registerTab").classList.toggle("active",register);
  $("nameInput").classList.toggle("hidden",!register);
  $("nameLabel").classList.toggle("hidden",!register);
  $("authTitle").textContent=register?"Create your account":"Welcome back";
  $("authDescription").textContent=register?"Join DocLingo and start exploring languages.":"Sign in to continue your language journey.";
  $("emailSubmit").textContent=register?"Create account":"Sign in";
  $("passwordInput").autocomplete=register?"new-password":"current-password";
  showError("");
}
function openAuth(){ $("authModal").classList.remove("hidden"); setAuthMode(false); }
function closeAuth(){ $("authModal").classList.add("hidden"); }
function showFact(){
  const fact=facts[Math.floor(Math.random()*facts.length)];
  $("factTitle").textContent=fact.title;$("factText").textContent=fact.text;$("factCategory").textContent=fact.category;
}
function friendlyName(user){
  return user.displayName?.trim() || user.email?.split("@")[0] || "there";
}
function updateDashboard(user){
  currentUser=user;
  $("welcomePanel").classList.add("hidden");
  $("dashboard").classList.remove("hidden");
  $("signOutBtn").classList.remove("hidden");
  const name=friendlyName(user);
  $("welcomeTitle").textContent=`Welcome back, ${name}!`;
  $("welcomeSub").textContent="Here's a little discovery for your next language adventure.";
  $("userAvatar").textContent=(name[0]||"D").toUpperCase();
  $("profileAvatar").textContent=(name[0]||"D").toUpperCase();
  $("profileName").textContent=name;
  $("profileEmail").textContent=user.email||user.phoneNumber||"Phone account";
  $("profileMethod").textContent=user.phoneNumber?"Phone sign-in":user.providerData?.some(p=>p.providerId==="google.com")?"Google sign-in":"Email account";
  $("profileCreated").textContent=user.metadata?.creationTime?new Date(user.metadata.creationTime).toLocaleDateString():"Active";
  showFact();
  closeAuth();
  if(db){setDoc(doc(db,"users",user.uid),{displayName:user.displayName||name,email:user.email||null,phoneNumber:user.phoneNumber||null,lastLoginAt:serverTimestamp()},{merge:true}).catch(console.warn);}
}
function updateLoggedOut(){
  currentUser=null;$("dashboard").classList.add("hidden");$("welcomePanel").classList.remove("hidden");$("signOutBtn").classList.add("hidden");
}
async function initFirebase(){
  if(!configReady){$("connectionStatus").textContent="Firebase setup required";return;}
  try{
    app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);googleProvider=new GoogleAuthProvider();googleProvider.setCustomParameters({prompt:"select_account"});
    $("connectionStatus").innerHTML="<i></i> Firebase connected";$("connectionStatus").classList.add("ready");
    onAuthStateChanged(auth,user=>user?updateDashboard(user):updateLoggedOut());
  }catch(err){$("connectionStatus").textContent="Firebase connection error";console.error(err);}
}
$("openAuthBtn").addEventListener("click",openAuth);
$("closeAuthBtn").addEventListener("click",closeAuth);
$("authModal").addEventListener("click",e=>{if(e.target===$("authModal"))closeAuth();});
$("loginTab").addEventListener("click",()=>setAuthMode(false));
$("registerTab").addEventListener("click",()=>setAuthMode(true));
$("signOutBtn").addEventListener("click",async()=>{if(auth)await signOut(auth);});
$("newFactBtn").addEventListener("click",showFact);
$("emailForm").addEventListener("submit",async e=>{
  e.preventDefault();showError("");
  if(!auth){showError("Firebase isn't configured yet. Add your Firebase web config in firebase-config.js.");return;}
  const email=$("emailInput").value.trim(),password=$("passwordInput").value;
  try{
    if(isRegister){const credential=await createUserWithEmailAndPassword(auth,email,password);const name=$("nameInput").value.trim();if(name)await updateProfile(credential.user,{displayName:name});}
    else await signInWithEmailAndPassword(auth,email,password);
  }catch(err){showError(err.message);}
});
$("googleBtn").addEventListener("click",async()=>{
  if(!auth){showError("Add Firebase configuration first.");return;}
  try{await signInWithPopup(auth,googleProvider);}catch(err){showError(err.message);}
});
$("sendCodeBtn").addEventListener("click",async()=>{
  if(!auth){showError("Add Firebase configuration first.");return;}
  try{
    if(!recaptcha)recaptcha=new RecaptchaVerifier(auth,"recaptcha-container",{size:"normal"});
    confirmationResult=await signInWithPhoneNumber(auth,$("phoneInput").value.trim(),recaptcha);
    $("codeArea").classList.remove("hidden");showError("Verification code sent.");
  }catch(err){showError(err.message);if(recaptcha){recaptcha.clear();recaptcha=null;}}
});
$("verifyCodeBtn").addEventListener("click",async()=>{
  try{await confirmationResult.confirm($("codeInput").value.trim());}catch(err){showError(err.message);}
});
$("translateBtn").addEventListener("click",()=>{
  const text=$("translateInput").value.trim();
  if(!text){$("translateOutput").classList.remove("hidden");$("translateOutput").textContent="Enter something to translate first.";return;}
  $("translateOutput").classList.remove("hidden");
  $("translateOutput").textContent="Translation service isn't connected yet. Firebase is your account and data backend; a translation API will be added separately.";
});
$("newFactBtn").addEventListener("click",showFact);
initFirebase();
