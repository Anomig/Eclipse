
/* ==================================================
   CONFIGURATION
================================================== */

const MAX_COVERAGE = 89.6;

let position = 0.72;

let dragging = false;


/* ==================================================
   DOM ELEMENTS
================================================== */

const moon =
  document.getElementById(
    "moon"
  );

const percentage =
  document.getElementById(
    "percentage"
  );

const label =
  document.getElementById(
    "label"
  );

const progress =
  document.getElementById(
    "progress"
  );

const eventLabel =
  document.getElementById(
    "event"
  );

const stars =
  document.getElementById(
    "stars"
  );

const sky =
  document.querySelector(
    ".sky"
  );

const hint =
  document.querySelector(
    ".hint"
  );


/* ==================================================
   CREATE STARS
================================================== */

function createStars() {

  stars.innerHTML = "";

  const count =
    window.innerWidth < 600
      ? 100
      : 180;


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const star =
      document.createElement(
        "div"
      );

    star.className =
      "star";


    star.style.left =
      Math.random() *
      100 +
      "%";


    star.style.top =
      Math.random() *
      100 +
      "%";


    star.style.animationDelay =
      Math.random() *
      3 +
      "s";


    star.style.opacity =
      Math.random();


    stars.appendChild(
      star
    );

  }

}


/* ==================================================
   CIRCLE OVERLAP
================================================== */

function circleOverlapArea(
  r1,
  r2,
  d
) {


  /* ----------------------------------------------
     No overlap
  ---------------------------------------------- */

  if (
    d >= r1 + r2
  ) {

    return 0;

  }


  /* ----------------------------------------------
     One circle completely inside
     the other
  ---------------------------------------------- */

  if (
    d <= Math.abs(r1 - r2)
  ) {

    return (
      Math.PI *
      Math.min(r1, r2) ** 2
    );

  }


  /* ----------------------------------------------
     Partial overlap
  ---------------------------------------------- */

  const angle1 =
    Math.acos(
      (
        d ** 2 +
        r1 ** 2 -
        r2 ** 2
      ) /
      (
        2 *
        d *
        r1
      )
    );


  const angle2 =
    Math.acos(
      (
        d ** 2 +
        r2 ** 2 -
        r1 ** 2
      ) /
      (
        2 *
        d *
        r2
      )
    );


  const segment1 =
    r1 ** 2 *
    angle1;


  const segment2 =
    r2 ** 2 *
    angle2;


  const triangle =
    0.5 *
    Math.sqrt(

      (
        -d +
        r1 +
        r2
      ) *

      (
        d +
        r1 -
        r2
      ) *

      (
        d -
        r1 +
        r2
      ) *

      (
        d +
        r1 +
        r2
      )

    );


  return (
    segment1 +
    segment2 -
    triangle
  );

}


/* ==================================================
   GET VISUAL DIMENSIONS
================================================== */

function getSunDiameter() {

  if (
    window.innerWidth < 600
  ) {

    return (
      window.innerWidth *
      0.78
    );

  }


  return Math.min(
    window.innerWidth *
    0.52,

    650
  );

}


/* ==================================================
   GET MOON MOVEMENT
================================================== */

function getMoonX(
  currentPosition
) {

  const sunDiameter =
    getSunDiameter();

  const movement =
    sunDiameter *
    1.42;

  return (
    currentPosition -
    0.72
  ) * movement;

}


/* ==================================================
   GET ACTUAL COVERAGE
================================================== */

function getCoverage(
  currentPosition
) {

  const sunDiameter =
    getSunDiameter();


  const radius =
    sunDiameter / 2;

  const moonX =
    getMoonX(
      currentPosition
    );


  const distance =
    Math.abs(
      moonX
    );

  const overlap =
    circleOverlapArea(
      radius,
      radius,
      distance
    );

  const sunArea =
    Math.PI *
    radius ** 2;

  const rawCoverage =
    (
      overlap /
      sunArea
    ) * 100;


  return Math.min(
    MAX_COVERAGE,
    rawCoverage
  );

}


/* ==================================================
   SKY COLOR
================================================== */

