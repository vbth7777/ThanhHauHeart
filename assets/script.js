var globalSettings = {
  color: "#ffffff",
  isClosing: false,
};
const startBtn = document.querySelector(".start-btn");
const closeBtn = document.querySelector(".close-btn");
const timeLapseBtn = document.querySelector(".time-lapse-btn");
const fullVideoBtn = document.querySelector(".full-video-btn");
function startClicked() {
  startBtn.style.display = "none";
  timeLapseBtn.style.display = "none";
  fullVideoBtn.style.display = "none";
  function beatingHeart(canvas, settings = null) {
    if (settings === null) {
      settings = {
        particles: {
          length: 500,
          duration: 2,
          velocity: 3,
          effect: 1,
          size: 14,
        },
      };
    }
    (function () {
      var b = 0;
      var c = ["ms", "moz", "webkit", "o"];
      for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
        window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
        window.cancelAnimationFrame =
          window[c[a] + "CancelAnimationFrame"] ||
          window[c[a] + "CancelRequestAnimationFrame"];
      }
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (h, e) {
          var d = new Date().getTime();
          var f = Math.max(0, 16 - (d - b));
          var g = window.setTimeout(function () {
            h(d + f);
          }, f);
          b = d + f;
          return g;
        };
      }
      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (d) {
          clearTimeout(d);
        };
      }
    })();
    var Point = (function () {
      function Point(x, y) {
        this.x = typeof x !== "undefined" ? x : 0;
        this.y = typeof y !== "undefined" ? y : 0;
      }
      Point.prototype.clone = function () {
        return new Point(this.x, this.y);
      };
      Point.prototype.length = function (length) {
        if (typeof length == "undefined") {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
      };
      Point.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
      };
      return Point;
    })();
    var Particle = (function () {
      function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
      }
      Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
      };
      Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      };
      Particle.prototype.draw = function (context, image) {
        function ease(t) {
          return --t * t * t + 1;
        }
        var size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(
          image,
          this.position.x - size / 2,
          this.position.y - size / 2,
          size,
          size
        );
      };
      return Particle;
    })();
    var ParticlePool = (function () {
      var particles,
        firstActive = 0,
        firstFree = 0,
        duration = settings.particles.duration;
      function ParticlePool(length) {
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++) {
          particles[i] = new Particle();
        }
      }
      ParticlePool.prototype.add = function (x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);
        firstFree++;
        if (firstFree == particles.length) {
          firstFree = 0;
        }
        if (firstActive == firstFree) {
          firstActive++;
        }
        if (firstActive == particles.length) {
          firstActive = 0;
        }
      };
      ParticlePool.prototype.update = function (deltaTime) {
        var i;
        if (firstActive < firstFree) {
          for (i = firstActive; i < firstFree; i++) {
            particles[i].update(deltaTime);
          }
        }
        if (firstFree < firstActive) {
          for (i = firstActive; i < particles.length; i++) {
            particles[i].update(deltaTime);
          }
          for (i = 0; i < firstFree; i++) {
            particles[i].update(deltaTime);
          }
        }
        while (
          firstActive != firstFree &&
          particles[firstActive].age >= duration
        ) {
          firstActive++;
          if (firstActive == particles.length) {
            firstActive = 0;
          }
        }
      };
      ParticlePool.prototype.draw = function (context, image) {
        if (firstActive < firstFree) {
          for (i = firstActive; i < firstFree; i++) {
            particles[i].draw(context, image);
          }
        }
        if (firstFree < firstActive) {
          for (i = firstActive; i < particles.length; i++) {
            particles[i].draw(context, image);
          }
          for (i = 0; i < firstFree; i++) {
            particles[i].draw(context, image);
          }
        }
      };
      return ParticlePool;
    })();
    function main() {
      var context = canvas.getContext("2d"),
        particles = new ParticlePool(settings.particles.length),
        particleRate = settings.particles.length / settings.particles.duration,
        time;
      function pointOnHeart(t) {
        return new Point(
          160 * Math.pow(Math.sin(t), 3),
          130 * Math.cos(t) -
            50 * Math.cos(2 * t) -
            20 * Math.cos(3 * t) -
            10 * Math.cos(4 * t) +
            25
        );
      }
      function getImage() {
        var canvas = document.createElement("canvas"),
          context = canvas.getContext("2d");
        canvas.width = settings.particles.size;
        canvas.height = settings.particles.size;
        function to(t) {
          var point = pointOnHeart(t);
          point.x =
            settings.particles.size / 3 +
            (point.x * settings.particles.size) / 300;
          point.y =
            settings.particles.size / 3 +
            (point.y * settings.particles.size) / 300;
          return point;
        }
        context.beginPath();
        var t = -Math.PI;
        var point = to(t);
        context.moveTo(point.x, point.y);
        while (t < Math.PI) {
          t += 0.01;
          point = to(t);
          context.lineTo(point.x, point.y);
        }
        context.closePath();
        context.fillStyle = globalSettings.color;
        context.fill();
        var image = new Image();
        image.src = canvas.toDataURL();
        return image;
      }
      var image = getImage();
      function render() {
        image = getImage();
        requestAnimationFrame(render);
        var newTime = new Date().getTime() / 1000,
          deltaTime = newTime - (time || newTime);
        time = newTime;
        context.clearRect(0, 0, canvas.width, canvas.height);
        var amount = particleRate * deltaTime;
        for (var i = 0; i < amount; i++) {
          var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
          var dir = pos.clone().length(settings.particles.velocity);
          particles.add(
            canvas.width / 2 + pos.x,
            canvas.height / 2 - pos.y,
            dir.x,
            -dir.y
          );
        }
        particles.update(deltaTime);
        particles.draw(context, image);
      }
      function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener("resize", onResize);
      setTimeout(function () {
        onResize();
        render();
      }, 10);
    }
    main();
  }
  function flashScreen() {
    const flash = document.getElementById("flashScreen");
    flash.style.display = "block";
    flash.style.display = "flash 1.5s";
    setTimeout(function () {
      flash.style.display = "none";
    }, 1300);
  }
  function setAnimationOfHeart() {
    const heart = document.querySelector("#heart");
    const heart2 = document.querySelector("#shadowHeart");
    heart.style.animation = "heart 1.5s infinite";
    heart2.style.animation = "fadeIn 1.5s infinite";
    heart2.style.animationDelay = "0.5s";
  }
  function setBackground(url) {
    const background = document.querySelector("#background");
    background.style.backgroundColor = "#fff";
    background.style.backgroundImage = "url(" + url + ")";
    background.style.backgroundRepeat = "no-repeat";
    background.style.backgroundPosition = "center";
  }
  beatingHeart(document.querySelector("#heart"));
  beatingHeart(document.querySelector("#shadowHeart"), {
    particles: {
      length: 500,
      effect: 5,
      size: 14,
      duration: 2,
      velocity: 2,
    },
  });
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  setTimeout(async () => {
    closeBtn.style.display = "block";
    if (!globalSettings.isClosing) {
      setAnimationOfHeart();
    }
    await sleep(5000);
    flashScreen();
    globalSettings.color = "cyan";
    setBackground("./assets/images/icon1.jpg");
    await sleep(6000);
    flashScreen();
    setBackground("./assets/images/icon2.jpg");
    globalSettings.color = "red";
  }, 3000);
  closeBtn.onclick = async function () {
    globalSettings.isClosing = true;
    document.querySelector("#shadowHeart").style.display = "none";
    const heart = document.querySelector("#heart");
    heart.style.animationPlayState = "paused";
    beatingHeart(heart, {
      particles: {
        length: 1500,
        effect: 15,
        size: 25,
        duration: 10,
        velocity: 15,
      },
    });
    await sleep(5000);
    window.location.reload();
  };
}
startBtn.onclick = startClicked;
