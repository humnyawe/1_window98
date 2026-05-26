const miniFace = document.querySelector("#miniFace");
const systemClock = document.querySelector("#systemClock");
const frameSection = document.querySelector(".frame-console");
const scrollFrame = document.querySelector("#scrollFrame");
const customCursor = document.querySelector("#customCursor");
const mutatingTexts = document.querySelectorAll(".mutating-text");

const openFace = "[ o  o ]";
const closedFace = "[ o  < ]";
const frameCount = scrollFrame ? Number(scrollFrame.dataset.frameCount) : 0;
const framePath = scrollFrame ? scrollFrame.dataset.framePath : "";

let lastBlink = 0.5;
let idleTimer; 
let currentFrame = 1;
const mutationCharacters = "ARTDESIGNMEMORY//001<>[]{}+-";

// The small face in the top bar blinks by changing only its text.
function blinkMiniFace() {
  if (!miniFace) return;

  miniFace.classList.add("is-blinking");
  miniFace.textContent = closedFace;

  window.setTimeout(() => {
    miniFace.textContent = openFace;
    miniFace.classList.remove("is-blinking");
  }, 140);
}

// Scroll can trigger a blink, but the delay keeps it from firing constantly.
function handleScroll() {
  const now = Date.now();

  updateScrollFrame();

  if (now - lastBlink > 900 && Math.random() > 0.58) {
    lastBlink = now;
    blinkMiniFace();
  }
}

// The image sequence advances one frame at a time while this section is sticky.
function updateScrollFrame() {
  if (!frameSection || !scrollFrame || !frameCount) return;

  const sectionTop = frameSection.offsetTop;
  const travelDistance = Math.max(1, frameSection.offsetHeight - window.innerHeight);
  const rawProgress = (window.scrollY - sectionTop) / travelDistance;
  const progress = Math.min(1, Math.max(0, rawProgress));
  const nextFrame = Math.min(frameCount, Math.max(1, Math.floor(progress * frameCount) + 1));

  if (nextFrame === currentFrame) return;

  currentFrame = nextFrame;
  scrollFrame.src = `${framePath}${currentFrame}.png`;

}

// Preloads nearby image frames so scroll animation feels less choppy.
function preloadFrames() {
  if (!framePath || !frameCount) return;

  for (let index = 1; index <= frameCount; index += 1) {
    const image = new Image();
    image.src = `${framePath}${index}.png`;
  }
}

// Moves the Korean cursor label without affecting clicks.
function moveCustomCursor(event) {
  if (!customCursor) return;

  customCursor.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 14}px, 0)`;
}

// Briefly scrambles a line, then restores the original terminal text.
function mutateTextLine(line) {
  const original = line.dataset.text || line.textContent;
  let step = 0;
  const maxSteps = 11;

  window.clearInterval(line.mutationTimer);

  line.mutationTimer = window.setInterval(() => {
    line.textContent = original
      .split("")
      .map((letter, index) => {
        if (letter === " " || letter === ".") return letter;
        if (index < step * 4) return original[index];
        return mutationCharacters[Math.floor(Math.random() * mutationCharacters.length)];
      })
      .join("");

    step += 1;

    if (step > maxSteps) {
      window.clearInterval(line.mutationTimer);
      line.textContent = original;
    }
  }, 42);
}

function setUpMutatingText() {
  mutatingTexts.forEach((line) => {
    line.addEventListener("mouseenter", () => mutateTextLine(line));
    line.addEventListener("focus", () => mutateTextLine(line));
  });
}

// Idle blinking keeps the DOS screen feeling alive even without scrolling.
function scheduleIdleBlink() {
  window.clearTimeout(idleTimer);

  idleTimer = window.setTimeout(() => {
    blinkMiniFace();
    scheduleIdleBlink();
  }, 2200 + Math.random() * 4200);
}

// Shows the current local date and time, including seconds, in the bottom bar.
function updateClock() {
  if (!systemClock) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const stamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  systemClock.textContent = stamp;
  systemClock.dateTime = now.toISOString();
}

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("mousemove", moveCustomCursor);
window.addEventListener("load", () => {
  blinkMiniFace();
  scheduleIdleBlink();
  updateClock();
  preloadFrames();
  updateScrollFrame();
  setUpMutatingText();
  window.setInterval(updateClock, 1000);
});

window.addEventListener("resize", updateScrollFrame);