function updateSky(coverage) {

  /*
    AFTER THE ECLIPSE
    -----------------

    Once the eclipse is over, we don't
    calculate the sky from coverage anymore.

    The experience has entered the night.
  */

  if (position > 1.08) {

    document.body.style.background =
      "rgb(5, 7, 13)";


    /*
      Full night sky
    */

    document.documentElement
      .style
      .setProperty(
        "--stars",
        1
      );


    /*
      Meteors gradually become
      more visible.
    */

    const meteorOpacity =
      Math.min(
        1,
        (position - 1.08) * 4
      );


    document.documentElement
      .style
      .setProperty(
        "--meteor-opacity",
        meteorOpacity
      );


    return;
  }


  /* ----------------------------------------------
     ECLIPSE SKY
  ---------------------------------------------- */

  const normalized =
    coverage /
    MAX_COVERAGE;


  /*
    Non-linear darkness.

    The beginning of the eclipse remains
    relatively bright.

    The atmosphere changes much more
    strongly near maximum.
  */

  const darkness =
    Math.pow(
      normalized,
      1.7
    );


  const day = {
    r: 244,
    g: 177,
    b: 78
  };


  const dusk = {
    r: 75,
    g: 82,
    b: 125
  };


  const night = {
    r: 5,
    g: 7,
    b: 13
  };


  let r;
  let g;
  let b;


  /*
    DAY → DUSK
  */

  if (
    darkness < 0.7
  ) {

    const t =
      darkness / 0.7;


    r =
      day.r +
      (
        dusk.r -
        day.r
      ) * t;


    g =
      day.g +
      (
        dusk.g -
        day.g
      ) * t;


    b =
      day.b +
      (
        dusk.b -
        day.b
      ) * t;

  }


  /*
    DUSK → NIGHT
  */

  else {

    const t =
      (
        darkness -
        0.7
      ) / 0.3;


    r =
      dusk.r +
      (
        night.r -
        dusk.r
      ) * t;


    g =
      dusk.g +
      (
        night.g -
        dusk.g
      ) * t;


    b =
      dusk.b +
      (
        night.b -
        dusk.b
      ) * t;

  }


  document.body.style.background =
    `rgb(
      ${Math.round(r)},
      ${Math.round(g)},
      ${Math.round(b)}
    )`;


  /*
    Stars during eclipse
  */

  const starOpacity =
    Math.max(
      0,
      (
        normalized -
        0.52
      ) * 2.2
    );


  document.documentElement
    .style
    .setProperty(
      "--stars",
      starOpacity
    );


  /*
    Meteors should not yet be visible.
  */

  document.documentElement
    .style
    .setProperty(
      "--meteor-opacity",
      0
    );

}



/* ==================================================
   TEXT
================================================== */

function updateText(
  coverage
) {

  if (
    position < 0.18
  ) {

    label.textContent =
      "the eclipse begins";

    eventLabel.textContent =
      "ECLIPSE";

  }


  else if (
    position < 0.72
  ) {

    label.textContent =
      "moon crossing the sun";

    eventLabel.textContent =
      "IN PROGRESS";

  }


  else if (
    position <= 0.82
  ) {

    label.textContent =
      "maximum eclipse";

    eventLabel.textContent =
      `${coverage.toFixed(1)}% COVERED`;

  }


  else if (
    position <= 1.08
  ) {

    label.textContent =
      "the moon moves away";

    eventLabel.textContent =
      "ECLIPSE";

  }


  else {

    label.textContent =
      "the night begins";

    eventLabel.textContent =
      "PERSEIDS";

  }

}


/* ==================================================
   NIGHT MODE
================================================== */

function updateNightMode() {

  if (
    position > 1.08
  ) {

    document.body
      .classList
      .add(
        "night"
      );

  }

  else {

    document.body
      .classList
      .remove(
        "night"
      );

  }

}


/* ==================================================
   UPDATE MOON
================================================== */

function updateMoon() {

  const moonX =
    getMoonX(
      position
    );


  moon.style.setProperty(
    "--moon-x",
    `${moonX}px`
  );

}


/* ==================================================
   UPDATE TIMELINE
================================================== */

function updateTimeline() {

  const timeline =
    Math.min(
      position / 1.35,
      1
    );


  progress.style.width =
    timeline * 100 +
    "%";

}


/* ==================================================
   MAIN UPDATE
================================================== */

