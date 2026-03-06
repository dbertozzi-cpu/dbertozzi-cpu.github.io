function run_pipeline_3s(canvas)
{
const YPOS = 60;
const YMEM = YPOS-50;

const BUTTON_Y = 260;

const XX = 560;		// Status report position
const YY =  60;

const XXX = 620;	// Debug data only @@@
const YYY =  40;	// Debug data only @@@

const iColour = ["Pink", "LightGrey", "Orange", "Coral",	// @@@
                 "Chartreuse", "CornflowerBlue",
                 "Chartreuse", "CornflowerBlue"];

const NONE   = 0;
const SHADOW = 1;
const DATA   = 2;
const JUMP   = 3;
const LOAD   = 4;
const STORE  = 5;
const LOAD2  = 6;
const STORE2 = 7;

var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

var buttonCount = 0;
var button = [];

var cycles = 0;
var started = 0;
var finished = 0;
var flushes = 0;
var stalls = 0;

var reset   = true;
var stalled = false;

var freelist = 0;
var stage = [-1, -1, -1];	// Empty
var contents = [1, 2, -1];	// Linked list
// 'contents' is overloaded: values are indices when in 'freelist' but
//instruction codes when in a 'stage[]';

drawPipe();

button[buttonCount] = new makeButton(100, BUTTON_Y, 30, 20, iColour[DATA], "Black", "Data", f_instr, DATA);
button[buttonCount] = new makeButton(190, BUTTON_Y, 30, 20, iColour[JUMP], "Black", "Jump", f_instr, JUMP);
button[buttonCount] = new makeButton(280, BUTTON_Y, 30, 20, iColour[LOAD], "Black", "Load", f_instr, LOAD);
button[buttonCount] = new makeButton(370, BUTTON_Y, 30, 20, iColour[STORE], "Black", "Store", f_instr, STORE);

button[buttonCount] = new makeButton(460, BUTTON_Y, 30, 20, "Red", "Black", "Reset", f_reset, 0);


ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  });

return;

//------------------------------------------------------------------------------

