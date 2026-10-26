'use strict';

const $ = (id) => document.getElementById(id);
const sceneNames = ['welcome','heartGame','letterScene','finaleScene','playlistScene'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeScene = 'welcome';
let gameActive = false;
let animationFrame = 0;

function showScene(id) {
  if (!sceneNames.includes(id)) return;
  if (id !== 'heartGame') {
    gameActive = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
  }
  sceneNames.forEach((name) => {
    const element = $(name);
    const active = name === id;
    element.classList.toggle('is-active', active);
    element.inert = !active;
    if (active) element.scrollTop = 0;
  });
  activeScene = id;
  if (id !== 'playlistScene') {
    const currentPlayer = $('playerSlot')?.querySelector('iframe');
    if (currentPlayer) currentPlayer.remove();
  }
  $('chapter').innerHTML = String(sceneNames.indexOf(id) + 1).padStart(2, '0') + ' <span>/ 05</span>';
}

// Floating little hearts, all animated by the CSS-only driftHearts keyframes.
const floatField = $('drifting-hearts');
for (let i = 0; i < (reducedMotion ? 0 : 21); i++) {
  const node = document.createElement('span');
  node.className = 'floating-heart';
  node.textContent = ['♡','✦','✧','♥'][i % 4];
  node.style.setProperty('--x', `${Math.random() * 100}%`);
  node.style.setProperty('--size', `${10 + Math.random() * 18}px`);
  node.style.setProperty('--hue', ['#f3acc8','#e4b1d8','#ffcadc','#f6b8ce'][i % 4]);
  node.style.setProperty('--dur', `${11 + Math.random() * 14}s`);
  node.style.setProperty('--delay', `${-Math.random() * 22}s`);
  node.style.setProperty('--drift', `${Math.round((Math.random() - .5) * 160)}px`);
  floatField.appendChild(node);
}

function burstAt(element, count = 15) {
  if (reducedMotion) return;
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    const angle = (Math.PI * 2 * i/count) + (Math.random() - .5)*.5;
    const dist = 40 + Math.random()*110;
    dot.className = 'burst-particle';
    dot.textContent = i % 3 === 0 ? '♡' : '✦';
    dot.style.setProperty('--left', `${cx}px`);
    dot.style.setProperty('--top', `${cy}px`);
    dot.style.setProperty('--dx', `${Math.cos(angle)*dist}px`);
    dot.style.setProperty('--dy', `${Math.sin(angle)*dist-20}px`);
    dot.style.setProperty('--rotate', `${Math.round(Math.random()*280-140)}deg`);
    dot.style.setProperty('--size', `${12+Math.random()*16}px`);
    dot.style.setProperty('--color', ['#ee7da9','#ffbdd6','#e8b4de','#e9b74f'][i % 4]);
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 950);
  }
}

// Background: the requested No. 1 Party Anthem Spotify embed, with a user-supplied
// audio-file fallback. Spotify's official iFrame API permits play() requests after
// interaction, but autoplay/DRM and account access are controlled by Spotify/browser.
const BACKGROUND_TRACK = '5TTGoX70AFrTvuEtqHK37S';
let backgroundController = null;
let backgroundLoading = false;
let backgroundWantsPlay = false;
let backgroundFileUrl = null;
const backgroundDock = $('backgroundDock');
const backgroundAudio = $('localBackground');
const backgroundSlot = $('backgroundSpotifyPlayer');

