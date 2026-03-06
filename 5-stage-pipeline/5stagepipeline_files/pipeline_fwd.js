// Simple 5-stage processor pipeline demonstration
// J. Garside October 2020
// Renamed Dec. 2020
// Canvas 760 x 250 (900 x 250 for debug print)

function run_pipeline_fwd(canvas)
{
const YPOS = -10;
const BUTTON_X =  70;
const BUTTON_Y = 200;

const XXX = 770; // Debug data only @@@
const YYY =  60; // Debug data only @@@

const iColour = ["Pink", "LightGrey", "Coral", "Orange",	// @@@
                 "Chartreuse", "CornflowerBlue", "Purple", "Grey"];

const dotCol = ["Red", "Yellow", "Green", "DeepPink",
                "Blue", "SaddleBrown", "BlueViolet", "LightGrey"];

const NONE   = 0;
const SHADOW = 1;
const JUMP   = 2;
const DATA   = 3;
const LOAD   = 4;
const STORE  = 5;

var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

var buttonCount = 0;
var button = [];

var cycle_count = 0;
var instr_count = 0;

var reset = true;
var stalled;
var jumped;
//var loading;
var dot = 0;				// Instruction count

var freelist = 0;
var stage = [-1, -1, -1, -1, -1];	// Empty
var contents = [1, 2, 3, 4, -1];	// Linked list
// 'contents' is overloaded: values are indices when in 'freelist' but
//instruction codes when in a 'stage[]';

drawPipe();

/*
ctx.textAlign = "left";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("TEST", 10, 80);
*/

/*
button[buttonCount] = new makeButton( 40, BUTTON_Y, 30, 20, "Silver", "Black", "Data", f_instr, DATA);
button[buttonCount] = new makeButton(120, BUTTON_Y, 30, 20, "Silver", "Black", "Jump", f_instr, JUMP);
button[buttonCount] = new makeButton(200, BUTTON_Y, 30, 20, "Silver", "Black", "Load", f_instr, LOAD);
button[buttonCount] = new makeButton(280, BUTTON_Y, 30, 20, "Silver", "Black", "Store", f_instr, STORE);
*/
button[buttonCount] = new makeButton(BUTTON_X +  40, BUTTON_Y, 30, 20, iColour[DATA], "Black", "Data", f_instr, DATA);
button[buttonCount] = new makeButton(BUTTON_X + 120, BUTTON_Y, 30, 20, iColour[JUMP], "Black", "Jump", f_instr, JUMP);
button[buttonCount] = new makeButton(BUTTON_X + 200, BUTTON_Y, 30, 20, iColour[LOAD], "Black", "Load", f_instr, LOAD);
button[buttonCount] = new makeButton(BUTTON_X + 280, BUTTON_Y, 30, 20, iColour[STORE], "Black", "Store", f_instr, STORE);

button[buttonCount] = new makeButton(BUTTON_X + 360, BUTTON_Y, 30, 20, "Silver", "Black", "Reset", f_reset, 0);

ctx.fillText("Registers", 560, YPOS+60+130);	// Outside cleared area

ctx.fillStyle = "Grey";
//ctx.font = "16px Courier new";
ctx.font = "16px Calibri";
ctx.textAlign = "right";
ctx.fillText("Add dependency", BUTTON_X + 40, BUTTON_Y + 40 + 5);

for (i = 0; i < 8; i++)
  button[buttonCount] = new makeButton(BUTTON_X + 60 + 40*i, BUTTON_Y + 40, 10, 10, dotCol[i], "Black", "", f_depend, i);
button[buttonCount] = new makeButton(BUTTON_X + 60 + 40*i, BUTTON_Y + 40, 10, 10, "White", "Black", "", f_depend, 0xF);


ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  });

return;

function initStages()
{
var i;
for (i = 0; i < 5; i++)
  {
  stage[i] = -1;				// Empty
  contents[i] = (i < 4) ? (i + 1) : -1;		// Linked list
  }
freelist = 0;
}

//------------------------------------------------------------------------------

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
initStages();
dot = 0;
cycle_count = 0;
instr_count = 0;
reset = true;
return true;
}


