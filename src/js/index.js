"use strict";

(function () {
  var paint = false,
      timer;

  var socket = io(),
      canvas = document.querySelector("canvas"),
      config = {
    x: canvas.width,
    y: canvas.height
  },
      ctx = canvas.getContext("2d"),
      hexToRgb = function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
      draw = function draw(e, click) {
    if (paint || click) {
      var pos = {
        "x": Math.trunc(e.layerX / canvas.clientHeight * config.x),
        "y": Math.trunc(e.layerY / canvas.clientWidth * config.y)
      },
          pixel = ctx.createImageData(1, 1);
      pixel.data[0] = color.r;
      pixel.data[1] = color.g;
      pixel.data[2] = color.b;
      pixel.data[3] = 255;
      socket.emit("pixel update", {
        pos: pos,
        "pixel": {
          r: pixel.data[0],
          g: pixel.data[1],
          b: pixel.data[2],
          a: pixel.data[3]
        }
      });
      ctx.putImageData(pixel, pos.x, pos.y);
    }
  },
      app = function app() {
    canvas.addEventListener("mousemove", function (e) {
      draw(e);
    });
    canvas.addEventListener("click", function (e) {
      e.preventDefault();
      draw(e, true);
    });
    canvas.addEventListener("mousedown", function (e) {
      e.preventDefault();
      paint = true;
    });
    canvas.addEventListener("mouseup", function (e) {
      e.preventDefault();
      paint = false;
    });
    canvas.addEventListener("mouseleave", function (e) {
      e.preventDefault();
      paint = false;
    });
  },
      grid = function grid() {
    console.log("booting grid");
    var dimensions = {
      "height": canvas.clientHeight,
      "width": canvas.clientWidth
    };

    for (var i = 0; i < config.x; i++) {
      var vLine = document.createElement("div"),
          hLine = document.createElement("div");
      vLine.classList.add("vLine");
      vLine.setAttribute("style", "left:".concat(dimensions.height / config.x * (i + 1), "px;height:").concat(canvas.clientHeight, "px;"));
      hLine.classList.add("hLine");
      hLine.setAttribute("style", "top:".concat(dimensions.width / config.y * (i + 1), "px;width:").concat(canvas.clientHeight, "px;"));
      canvas.parentElement.appendChild(vLine);
      canvas.parentElement.appendChild(hLine);
    }
  };

  grid();
  var color = hexToRgb(document.querySelector("[type=color]").value);
  socket.on("pixel update", function (update) {
    var pos = update.pos,
        pixel = ctx.createImageData(1, 1);
    pixel.data[0] = update.pixel.r;
    pixel.data[1] = update.pixel.g;
    pixel.data[2] = update.pixel.b;
    pixel.data[3] = update.pixel.a;
    ctx.putImageData(pixel, pos.x, pos.y);
  });
  var form = document.querySelector("form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.querySelector("#username").value;

    if (name.length > 0) {
      color = hexToRgb(document.querySelector("[type=color]").value);
      localStorage.setItem("user", name);
      socket.emit("user registration", {
        user: name,
        color: document.querySelector("[type=color]").value
      });
    } else {
      alert("Please enter a user name");
    }

    return false;
  });
  socket.on("user registration", function (e) {
    if (e.user) {
      document.querySelector("ul").innerHTML += "\n                <li>".concat(e.msg, "</li>\n            ");
    }

    if (e.user == localStorage.getItem("user")) {
      app();
      form.querySelector("label").style.setProperty("display", "none");
    }
  });
  socket.on("online users", function (e) {
    var onlineCont = document.querySelector("#online");
    onlineCont.innerHTML = "";
    e.forEach(function (el) {
      var newDiv = document.createElement("div"),
          newSpan = document.createElement("span"),
          newClr = document.createElement("div");
      newSpan.innerHTML = el.user;
      newClr.style.setProperty("background", el.color);
      newDiv.appendChild(newClr);
      newDiv.appendChild(newSpan);
      onlineCont.appendChild(newDiv);
    });
  });
  socket.on("new word", function (e) {
    if (document.querySelector("main h1")) {
      document.querySelector("main h1").innerHTML = e;
    } else {
      var newH1 = document.createElement("h1");
      newH1.classList.add("itemName");
      newH1.innerHTML = e;
      document.querySelector("main").appendChild(newH1);
    }

    if (e.includes("session")) {} else {
      timer = setInterval(function () {
        var value = Number(document.querySelector("#timer span").innerHTML);
        value -= 1;

        if (value == 0) {
          value = 30;
          document.querySelector("#timer span").innerHTML = value;
          clearInterval(timer);
        } else {
          document.querySelector("#timer span").innerHTML = value;
          document.querySelector("#timer").classList.remove("hide");
        }
      }, 1000);
    }
  });
  socket.on("snapshot", function (e) {
    var snapshot = canvas.toDataURL("image/png"),
        snapCont = document.querySelector("#snapshots"),
        newImg = document.createElement("img"),
        newSpan = document.createElement("span");
    newImg.src = snapshot;
    newSpan.innerHTML = document.querySelector(".itemName span").innerHTML;
    newSpan.appendChild(newImg);
    snapCont.appendChild(newSpan);
    ctx.clearRect(0, 0, config.x, config.y);
  });
})();