function buildSpotifyFrame(track, title, height = 202) {
  const frame = document.createElement('iframe');
  frame.src = `https://open.spotify.com/embed/track/${encodeURIComponent(track)}?utm_source=generator&theme=0`;
  frame.title = title;
  frame.width = '100%'; frame.height = String(height);
  frame.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
  frame.setAttribute('allowfullscreen', '');
  frame.loading = 'eager';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  return frame;
}
function initBackgroundSpotify() {
  if (backgroundSlot.querySelector('iframe') || backgroundLoading) return;
  if (window.spotifyEmbedApi) {
    backgroundLoading = true;
    try {
      window.spotifyEmbedApi.createController(backgroundSlot,{
        uri:`spotify:track:${BACKGROUND_TRACK}`,width:'100%',height:'152'
      },(controller) => {
        backgroundController=controller;
        backgroundLoading=false;
        controller.addListener('ready',() => {
          if (backgroundWantsPlay && !backgroundDock.hidden && !backgroundAudio.src) {
            try {controller.play();} catch (e) {/* user can press the embedded player */}
          }
        });
      });
    } catch (e) {
      backgroundLoading=false;
      backgroundSlot.replaceChildren(buildSpotifyFrame(BACKGROUND_TRACK,'No. 1 Party Anthem by Arctic Monkeys',152));
    }
  } else {
    backgroundSlot.replaceChildren(buildSpotifyFrame(BACKGROUND_TRACK,'No. 1 Party Anthem by Arctic Monkeys',152));
  }
}
function openBackground(tryPlay = false) {
  backgroundDock.hidden = false;
  $('soundBtn').setAttribute('aria-pressed','true');
  $('soundBtn').setAttribute('aria-label','Close background music player');
  backgroundWantsPlay = tryPlay;
  initBackgroundSpotify();
  if (tryPlay && backgroundAudio.src) backgroundAudio.play().catch(()=>{});
  else if (tryPlay && backgroundController) {
    try {backgroundController.play();} catch (e) {/* user can press play */}
  }
}
function stopBackground() {
  backgroundWantsPlay=false;
  backgroundDock.hidden=true;
  $('soundBtn').setAttribute('aria-pressed','false');
  $('soundBtn').setAttribute('aria-label','Open background music player');
  backgroundAudio.pause();
  if (backgroundController) {try {backgroundController.pause();} catch(e) {}}
  else backgroundSlot.replaceChildren();
}
$('soundBtn').addEventListener('click',() => {
  if (backgroundDock.hidden) openBackground(true); else stopBackground();
});
$('closeBackground').addEventListener('click', stopBackground);
$('backgroundFile').addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (backgroundFileUrl) URL.revokeObjectURL(backgroundFileUrl);
  backgroundFileUrl=URL.createObjectURL(file);
  backgroundAudio.src=backgroundFileUrl;
  backgroundAudio.hidden=false;
  backgroundAudio.play().catch(()=>{});
  $('backgroundHint').textContent='Your chosen audio file is playing locally. It will loop until you close the player or open the playlist.';
  if(backgroundController) {try {backgroundController.pause();} catch(e) {}}
  else backgroundSlot.replaceChildren();
});
window.addEventListener('spotify-api-ready',() => {
  // Initialize once requested; the fallback player remains stable if already shown.
  if (!backgroundDock.hidden && !backgroundSlot.querySelector('iframe')) initBackgroundSpotify();
});