function f_instr(x)
{
var instr;
var i;

instr = button[x].value;
stalled = false;
jumped  = false;
//loading = false;
  
for (i = 0; i < 5; i++)			// Fade out previous shadows
  if ((contents[stage[i]] & 0xF) == SHADOW)
    {
    free(stage[i]);
    stage[i] = -1;
    }

if (stage[4] >= 0)
  {
  free(stage[4]);
  instr_count++;			// Retirement most ops.
  }
stage[4] = stage[3];
if (((contents[stage[3]] & 0xF) == LOAD)	// Stall if appropriate
&& (((contents[stage[3]]>>4) & 0xF) == ((contents[stage[2]]>>8) & 0xF)))
  {
  stage[3] = alloc();			// Create bubble
  contents[stage[3]] = SHADOW;
  stalled = true;
  }
else					// Go ahead
  {
  stage[3] = stage[2];
  stage[2] = stage[1];
  stage[1] = stage[0];
  stage[0] = alloc();
  contents[stage[0]] = instr | (dot<<4) | (0xF << 8);
  dot = (dot + 1) & 0x7;
  }

if ((contents[stage[2]] & 0xF) == JUMP)
  {
  contents[stage[1]] = SHADOW;
  contents[stage[0]] = SHADOW;
  }

if ((contents[stage[3]] & 0xF) == JUMP)
  {
  contents[stage[3]] = SHADOW;		// If fading
//free(stage[3]); stage[3] = -1;	// If evaporating
  instr_count++;			// Retirement of jump
  jumped = true;
  }

cycle_count++;

return true;
}

function f_depend(x)
{
if (stage[0] >= 0)
  {
  contents[stage[0]] = (contents[stage[0]] & 0xFF) | (button[x].value << 8);
  return true;
  }
else
  return false;
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

function valid(stage)
  {
  return (stage >= 0) && ((contents[stage] & 0xF) != SHADOW);
  }

function getCol(stage)
  {
  if (valid(stage)) return (contents[stage]>>8) & 0xF;
  else              return -1;
  }
  
var fwdCol;
var i;

ctx.clearRect(0, 0, 760, 165);
//ctx.clearRect(0, 0, 900, 165);		// Stretch over debug print @@@
//ctx.strokeRect(0, 0, 900, 165);		// Stretch over debug print @@@
ctx.clearRect(580, 175, 160, 25);		// Clear message area
ctx.clearRect(540, 200, 200, 40);		// Clear message area
//ctx.strokeRect(580, 175, 160, 25);
//ctx.strokeRect(540, 200, 200, 40);

/*
{	// Debug print
ctx.fillStyle = "Blue";
ctx.font = "12px Calibri";
ctx.textAlign = "right";
for (i = 0; i < 5; i++)
  {
  ctx.fillText(stage[i],    XXX, YYY + 20 * i);
  ctx.fillText(contents[i].toString(16), XXX + 30, YYY + 20 * i);
  if (stage[i] < 0)
    ctx.fillText(-1, XXX + 60, YYY + 20 * i);
  else
    ctx.fillText(contents[stage[i]].toString(16), XXX + 60, YYY + 20 * i);
  }
ctx.fillText(freelist, XXX + 30, YYY - 20);
}
*/

ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText("PC", 55, YPOS+60+80);
//ctx.fillText("Registers", 560, YPOS+60+130);
if ((contents[stage[2]] & 0xF) == JUMP)
  {
  ctx.fillText("Jumping",      125, YPOS+45);
  ctx.fillText("(invalidate)", 125, YPOS+140);
  ctx.fillText("(invalidate)", 265, YPOS+140);
  ctx.fillStyle = iColour[JUMP];
  ctx.fillText("Prefetch flush", 195, YPOS + 160);
  }

fwdCol = getCol(stage[2]);

if (valid(stage[3]) && (fwdCol == ((contents[stage[3]]>>4) & 0xF))
                    && ((contents[stage[3]] & 0xF) != LOAD))
  drawFBData2(YPOS, dotCol[fwdCol]);
else drawFBData2(YPOS, "");

if (valid(stage[4]) && (fwdCol == ((contents[stage[4]]>>4) & 0xF)))
  drawFBMem2(YPOS, dotCol[fwdCol]);
else drawFBMem2(YPOS, "");

fwdCol = getCol(stage[1]);

if (valid(stage[4]) && (fwdCol == ((contents[stage[4]]>>4) & 0xF)))
  drawFB(YPOS, dotCol[fwdCol]);
else drawFB(YPOS, "");

drawStage( 50, YPOS+60, 0, "Fetch",      true);
drawStage(190, YPOS+60, 1, "Decode",     true);
drawStage(330, YPOS+60, 2, "Execute",    true);
drawStage(470, YPOS+60, 3, "Memory",     true);
drawStage(610, YPOS+60, 4, "Writeback", false);

if (reset) drawReset(YPOS, "Pink");

//for (i = 0; i < buttonCount; i++) redrawButton(i, "");

if (jumped)
  {
  ctx.fillStyle = iColour[JUMP];
  ctx.fillText("Jump has executed", 545, YPOS + 55);
  }

if (stalled)	// May want stalls for other reasons/cycles @@@
  {
  ctx.fillStyle = iColour[JUMP];
  ctx.fillText("Lost to load", 545, YPOS + 55);
  ctx.fillStyle = "Red";
  ctx.fillText("Sorry - stalled on that cycle", BUTTON_X + 560, BUTTON_Y + 35);
  }

ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "right";
ctx.fillText("Cycles:", 640, BUTTON_Y - 5);
ctx.fillText(cycle_count, 670, BUTTON_Y - 5);
ctx.fillText("Instructions:", 640, BUTTON_Y + 15);
ctx.fillText(instr_count, 670, BUTTON_Y + 15);

reset = false;
}

