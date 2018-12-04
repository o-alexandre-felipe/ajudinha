window.requestAnimFrame = (
  window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  window.oRequestAnimationFrame || 
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  }
);

var N = 8;
var L = 8;

var actionEl;
var canvas;
var context;

function animate(canvas, context, op, startTime, duration){
  var time = (new Date()).getTime() - startTime;
  var w = canvas.width;
  var h = canvas.height;
  context.fillStyle = canvas.style.backgroundColor;
  context.fillRect(0, 0, w, h);
  if(time >= duration){
    op(canvas, context, duration, duration);
  }else{
    op(canvas, context, time, duration);
    requestAnimFrame(function () {
      animate(canvas, context, op, startTime, duration);
    })
  }
}


function createOperation(op, descr, duration){
  var btn = document.createElement('div');
  btn.className = 'anim-btn';
  btn.addEventListener('click', function () {
    animate(canvas, context, op, (new Date()).getTime(), duration);
  });
  btn.appendChild(document.createTextNode(descr));
  actionEl.appendChild(btn);
}

var impulseResponse = [];
for(var i = 0; i < N*L; ++i){
  impulseResponse[i] = 1 - 2* Math.random();
}

function enterInpulseResponse(canvas, ctx, time, duration){
  var w, h;
  var axisPos = h/4;
  var x0, xw;
  var y0, yw;
  w = canvas.width;
  h = canvas.height;
  x0 = w/8;
  y0 = h/8;
  xw = 6*w/8;
  yw = h/8;


  ctx.fillStyle = '#ff0000';
  ctx.fill();

  canvas.style.backgroundColor = 'white';

  ctx.beginPath();
  var p0 = (5 - 10 * time / duration);
  for(var i = 0; i < N*L; ++i){
    var refX = x0 + i * xw / (N*L);
    var p = i / (N*L) + p0;
    var f = (0.5 * (1 - Math.tanh(p)) + 1/Math.cosh(2*p));
    ctx.rect(refX, y0, xw / (N*L), yw * f * impulseResponse[i]);
  }
  ctx.strokeStyle = "#008000";
  ctx.fillStyle = "#d0ffd0";
  ctx.fill();
  ctx.lineWidth = xw / (4*N*L);
  ctx.stroke();
}