function initStages()
{
var i;
for (i = 0; i < 3; i++)
  {
  stage[i] = -1;				// Empty
  contents[i] = (i < 2) ? (i + 1) : -1;		// Linked list
  }
freelist = 0;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_click()
{
var updated = false;

// Scan buttons and call function of any found.
for (i = 0; i < buttonCount; i++)
  if ((mouse.x >= button[i].left) && (mouse.x <= button[i].right)
   && (mouse.y >= button[i].top)  && (mouse.y <= button[i].bottom))
    updated = button[i].func(i);

if (updated) drawPipe();
}

function f_reset(i)
{
cycles = 0;
started = 0;
finished = 0;
flushes = 0;
stalls = 0;
initStages();
reset = true;
stalled = false;
return true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_instr(x)
{
var instr;
var i;

cycles++;

instr = button[x].value;
stalled = false;

for (i = 0; i < 3; i++)			// Fade out previous shadows
  if (contents[stage[i]] == SHADOW)
    {
    free(stage[i], true);
    stage[i] = -1;
    }

if (stage[2] >= 0)
  if ((contents[stage[2]] == LOAD) || (contents[stage[2]] == STORE))
    stalled = true;

if (!stalled)
  {
  if (stage[2] >= 0) free(stage[2], false);
  stage[2] = stage[1];
  stage[1] = stage[0];
  stage[0] = alloc();
  contents[stage[0]] = instr;
  started++;
  }
else stalls++;

switch (contents[stage[2]])
  {
  case JUMP:
    contents[stage[1]] = SHADOW;
    contents[stage[0]] = SHADOW;
    break;

  case LOAD:
    if (stalled) contents[stage[2]] = LOAD2;
    break;

  case STORE:
    if (stalled) contents[stage[2]] = STORE2;
    break;
  }

return true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function makeButton(x_org, y_org, x_dim, y_dim, bg_col, fg_col, text, func, value)
{
drawButton(x_org, y_org, x_dim, y_dim, bg_col, fg_col, text);
this.x      = x_org;
this.y      = y_org;
this.width  = x_dim;		// Half width
this.height = y_dim;		// Half height
this.left   = x_org - x_dim;
this.right  = x_org + x_dim;
this.top    = y_org - x_dim;
this.bottom = y_org + y_dim;
this.bg_col = bg_col;
this.fg_col = fg_col;
this.text   = text;
this.func   = func;
this.value  = value;
buttonCount++;
}


function drawButton(x_org, y_org, x_dim, y_dim, bg_col, fg_col, text)
{
ctx.save();
ctx.fillStyle = bg_col;
ctx.fillRect(x_org - x_dim, y_org - y_dim, 2 * x_dim, 2 *y_dim);
ctx.strokeRect(x_org - x_dim, y_org - y_dim, 2 * x_dim, 2 * y_dim);
ctx.fillStyle = fg_col;
//ctx.font = "16px Courier new";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText(text, x_org, y_org + 5);
ctx.restore();
}

function redrawButton(i, col)
{  // Redraws in original colour if col == ""
var bcol;

if (col) bcol = col; else bcol = button[i].bg_col;
drawButton(button[i].x, button[i].y,
           button[i].width, button[i].height, bcol,
	   button[i].fg_col, button[i].text);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawPipe()
{
var i;

ctx.clearRect(0, 0, 600, 305);

/*
{	// Debug data
ctx.clearRect(0, 0, 760, 305);
ctx.fillStyle = "Blue";
ctx.font = "12px Calibri";
ctx.textAlign = "right";
for (i = 0; i < 3; i++)
  {
  ctx.fillText(stage[i],    XXX, YYY + 20 * i);
  ctx.fillText(contents[i], XXX + 30, YYY + 20 * i);
  if (stage[i] < 0)
    ctx.fillText(-1, XXX + 60, YYY + 20 * i);
  else
    ctx.fillText(contents[stage[i]], XXX + 60, YYY + 20 * i);
  }
ctx.fillText(freelist, XXX + 30, YYY - 20);
ctx.fillText(cycles,  XXX, YYY - 20);
ctx.fillText(stalled, XXX + 90, YYY - 20);
}
*/

ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText("PC", 55, YPOS+55);
if (contents[stage[2]] == JUMP)
  {
  ctx.fillText("Jumping",      430, YPOS+135);
  ctx.fillText("(invalidate)", 130, YPOS+135);
  ctx.fillText("(invalidate)", 280, YPOS+135);
  ctx.fillStyle = iColour[JUMP];
  ctx.fillText("Prefetch flush", 195, YPOS + 155);
  }

drawMem(90, YMEM);

drawStage( 50, YPOS+60, 0, "Fetch",      true);
drawStage(200, YPOS+60, 1, "Decode",     true);
drawStage(350, YPOS+60, 2, "Execute",   false);

if (reset) drawReset(YPOS, "Pink");

for (i = 0; i < buttonCount; i++) redrawButton(i, "");

if (stalled)	// May want stalls for other reasons/cycles @@@
  {
  ctx.fillStyle = "Red";
  ctx.fillText("Sorry - stalled on that cycle", 285, BUTTON_Y + 40);
  }

ctx.fillStyle = "Black";
ctx.font = "20px Calibri";
ctx.textAlign = "right";
ctx.fillText("Cycles",  XX,    YY);
ctx.fillText(cycles,    XX+40, YY);
ctx.fillText("Started", XX,    YY+30);
ctx.fillText(started,   XX+40, YY+30);
ctx.fillText("Retired", XX,    YY+60);
ctx.fillText(finished,  XX+40, YY+60);
ctx.fillText("Lost",    XX,    YY+90);
ctx.fillText(flushes,   XX+40, YY+90);
ctx.fillText("Stalls",  XX,    YY+120);
ctx.fillText(stalls,    XX+40, YY+120);

reset = false;
}


function drawMem(x, y)
{
var iExec;		// Current instruction being executed
var fetching;

function drawArrow(x, y0, y1, width, acol, fill)
  {
  var w2, hdx, hdy;
  var fill;

  w2 = width/2;
  hdy = 0.8 * width;
  if (y1 > y0) hdy = -hdy;
  hdx = 0.8 * width;

//ctx.save();
  ctx.strokeStyle = "Black";
  ctx.beginPath();
  ctx.moveTo(x-w2, y0);
  ctx.lineTo(x-w2, y1+hdy);
  ctx.lineTo(x-hdx, y1+hdy);
  ctx.lineTo(x, y1);
  ctx.lineTo(x+hdx, y1+hdy);
  ctx.lineTo(x+w2, y1+hdy);
  ctx.lineTo(x+w2, y0);
  if (fill)
    {
    ctx.fillStyle = acol;
    ctx.fill();
    }
  ctx.stroke();
//ctx.restore();
  }

iExec = contents[stage[2]];
ctx.save();
ctx.strokeStyle = "Black";

fetching = (stage[0] >= 0) && (contents[stage[0]] != SHADOW) && !stalled;

if (fetching)
{
var grad = ctx.createLinearGradient(x-10, 0, x+390, 0);
grad.addColorStop(0, iColour[contents[stage[0]]]);
grad.addColorStop(1, "white");
ctx.fillStyle = grad;
ctx.fillRect(x-10, y, 400, 60);
}
else
if (stalled)
{
var grad = ctx.createLinearGradient(x-10, 0, x+390, 0);
grad.addColorStop(0, "white");
grad.addColorStop(1, iColour[contents[stage[2]]]);
ctx.fillStyle = grad;
ctx.fillRect(x-10, y, 400, 60);
}

ctx.strokeRect(x-10, y, 400, 60);

drawArrow(x+10, YPOS+60, YMEM+60, 10, iColour[contents[stage[0]]], fetching);
drawArrow(x+70, YMEM+60, YPOS+60, 10, iColour[contents[stage[0]]], fetching);

//drawArrow(x+290, YPOS + 60, YPOS + 40, 10, iColour[contents[stage[2]]], stage[2] >= 0);
drawArrow(x+310, YPOS+60, YPOS+40, 10, iColour[iExec],
                (iExec == LOAD) || (iExec == STORE));
drawArrow(x+350, YPOS+60, YPOS+40, 10, iColour[iExec], (iExec == STORE));

if (stalled)
  {
  ctx.fillStyle = iColour[iExec];
  ctx.fillRect(x + 300, YPOS + 30, 60, 10);	// Address latch
  }
ctx.strokeRect(x + 300, YPOS + 30, 60, 10);	// Address latch

drawArrow(x+310, YPOS + 30, YMEM + 60, 10, "", stalled);
//drawArrow(x+350, YPOS + 60, YMEM + 60, 10, "", iExec == STORE2);
drawArrow(x+350, YPOS + 30, YMEM + 60, 10, "", iExec == STORE2);
drawArrow(x+370, YMEM + 60, YPOS + 60, 10, "", iExec == LOAD2);

ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText("Memory", x + 380/2, y + 35);
ctx.restore();
}


function drawStage(x, y, j, label, outarrow)
{

function drawArrow(x, y, length, width, acol, fill)
  {
  var w2, hdx, ptx, hdy;
  var fill;

  w2 = width/2;
  hdx = 0.8 * width;
  ptx = x + length;
  hdy = 0.8 * width;

//ctx.save();
  ctx.strokeStyle = "Black";
  ctx.beginPath();
  ctx.moveTo(x, y - w2);
  ctx.lineTo(ptx-hdx, y-w2);
  ctx.lineTo(ptx-hdx, y-hdx);
  ctx.lineTo(ptx, y)
  ctx.lineTo(ptx-hdx, y+hdx);
  ctx.lineTo(ptx-hdx, y+w2);
  ctx.lineTo(x, y + w2);
  if (fill)
    {
    ctx.fillStyle = acol;
    ctx.fill();
    }
  ctx.stroke();
//ctx.restore();
  }

ctx.save();
ctx.strokeStyle = "Black";

col = stage[j] < 0 ? "" : iColour[contents[stage[j]]];

fill = true; // @@@

switch (label)
  {
  case "Fetch":
    fill = (stage[0] >= 0);
    if ((contents[stage[2]] != JUMP) && !reset) drawInc(y-60, col);
    break;
  case "Decode":
    fill = (stage[1] >= 0);
    break;
  case "Execute":
    fill = (stage[2] >= 0);
    if (contents[stage[2]] == JUMP) drawFBJump2(y-60, col);
    break;
  }

drawArrow(x +  10, y + 30, 30, 10, col, fill);
if (outarrow) drawArrow(x + 120, y + 30, 30, 10, col, fill);

fill = col ? true : false;
//  ctx.fillText(fill, XXX + 90, YYY + 20 * j);	// Debug print

if (fill)
  {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, 10, 60);
  ctx.fillRect(x+40, y, 80, 60);
  }
ctx.strokeRect(x, y, 10, 60);
ctx.strokeRect(x+40, y, 80, 60);
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText(label, x + 80, y + 35);
ctx.restore();
}


function drawReset(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo( 35, y + 30);
ctx.lineTo( 35, y + 85);
ctx.lineTo( 43, y + 85);
ctx.lineTo( 43, y + 82);
ctx.lineTo( 50, y + 90);	// point
ctx.lineTo( 43, y + 98);
ctx.lineTo( 43, y + 95);
ctx.lineTo( 25, y + 95);
ctx.lineTo( 25, y + 30);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText("Reset", 30, y+25);
ctx.restore();
}

function drawInc(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(170, y + 85);
ctx.lineTo(193, y + 85);
ctx.lineTo(193, y + 82);
ctx.lineTo(200, y + 90);
ctx.lineTo(193, y + 98);
ctx.lineTo(193, y + 95);
ctx.lineTo(190, y + 95);
ctx.lineTo(190, y + 170);
ctx.lineTo( 25, y + 170);
ctx.lineTo( 25, y + 85);
ctx.lineTo( 43, y + 85);
ctx.lineTo( 43, y + 82);
ctx.lineTo( 50, y + 90);	// point
ctx.lineTo( 43, y + 98);
ctx.lineTo( 43, y + 95);
ctx.lineTo( 35, y + 95);
ctx.lineTo( 35, y + 160);
ctx.lineTo(180, y + 160);
ctx.lineTo(180, y + 95);
ctx.lineTo(170, y + 95);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.restore();
}

function drawFBJump2(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(470, y + 85);
ctx.lineTo(500, y + 85);
ctx.lineTo(500, y + 170);
ctx.lineTo( 25, y + 170);
ctx.lineTo( 25, y + 85);
ctx.lineTo( 43, y + 85);
ctx.lineTo( 43, y + 82);
ctx.lineTo( 50, y + 90);	// point
ctx.lineTo( 43, y + 98);
ctx.lineTo( 43, y + 95);
ctx.lineTo( 35, y + 95);
ctx.lineTo( 35, y + 160);
ctx.lineTo(490, y + 160);
ctx.lineTo(490, y + 95);
ctx.lineTo(470, y + 95);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function alloc()
{
var temp;
temp = freelist;
freelist = contents[freelist];
return temp;
}

function free(i, junked)
{
contents[i] = freelist;
freelist = i;
if (junked) flushes++; else finished++;
}

//------------------------------------------------------------------------------

}

//==============================================================================