function drawStage(x, y, j, label, outarrow)
{

function drawArrow(x, y, length, width, acol, fill)
  {
  var w2, hdx, ptx, hdy;
//var fill;

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
  }			// End of function drawArrow

function drawDot(cx, cy, bcol, fcol)
  {
//ctx.save(); // save state
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI, false);
  ctx.fillStyle = bcol;
  ctx.strokeStyle = fcol;
//ctx.lineWidth = stroke;
  if (bcol) ctx.fill();
  if (fcol) ctx.stroke();
//ctx.restore(); // restore to original state
  }			// End of function drawDot

var temp, instr, col, dot1, dot2;

ctx.save();		// Start of function code proper
ctx.strokeStyle = "Black";

//col = stage[j] < 0 ? "" : iColour[contents[stage[j]] & 0xF];

if (stage[j] < 0)
  {
  instr = NONE;
  col = "";
  }
else
  {
  temp = contents[stage[j]];
  instr = temp & 0xF;
  col = iColour[instr];
  dot1 = (temp >> 4) & 0xF;
  dot2 = (temp >> 8) & 0xF;
  }

//  ctx.fillText(col,    630, 150 + 20 * j);

fill = true; // @@@

switch (label)
  {
  case "Fetch":
    fill = (stage[0] >= 0);
    if (((contents[stage[2]] & 0xF) != JUMP) && !reset) drawInc(y-60, col);
    break;
  case "Decode":
    fill = (stage[1] >= 0);
    break;
  case "Execute":
    fill = (stage[2] >= 0);
    if ((contents[stage[2]] & 0xF) == JUMP) drawFBJump2(y-60, col);
    break;
  case "Memory":
    fill = (stage[3] >= 0);
    break;
  case "Writeback":
    fill = (stage[4] >= 0);
    break;
  }

drawArrow(x +  10, y + 30, 30, 10, col, fill);
if (outarrow) drawArrow(x + 110, y + 30, 30, 10, col, fill);

fill = col ? true : false;
//ctx.fillText(fill, XXX + 90, YYY + 20 * j);	// Debug print

if (fill)
  {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, 10, 60);
  ctx.fillRect(x+40, y, 70, 60);
  }
ctx.strokeRect(x, y, 10, 60);
ctx.strokeRect(x+40, y, 70, 60);
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText(label, x + 75, y + 35);

//if ((instr != NONE) && (instr != SHADOW) && (instr != JUMP))
if ((instr != NONE) && (instr != SHADOW))
  {
  drawDot(x+50,  y+10, dotCol[dot1], "");
  if (dot2 == 0xF) drawDot(x+100, y+10, "", "Grey");
  else             drawDot(x+100, y+10, dotCol[dot2], "");
  }

ctx.restore();
}


function drawReset(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo( 35, y + 50);
ctx.lineTo( 35, y + 85);
ctx.lineTo( 43, y + 85);
ctx.lineTo( 43, y + 82);
ctx.lineTo( 50, y + 90);	// point
ctx.lineTo( 43, y + 98);
ctx.lineTo( 43, y + 95);
ctx.lineTo( 25, y + 95);
ctx.lineTo( 25, y + 50);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText("Reset", 30, y+45);
ctx.restore();
}