function reshapeInpulseResponse(canvas, ctx, time, duration){
  var w, h;
  var axisPos = h/4;
  var x0, xw;
  var y0, yw;
  w = canvas.width;
  h = canvas.height;
  x0 = w/8;
  y0 = h/8;
  xw = 6*w/8;
  yw = h/8;


  canvas.style.backgroundColor = 'white';
  if(time >= duration){
    ctx.beginPath();
    for(var j = -L; j < L; ++j){
      for(var i = -N; i < N && ((j < 0) || (i < 0)) ; ++i){
        var endX = x0 + (j/L) * xw/2 + xw/2;
        var endY = 3*h/8 * i/N + (h/2);
        var endWidth = xw * (3/4) / L / 2;
        var endHeight = (h / 3) / N;
        
        ctx.rect(endX, endY, endWidth, endHeight);
      }
    }
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.lineWidth = xw / (4*N*L);
    ctx.stroke();
  }
 
  ctx.beginPath();
  for(var j = 0; j < L; ++j){
    for(var i = 0; i < N; ++i){
      var refX = x0 + (N*j+i) * xw / (N*L);
      var f = (((N*L+5)*time) / duration - (N*j+i))/5;
      var startX = refX;
      var startY = y0;
      var startWidth = xw / (N*L);
      var startHeight = yw * impulseResponse[N*j+i];
      var endX = x0 + (j/L) * xw/2 + xw/2;
      var endY = 3*h/8 * i/N + (h/2);
      var endWidth = xw * (3/4) / L / 2;
      var endHeight = (h / 3) / N;
      if(f < 0)f = 0;
      if(f > 1)f = 1;

      ctx.rect((1-f)*startX + f * endX,
               (1-f)*startY + f * endY,
               (1-f)*startWidth + f * endWidth,
               (1-f)*startHeight + f * endHeight);
    }
  }
  ctx.strokeStyle = "#008000";
  ctx.fillStyle = "#d0ffd0";
  ctx.fill();
  ctx.lineWidth = xw / (4*N*L);
  ctx.stroke();
 
  if(time >= duration){
    ctx.beginPath();
    for(var j = -L; j < L; ++j){
      for(var i = -N; i < N && ((j < 0) || (i < 0)) ; ++i){
        var endX = x0 + (j/L) * xw/2 + xw/2;
        var endY = 3*h/8 * i/N + (h/2);
        var endWidth = xw * (3/4) / L / 2;
        var endHeight = (h / 3) / N;
        
        ctx.rect(endX, endY, endWidth, endHeight);
      }
    }
  }
}
function fftsr(canvas, ctx, time, duration){
  var w, h;
  var axisPos = h/4;
  var x0, xw;
  var y0, yw;
  w = canvas.width;
  h = canvas.height;
  x0 = w/8;
  y0 = h/8;
  xw = 6*w/8;
  yw = h/8;

  ctx.lineWidth = xw / (4*N*L);
 
  ctx.beginPath();
  for(var j = -L; j < L; ++j){
    for(var i = -N; i < N; ++i){
      var f = L + j - (2*(L+2)*time) / duration;
      var left = x0 + (j/L) * xw/2 + xw/2;
      var bottom = 3*h/8 * i/N + (h/2);
      var width = xw * (3/4) / L / 2;
      var height = (h / 3) / N;

      if(f > 1){
        f = 1;
      }
      if(f < 0){
        f = 0;
      }
      if(f > 0.5){  
        f = 2*f-1;
        ctx.beginPath();
        ctx.rect(left + 0.5 * (1-f) * width,
             bottom + 0.5 * (1-f) * height,
             f * width,
             f * height);
        if((i >= 0) && (j >= 0)){
          ctx.strokeStyle = "#008000";
          ctx.fillStyle = "#d0ffd0";
          ctx.fill();
          ctx.stroke();
        }else{
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
        }
      }else{
        f = 1-2*f;
        ctx.beginPath();
        ctx.rect(left + 0.5 * (1-f) * width,
             bottom + 0.5 * (1-f) * height,
             f * width,
             f * height);
        if(j >= 0){
          ctx.strokeStyle = "#800000";
          ctx.fillStyle = "#ffc0d0";
          ctx.fill();
          ctx.stroke();
        }else{
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }
}
function fftlr(canvas, ctx, time, duration){
  var w, h;
  var axisPos = h/4;
  var x0, xw;
  var y0, yw;
  w = canvas.width;
  h = canvas.height;
  x0 = w/8;
  y0 = h/8;
  xw = 6*w/8;
  yw = h/8;

  ctx.lineWidth = xw / (4*N*L);
 
  ctx.beginPath();
  for(var j = -L; j < L; ++j){
    for(var i = -N; i < N; ++i){
      var f = N + i - (2*(N+2)*time) / duration;
      var left = x0 + (j/L) * xw/2 + xw/2;
      var bottom = 3*h/8 * i/N + (h/2);
      var width = xw * (3/4) / L / 2;
      var height = (h / 3) / N;

      if(f > 1){
        f = 1;
      }
      if(f < 0){
        f = 0;
      }
      if(f > 0.5){  
        f = 2*f-1;
        ctx.beginPath();
        ctx.rect(left + 0.5 * (1-f) * width,
             bottom + 0.5 * (1-f) * height,
             f * width,
             f * height);
        if(j >= 0){
          ctx.strokeStyle = "#800000";
          ctx.fillStyle = "#ffc0d0";
          ctx.fill();
          ctx.stroke();
        }else{
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
        }
      }else{
        f = 1-2*f;
        ctx.beginPath();
        ctx.rect(left + 0.5 * (1-f) * width,
             bottom + 0.5 * (1-f) * height,
             f * width,
             f * height);
        ctx.strokeStyle = "#000080";
        ctx.fillStyle = "#d0d0ff";
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}
function filter_config(canvas, ctx, time, duration){
  var w, h;
  var axisPos = h/4;
  var x0, xw;
  var y0, yw;
  w = canvas.width;
  h = canvas.height;
  x0 = w/8;
  y0 = h/8;
  xw = 6*w/8;
  yw = h/8;

  ctx.lineWidth = xw / (4*N*L);
 
  ctx.beginPath();
  for(var j = -L; j < L; ++j){
    for(var i = -N; i < N; ++i){
      var f = i + 1 - (2*(N+2)*time) / duration;
      var left = x0 + (j/L) * xw/2 + xw/2;
      var bottom = 3*h/8 * f/N + (h/2);
      var width = xw * (3/4) / L / 2;
      var height = (h / 3) / N;
      if(f < -L){
        continue;
      }
      ctx.beginPath();
      ctx.rect(left, bottom * Math.min(1, Math.pow(L+f, 2)), width, height);
      if(f > -L+0.5){
        ctx.strokeStyle = "#000080";
        ctx.fillStyle = "#d0d0ff";
      }else{
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#ff0000";
      }
      ctx.fill();
      ctx.stroke();
    }
  }
}




window.addEventListener('load', function (){
  actionEl = document.getElementById('action');
  canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  canvas.style.width='100%';
  canvas.style.height='100%';
  document.getElementById('display').appendChild(canvas);
  context = canvas.getContext('2d');
  createOperation(enterInpulseResponse, 'impulse response', 1500);
  createOperation(reshapeInpulseResponse, 'reshape response', 2000);
  createOperation(fftsr, 'short-range FFT', 2000);
  createOperation(fftlr, 'long-range FFT', 2000);
  createOperation(filter_config, 'Filter configuration', 10000);
  window.initRecording();
});


