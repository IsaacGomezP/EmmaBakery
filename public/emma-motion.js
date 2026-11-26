(() => {
  const stage = document.querySelector('.emma-character');
  const portrait = stage.querySelector('img');
  const canvas = stage.querySelector('canvas');
  const control = stage.querySelector('.emma-pause');
  const crumbs = stage.querySelectorAll('.emma-crumb');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Coordinates follow the original 850 × 777 illustration. The cutout holds
  // the hand, cookie and forearm together so their contours move as one piece.
  const armOutline = new Path2D(
    'M 546 365 C 560 354 581 350 599 354 Q 632 360 646 381 ' +
    'Q 658 409 648 438 Q 666 467 648 505 L 642 520 ' +
    'Q 675 567 680 613 Q 680 658 653 683 Q 618 713 579 689 ' +
    'Q 554 674 557 645 Q 553 618 570 582 L 579 528 ' +
    'Q 565 517 560 502 Q 559 488 551 480 ' +
    'Q 529 478 513 457 Q 494 442 495 417 Q 495 402 513 400 ' +
    'Q 522 401 526 394 Q 536 398 541 389 Q 554 387 555 377 ' +
    'Q 555 368 546 365 Z'
  );
  const ink = '#430807';
  const skin = '#fbc09e';
  const sleeve = new Path2D(
    'M 493 451 Q 538 466 572 514 Q 608 559 614 616 ' +
    'Q 624 649 602 680 Q 584 689 565 672 L 530 551 Z'
  );
  const cheek = new Path2D(
    'M 420 331 Q 499 299 551 309 Q 573 320 582 338 ' +
    'C 600 367 588 395 564 419 Q 540 444 512 453 Q 477 467 443 449 Z'
  );
  const contactCleanup = new Path2D(
    'M 560 344 Q 584 333 608 345 L 626 384 L 593 445 L 535 471 ' +
    'L 499 461 L 491 420 L 496 394 L 534 371 Q 544 353 560 344 Z'
  );
  const mouthPatch = new Path2D(
    'M 422 373 Q 431 363 440 363 C 465 368 496 365 509 352 ' +
    'Q 513 336 525 338 Q 530 340 535 349 L 534 362 ' +
    'Q 526 385 515 410 L 506 423 Q 478 433 454 409 ' +
    'L 437 387 L 422 393 Z'
  );
  const arm = document.createElement('canvas');
  arm.width = 850;
  arm.height = 777;
  const armCtx = arm.getContext('2d');
  const base = document.createElement('canvas');
  base.width = arm.width;
  base.height = arm.height;
  const baseCtx = base.getContext('2d');

  function paint(ctx, path, fill, stroke = '', width = 0) {
    ctx.fillStyle = fill;
    ctx.fill(path);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke(path);
    }
  }

  function prepareLayers() {
    armCtx.save();
    armCtx.clip(armOutline);
    armCtx.drawImage(portrait, 0, 0);
    armCtx.restore();

    paint(baseCtx, sleeve, '#8b1c30', ink, 10);
    baseCtx.drawImage(portrait, 0, 0);
    baseCtx.save();
    const covered = new Path2D(armOutline);
    covered.addPath(contactCleanup);
    baseCtx.clip(covered);
    baseCtx.clearRect(0, 0, 850, 777);
    paint(baseCtx, sleeve, '#8b1c30', ink, 10);
    paint(baseCtx, cheek, skin, ink, 10);
    baseCtx.restore();

    // Paint the clean face once. A single mouth is drawn over it each frame,
    // so the open and closed expressions can never show at the same time.
    const skinShading = baseCtx.createLinearGradient(433, 355, 510, 423);
    skinShading.addColorStop(0, '#fbbd9c');
    skinShading.addColorStop(1, skin);
    paint(baseCtx, mouthPatch, skinShading);
  }

  const smooth = (min, max, time) => {
    const t = Math.max(0, Math.min(1, (time - min) / (max - min)));
    return t * t * (3 - 2 * t);
  };
  const gesture = (start, peak, end, time) =>
    smooth(start, peak, time) * (1 - smooth(peak, end, time));

  function paintMouth(opening) {
    const bottom = 385 + opening * 33;
    const mouth = new Path2D(
      `M 437 371 C 463 381 499 372 522 350
        C 517 ${376 + opening * 22} 506 ${bottom} 487 ${bottom}
        C 466 ${bottom} 449 ${379 + opening * 21} 437 371 Z`
    );
    paint(ctx, mouth, ink, ink, 2.8);
    if (opening > .30) {
      ctx.save();
      ctx.clip(mouth);
      ctx.fillStyle = '#cd4355';
      ctx.beginPath();
      ctx.ellipse(486, bottom+2, 25, 15 * opening, -.10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke(new Path2D('M 430 378 Q 432 372 438 368 M 518 345 Q 524 346 528 352'));
  }

  let ready = false;
  let visible = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let manuallyPaused = false;

  function draw(now) {
    frame = 0;
    if (paused()) return;
    elapsed += previous ? Math.min(now - previous, 100) : 0;
    previous = now;
    const time = (elapsed / 1000) % 8;

    const lift = smooth(.46, 1.6, time) * (1 - smooth(1.95, 2.88, time));
    const bite = gesture(1.6, 1.84, 2.12, time);
    const chewing = smooth(1.96, 2.24, time) * (1 - smooth(4.10, 4.70, time));
    const chew = (.66 + .22 * Math.cos((time - 2.35) * 13)) * chewing;
    const reach = .086 * (1 - lift) + .003 * Math.sin(time * Math.PI / 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvas.width / 732, 0, 0, canvas.height / 802,
      -58 * canvas.width / 732, 13 * canvas.height / 802);
    ctx.drawImage(base, 0, 0);
    paintMouth(1 - .93 * Math.max(bite, chew));

    ctx.save();
    ctx.translate(607, 635 + 10 * (1 - lift));
    ctx.rotate(reach);
    ctx.translate(-607, -635);
    ctx.drawImage(arm, 0, 0);
    ctx.restore();
    stage.classList.add('emma-is-animated');

    const progress = (time - 1.79) / .64;
    crumbs.forEach((crumb, index) => {
      const show = progress > 0 && progress < 1;
      crumb.style.opacity = show ? String(1 - progress) : '0';
      if (show) {
        const x = (index - 1) * 16 * progress;
        const y = -20 * progress + 45 * progress * progress;
        crumb.style.transform = `translate(${x}px, ${y}px) rotate(${progress * 160}deg)`;
      }
    });
    frame = requestAnimationFrame(draw);
  }

  function paused() {
    return !ready || !visible || document.hidden || motionPreference.matches || manuallyPaused;
  }

  function updatePlayback() {
    control.hidden = !ready || motionPreference.matches;
    if (paused()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (motionPreference.matches) stage.classList.remove('emma-is-animated');
    } else if (!frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
  });
  observer.observe(stage);
  control.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    control.classList.toggle('is-paused', manuallyPaused);
    control.setAttribute('aria-label', manuallyPaused ? 'Reanudar animación de Emma' : 'Pausar animación de Emma');
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  motionPreference.addEventListener('change', updatePlayback);
  portrait.decode().then(() => {
    prepareLayers();
    ready = true;
    updatePlayback();
  }).catch(() => {
    // The original illustration remains available as a still.
  });
})();