function update() {

  /*
    1. Move moon
  */

  updateMoon();


  /*
    2. Calculate REAL
       visual coverage
  */

  const coverage =
    getCoverage(
      position
    );


  /*
    3. Update percentage
  */

  percentage.textContent =
    coverage.toFixed(1) +
    "%";


  /*
    4. Update atmosphere
  */

  updateSky(
    coverage
  );


  /*
    5. Update text
  */

  updateText(
    coverage
  );


  /*
    6. Night state
  */

  updateNightMode();


  /*
    7. Timeline
  */

  updateTimeline();


  /*
    8. Hide interaction hint
       once user starts moving
  */

  if (
    position !== 0.72
  ) {

    hint.style.opacity =
      "0";

  }

}


/* ==================================================
   POINTER POSITION
================================================== */

function pointerPosition(
  clientX
) {

  const width =
    window.innerWidth;


  /*
    Convert horizontal screen
    position into eclipse position.

    0 → beginning

    0.72 → maximum

    1.35 → after eclipse
  */

  position =
    (
      clientX /
      width
    ) * 1.35;


  /*
    Keep it within the
    experience range.
  */

  position =
    Math.max(
      0,
      Math.min(
        1.35,
        position
      )
    );


  update();

}


/* ==================================================
   DRAGGING
================================================== */

let activePointerId = null;


/* ==================================================
   START DRAG
================================================== */

moon.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    dragging = true;

    activePointerId =
      event.pointerId;


    /*
      Keep the pointer attached
      to the moon.

      This fixes the "works once,
      then gets stuck" behaviour.
    */

    moon.setPointerCapture(
      event.pointerId
    );


    pointerPosition(
      event.clientX
    );

  }
);


/* ==================================================
   MOVE MOON
================================================== */

moon.addEventListener(
  "pointermove",
  event => {

    if (
      !dragging ||
      event.pointerId !== activePointerId
    ) {

      return;

    }


    pointerPosition(
      event.clientX
    );

  }
);


/* ==================================================
   END DRAG
================================================== */

function stopDragging(event) {

  if (
    event.pointerId !== activePointerId
  ) {

    return;

  }


  dragging = false;

  activePointerId = null;


  /*
    Release pointer capture.
  */

  try {

    moon.releasePointerCapture(
      event.pointerId
    );

  } catch (error) {

    // Pointer capture may already be released.

  }

}


moon.addEventListener(
  "pointerup",
  stopDragging
);


moon.addEventListener(
  "pointercancel",
  stopDragging
);


/* ==================================================
   PREVENT CONTEXT MENU WHILE DRAGGING
================================================== */

moon.addEventListener(
  "contextmenu",
  event => {

    if (dragging) {

      event.preventDefault();

    }

  }
);



/* ==================================================
   METEOR CANVAS
================================================== */

const canvas =
  document.getElementById(
    "meteors"
  );

const ctx =
  canvas.getContext(
    "2d"
  );


/* ==================================================
   CANVAS RESIZE
================================================== */

function resizeCanvas() {

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  canvas.width =
    window.innerWidth *
    dpr;


  canvas.height =
    window.innerHeight *
    dpr;


  canvas.style.width =
    window.innerWidth +
    "px";


  canvas.style.height =
    window.innerHeight +
    "px";


  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

}


resizeCanvas();


window.addEventListener(
  "resize",
  () => {

    resizeCanvas();

    createStars();

    update();

  }
);


/* ==================================================
   CREATE METEOR
================================================== */

function createMeteor() {

  /*
    Don't create meteors during
    the eclipse itself.
  */

  if (
    position < 1.08
  ) {

    return;

  }


  const meteor =
    document.createElement(
      "div"
    );


  meteor.className =
    "meteor";


  /*
    Keep meteors mostly
    in the upper sky.
  */

  meteor.style.left =
    Math.random() *
    100 +
    "%";


  meteor.style.top =
    Math.random() *
    55 +
    "%";


  meteor.style.animationDuration =
    (
      .7 +
      Math.random() *
      1.2
    ) +
    "s";


  sky.appendChild(
    meteor
  );


  setTimeout(
    () => {

      meteor.remove();

    },
    2200
  );

}


/* ==================================================
   METEOR LOOP
================================================== */

setInterval(
  createMeteor,
  650
);


/* ==================================================
   INITIALIZATION
================================================== */

createStars();

update();
