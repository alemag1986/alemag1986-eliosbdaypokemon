/**
 * Elio's 5th Birthday — Pokémon Party Interactive Script
 * Best of 2026 Edition: Web Audio API Synth, Canvas Particle Confetti,
 * Gyroscopic 3D Card Tilt, Theme Lighting Engine & Micro-Interactions
 */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const gate = document.getElementById('access-gate');
  const gateScreen = gate ? gate.querySelector('.gb-screen') : null;
  const gateForm = document.getElementById('gate-form');
  const passcodeInput = document.getElementById('passcode-input');
  const gateError = document.getElementById('gate-error');
  const unlockFlash = document.getElementById('unlock-flash');
  const mainContent = document.getElementById('main-content');
  const pokemonGrid = document.getElementById('pokemon-grid');
  const wildDialogBox = document.getElementById('wild-dialog-box');
  const wildDialogText = document.getElementById('wild-dialog-text');
  const rsvpForm = document.getElementById('rsvp-form') || document.getElementById('diet-form');
  const rsvpSuccessMessage = document.getElementById('rsvp-success-message') || document.getElementById('diet-success-message');
  const dietForm = rsvpForm;
  const dietSuccessMessage = rsvpSuccessMessage;
  const floatingBallButtons = document.querySelectorAll('.floating-pokeball-btn');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const confettiCanvas = document.getElementById('confetti-canvas');

  const CORRECT_PASSCODE = 'ELIO5';
  let soundEnabled = true;

  /* ==========================================================================
     1. WEB AUDIO API 8-BIT RETRO SOUND SYNTHESIZER (Zero External Files!)
     ========================================================================== */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'victory') {
        // Authentic 4-note victory fanfare: C5 -> G5 -> E5 -> C6
        const notes = [
          { f: 523.25, t: 0.0, d: 0.12 },
          { f: 783.99, t: 0.12, d: 0.12 },
          { f: 659.25, t: 0.24, d: 0.12 },
          { f: 1046.50, t: 0.36, d: 0.45 }
        ];
        notes.forEach(function (n) {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'square';
          noteOsc.frequency.setValueAtTime(n.f, now + n.t);
          noteGain.gain.setValueAtTime(0.14, now + n.t);
          noteGain.gain.linearRampToValueAtTime(0.01, now + n.t + n.d);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(now + n.t);
          noteOsc.stop(now + n.t + n.d);
        });
      } else if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'flame') {
        const bufferSize = Math.floor(ctx.sampleRate * 0.45);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.55));
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.frequency.linearRampToValueAtTime(180, now + 0.45);
        filter.Q.setValueAtTime(3, now);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.45);
        return;
      } else if (type === 'heal') {
        // Classic Pokemon Center 6-tone recovery chime
        const chimeNotes = [
          { f: 523.25, t: 0.0, d: 0.09 },
          { f: 659.25, t: 0.09, d: 0.09 },
          { f: 783.99, t: 0.18, d: 0.09 },
          { f: 1046.50, t: 0.27, d: 0.11 },
          { f: 1318.51, t: 0.38, d: 0.12 },
          { f: 1567.98, t: 0.50, d: 0.32 }
        ];
        chimeNotes.forEach(function (n) {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(n.f, now + n.t);
          noteGain.gain.setValueAtTime(0.12, now + n.t);
          noteGain.gain.linearRampToValueAtTime(0.01, now + n.t + n.d);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(now + n.t);
          noteOsc.stop(now + n.t + n.d);
        });
      }
    } catch (e) {
      // Audio fallback silent
    }
  }

  function initSoundToggle() {
    if (!soundToggleBtn) return;
    soundToggleBtn.addEventListener('click', function () {
      soundEnabled = !soundEnabled;
      const icon = soundToggleBtn.querySelector('.sound-icon');
      if (icon) {
        icon.textContent = soundEnabled ? '🔊' : '🔇';
        icon.classList.toggle('sound-active', soundEnabled);
      }
      if (soundEnabled) playSynthSound('click');
    });
  }

  /* ==========================================================================
     2. DAY / SUNSET / NIGHT THEME LIGHTING ENGINE
     ========================================================================== */
  const THEMES = ['day', 'sunset', 'night'];
  let currentThemeIndex = 0;

  function initThemeToggle() {
    if (!themeToggleBtn) return;
    themeToggleBtn.addEventListener('click', function () {
      currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
      const nextTheme = THEMES[currentThemeIndex];
      document.documentElement.setAttribute('data-theme', nextTheme);

      const icon = themeToggleBtn.querySelector('.theme-icon');
      if (icon) {
        if (nextTheme === 'day') icon.textContent = '☀️';
        else if (nextTheme === 'sunset') icon.textContent = '🌅';
        else if (nextTheme === 'night') icon.textContent = '🌙';
      }
      playSynthSound('click');
    });
  }

  /* ==========================================================================
     3. HIGH-PERFORMANCE PARTICLE CONFETTI SYSTEM
     ========================================================================== */
  let confettiParticles = [];
  let confettiAnimationId = null;

  function triggerConfettiBurst(originX, originY, count) {
    if (prefersReducedMotion || !confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    if (!ctx) return;

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const colors = ['#eb3b32', '#ffd028', '#1b8cf2', '#52ba41', '#ffffff', '#ff7714'];
    const x = originX || window.innerWidth / 2;
    const y = originY || window.innerHeight / 2;

    for (let i = 0; i < (count || 80); i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 4 + Math.random() * 8;
      confettiParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        life: 0.98 + Math.random() * 0.015,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!confettiAnimationId) {
      runConfettiLoop();
    }
  }

  function runConfettiLoop() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;
      p.opacity *= p.life;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      ctx.restore();

      if (p.opacity < 0.05 || p.y > confettiCanvas.height + 50) {
        confettiParticles.splice(i, 1);
      }
    }

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(runConfettiLoop);
    } else {
      confettiAnimationId = null;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  /* ==========================================================================
     4. GATE & UNLOCK LOGIC
     ========================================================================== */
  function unlockSite(instant) {
    if (!gate) return;

    if (instant || prefersReducedMotion) {
      gate.classList.add('hidden');
      gate.setAttribute('aria-hidden', 'true');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
      initInteractiveFeatures();
      return;
    }

    playSynthSound('victory');
    triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);

    gate.classList.add('unlocking');
    if (unlockFlash) {
      unlockFlash.classList.add('active');
    }

    setTimeout(function () {
      gate.classList.add('hidden');
      gate.setAttribute('aria-hidden', 'true');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
      if (unlockFlash) {
        unlockFlash.classList.remove('active');
      }
      initInteractiveFeatures();
    }, 650);
  }

  function handlePasscodeSubmit(e) {
    e.preventDefault();
    if (!passcodeInput) return;

    const enteredCode = passcodeInput.value.trim().toUpperCase();

    if (enteredCode === CORRECT_PASSCODE) {
      if (gateError) gateError.textContent = '';
      unlockSite(false);
    } else {
      playSynthSound('error');
      if (gateError) {
        gateError.textContent = 'The code missed! Try again, Trainer!';
      }
      if (gateScreen) {
        gateScreen.classList.remove('shake');
        void gateScreen.offsetWidth;
        gateScreen.classList.add('shake');
      }
      passcodeInput.focus();
      passcodeInput.select();
    }
  }

  function checkUrlPasscode() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');
      if (codeParam && codeParam.trim().toUpperCase() === CORRECT_PASSCODE) {
        unlockSite(true);
        return true;
      }
    } catch (e) {
      // Fallback
    }
    return false;
  }

  if (gateForm) {
    gateForm.addEventListener('submit', handlePasscodeSubmit);
  }

  /* ==========================================================================
     4B. INTERACTIVE GAME BOY RETRO CONTROLS (TOUCH & CLICK SUPPORT)
     ========================================================================== */
  function triggerGameBoyHaptic(duration) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration || 20);
      } catch (e) {
        // Haptics fallback silent
      }
    }
  }

  function handleStartAction() {
    playSynthSound('click');
    triggerGameBoyHaptic(25);

    // Visual button press feedback
    const startBtn = document.getElementById('gb-btn-start');
    if (startBtn) {
      startBtn.classList.add('active-pressed');
      setTimeout(function () {
        startBtn.classList.remove('active-pressed');
      }, 180);
    }

    if (!passcodeInput) {
      unlockSite(false);
      return;
    }

    const val = passcodeInput.value.trim().toUpperCase();
    if (!val || val === CORRECT_PASSCODE) {
      // Empty input or correct code: auto-fill ELIO5 and unlock the party!
      passcodeInput.value = CORRECT_PASSCODE;
      if (gateError) gateError.textContent = '';
      unlockSite(false);
    } else {
      // Invalid code already entered: trigger miss shake & error sound
      handlePasscodeSubmit(new Event('submit'));
    }
  }

  function initGameBoyControls() {
    // 1. START Button & Screen PRESS START prompt
    const btnStart = document.getElementById('gb-btn-start');
    const screenPressStart = document.getElementById('gb-screen-press-start');

    if (btnStart) {
      btnStart.addEventListener('click', handleStartAction);
    }
    if (screenPressStart) {
      screenPressStart.addEventListener('click', handleStartAction);
    }

    // 2. Button A (Confirm / Start)
    const btnA = document.getElementById('gb-btn-a');
    if (btnA) {
      btnA.addEventListener('click', function () {
        btnA.classList.add('active-pressed');
        setTimeout(function () {
          btnA.classList.remove('active-pressed');
        }, 180);
        handleStartAction();
      });
    }

    // 3. Button B (Cancel / Clear)
    const btnB = document.getElementById('gb-btn-b');
    if (btnB) {
      btnB.addEventListener('click', function () {
        playSynthSound('pop');
        triggerGameBoyHaptic(15);
        btnB.classList.add('active-pressed');
        setTimeout(function () {
          btnB.classList.remove('active-pressed');
        }, 180);
        if (passcodeInput) {
          passcodeInput.value = '';
          if (gateError) gateError.textContent = '';
          passcodeInput.focus();
        }
      });
    }

    // 4. SELECT Button (Toggle lighting theme)
    const btnSelect = document.getElementById('gb-btn-select');
    if (btnSelect) {
      btnSelect.addEventListener('click', function () {
        playSynthSound('click');
        triggerGameBoyHaptic(15);
        btnSelect.classList.add('active-pressed');
        setTimeout(function () {
          btnSelect.classList.remove('active-pressed');
        }, 180);
        if (themeToggleBtn) {
          themeToggleBtn.click();
        }
      });
    }

    // 5. D-Pad Directional Buttons
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        playSynthSound('click');
        triggerGameBoyHaptic(10);
      });
    });
  }

  /* ==========================================================================
     5. HERO FLOATING POKÉBALL INTERACTION
     ========================================================================== */
  function initFloatingPokeballs() {
    if (!floatingBallButtons || floatingBallButtons.length === 0) return;

    floatingBallButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (btn.classList.contains('popping')) return;

        playSynthSound('pop');
        const rect = btn.getBoundingClientRect();
        triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

        const roster = (typeof POKEMON_GUESTS !== 'undefined' && POKEMON_GUESTS.length)
          ? POKEMON_GUESTS
          : [{ name: 'Pikachu', image: 'assets/pokemon/25.png' }];

        const randomPoke = roster[Math.floor(Math.random() * roster.length)];
        const spriteWrapper = btn.querySelector('.popup-sprite-wrapper');

        if (spriteWrapper) {
          spriteWrapper.innerHTML = '<img src="' + randomPoke.image + '" alt="' + randomPoke.name + '">';
        }

        btn.classList.add('popping');

        setTimeout(function () {
          btn.classList.remove('popping');
          if (spriteWrapper) {
            spriteWrapper.innerHTML = '';
          }
        }, 2300);
      });
    });
  }

  /* ==========================================================================
     6. TYPEWRITER EFFECT IN TRAINER DIALOG BOX
     ========================================================================== */
  const DIALOG_TEXT = "Let's train our next generation of Pokémon Trainers! Tap any Poké Ball to test your knowledge!";

  function typewriteText(element, text, speed, callback) {
    if (prefersReducedMotion) {
      element.textContent = text;
      if (callback) callback();
      return;
    }

    element.textContent = '';
    let index = 0;

    const timer = setInterval(function () {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, speed);
  }

  function initWildDialog() {
    if (!wildDialogBox || !wildDialogText) return;

    if (!('IntersectionObserver' in window)) {
      wildDialogText.textContent = DIALOG_TEXT;
      return;
    }

    let hasRun = false;
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !hasRun) {
            hasRun = true;
            typewriteText(wildDialogText, DIALOG_TEXT, 35);
            observer.unobserve(wildDialogBox);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(wildDialogBox);
  }

  /* ==========================================================================
     7. POKÉMON TRAINER GUESSING GAME & SESSION PERSISTENCE
     ========================================================================== */
  const quizModal = document.getElementById('pokemon-quiz-modal');
  const quizModalClose = document.getElementById('quiz-modal-close');
  const quizModalBackdrop = document.getElementById('quiz-modal-backdrop');
  const quizPokeballArt = document.getElementById('quiz-pokeball-art');
  const quizMysterySprite = document.getElementById('quiz-mystery-sprite');
  const quizClueDesc = document.getElementById('quiz-clue-desc');
  const quizTypeClue = document.getElementById('quiz-type-clue');
  const quizChoicesGrid = document.getElementById('quiz-choices-grid');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizFeedbackMsg = document.getElementById('quiz-feedback-msg');
  const quizContinueBtn = document.getElementById('quiz-continue-btn');

  function getTrainerGuesses() {
    try {
      const data = sessionStorage.getItem('pokemon_trainer_guesses');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveTrainerGuess(pokemonId, chosenName, isCorrect) {
    try {
      const guesses = getTrainerGuesses();
      guesses[pokemonId] = {
        guess: chosenName,
        isCorrect: Boolean(isCorrect),
        timestamp: Date.now()
      };
      sessionStorage.setItem('pokemon_trainer_guesses', JSON.stringify(guesses));
    } catch (e) {
      // Storage fallback
    }
  }

  function renderPokemonGrid() {
    if (!pokemonGrid) return;
    if (typeof POKEMON_GUESTS === 'undefined' || !Array.isArray(POKEMON_GUESTS)) return;

    pokemonGrid.innerHTML = '';
    const savedGuesses = getTrainerGuesses();

    POKEMON_GUESTS.forEach(function (p) {
      const card = document.createElement('article');
      card.className = 'pokemon-card';
      card.setAttribute('data-id', p.id);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      const typeBadges = p.types
        .map(function (type) {
          return '<span class="type-badge type-' + type + '">' + type + '</span>';
        })
        .join('');

      const saved = savedGuesses[p.id];
      const isRevealed = Boolean(saved);
      const fallbackCdn = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + p.id + '.png';

      if (isRevealed) {
        card.classList.add('revealed');
        card.classList.add('has-guessed');
        card.setAttribute('aria-label', p.name + ' (Revealed). Your guess: ' + saved.guess + '.');

        const guessHtml = saved.isCorrect
          ? '<div class="trainer-guess-tag guess-correct">⭐ Guess: ' + saved.guess + ' (Correct!)</div>'
          : '<div class="trainer-guess-tag guess-wrong">🎯 Guess: ' + saved.guess + '</div>';

        card.innerHTML =
          '<div class="card-sprite-stage">' +
            '<div class="pokeball card-pokeball" aria-hidden="true" style="display: none;"></div>' +
            '<div class="burst-ring" aria-hidden="true"></div>' +
            '<img class="pokemon-sprite" src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.onerror=null; this.src=\'' + fallbackCdn + '\';">' +
          '</div>' +
          '<h3 class="pokemon-name revealed-name">' + p.name + '</h3>' +
          '<div class="pokemon-types">' + typeBadges + '</div>' +
          '<p class="pokemon-desc revealed-desc">“' + (p.description || 'A mysterious party guest!') + '”</p>' +
          '<div class="card-guess-slot">' + guessHtml + '</div>';
      } else {
        // Do NOT name the Pokémon if unrevealed! Mystery icon is the Pokéball.
        card.setAttribute('aria-label', 'Mystery Pokémon #' + p.id + '. Tap to guess!');

        card.innerHTML =
          '<div class="card-sprite-stage">' +
            '<div class="pokeball card-pokeball" aria-label="Mystery Poké Ball"></div>' +
            '<div class="burst-ring" aria-hidden="true"></div>' +
            '<img class="pokemon-sprite" src="' + p.image + '" alt="' + p.name + '" loading="lazy" style="display: none;" onerror="this.onerror=null; this.src=\'' + fallbackCdn + '\';">' +
          '</div>' +
          '<h3 class="pokemon-name mystery-name">Mystery Pokémon</h3>' +
          '<div class="pokemon-types">' + typeBadges + '</div>' +
          '<p class="pokemon-desc mystery-desc">“' + (p.description || 'Who could this Pokémon be?') + '”</p>' +
          '<div class="card-guess-slot"><div class="card-mystery-tag">⚡ Tap to Guess!</div></div>';
      }

      function onCardActivate() {
        openQuizModal(p);
      }

      card.addEventListener('click', onCardActivate);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardActivate();
        }
      });

      pokemonGrid.appendChild(card);
    });
  }

  function openQuizModal(pokemon) {
    if (!quizModal) return;

    const fallbackCdn = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + pokemon.id + '.png';

    // The mystery icon is the Pokéball
    if (quizPokeballArt) {
      quizPokeballArt.style.display = 'inline-block';
      quizPokeballArt.className = 'pokeball quiz-modal-pokeball';
    }

    if (quizMysterySprite) {
      quizMysterySprite.style.display = 'none';
      quizMysterySprite.classList.remove('revealed-color');
      quizMysterySprite.src = pokemon.image;
      quizMysterySprite.alt = pokemon.name;
      quizMysterySprite.onerror = function () {
        this.onerror = null;
        this.src = fallbackCdn;
      };
    }

    if (quizClueDesc) {
      quizClueDesc.textContent = '“' + (pokemon.description || 'A mysterious party guest!') + '”';
    }

    if (quizTypeClue) {
      const typeIcons = pokemon.types.map(function (t) {
        return '<span class="type-badge type-' + t + '">' + t + '</span>';
      }).join(' ');
      quizTypeClue.innerHTML = '<span>Type Clue: </span>' + typeIcons;
    }

    // Generate 4 options: correct answer + 3 random distractors from POKEMON_GUESTS
    const otherPool = POKEMON_GUESTS
      .filter(function (item) { return item.id !== pokemon.id; })
      .map(function (item) { return item.name; });

    // Shuffle pool and pick 3
    const shuffledPool = otherPool.slice().sort(function () { return 0.5 - Math.random(); });
    const choices = [pokemon.name, shuffledPool[0], shuffledPool[1], shuffledPool[2]];
    choices.sort(function () { return 0.5 - Math.random(); });

    if (quizChoicesGrid) {
      quizChoicesGrid.innerHTML = '';
      choices.forEach(function (name) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-choice-btn';
        btn.textContent = name;
        btn.setAttribute('data-name', name);

        btn.addEventListener('click', function () {
          handleQuizGuess(pokemon, name, btn);
        });

        quizChoicesGrid.appendChild(btn);
      });
    }

    if (quizFeedback) {
      quizFeedback.classList.add('hidden');
    }

    quizModal.classList.remove('hidden');
    quizModal.removeAttribute('aria-hidden');
    playSynthSound('click');
  }

  function handleQuizGuess(pokemon, chosenName, clickedBtn) {
    const isCorrect = (chosenName.toLowerCase() === pokemon.name.toLowerCase());

    // Disable all option buttons
    const allBtns = quizChoicesGrid.querySelectorAll('.quiz-choice-btn');
    allBtns.forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-name') === pokemon.name) {
        b.classList.add('is-correct');
      }
    });

    if (!isCorrect && clickedBtn) {
      clickedBtn.classList.add('is-wrong');
    }

    // Reveal in modal: swap mystery pokeball for revealed sprite in full color
    if (quizPokeballArt) {
      quizPokeballArt.style.display = 'none';
    }
    if (quizMysterySprite) {
      quizMysterySprite.style.display = 'inline-block';
      quizMysterySprite.classList.add('revealed-color');
    }

    // Save to session
    saveTrainerGuess(pokemon.id, chosenName, isCorrect);

    // Audio & visuals
    if (isCorrect) {
      playSynthSound('victory');
      triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 45);
    } else {
      playSynthSound('pop');
    }

    // Feedback message
    if (quizFeedback && quizFeedbackMsg) {
      quizFeedback.classList.remove('hidden');
      quizFeedbackMsg.className = 'quiz-feedback-msg ' + (isCorrect ? 'feedback-correct' : 'feedback-wrong');
      quizFeedbackMsg.textContent = isCorrect
        ? '🎉 Excellent deduction, Trainer! It is ' + pokemon.name + '! You earned a Trainer Badge!'
        : '⚡ Nice effort, Trainer! It was actually ' + pokemon.name + '! Keep training!';
    }

    // Update the card on the grid with reveal animation
    const card = pokemonGrid.querySelector('.pokemon-card[data-id="' + pokemon.id + '"]');
    if (card) {
      card.classList.add('anim-wiggle');
      setTimeout(function () {
        card.classList.remove('anim-wiggle');
        card.classList.add('anim-burst');
        setTimeout(function () {
          card.classList.remove('anim-burst');
          card.classList.add('revealed');
          card.classList.add('has-guessed');

          // Reveal actual Pokémon name
          const nameEl = card.querySelector('.pokemon-name');
          if (nameEl) {
            nameEl.className = 'pokemon-name revealed-name';
            nameEl.textContent = pokemon.name;
          }

          // Swap pokeball to sprite
          const ball = card.querySelector('.card-pokeball');
          if (ball) ball.style.display = 'none';
          const sprite = card.querySelector('.pokemon-sprite');
          if (sprite) sprite.style.display = 'block';

          // Update description styling
          const descEl = card.querySelector('.pokemon-desc');
          if (descEl) {
            descEl.className = 'pokemon-desc revealed-desc';
          }

          // Update aria label
          card.setAttribute('aria-label', pokemon.name + ' (Revealed). Your guess: ' + chosenName + '.');

          const slot = card.querySelector('.card-guess-slot');
          if (slot) {
            slot.innerHTML = isCorrect
              ? '<div class="trainer-guess-tag guess-correct">⭐ Guess: ' + chosenName + ' (Correct!)</div>'
              : '<div class="trainer-guess-tag guess-wrong">🎯 Guess: ' + chosenName + '</div>';
          }
        }, 320);
      }, 550);
    }

    // Update battle dialog text
    if (wildDialogText) {
      wildDialogText.textContent = isCorrect
        ? 'Spot on, Trainer! ' + pokemon.name + ' was revealed! You are becoming a Pokémon Master!'
        : 'Good training! ' + pokemon.name + ' joined the party! Keep catching \'em all!';
    }
  }

  function closeQuizModal() {
    if (!quizModal) return;
    quizModal.classList.add('hidden');
    quizModal.setAttribute('aria-hidden', 'true');
    if (quizMysterySprite) {
      quizMysterySprite.style.display = 'none';
      quizMysterySprite.classList.remove('revealed-color');
    }
    if (quizPokeballArt) {
      quizPokeballArt.style.display = 'inline-block';
    }
  }

  if (quizModalClose) quizModalClose.addEventListener('click', closeQuizModal);
  if (quizModalBackdrop) quizModalBackdrop.addEventListener('click', closeQuizModal);
  if (quizContinueBtn) quizContinueBtn.addEventListener('click', closeQuizModal);
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && quizModal && !quizModal.classList.contains('hidden')) {
      closeQuizModal();
    }
  });

  /* ==========================================================================
     8. SCROLL REVEALS FOR SECTIONS & CARDS
     ========================================================================== */
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!revealElements || revealElements.length === 0) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      revealElements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================================
     9. RSVP FORM (WEB3FORMS) WITH HEALING LIGHTS
     ========================================================================== */
  function initDietForm() {
    const form = rsvpForm || dietForm;
    if (!form) return;

    let isSubmitting = false;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      const nameInput = document.getElementById('trainer-name');
      const countInput = document.getElementById('party-count');
      const submitBtn = form.querySelector('button[type="submit"]') || document.getElementById('submit-rsvp-btn') || document.getElementById('submit-diet-btn');
      const healingTerminal = form.closest('.healing-terminal');
      const healSlots = document.querySelectorAll('.healing-machine-lights .heal-slot');

      if (!nameInput || !nameInput.value.trim()) {
        if (nameInput) {
          nameInput.classList.add('form-field-invalid');
          nameInput.focus();
          playSynthSound('error');
          setTimeout(function () {
            nameInput.classList.remove('form-field-invalid');
          }, 600);
        }
        return;
      }

      if (countInput && countInput.value.trim() === '') {
        countInput.classList.add('form-field-invalid');
        countInput.focus();
        playSynthSound('error');
        setTimeout(function () {
          countInput.classList.remove('form-field-invalid');
        }, 600);
        return;
      }

      isSubmitting = true;
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send to Professor Oak ✉️';

      // 1. Submit Button Loading State with spinning Poké Ball
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-submitting');
        submitBtn.innerHTML = '<span class="pokeball-spinner" aria-hidden="true"></span> Transmitting to Oak... ⚡';
      }

      // 2. Nurse Joy's Healing Machine Sequence
      if (healingTerminal) {
        healingTerminal.classList.add('healing-active');
      }

      playSynthSound('heal');

      // Light up the 6 healing machine slots sequentially with elemental energy colors
      const slotColors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#9b59b6', '#00d2d3'];
      if (healSlots && healSlots.length > 0) {
        healSlots.forEach(function (slot, idx) {
          slot.classList.remove('slot-active', 'slot-healing');
          slot.style.backgroundColor = '#57606f';
          slot.style.boxShadow = 'none';

          setTimeout(function () {
            slot.classList.add('slot-healing');
            const color = slotColors[idx % slotColors.length];
            slot.style.backgroundColor = color;
            slot.style.boxShadow = '0 0 14px ' + color;
            playSynthSound('pop');
          }, idx * 110);
        });
      }

      // 3. Web3Forms Submission
      const formData = new FormData(form);
      formData.set('access_key', 'b9b7d051-66f1-4d60-84f0-c77dde7bab19');

      // Ensure name and message fields are populated for Web3Forms email formatting
      if (!formData.has('name') && formData.has('trainerName')) {
        formData.append('name', formData.get('trainerName'));
      }
      if (!formData.has('message') && formData.has('dietNotes')) {
        formData.append('message', formData.get('dietNotes'));
      }
      if (countInput && countInput.value !== '') {
        formData.set('kids_above_2', countInput.value);
        formData.set('guests', countInput.value);
      }

      const totalHealingDuration = (healSlots && healSlots.length > 0) ? healSlots.length * 110 + 200 : 400;
      const animDelay = new Promise(function (resolve) {
        setTimeout(resolve, totalHealingDuration);
      });

      try {
        const [response] = await Promise.all([
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          }),
          animDelay
        ]);

        const data = await response.json();

        if (response.ok && data.success !== false) {
          form.classList.add('form-fade-out');

          setTimeout(function () {
            form.style.display = 'none';
            const successMsg = rsvpSuccessMessage || dietSuccessMessage;
            if (successMsg) {
              successMsg.hidden = false;
              successMsg.focus();
            }

            playSynthSound('victory');

            // Confetti explosion from the terminal center
            const formRect = (healingTerminal || form).getBoundingClientRect();
            triggerConfettiBurst(
              formRect.left + formRect.width / 2,
              formRect.top + Math.min(formRect.height / 2, 200),
              80
            );

            if (healingTerminal) {
              setTimeout(function () {
                healingTerminal.classList.remove('healing-active');
              }, 1000);
            }
          }, 320);

          form.reset();
        } else {
          alert('Error: ' + (data.message || 'Failed to submit RSVP. Please try again.'));
          if (healingTerminal) {
            healingTerminal.classList.remove('healing-active');
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-submitting');
            submitBtn.innerHTML = originalBtnHtml;
          }
          isSubmitting = false;
        }
      } catch (error) {
        alert('Something went wrong. Please check your internet connection and try again.');
        if (healingTerminal) {
          healingTerminal.classList.remove('healing-active');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-submitting');
          submitBtn.innerHTML = originalBtnHtml;
        }
        isSubmitting = false;
      }
    });
  }

  /* ==========================================================================
     10. 3D CARD TILT & HOLOGRAPHIC SPECULAR ENGINE
     ========================================================================== */
  function initCardTilt() {
    const stage = document.getElementById('hero-card-stage');
    const card = document.getElementById('tcg-hero-card');
    const glare = card ? card.querySelector('.card-holo-glare') : null;
    const artSheen = card ? card.querySelector('.art-holo-sheen') : null;

    if (!stage || !card || prefersReducedMotion) return;

    stage.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -14;
      const rotateY = ((x - centerX) / centerX) * 14;

      card.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(12px)';

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      if (glare) {
        glare.style.opacity = '0.75';
        glare.style.background = 'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.65) 0%, rgba(255,220,100,0.35) 25%, transparent 65%)';
      }

      if (artSheen) {
        artSheen.style.opacity = '0.88';
        artSheen.style.backgroundPosition = glareX + '% ' + glareY + '%';
      }
    });

    stage.addEventListener('mouseleave', function () {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
      if (glare) {
        glare.style.opacity = '0.5';
        glare.style.background = '';
      }
      if (artSheen) {
        artSheen.style.opacity = '0.65';
        artSheen.style.backgroundPosition = '';
      }
    });
  }

  /* ==========================================================================
     11. CHARIZARD ANIMATED FIRE BREATH ENGINE (SMOOTH 60FPS, 5s ON / 5s OFF)
     ========================================================================== */
  function initCharizardFlame() {
    const canvas = document.getElementById('charizard-flame-canvas');
    const card = document.getElementById('tcg-hero-card');
    const glow = document.getElementById('charizard-mouth-glow');
    if (!canvas || !card) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PADDING_TOP = 100;
    const PADDING_RIGHT = 140;

    let width = 0;
    let height = 0;
    let cardWidth = 0;
    let cardHeight = 0;
    let dpr = 1;
    let cycleStartTime = performance.now();
    let lastTime = performance.now();
    let wasFiring = false;

    // 1. Pre-render flame textures once on tiny offscreen canvases (zero CPU shadowBlur per frame)
    function createOffscreenTexture(size, drawFn) {
      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;
      const octx = offscreen.getContext('2d');
      drawFn(octx, size / 2, size / 2, size / 2);
      return offscreen;
    }

    const coreTexture = createOffscreenTexture(64, function (c, cx, cy, r) {
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 245, 160, 0.92)');
      grad.addColorStop(0.65, 'rgba(255, 160, 20, 0.45)');
      grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
    });

    const flameTexture = createOffscreenTexture(80, function (c, cx, cy, r) {
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 230, 110, 0.95)');
      grad.addColorStop(0.3, 'rgba(255, 130, 20, 0.82)');
      grad.addColorStop(0.65, 'rgba(235, 45, 10, 0.45)');
      grad.addColorStop(1, 'rgba(180, 20, 0, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
    });

    const emberTexture = createOffscreenTexture(32, function (c, cx, cy, r) {
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 215, 0, 0.9)');
      grad.addColorStop(0.75, 'rgba(255, 100, 20, 0.4)');
      grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
    });

    function resize() {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      cardWidth = rect.width;
      cardHeight = rect.height;
      width = cardWidth + PADDING_RIGHT;
      height = cardHeight + PADDING_TOP;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if (prefersReducedMotion) return;

    // 2. Pre-allocated Particle Pool (zero GC stutter)
    class FluidFlameParticle {
      constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 1;
        this.texture = flameTexture;
        this.baseSize = 20;
        this.growth = 1;
        this.phase = 0;
        this.phaseSpeed = 0.1;
      }

      spawn(originX, originY) {
        this.active = true;
        this.x = originX + (Math.random() - 0.5) * 6;
        this.y = originY + (Math.random() - 0.5) * 6;

        const angle = -0.58 + (Math.random() - 0.5) * 0.28;
        const speed = 7.0 + Math.random() * 7.5;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - (0.1 + Math.random() * 0.25);

        this.maxLife = 36 + Math.random() * 26;
        this.life = this.maxLife;

        const rand = Math.random();
        if (rand < 0.32) {
          this.texture = coreTexture;
          this.baseSize = 14;
          this.growth = 0.55;
        } else if (rand < 0.82) {
          this.texture = flameTexture;
          this.baseSize = 20;
          this.growth = 1.25;
        } else {
          this.texture = emberTexture;
          this.baseSize = 8;
          this.growth = 0.2;
        }

        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpeed = 0.08 + Math.random() * 0.08;
      }

      update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
          this.active = false;
          return;
        }
        this.phase += this.phaseSpeed * dt;
        this.x += (this.vx + Math.sin(this.phase) * 1.1) * dt;
        this.y += (this.vy + Math.cos(this.phase) * 0.7) * dt;
      }

      draw(c) {
        if (!this.active) return;
        const progress = 1 - (this.life / this.maxLife);
        const alpha = Math.sin(progress * Math.PI);
        if (alpha <= 0.01) return;

        const size = this.baseSize + progress * this.growth * 30;
        c.globalAlpha = alpha;
        c.drawImage(this.texture, this.x - size / 2, this.y - size / 2, size, size);
      }
    }

    const POOL_SIZE = 180;
    const pool = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      pool.push(new FluidFlameParticle());
    }

    // Interactive Trigger: click restarts the 5-second fire burst immediately
    card.addEventListener('click', function () {
      cycleStartTime = performance.now();
      playSynthSound('flame');
    });

    function loop(now) {
      if (width === 0 || height === 0) {
        resize();
      }

      // Smooth delta-time calculation (clamped to prevent jumps after tab blur)
      const dt = Math.min((now - lastTime) / 16.67, 2.0);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Smooth 5s ON / 5s OFF loop with natural ignition & fade
      const elapsed = (now - cycleStartTime) % 10000;
      let intensity = 0;
      if (elapsed < 400) {
        intensity = elapsed / 400; // Gentle 0.4s ignition
      } else if (elapsed < 4500) {
        intensity = 1.0;          // Full blazing torrent
      } else if (elapsed < 5000) {
        intensity = (5000 - elapsed) / 500; // Smooth 0.5s dissipation
      }

      const isFiring = intensity > 0.01;

      if (glow) {
        if (isFiring) {
          glow.style.opacity = (0.2 + intensity * 0.8).toFixed(2);
        } else {
          glow.style.opacity = '0.15';
        }
      }

      if (isFiring && !wasFiring && elapsed < 800) {
        playSynthSound('flame');
      }
      wasFiring = isFiring;

      // Spawn fluid stream particles when firing
      if (isFiring) {
        const count = Math.round(6 * intensity);
        const originX = cardWidth * 0.575;
        const originY = PADDING_TOP + cardHeight * 0.266;
        for (let i = 0; i < count; i++) {
          for (let j = 0; j < POOL_SIZE; j++) {
            if (!pool[j].active) {
              pool[j].spawn(originX, originY);
              break;
            }
          }
        }
      }

      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < POOL_SIZE; i++) {
        const p = pool[i];
        if (p.active) {
          p.update(dt);
          if (p.x > width + 20 || p.y < -20) {
            p.active = false;
          } else {
            p.draw(ctx);
          }
        }
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* ==========================================================================
     9. SCROLL-DRIVEN PIXEL TRAINER & OVERWORLD ROADS
     ========================================================================== */
  function initScrollTrainer() {
    const trainer = document.getElementById('pixel-trainer');
    const bubble = document.getElementById('trainer-bubble');
    const roadSvg = document.getElementById('road-network-svg');
    const routeBorder = document.getElementById('trainer-route-border');
    const routeStepped = document.getElementById('trainer-route-stepped');
    const routeSurface = document.getElementById('trainer-route-surface');
    const routeDashes = document.getElementById('trainer-route-dashes');
    const bridgeDeck = document.getElementById('trainer-route-bridge-deck');
    const sign1 = document.getElementById('route-sign-1');
    const sign2 = document.getElementById('route-sign-2');
    const sign3 = document.getElementById('route-sign-3');
    const sign4 = document.getElementById('route-sign-4');

    if (!trainer || !routeSurface || !roadSvg) return;

    let walkTimeout = null;

    const TRAINER_QUOTES = [
      "Let's Party! 🎉",
      "Level 5 reached! ⚡",
      "Gotta Catch 'Em All! 🔴",
      "I choose you, Chuck E.! 🐭",
      "Happy 5th Birthday Elio! 🎂",
      "Pallet Town Champion! 🏆",
      "Pizza & Tickets time! 🍕",
      "Go Pikachu! ⚡"
    ];

    function buildWindingRoad() {
      if (!mainContent) return;
      const totalWidth = mainContent.offsetWidth || window.innerWidth;
      const totalHeight = mainContent.offsetHeight || document.documentElement.scrollHeight;

      roadSvg.setAttribute('width', totalWidth);
      roadSvg.setAttribute('height', totalHeight);
      roadSvg.setAttribute('viewBox', '0 0 ' + totalWidth + ' ' + totalHeight);

      const hero = document.getElementById('hero');
      const details = document.getElementById('details');
      const pokemon = document.getElementById('pokemon');
      const gifts = document.getElementById('gifts');
      const rsvp = document.getElementById('rsvp');
      const footer = document.querySelector('.site-footer');

      const isMobile = totalWidth < 768;
      const center = totalWidth * 0.5;
      const leftMargin = isMobile ? totalWidth * 0.12 : Math.max(50, totalWidth * 0.16);
      const rightMargin = isMobile ? totalWidth * 0.88 : Math.min(totalWidth - 50, totalWidth * 0.84);

      // Vertical coordinates aligned with real section geometry (Details -> Gifts -> RSVP -> Pokémon -> Footer)
      const y0 = details ? details.offsetTop : 800;                                         // Start at horizontal line where green grass begins
      const y1 = details ? details.offsetTop + 85 : 880;                                    // Pallet Town residential street between houses
      const y2 = details ? details.offsetTop + 240 : 1040;                                  // Center of canal wooden footbridge
      const y3 = details ? details.offsetTop + 420 : 1220;                                  // Ducks behind details cards
      const y4 = gifts ? gifts.offsetTop + 130 : 1700;                                      // Commercial Plaza Festival Archway
      const y5 = gifts ? gifts.offsetTop + gifts.offsetHeight * 0.55 : 2150;                // Ducks behind Gifts cards
      const y6 = rsvp ? rsvp.offsetTop + 130 : 2650;                                        // Nurse Joy Healing Terminal entrance
      const y7 = rsvp ? rsvp.offsetTop + rsvp.offsetHeight * 0.55 : 3150;                   // Ducks behind RSVP cards
      const y8 = pokemon ? pokemon.offsetTop + 140 : 3650;                                  // Trainer Academy & Wild Safari entrance
      const y9 = pokemon ? pokemon.offsetTop + pokemon.offsetHeight * 0.55 : 4150;          // Ducks behind Trainer Pokémon deck
      const y10 = footer ? footer.offsetTop + 50 : totalHeight - 120;                       // Victory Gym finish line

      // Waypoints engineered to weave down from between the trees, through towns, and behind cards
      const points = [
        { x: center, y: y0 },                                                                // Point 0: Start between trees
        { x: isMobile ? center + 25 : center + 65, y: y1 },                                 // Point 1: Pallet Town street
        { x: center, y: y2 },                                                                // Point 2: Wooden footbridge crossing canal
        { x: isMobile ? rightMargin - 25 : center + 140, y: y3 },                            // Point 3: Ducks behind Details cards
        { x: center, y: y4 },                                                                // Point 4: Commercial Plaza Festival Archway
        { x: isMobile ? leftMargin + 30 : center - 100, y: y5 },                             // Point 5: Ducks behind Gifts cards
        { x: isMobile ? rightMargin - 30 : center + 90, y: y6 },                             // Point 6: Ducks behind RSVP Terminal
        { x: isMobile ? leftMargin + 20 : leftMargin + 50, y: y7 },                          // Point 7: Safari & Trainer Academy entrance
        { x: isMobile ? rightMargin - 20 : rightMargin - 50, y: y8 },                        // Point 8: Ducks behind Wild Pokémon deck
        { x: center, y: y9 },                                                                // Point 9: Approaching finish line
        { x: center, y: y10 }                                                                // Point 10: Victory Gym finish line
      ];

      let d = 'M ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midY = (curr.y + next.y) / 2;
        const cp1x = curr.x;
        const cp1y = midY;
        const cp2x = next.x;
        const cp2y = midY;
        d += ' C ' + cp1x.toFixed(1) + ' ' + cp1y.toFixed(1) + ', ' +
             cp2x.toFixed(1) + ' ' + cp2y.toFixed(1) + ', ' +
             next.x.toFixed(1) + ' ' + next.y.toFixed(1);
      }

      if (routeBorder) routeBorder.setAttribute('d', d);
      if (routeStepped) routeStepped.setAttribute('d', d);
      routeSurface.setAttribute('d', d);
      if (routeDashes) routeDashes.setAttribute('d', d);

      // Wooden Bridge Deck at the canal crossing (Point 2)
      if (bridgeDeck && points[2]) {
        const bridgeX = points[2].x - 36;
        const bridgeY = points[2].y - 35;
        bridgeDeck.innerHTML =
          '<rect x="' + bridgeX + '" y="' + bridgeY + '" width="72" height="70" rx="3" />' +
          '<line x1="' + bridgeX + '" y1="' + (bridgeY + 4) + '" x2="' + (bridgeX + 72) + '" y2="' + (bridgeY + 4) + '" stroke="#4a2505" stroke-width="4"/>' +
          '<line x1="' + bridgeX + '" y1="' + (bridgeY + 66) + '" x2="' + (bridgeX + 72) + '" y2="' + (bridgeY + 66) + '" stroke="#4a2505" stroke-width="4"/>' +
          '<circle cx="' + (bridgeX + 6) + '" cy="' + (bridgeY + 4) + '" r="3" fill="#ffd700"/>' +
          '<circle cx="' + (bridgeX + 66) + '" cy="' + (bridgeY + 4) + '" r="3" fill="#ffd700"/>' +
          '<circle cx="' + (bridgeX + 6) + '" cy="' + (bridgeY + 66) + '" r="3" fill="#ffd700"/>' +
          '<circle cx="' + (bridgeX + 66) + '" cy="' + (bridgeY + 66) + '" r="3" fill="#ffd700"/>';
      }

      const branchRoutes = document.getElementById('branching-town-routes');
      if (branchRoutes) {
        branchRoutes.innerHTML = '';
      }
    }

    function updateTrainerPosition() {
      const totalLength = routeSurface.getTotalLength();
      if (!totalLength) return;

      const details = document.getElementById('details');
      const detailsTop = details ? details.offsetTop : 800;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollY = window.scrollY || window.pageYOffset || 0;

      // Road starts at detailsTop (the green horizontal line).
      // When user is in hero section, trainer waits at the beginning of the road (detailsTop).
      // As user scrolls past hero into details, trainer moves smoothly with scroll,
      // staying in viewport focus throughout the journey to the footer.
      const startScroll = Math.max(0, detailsTop - window.innerHeight * 0.4);
      const scrollRange = Math.max(1, maxScroll - startScroll);
      const progress = scrollY <= startScroll ? 0 : Math.min(1, (scrollY - startScroll) / scrollRange);

      const currentLength = progress * totalLength;
      const pt = routeSurface.getPointAtLength(currentLength);

      const forwardLength = Math.min(totalLength, currentLength + 6);
      const ptNext = routeSurface.getPointAtLength(forwardLength);

      const dx = ptNext.x - pt.x;

      if (dx > 0.4) {
        trainer.classList.add('facing-right');
        trainer.classList.remove('facing-left');
      } else if (dx < -0.4) {
        trainer.classList.add('facing-left');
        trainer.classList.remove('facing-right');
      }

      trainer.style.transform = 'translate3d(' + (pt.x - 22).toFixed(1) + 'px, ' + (pt.y - 48).toFixed(1) + 'px, 0)';

      trainer.classList.add('is-walking');
      if (walkTimeout) clearTimeout(walkTimeout);
      walkTimeout = setTimeout(function () {
        trainer.classList.remove('is-walking');
      }, 140);
    }

    function triggerTrainerJump() {
      if (trainer.classList.contains('trainer-jumping')) return;
      playSynthSound('jump');
      trainer.classList.add('trainer-jumping', 'jumping');
      const randomQuote = TRAINER_QUOTES[Math.floor(Math.random() * TRAINER_QUOTES.length)];
      bubble.textContent = randomQuote;
      bubble.classList.add('show-bubble');

      setTimeout(function () {
        trainer.classList.remove('trainer-jumping', 'jumping');
      }, 550);

      setTimeout(function () {
        bubble.classList.remove('show-bubble');
      }, 2400);
    }

    trainer.addEventListener('click', triggerTrainerJump);
    trainer.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerTrainerJump();
      }
    });

    [sign1, sign2, sign3, sign4].forEach(function (s) {
      if (s) {
        s.addEventListener('click', function () {
          playSynthSound('click');
          s.style.transform = 'scale(1.12) translateY(-6px)';
          setTimeout(function () {
            s.style.transform = '';
          }, 250);
        });
      }
    });

    buildWindingRoad();
    updateTrainerPosition();

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateTrainerPosition();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildWindingRoad();
        updateTrainerPosition();
      }, 150);
    });
  }

  /* ==========================================================================
     INITIALIZATION ORCHESTRATOR
     ========================================================================== */
  function initInteractiveFeatures() {
    initFloatingPokeballs();
    renderPokemonGrid();
    initWildDialog();
    initScrollReveals();
    initDietForm();
    initCardTilt();
    initCharizardFlame();
    initSoundToggle();
    initThemeToggle();
    initScrollTrainer();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGameBoyControls();

    const isUnlockedByUrl = checkUrlPasscode();
    // Only auto-focus on desktop / fine-pointer devices so mobile virtual keyboard doesn't occlude Game Boy
    const isTouchMobile = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!isUnlockedByUrl && passcodeInput && !isTouchMobile) {
      setTimeout(function () {
        passcodeInput.focus();
      }, 200);
    }
  });

})();
