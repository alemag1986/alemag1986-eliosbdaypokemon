import { test, expect } from '@playwright/test';

test.describe("Elio's 5th Birthday Pokémon Invitation Site", () => {

  test('Access Gate: should display Game Boy boot screen and shake on invalid code', async ({ page }) => {
    await page.goto('/');

    const gate = page.locator('#access-gate');
    await expect(gate).toBeVisible();

    const title = page.locator('#gate-title');
    await expect(title).toContainText('A wild INVITATION appeared!');

    const kicker = page.locator('.gb-kicker');
    await expect(kicker).toContainText('* ELIO VERSION *');

    const passcodeInput = page.locator('#passcode-input');
    const unlockBtn = page.locator('#unlock-btn');

    // Test invalid code
    await passcodeInput.fill('PIKACHU');
    await unlockBtn.click();

    const errorMsg = page.locator('#gate-error');
    await expect(errorMsg).toContainText('The code missed! Try again, Trainer!');

    const screen = page.locator('.gb-screen');
    await expect(screen).toHaveClass(/shake/);
  });

  test('Access Gate: should unlock successfully with code ELIO5', async ({ page }) => {
    await page.goto('/');

    const passcodeInput = page.locator('#passcode-input');
    const unlockBtn = page.locator('#unlock-btn');

    await passcodeInput.fill('ELIO5');
    await unlockBtn.click();

    // Gate should animate and then hide
    const gate = page.locator('#access-gate');
    await expect(gate).toHaveClass(/hidden/, { timeout: 3000 });

    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
    await expect(mainContent).not.toHaveAttribute('aria-hidden', 'true');
  });

  test('URL Query Param: ?code=ELIO5 should instantly bypass gate', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    const gate = page.locator('#access-gate');
    await expect(gate).toHaveClass(/hidden/);

    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('Hero: should display Pokémon trading card styled details and interactive pokéball', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    // Card badges & titles
    await expect(page.locator('.badge-level')).toContainText('LEVEL 5');
    await expect(page.locator('.badge-hp')).toContainText('HP 220 🔥');
    await expect(page.locator('.card-sub-title')).toContainText("ELIO'S");
    await expect(page.locator('.card-main-title')).toContainText('5th BIRTHDAY');

    // Attack rows
    const moveRows = page.locator('.move-row');
    await expect(moveRows).toHaveCount(2);
    await expect(moveRows.nth(0)).toContainText('Party Time');
    await expect(moveRows.nth(0)).toContainText('100');
    await expect(moveRows.nth(1)).toContainText('All-Out Fun');
    await expect(moveRows.nth(1)).toContainText('200');

    // Floating Pokéballs: 26 interactive balls in sky
    const allBalls = page.locator('.floating-pokeball-btn');
    await expect(allBalls).toHaveCount(26);

    const floatingBall = allBalls.first();
    await expect(floatingBall).toBeVisible();
    await floatingBall.click();
    await expect(floatingBall).toHaveClass(/popping/);

    const popupImg = floatingBall.locator('.popup-sprite-wrapper img');
    await expect(popupImg).toBeVisible();

    // Forest Tree Canopy Horizon (replaces triangles)
    const forestHorizon = page.locator('.sky-forest-horizon');
    await expect(forestHorizon).toBeVisible();

    // Town Houses across sections
    const townHouses = page.locator('.town-house');
    expect(await townHouses.count()).toBeGreaterThanOrEqual(25);
  });

  test('Details: displays accurate party info and functioning calendar link', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    const details = page.locator('#details');
    await expect(details).toContainText('Saturday');
    await expect(details).toContainText('October 17, 2026');
    await expect(details).toContainText('3:00 PM – 5:00 PM');
    await expect(details).toContainText('Chuck E. Cheese');
    await expect(details).toContainText('16790 I-45 South');
    await expect(details).toContainText('Conroe, TX 77385');
    await expect(details).toContainText('Gaby');
    await expect(details).toContainText('(786) 838-5648');
    await expect(details).toContainText('October 10th');

    // Check Google Calendar button href
    const calendarBtn = page.locator('#btn-add-calendar');
    await expect(calendarBtn).toHaveAttribute('href', /calendar\.google\.com/);
    await expect(calendarBtn).toHaveAttribute('href', /dates=20261017T200000Z%2F20261017T220000Z|dates=20261017T200000Z\/20261017T220000Z/);
  });

  test('Wild Pokémon: grid contains ~16 guests with sprites and types', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    const cards = page.locator('.pokemon-card');
    const count = await cards.count();
    expect(count).toBe(18);

    // Check first card structure: unrevealed mystery state
    const firstCard = cards.first();
    // Mystery icon must be the Pokéball
    await expect(firstCard.locator('.card-pokeball')).toBeVisible();
    // Card should not reveal the Pokémon's name yet
    const initialName = (await firstCard.locator('.pokemon-name').textContent()).trim();
    expect(initialName).toBe('Mystery Pokémon');
    expect(initialName).not.toContain('Pikachu');
    // Brief description clue must be visible
    const desc = firstCard.locator('.pokemon-desc');
    await expect(desc).toBeVisible();
    await expect(desc).not.toBeEmpty();

    await expect(firstCard.locator('.pokemon-sprite')).toHaveAttribute('src', /assets\/pokemon\/\d+\.png/);
    await expect(firstCard.locator('.type-badge').first()).toBeVisible();
  });

  test('Wild Pokémon Grid: adapts responsively to maintain even distribution across all screen sizes', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    const grid = page.locator('#pokemon-grid');
    const cards = page.locator('.pokemon-card');
    const totalCards = await cards.count();
    expect(totalCards).toBe(18);

    // 1. Desktop Viewport (1280px) -> 6 columns (3 complete rows of 6, 0 trailing cards)
    await page.setViewportSize({ width: 1280, height: 800 });
    const desktopCols = await grid.evaluate((el) => {
      const template = window.getComputedStyle(el).gridTemplateColumns;
      return template.trim().split(/\s+/).length;
    });
    expect(desktopCols).toBe(6);
    expect(totalCards % desktopCols).toBe(0);

    // 2. Tablet Viewport (800px) -> 3 columns (6 complete rows of 3, 0 trailing cards)
    await page.setViewportSize({ width: 800, height: 1024 });
    const tabletCols = await grid.evaluate((el) => {
      const template = window.getComputedStyle(el).gridTemplateColumns;
      return template.trim().split(/\s+/).length;
    });
    expect(tabletCols).toBe(3);
    expect(totalCards % tabletCols).toBe(0);

    // 3. Mobile Viewport (375px) -> 2 columns (9 complete rows of 2, 0 trailing cards)
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileCols = await grid.evaluate((el) => {
      const template = window.getComputedStyle(el).gridTemplateColumns;
      return template.trim().split(/\s+/).length;
    });
    expect(mobileCols).toBe(2);
    expect(totalCards % mobileCols).toBe(0);
  });

  test('RSVP Form: submission should show success card', async ({ page }) => {
    await page.route('**/api.web3forms.com/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Submission successful' }),
      })
    );

    await page.goto('/?code=ELIO5');

    const form = page.locator('#rsvp-form, #diet-form').first();
    await expect(form).toBeVisible();

    await page.locator('#trainer-name').fill('Ash Ketchum');
    const partyCount = page.locator('#party-count');
    if (await partyCount.count() > 0) {
      await partyCount.fill('2');
    }
    await page.locator('#diet-notes').fill('No peanuts, vegetarian pizza preferred');

    await page.locator('#submit-rsvp-btn, #submit-diet-btn').first().click();

    // Form should be hidden and success message displayed
    await expect(form).not.toBeVisible();
    const successCard = page.locator('#rsvp-success-message, #diet-success-message').first();
    await expect(successCard).toBeVisible();
    await expect(successCard).toContainText('Registered in Pokédex!');
    await expect(successCard).toContainText('Thanks, Trainer! Your info has been noted.');
  });

  test('Gifts & Footer: wish list, 529 fund, and Game Boy footer', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    // Gifts section
    const wishlistLink = page.locator('#gift-wishlist');
    const fundLink = page.locator('#gift-529');
    await expect(wishlistLink).toBeVisible();
    // Footer
    const footer = page.locator('footer');
    await expect(footer).toContainText('Thank you for playing!');
    await expect(footer).toContainText("Gotta party 'em all! ⚡");
    await expect(footer).toContainText('* ELIO VERSION * PALLET TOWN, TX * 2026');
  });

  test('Trainer Academy Quiz: clicking pokeball opens multiple choice modal, saves guess in session, and reveals pokemon', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    // Verify dialog text
    const dialogBox = page.locator('#wild-dialog-box');
    await expect(dialogBox).toBeVisible();
    await expect(dialogBox).toContainText("Let's train our next generation of Pokémon Trainers!");

    // Check first card
    const firstCard = page.locator('.pokemon-card').first();
    await expect(firstCard).toBeVisible();

    if (test.info().project.name === 'desktop-chrome') {
      await page.locator('#pokemon').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 150));
      await page.waitForTimeout(300);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/mystery_pokeballs_grid.png' });
    }

    // Click card to open quiz modal
    await firstCard.click();

    // Modal should be visible
    const modal = page.locator('#pokemon-quiz-modal');
    await expect(modal).toBeVisible();

    // Mystery icon in modal must be the Pokéball
    await expect(modal.locator('.quiz-modal-pokeball')).toBeVisible();
    // Clue description must be visible
    await expect(modal.locator('#quiz-clue-desc')).not.toBeEmpty();

    if (test.info().project.name === 'desktop-chrome') {
      await page.waitForTimeout(350);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/quiz_modal_pokeball.png' });
    }

    // 4 multiple choice options should appear
    const choices = modal.locator('.quiz-choice-btn');
    await expect(choices).toHaveCount(4);

    // Pick first option
    const chosenBtn = choices.first();
    const chosenName = (await chosenBtn.textContent()).trim();
    await chosenBtn.click();

    // Feedback should be displayed
    const feedback = modal.locator('#quiz-feedback');
    await expect(feedback).toBeVisible();

    if (test.info().project.name === 'desktop-chrome') {
      await page.waitForTimeout(350);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/quiz_modal_revealed.png' });
    }

    // Close modal
    await modal.locator('#quiz-modal-close').click();
    await expect(modal).not.toBeVisible();

    // Card should now be revealed with its actual Pokémon name and show guess tag
    await expect(firstCard).toHaveClass(/revealed/);
    await expect(firstCard.locator('.pokemon-name')).toHaveText('Pikachu');
    await expect(firstCard.locator('.pokemon-sprite')).toBeVisible();
    await expect(firstCard.locator('.pokemon-desc')).toBeVisible();

    if (test.info().project.name === 'desktop-chrome') {
      await firstCard.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -60));
      await page.waitForTimeout(900);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/pokemon_grid_revealed.png' });
    }

    const guessTag = firstCard.locator('.trainer-guess-tag');
    await expect(guessTag).toBeVisible();
    await expect(guessTag).toContainText(chosenName);

    // Verify sessionStorage saved the guess
    const sessionGuesses = await page.evaluate(() => sessionStorage.getItem('pokemon_trainer_guesses'));
    expect(sessionGuesses).not.toBeNull();
    expect(sessionGuesses).toContain(chosenName);

    // Reload page in the same session: card should still be revealed with current guess and name
    await page.reload();
    const reloadedFirstCard = page.locator('.pokemon-card').first();
    await expect(reloadedFirstCard).toHaveClass(/revealed/);
    await expect(reloadedFirstCard.locator('.pokemon-name')).toHaveText('Pikachu');
    await expect(reloadedFirstCard.locator('.trainer-guess-tag')).toContainText(chosenName);
  });

  test('Section Order: pokemon section is located at the end above the footer', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    const sectionOrder = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('#main-content > section'));
      return sections.map(s => s.id);
    });

    expect(sectionOrder).toEqual(['details', 'gifts', 'rsvp', 'pokemon']);
  });

  test('Pixel Trainer & Overworld Roads: should render winding route and respond to scroll & click', async ({ page }) => {
    await page.goto('/?code=ELIO5');

    // Overworld road network elements
    const roadLayer = page.locator('#overworld-roads');
    await expect(roadLayer).toBeAttached();

    const roadSurface = page.locator('#trainer-route-surface');
    await expect(roadSurface).toBeAttached();
    // Verify SVG path has been generated
    const dAttribute = await roadSurface.getAttribute('d');
    expect(dAttribute).toContain('M ');
    expect(dAttribute).toContain('C ');

    // Signs: All signs aligned to the left side of their section
    const sign1 = page.locator('#route-sign-1');
    const sign2 = page.locator('#route-sign-2');
    const sign3 = page.locator('#route-sign-3');
    const sign4 = page.locator('#route-sign-4');

    await expect(sign1).toBeVisible();
    await expect(sign1).toContainText('ROUTE 5');
    await expect(sign2).toBeVisible();
    await expect(sign2).toContainText('POKÉ MART & GIFTS');
    await expect(sign3).toBeVisible();
    await expect(sign3).toContainText('TRAINER ACADEMY');
    await expect(sign4).toBeVisible();
    await expect(sign4).toContainText('CHUCK E. CHEESE GYM');

    // Verify all signs are left-aligned in their sections
    for (const sign of [sign1, sign2, sign3, sign4]) {
      const parentBar = sign.locator('..');
      await expect(parentBar).toHaveClass(/section-signpost-bar/);
    }

    // Pixel Trainer
    const trainer = page.locator('#pixel-trainer');
    await expect(trainer).toBeVisible();
    const bubble = page.locator('#trainer-bubble');
    await expect(bubble).toBeVisible();

    // Initial transform check
    const initialTransform = await trainer.evaluate(el => el.style.transform);
    expect(initialTransform).toContain('translate3d');

    // Click trainer: should trigger jump celebration
    await trainer.evaluate(el => el.click());
    await expect(trainer).toHaveClass(/trainer-jumping/);

    // Scroll down: should update position and trigger walking animation
    await page.evaluate(() => window.scrollTo(0, 1000));
    // Wait slightly for rAF / scroll handling
    await page.waitForTimeout(200);

    const scrolledTransform = await trainer.evaluate(el => el.style.transform);
    expect(scrolledTransform).not.toBe(initialTransform);

    // Save screenshots for visual verification
    if (test.info().project.name === 'desktop-chrome') {
      // 1. Hero Sky with 26 Floating Pokéballs
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/sky_pokeballs.png' });

      // 2. Horizon: Pallet Town North Lawn & Canal
      await page.evaluate(() => {
        const el = document.getElementById('details');
        window.scrollTo(0, el ? el.offsetTop - 30 : 680);
      });
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/forest_trees_horizon.png' });

      // 3. Pallet Town Lower Lawn & Fountain
      await page.evaluate(() => {
        const el = document.getElementById('details');
        window.scrollTo(0, el ? el.offsetTop + 420 : 1150);
      });
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/pallet_town_houses.png' });

      // 4. Commercial Plaza (Gifts)
      await page.evaluate(() => {
        const el = document.getElementById('gifts');
        window.scrollTo(0, el ? el.offsetTop - 20 : 1700);
      });
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/gifts_plaza_shops.png' });

      // 5. Pokémon Trainer Academy (Above Footer)
      await page.evaluate(() => {
        const el = document.getElementById('pokemon');
        window.scrollTo(0, el ? el.offsetTop - 20 : 3600);
      });
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/safari_cabins.png' });
    } else if (test.info().project.name === 'mobile-iphone') {
      await page.evaluate(() => window.scrollTo(0, 550));
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/Users/ale/.gemini/antigravity/brain/dac9e70c-f884-4228-b552-4234e497cfc6/town_mobile.png' });
    }
  });

});
