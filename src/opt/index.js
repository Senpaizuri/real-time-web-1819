"use strict";!function(){var n=io(),u=document.querySelector("canvas"),o=u.width,i=u.height,c=u.getContext("2d"),t=function(){u.addEventListener("mousemove",function(e){var t={x:Math.trunc(e.layerX/u.clientHeight*o),y:Math.trunc(e.layerY/u.clientWidth*i)},a=c.createImageData(1,1),r=function(e){var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}(document.querySelector("[type=color]").value);a.data[0]=r.r,a.data[1]=r.g,a.data[2]=r.b,a.data[3]=255,n.emit("pixel update",{pos:t,pixel:{r:a.data[0],g:a.data[1],b:a.data[2],a:a.data[3]}}),c.putImageData(a,t.x,t.y)}),n.on("pixel update",function(e){var t=e.pos,a=c.createImageData(1,1);a.data[0]=e.pixel.r,a.data[1]=e.pixel.g,a.data[2]=e.pixel.b,a.data[3]=e.pixel.a,c.putImageData(a,t.x,t.y)})},a=document.querySelector("form");a.addEventListener("submit",function(e){e.preventDefault();var t=document.querySelector("#username").value;return n.emit("user registration",{user:t,color:document.querySelector("[type=color]").value}),!1}),n.on("user registration",function(e){document.querySelector("#users ul").innerHTML+="<li>".concat(e,"</li>"),t(),a.style.setProperty("display","none")})}();