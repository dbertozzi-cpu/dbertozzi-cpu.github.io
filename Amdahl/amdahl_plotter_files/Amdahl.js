// Graph plot for Amdahl's Law

function run_Amdahl(canvas)
{
const labels = ["0", "1", "2", "3", "4", "5", "6", "7",
                "8", "9", "A", "B", "C", "D", "E", "F"];
const range = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
const ranges = 13;

const GRAPH_X  = 100;
const GRAPH_Y  =  20;
const GRAPH_DX = 550;
const GRAPH_DY = 350;

const BAR_1_X  = 100;
//const BAR_1_Y  = 560;
const BAR_1_Y  = GRAPH_Y + GRAPH_DY + 40;
const BAR_1_DX = 480;
const BAR_1_DY =  20;

const ROW_1_Y = GRAPH_Y + GRAPH_DY + 60;
const ROW_2_Y = ROW_1_Y + 40;
//const ROW_3_Y = ROW_2_Y + 40;
const ROW_3_Y = BAR_1_Y + 100;
const ROW_X   = GRAPH_X;
const ROW_SPACE = 70;

const NO_NUMS = 10;		// Roughly number of labels/scale

var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

var buttonCount = 0;
var button = [];
var barCount = 0;
var bar = [];

// *_min want to be appropriate multiples @@@
var x_min = 0;
var x_max = 100;
var x_range;
var x_increment;
var y_min = 0;
var y_max = 100;
var y_range;
var y_increment;
var i;

var symbol = 0;
var old_symbol = -1;

//draw_test();			// Replacement
add_actions();

x_range = x_max - x_min;
y_range = y_max - y_min;

clear();

drawRowLabel(ROW_3_Y, "Symbol");

button[buttonCount] = new makeButton(0, ROW_X + 1/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Silver", "Black", "X", setSymbol, 0);
old_symbol = buttonCount - 1;
redrawButton(old_symbol, "Yellow");		// Highlight default
button[buttonCount] = new makeButton(1, ROW_X + 3/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Silver", "Black", "+", setSymbol, 1);
button[buttonCount] = new makeButton(2, ROW_X + 5/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Silver", "Black", "H", setSymbol, 2);
button[buttonCount] = new makeButton(3, ROW_X + 7/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Silver", "Black", "A", setSymbol, 3);
button[buttonCount] = new makeButton(4, ROW_X + 9/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Silver", "Black", "O", setSymbol, 4);

button[buttonCount] = new makeButton(-1, ROW_X +13/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Lime", "Black", "Clear", clear, 0);
button[buttonCount] = new makeButton(-1, ROW_X +15/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Lime", "Black", "Plot", plotPt, 0);

//button[buttonCount] = new makeButton(-1, ROW_X +11/2 * ROW_SPACE, ROW_3_Y, 30, 16, "Red", "Black", "Test", test, 0);

bar[barCount] = new makeBar(0, BAR_1_X, BAR_1_Y, BAR_1_DX, BAR_1_DY, "Red", "Lime", "Serial", "Parallel", setBar, 20);
bar[barCount] = new makeBar(0, BAR_1_X, BAR_1_Y+40, BAR_1_DX, BAR_1_DY, "Blue", "", "Processors", "", setBar, 50);

return;

//------------------------------------------------------------------------------

function scale(value)
{
var a;

a = value / NO_NUMS;
for (i = 0; i < ranges; i++)
  if (a/range[i] <= 1) break;
if (value < 14 * range[i - 1]) i--;
return i;
}

function plotPoint(symbol, x, y)
{
var xx, yy;

xx = GRAPH_X + ((x - x_min) * GRAPH_DX) / x_range;
yy = GRAPH_Y + GRAPH_DY - ((y - y_min) * GRAPH_DY) / y_range;

plotSymbol(symbol, xx, yy);
}

function plotSymbol(symbol, x, y)
{
switch(symbol)
  {
  case 0: plotX   (x, y); break;
  case 1: plotPlus(x, y); break;
  case 2: plotBox (x, y); break;
  case 3: plotTri (x, y); break;
  case 4: plotO   (x, y); break;
  }
}

function plotX(x, y)
{ drawLine(x-5, y-5, x+5, y+5); drawLine(x-5, y+5, x+5, y-5); }

function plotPlus(x, y)
{ drawLine(x-7, y, x+7, y);     drawLine(x, y+7, x, y-7); }

function plotBox(x, y) { ctx.strokeRect(x-6, y-6, 12, 12); }

function plotTri(x, y)
{
//ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(x-7, y+4);
ctx.lineTo(x+7, y+4);
ctx.lineTo(x, y -8);
ctx.closePath();
ctx.stroke();
}

function plotO(x, y)
{
//ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
ctx.stroke();
}

function add_actions()
{
ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  });
}

function f_click()
{
var i;

//ctx.fillText(mouse.x, 140, 280);
// Scan buttons and call function of any found.
for (i = 0; i < buttonCount; i++)
  if ((mouse.x >= button[i].left) && (mouse.x <= button[i].right)
   && (mouse.y >= button[i].top)  && (mouse.y <= button[i].bottom))
    button[i].func(i);

for (i = 0; i < barCount; i++)
  if ((mouse.x >= bar[i].left) && (mouse.x <= bar[i].right)
   && (mouse.y >= bar[i].top)  && (mouse.y <= bar[i].bottom))
  bar[i].func(i, ((mouse.x - bar[i].left) * 100 / bar[i].width));

}

function makeButton(type, x_org, y_org, x_dim, y_dim, bg_col, fg_col, text, func, value)
{
drawButton(type, x_org, y_org, x_dim, y_dim, bg_col, fg_col, text);
this.x      = x_org;
this.y      = y_org;
this.width  = x_dim;		// Half width
this.height = y_dim;		// Half height
this.type   = type;
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

function makeBar(type, x_org, y_org, x_dim, y_dim, l_col, r_col, l_text, r_text, func, value)
{
drawBar(type, x_org, y_org, x_dim, y_dim, l_col, r_col, l_text, r_text, value);
this.width  = x_dim;
this.height = y_dim;
this.type   = type;
this.left   = x_org;
this.right  = x_org + x_dim;
this.top    = y_org;
this.bottom = y_org + y_dim;
this.l_col  = l_col;
this.r_col  = r_col;
this.l_text = l_text;
this.r_text = r_text;
this.func   = func;
this.value  = value;
barCount++;
}

function setSymbol(i)
{
if (old_symbol >= 0) redrawButton(old_symbol, "");
old_symbol = i;
redrawButton(i, "Yellow");
symbol = button[i].value;
}

function setBar(i, x)
{
var rounded;

rounded = Math.floor(x + 0.5);
bar[i].value = rounded;
drawBar(0, bar[i].left, bar[i].top, bar[i].width, bar[i].height,
           bar[i].l_col, bar[i].r_col, bar[i].l_text, bar[i].r_text, rounded);
}

function plotPt(i)
{
var x;

x = 100 / (bar[0].value + (100 - bar[0].value) / bar[1].value);
plotPoint(symbol, bar[1].value, x);
}

function clear(i)
{  // Clear and reinitialise plotting area
ctx.clearRect(0, GRAPH_Y - 5, GRAPH_X + GRAPH_DX + 10, GRAPH_Y + GRAPH_DY + 15);

drawLine(GRAPH_X, GRAPH_Y - 5, GRAPH_X, GRAPH_Y + GRAPH_DY);
drawLine(GRAPH_X, GRAPH_Y + GRAPH_DY,
         GRAPH_X + GRAPH_DX + 5, GRAPH_Y + GRAPH_DY);

x_increment = scale(x_range);
y_increment = scale(y_range);

ctx.textAlign = "center";	// ++ @@@

for (i = 0; i <= x_range; i = i + range[x_increment])
  {
  drawLine(GRAPH_X + i * GRAPH_DX / x_range, GRAPH_Y + GRAPH_DY,
           GRAPH_X + i * GRAPH_DX / x_range, GRAPH_Y + GRAPH_DY + 5);
  ctx.fillText(x_min + i, GRAPH_X + i * GRAPH_DX / x_range,
                          GRAPH_Y + GRAPH_DY + 15);
  }

ctx.textAlign = "right";	// ++ @@@

for (i = 0; i <= y_range; i = i + range[y_increment])
  {
  drawLine(GRAPH_X - 5, GRAPH_Y + GRAPH_DY - i * GRAPH_DY / y_range,
           GRAPH_X,     GRAPH_Y + GRAPH_DY - i * GRAPH_DY / y_range);
  ctx.fillText(y_min + i, GRAPH_X - 6, GRAPH_Y + GRAPH_DY - i * GRAPH_DY / y_range + 4);
  }

scaleLabels("Speed up", "Processors");
}

function drawRowLabel(pos, text)
{
ctx.save();
ctx.fillStyle = "Black";
ctx.textAlign = "right";
ctx.font = "16px Calibri";
ctx.fillText(text, ROW_X - 10, pos + 3);
ctx.restore();
}

function scaleLabels(text_y, text_x)
{
ctx.save();
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.textAlign = "right";
ctx.fillText(text_y, ROW_X - 20, GRAPH_Y + GRAPH_DY/2 + 3);
ctx.textAlign = "center";
ctx.fillText(text_x, GRAPH_X + GRAPH_DX/2, GRAPH_Y + GRAPH_DY + 30);
ctx.restore();
}

function test() { redrawButton(22, "Yellow"); }
// Handy debug function

function redrawButton(i, col)
{  // Redraws in original colour if col == ""
var bcol;

if (col) bcol = col; else bcol = button[i].bg_col;
drawButton(button[i].type, button[i].x, button[i].y,
           button[i].width, button[i].height, bcol,
	   button[i].fg_col, button[i].text);
}

function drawBar(type, x_org, y_org, x_dim, y_dim, l_col, r_col, l_text, r_text, value)
{
var dx_l, dx_r;

dx_l = x_dim * value / 100;
dx_r = x_dim - dx_l;

ctx.save();
ctx.clearRect(x_org - 80, y_org - 5, x_dim + 160, y_dim + 10);
//ctx.strokeRect(x_org - 80, y_org - 5, x_dim + 160, y_dim + 10);
if (l_col)
  {
  ctx.fillStyle = l_col;
  ctx.fillRect(x_org, y_org, dx_l, y_dim);
  }
if (r_col)
  {
  ctx.fillStyle = r_col;
  ctx.fillRect(x_org + dx_l, y_org, dx_r, y_dim);
  }
  
ctx.strokeRect(x_org, y_org, x_dim, y_dim);

ctx.font = "12px Calibri";
ctx.fillStyle = "Black";
ctx.textAlign = "right";
ctx.fillText(l_text, x_org - 5, y_org + y_dim /2 + 3);
ctx.textAlign = "left";
ctx.fillText(r_text, x_org + x_dim + 5, y_org + y_dim /2 + 3);
ctx.textAlign = "right";
ctx.fillText(value, x_org + x_dim + 70, y_org + y_dim /2 + 3);

ctx.restore();
}

function drawButton(type, x_org, y_org, x_dim, y_dim, bg_col, fg_col, text)
{
ctx.save();
ctx.fillStyle = bg_col;
ctx.fillRect(x_org - x_dim, y_org - y_dim, 2 * x_dim, 2 *y_dim);
ctx.strokeRect(x_org - x_dim, y_org - y_dim, 2 * x_dim, 2 * y_dim);
ctx.fillStyle = fg_col;
//ctx.fillText(text, x_org + (x_dim - 12*text.length)/2 , y_org + 22);

if (type < 0)
  {
  ctx.font = "16px Courier new";
  ctx.textAlign = "center";
  ctx.fillText(text, x_org, y_org + 5);
  }
else
  plotSymbol(type, x_org, y_org);

ctx.restore();
}

function drawLine(x0, y0, x1, y1)
{ // Line drawing primitive
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.stroke();
}

}

//==============================================================================