// Chapter 2: catch the hearts mini-game.
const gameCanvas = $('heartCanvas');
const ctx = gameCanvas.getContext('2d');
const TARGET = 12;
let W = 0, H = 0, catcherX = 0, score = 0, lastFrame = 0, spawnIn = 0;
let falling = [], pops = [], sceneryDots = [];
function resizeGame() {
  const r = gameCanvas.getBoundingClientRect();
  W = r.width; H = r.height;
  const dpr = Math.min(window.devicePixelRatio || 1,2);
  gameCanvas.width = Math.round(W*dpr);
  gameCanvas.height = Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  catcherX = catcherX || W/2;
  catcherX = Math.max(35,Math.min(W-35,catcherX));
  sceneryDots = Array.from({length:28},() => ({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.7+.6}));
}
window.addEventListener('resize',() => { if (gameActive) resizeGame(); });
function drawHeart(x,y,size,color,tilt=0) {
  ctx.save();
  ctx.translate(x,y); ctx.rotate(tilt); ctx.scale(size/28,size/28);
  ctx.beginPath(); ctx.moveTo(0,10);
  ctx.bezierCurveTo(-25,-5,-15,-22,0,-12);
  ctx.bezierCurveTo(15,-22,25,-5,0,10);
  ctx.fillStyle=color; ctx.shadowColor='#ed75a266';ctx.shadowBlur=13;ctx.fill();ctx.restore();
}
function drawPresent(x,y) {
  ctx.save(); ctx.translate(x,y);
  ctx.shadowColor='#d78aa55c'; ctx.shadowBlur=12;ctx.shadowOffsetY=6;
  ctx.fillStyle='#f39ac0';ctx.beginPath();ctx.roundRect(-31,-17,62,47,9);ctx.fill();
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.fillStyle='#fff6f8';ctx.fillRect(-5,-17,10,47);
  ctx.fillStyle='#ffbdd8';ctx.beginPath();ctx.roundRect(-37,-24,74,17,5);ctx.fill();
  ctx.fillStyle='#fff6f8';ctx.fillRect(-5,-24,10,17);
  drawHeart(0,-29,15,'#df689d');ctx.restore();
}
function startGame() {
  showScene('heartGame');
  resizeGame();
  catcherX=W/2;score=0;spawnIn=.2;falling=[];pops=[];
  $('heartCount').textContent='0 / 12 hearts'; $('gameFill').style.width='0%';
  gameActive=true; lastFrame=performance.now();
  animationFrame=requestAnimationFrame(drawGame);
}
function drawGame(now) {
  if (!gameActive) return;
  const delta=Math.min((now-lastFrame)/1000,.045); lastFrame=now; spawnIn-=delta;
  if (spawnIn<=0) {
    falling.push({x:25+Math.random()*(W-50),y:-25,s:18+Math.random()*12,v:105+Math.random()*45,phase:Math.random()*6.28,color:['#ef84ab','#f19dbd','#e66d9f','#f6adcc'][Math.floor(Math.random()*4)]});
    spawnIn=.42+Math.random()*.22;
  }
  ctx.clearRect(0,0,W,H);
  for (const star of sceneryDots) {ctx.globalAlpha=.28;ctx.fillStyle='#e5a4c0';ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;
  const catchY=H-56;
  const remaining=[];
  for (const h of falling) {
    h.y+=h.v*delta;
    const xx=h.x+Math.sin(now/400+h.phase)*8;
    drawHeart(xx,h.y,h.s,h.color,Math.sin(now/500+h.phase)*.18);
    if (h.y>catchY-24 && h.y<catchY+19 && Math.abs(xx-catcherX)<43) {
      score++;
      for (let k=0;k<7;k++) pops.push({x:xx,y:h.y,vx:(Math.random()-.5)*110,vy:-30-Math.random()*90,life:.7});
      $('heartCount').textContent=`${Math.min(score,TARGET)} / ${TARGET} hearts`;
      $('gameFill').style.width=`${Math.min(score/TARGET,1)*100}%`;
    } else if (h.y<H+40) remaining.push(h);
  }
  falling=remaining;
  pops=pops.filter(p => {p.x+=p.vx*delta;p.y+=p.vy*delta;p.life-=delta;if(p.life<=0)return false;ctx.globalAlpha=p.life/.7;drawHeart(p.x,p.y,11,'#e5a13f');ctx.globalAlpha=1;return true;});
  drawPresent(catcherX,catchY+7);
  if (score>=TARGET) {
    gameActive=false;burstAt(gameCanvas,25);setTimeout(openLetterScene,850);return;
  }
  animationFrame=requestAnimationFrame(drawGame);
}
function moveCatcher(event) {
  if (!gameActive) return;
  const r=gameCanvas.getBoundingClientRect();
  catcherX=Math.max(35,Math.min(W-35,event.clientX-r.left));
}
gameCanvas.addEventListener('pointerdown',moveCatcher);
gameCanvas.addEventListener('pointermove',moveCatcher);
window.addEventListener('keydown',(event) => {
  if (!gameActive) return;
  if (event.key==='ArrowLeft' || event.key==='ArrowRight') {
    event.preventDefault();catcherX=Math.max(35,Math.min(W-35,catcherX+(event.key==='ArrowLeft'?-35:35)));
  }
});
$('openGift').addEventListener('click', (e) => {burstAt(e.currentTarget,21);openBackground(true);setTimeout(startGame,260);});
$('skipGame').addEventListener('click',openLetterScene);

// Chapter 3: tap envelope to read the letter.
function openLetterScene() {
  $('envelopeButton').hidden=false;
  $('envelopeButton').classList.remove('is-opening');
  $('letterPaper').hidden=true;
  $('afterLetter').hidden=true;
  showScene('letterScene');
}
let envelopeBusy=false;
$('envelopeButton').addEventListener('click', () => {
  if (envelopeBusy) return;
  envelopeBusy=true;
  const env=$('envelopeButton');
  env.classList.add('is-opening');
  burstAt(env,18);
  setTimeout(() => {
    env.hidden=true;
    const paper=$('letterPaper');
    paper.hidden=false;
    $('afterLetter').hidden=false;
    envelopeBusy=false;
  },reducedMotion?80:690);
});
$('afterLetter').addEventListener('click',openFinale);

// Chapter 4: celebratory falling confetti, made with CSS animation.
function openFinale() {
  showScene('finaleScene');
  const field=$('confettiField');field.replaceChildren();
  if (reducedMotion) return;
  for (let i=0;i<80;i++) {
    const part=document.createElement('span');part.className='confetti-bit';
    part.textContent=['♥','✦','✧','●'][i%4];
    part.style.color=['#efa0bf','#e685ab','#e8c16c','#d9ade0','#f3b1cc'][i%5];
    part.style.setProperty('--x',`${Math.random()*100}%`);
    part.style.setProperty('--size',`${8+Math.random()*14}px`);
    part.style.setProperty('--dur',`${4.5+Math.random()*5}s`);
    part.style.setProperty('--delay',`${-Math.random()*8}s`);
    part.style.setProperty('--drift',`${Math.round((Math.random()-.5)*260)}px`);
    field.appendChild(part);
  }
}
function resetExperience() {stopBackground();stopSong();showScene('welcome');}
$('replayFirst').addEventListener('click',resetExperience);
$('replayLast').addEventListener('click',resetExperience);
$('toPlaylist').addEventListener('click',() => {stopBackground();showScene('playlistScene');selectTrack(songCards[0]);});

// Chapter 5: official Spotify playlist embeds and optional local audio playback.
// Spotify controls track permissions: autoplay is intentionally not forced; full listening may need sign-in.
const songCards = [...document.querySelectorAll('.song-card')];
const allowedTracks = new Set(songCards.map(card => card.dataset.track));
function selectTrack(card) {
  const track = card?.dataset.track;
  if (!allowedTracks.has(track)) return;
  stopBackground();
  stopSong();
  songCards.forEach(other => {
    const selected = other === card;
    other.classList.toggle('is-playing', selected);
    other.querySelector('.song-select').textContent = selected ? 'Selected ♫' : 'Select ♫';
    other.querySelector('.song-select').setAttribute('aria-pressed', String(selected));
  });
  const frame = buildSpotifyFrame(track,`Spotify player for ${card.querySelector('.song-info strong').textContent}`,232);
  $('playerSlot').replaceChildren(frame);
}
songCards.forEach(card => card.querySelector('.song-select').addEventListener('click', () => selectTrack(card)));
let localSongUrl = null;
const localSong = $('localSongPlayer');
function stopSong() {
  localSong.pause();
  localSong.hidden=true;
  localSong.removeAttribute('src');
  localSong.load();
  if (localSongUrl) {URL.revokeObjectURL(localSongUrl); localSongUrl=null;}
  $('localSongFile').value='';
}
$('localSongFile').addEventListener('change', e => {
  const file=e.target.files?.[0];
  if (!file) return;
  stopBackground();
  stopSong();
  localSongUrl=URL.createObjectURL(file);
  localSong.src=localSongUrl;
  localSong.hidden=false;
  localSong.play().catch(()=>{});
  $('playerSlot').replaceChildren(document.createTextNode('Playing your local audio file below. ♫'));
});


// Secret last note.
const dialog=$('secretDialog');
$('secretButton').addEventListener('click',(event) => {burstAt(event.currentTarget,16);if (typeof dialog.showModal==='function') dialog.showModal();else dialog.setAttribute('open','');});
function closeDialog(){if (typeof dialog.close==='function') dialog.close();else dialog.removeAttribute('open');}
$('closeSecret').addEventListener('click',closeDialog);
$('secretOkay').addEventListener('click',closeDialog);
dialog.addEventListener('click',(event) => {if (event.target===dialog) closeDialog();});

showScene('welcome');