function drawInc(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(160, y + 85);
ctx.lineTo(183, y + 85);
ctx.lineTo(183, y + 82);
ctx.lineTo(190, y + 90);
ctx.lineTo(183, y + 98);
ctx.lineTo(183, y + 95);
ctx.lineTo(180, y + 95);
ctx.lineTo(180, y + 170);
ctx.lineTo( 25, y + 170);
ctx.lineTo( 25, y + 85);
ctx.lineTo( 43, y + 85);
ctx.lineTo( 43, y + 82);
ctx.lineTo( 50, y + 90);	// point
ctx.lineTo( 43, y + 98);
ctx.lineTo( 43, y + 95);
ctx.lineTo( 35, y + 95);
ctx.lineTo( 35, y + 160);
ctx.lineTo(170, y + 160);
ctx.lineTo(170, y + 95);
ctx.lineTo(160, y + 95);
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
ctx.moveTo(440, y + 85);
ctx.lineTo(450, y + 85);
ctx.lineTo(450, y + 20);
ctx.lineTo(35, y + 20);
ctx.lineTo(35, y + 85);
ctx.lineTo(43, y + 85);
ctx.lineTo(43, y + 82);
ctx.lineTo(50, y + 90);		// point
ctx.lineTo(43, y + 98);
ctx.lineTo(43, y + 95);
ctx.lineTo(25, y + 95);
ctx.lineTo(25, y + 10);
ctx.lineTo(460, y + 10);
ctx.lineTo(460, y + 85);
ctx.lineTo(462, y + 85);
ctx.lineTo(462, y + 82);
ctx.lineTo(470, y + 90);	// point
ctx.lineTo(462, y + 98);
ctx.lineTo(462, y + 95);
ctx.lineTo(440, y + 95);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.restore();
}


function drawFBData2(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(480, y + 85);
ctx.lineTo(490, y + 85);
ctx.lineTo(490, y + 40);
ctx.lineTo(360, y + 40);
ctx.lineTo(360, y + 78);
ctx.lineTo(363, y + 78);
ctx.lineTo(355, y + 85);	// point
ctx.lineTo(347, y + 78);
ctx.lineTo(350, y + 78);
ctx.lineTo(350, y + 30);
ctx.lineTo(500, y + 30);
ctx.lineTo(500, y + 85);
ctx.lineTo(502, y + 85);
ctx.lineTo(502, y + 82);
ctx.lineTo(510, y + 90);	// point
ctx.lineTo(502, y + 98);
ctx.lineTo(502, y + 95);
ctx.lineTo(480, y + 95);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.restore();
}


function drawFBMem2(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(620, y + 85);
ctx.lineTo(642, y + 85);
ctx.lineTo(642, y + 82);
ctx.lineTo(650, y + 90);	// point
ctx.lineTo(642, y + 98);
ctx.lineTo(642, y + 95);
ctx.lineTo(640, y + 95);
ctx.lineTo(640, y + 150);
ctx.lineTo(350, y + 150);
ctx.lineTo(350, y + 102);
ctx.lineTo(347, y + 102);
ctx.lineTo(355, y + 95);	// point
ctx.lineTo(363, y + 102);
ctx.lineTo(360, y + 102);
ctx.lineTo(360, y + 140);
ctx.lineTo(630, y + 140);
ctx.lineTo(630, y + 95);
ctx.lineTo(620, y + 95);
if (acol != "")
  {
  ctx.fillStyle = acol;
  ctx.fill();
  }
ctx.stroke();
ctx.restore();
}


function drawFB(y, acol)
{
ctx.save();
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(720, y + 85);
ctx.lineTo(750, y + 85);
ctx.lineTo(750, y + 170);
ctx.lineTo(310, y + 170);
ctx.lineTo(310, y + 102);
ctx.lineTo(307, y + 102);
ctx.lineTo(315, y + 95);	// point
ctx.lineTo(323, y + 102);
ctx.lineTo(320, y + 102);
ctx.lineTo(320, y + 160);
ctx.lineTo(740, y + 160);
ctx.lineTo(740, y + 95);
ctx.lineTo(720, y + 95);
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

function free(i)
{
contents[i] = freelist;
freelist = i;
}

//------------------------------------------------------------------------------

}

//==============================================================================
