// Reorder buffer illustration
// J. Garside - Jan. 2021
// (Not tidied up!)

function run_reorder(canvas)
{
const ISSUE_X = 30
const ISSUE_Y = 10;
const MEMORY_X = ISSUE_X + 110;
const MEMORY_Y = ISSUE_Y;
const ALU_X = MEMORY_X;
const ALU_Y = MEMORY_Y + 60;
const REORDER_X = MEMORY_X+3*90 + 60;
const REORDER_Y = MEMORY_Y;
const REGISTER_X = REORDER_X + 130;
const REGISTER_Y = MEMORY_Y;
const CODE_X = ISSUE_X - 15;
const CODE_Y = ISSUE_Y + 130;
const STATUS_X = 230
const STATUS_Y = 140
const BUTTON_Y = 220;

const R = ["R0", "R1", "R2", "..."];

const code = ["ldr  r1, memA ; = 55",
              "mov  r1, #99",
              "mov  r0, r1",
              "ldr  r2, memB ; = 66",
              "nop           ; etc.",
              "line 5",
              "line 6",
              "line 7"];

const reg = [["R0", "R1", "R2", "..."],
             ["R0", "S0", "R2", "..."],
             ["R0", "S1", "R2", "..."],
             ["S2", "S1", "R2", "..."],
             ["S2", "S1", "S3", "..."],
             ["S2", "S1", "S3", "..."],
             ["S2", "R1", "S3", "..."],
             ["R0", "R1", "S3", "..."],
             ["R0", "R1", "R2", "..."]];

const rcol = [["Lime", "Lime", "Lime", "Lime"],
              ["Lime", "Gold", "Lime", "Lime"],
              ["Lime", "Gold", "Lime", "Lime"],
              ["Gold", "Lime", "Lime", "Lime"],
              ["Lime", "Lime", "Gold", "Lime"],
              ["Lime", "Lime", "Gold", "Lime"],
              ["Lime", "Lime", "Gold", "Lime"],
              ["Lime", "Lime", "Lime", "Lime"],
              ["Lime", "Lime", "Lime", "Lime"]];

const mem0 = [["--", "--", "--"],
              ["S0", "--", "--"],
              ["--", "S0", "--"],
              ["--", "--", "S0"],
              ["S3", "--", "--"],
              ["--", "S3", "--"],
              ["--", "--", "S3"],
              ["--", "--", "--"],
              ["--", "--", "--"]];

const mem1 = [["--", "--", "--"],
              ["R1", "--", "--"],
              ["--", "R1", "--"],
              ["--", "--", "R1"],
              ["R2", "--", "--"],
              ["--", "R2", "--"],
              ["--", "--", "R2"],
              ["--", "--", "--"],
              ["--", "--", "--"]];

const mem2 = [["--", "--", "--"],
              ["memA", "--", "--"],
              ["--", "memA", "--"],
              ["--", "--", "55"],
              ["memB", "--", "--"],
              ["--", "memB", "--"],
              ["--", "--", "66"],
              ["--", "--", "--"],
              ["--", "--", "--"]];

const alu0 = ["--", "--", "S1", "S2", "--", "--", "--", "--", "--"];
const alu1 = ["--", "--", "R1", "R0", "--", "--", "--", "--", "--"];
const alu2 = ["--", "--", "99", "99", "--", "--", "--", "--", "--"];

const buff0 = [["--", "--", "--", "--"],
               ["??", "--", "--", "--"],
               ["??", "??", "--", "--"],
               ["??", "R1", "??", "--"],
               ["R1", "R1", "R0", "??"],
               ["--", "R1", "R0", "??"],
               ["--", "--", "R0", "??"],
               ["--", "--", "--", "R2"],
               ["--", "--", "--", "--"]];

const buff1 = [["--", "--", "--", "--"],
               ["--", "--", "--", "--"],
               ["--", "--", "--", "--"],
               ["--", "99", "--", "--"],
               ["55", "99", "99", "--"],
               ["--", "99", "99", "--"],
               ["--", "--", "99", "--"],
               ["--", "--", "--", "66"],
               ["--", "--", "--", "--"]];

const regw = [["--", "--", "--", "--"],
              ["--", "--", "--", "--"],
              ["--", "--", "--", "--"],
              ["--", "--", "--", "--"],
              ["--", "--", "--", "--"],
              ["--", "55", "--", "--"],
              ["--", "99", "--", "--"],
              ["99", "99", "--", "--"],
              ["99", "99", "66", "--"]];

const COL_ACTIVE = "Black";

const BACK = "Beige";

var buttonCount = 0;
var button = [];

var old_button = 0;
var step = 0;


var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

button[buttonCount] = new makeButton(5, 380, BUTTON_Y, 30, 20, "Silver", "Black", "Step 0", f_rwd, 0);
button[buttonCount] = new makeButton(6, 460, BUTTON_Y, 30, 20, "Silver", "Black", "Step 1", f_bck, 1);
button[buttonCount] = new makeButton(7, 540, BUTTON_Y, 30, 20, "Silver", "Black", "Step 2", f_fwd, 2);
/*
button[buttonCount] = new makeButton(-1, 250, BUTTON_Y, 30, 20, "Silver", "Black", "Step 0", f_rwd, 0);
redrawButton(buttonCount-1, "Lime");
button[buttonCount] = new makeButton(-1, 330, BUTTON_Y, 30, 20, "Silver", "Black", "Step 1", f_bck, 1);
button[buttonCount] = new makeButton(-1, 410, BUTTON_Y, 30, 20, "Silver", "Black", "Step 2", f_fwd, 2);
button[buttonCount] = new makeButton(-1, 490, BUTTON_Y, 30, 20, "Silver", "Black", "Step 3", f_step, 3);
button[buttonCount] = new makeButton(-1, 570, BUTTON_Y, 30, 20, "Silver", "Black", "Step 4", f_step, 4);
button[buttonCount] = new makeButton(-1, 650, BUTTON_Y, 30, 20, "Silver", "Black", "Step 5", f_step, 5);
button[buttonCount] = new makeButton(-1, 250, BUTTON_Y + 60, 30, 20, "Silver", "Black", "Step 6", f_step, 6);
button[buttonCount] = new makeButton(-1, 330, BUTTON_Y + 60, 30, 20, "Silver", "Black", "Step 7", f_step, 7);
button[buttonCount] = new makeButton(-1, 410, BUTTON_Y + 60, 30, 20, "Silver", "Black", "Step 8", f_step, 8);
*/
drawAll();

ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  });

return;

//------------------------------------------------------------------------------

function add_actions(canvas)
{
ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
//ctx.fillText(mouse.x, 140, 320);
  });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function f_click()
{
var i;

// Scan buttons and call function of any found.
for (i = 0; i < buttonCount; i++)
  if ((mouse.x >= button[i].left) && (mouse.x <= button[i].right)
   && (mouse.y >= button[i].top)  && (mouse.y <= button[i].bottom))
    button[i].func(i);

}

//------------------------------------------------------------------------------

function f_step(x)
{

redrawButton(old_button, "");
old_button = x;
redrawButton(x, "Lime");
step = button[x].value;

drawAll();
/*
draw_code();
draw_issue();
draw_memory();
*/
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_rwd(x)
{
if (step != 0)
  {
  step = 0;
  drawAll();

  redrawButton(x, "Lime", "");		// Flash button
  setTimeout(function()
    { redrawButton(x, "", ""); }, 200);
  }
}

function f_fwd(x)
{
if (step < 8)
  {
  step++;
  drawAll();

  redrawButton(x, "Lime", "");		// Flash button
  setTimeout(function()
    { redrawButton(x, "", ""); }, 200);
  }
}

function f_bck(x)
{
if (step > 0)
  {
  step--;
  drawAll();

  redrawButton(x, "Lime", "");		// Flash button
  setTimeout(function()
    { redrawButton(x, "", ""); }, 200);
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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


function drawButton(type, x_org, y_org, x_dim, y_dim, bg_col, fg_col, text)
{
ctx.save();
ctx.fillStyle = bg_col;
ctx.fillRect(x_org - x_dim, y_org - y_dim, 2 * x_dim, 2 *y_dim);
ctx.strokeRect(x_org - x_dim, y_org - y_dim, 2 * x_dim, 2 * y_dim);
ctx.fillStyle = fg_col;
if (type < 0)
  {
  //ctx.font = "16px Courier new";
  ctx.font = "16px Calibri";
  ctx.textAlign = "center";
  ctx.fillText(text, x_org, y_org + 5);
  }
else
  plotSymbol(type, x_org, y_org);

ctx.restore();
}

function redrawButton(i, col)
{  // Redraws in original colour if col == ""
var bcol;

if (col) bcol = col; else bcol = button[i].bg_col;
drawButton(button[i].type,
           button[i].x, button[i].y,
           button[i].width, button[i].height, bcol,
	   button[i].fg_col, button[i].text);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function plotSymbol(symbol, x, y)
{
switch(symbol)
  {
  case 0: plotX   (x, y); break;
  case 1: plotPlus(x, y); break;
  case 2: plotBox (x, y); break;
  case 3: plotTri (x, y); break;
  case 4: plotO   (x, y); break;
  case 5: plotRwd (x, y); break;
  case 6: plotL  (x, y); break;
  case 7: plotR   (x, y); break;
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

function plotRwd(x, y)
{
//ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(x-4, y-7);
ctx.lineTo(x-16, y);
ctx.lineTo(x-4, y+7);
ctx.closePath();
ctx.stroke();
ctx.beginPath();
ctx.moveTo(x+12, y-7);
ctx.lineTo(x, y);
ctx.lineTo(x+12, y+7);
ctx.closePath();
ctx.stroke();
}

function plotL(x, y)
{
//ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(x+4, y-7);
ctx.lineTo(x-8, y);
ctx.lineTo(x+4, y+7);
ctx.closePath();
ctx.stroke();
}

function plotR(x, y)
{
//ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(x-4, y-7);
ctx.lineTo(x+8, y);
ctx.lineTo(x-4, y+7);
ctx.closePath();
ctx.stroke();
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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawAll()
{
//ctx.clearRect(0, 0, 620, 190);
//ctx.strokeRect(0, 0, 620, 190);

ctx.save();

draw_code();
draw_issue();
draw_memory();
draw_ALU();
draw_reorder();
draw_registers();
draw_status();
/*
ctx.textAlign = "left";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("TEST 2", 200, 16);
*/

ctx.restore();

return;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_code()
{
var i;

ctx.clearRect(CODE_X, CODE_Y, 200, 100);
//ctx.strokeRect(CODE_X, CODE_Y, 200, 100);

ctx.save();

ctx.textAlign = "left";
//ctx.strokeStyle = "Black";
ctx.font = "16px Courier new";

//ctx.fillStyle = "Grey";

for (i = 0; i < 5; i++)
  {
  if (i == step) ctx.fillStyle = "Red";
  else           ctx.fillStyle = "Grey";
  ctx.fillText(code[i], CODE_X, CODE_Y + i * 20 + 16);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_issue()
{

ctx.clearRect(ISSUE_X-15, ISSUE_Y-2, 110, 124);
//ctx.strokeRect(ISSUE_X-15, ISSUE_Y-2, 110, 124);

ctx.save();

ctx.textAlign = "center";
ctx.strokeStyle = "Black";
ctx.font = "16px Calibri";

ctx.fillStyle = BACK;
ctx.fillRect(ISSUE_X, ISSUE_Y, 80, 100);
ctx.strokeRect(ISSUE_X, ISSUE_Y, 80, 100);

for (i = 0; i < 4; i++)
  {
  ctx.fillStyle = rcol[step][i];
  ctx.fillRect(ISSUE_X + 30, ISSUE_Y + 10 + i * 20, 40, 20);
  ctx.strokeRect(ISSUE_X + 30, ISSUE_Y + 10 + i * 20, 40, 20);

  ctx.fillStyle = "Black";
  ctx.fillText(R[i], ISSUE_X + 15, ISSUE_Y + 10 + i * 20 + 16);
  ctx.fillText(reg[step][i], ISSUE_X + 50, ISSUE_Y + 10 + i * 20 + 16);
  }

ctx.fillStyle = "Black";
/*
  ctx.fillText(9, ISSUE_X-10, ISSUE_Y + i * 20 + 16);
  ctx.fillText("R?", ISSUE_X+20, ISSUE_Y + i * 20 + 16);
*/
ctx.fillText("Instruction issue", ISSUE_X+40, ISSUE_Y + 100 + 16);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_memory()
{
ctx.clearRect(MEMORY_X-2, MEMORY_Y-2, 304, 64);
//ctx.strokeRect(MEMORY_X-2, MEMORY_Y-2, 304, 64);

ctx.save();

ctx.strokeStyle = "Black";
ctx.fillStyle = BACK;
ctx.fillRect(MEMORY_X, MEMORY_Y, 300, 40);
ctx.strokeRect(MEMORY_X, MEMORY_Y, 300, 40);

if (mem0[step][0].charAt(0) == 'S') ctx.fillStyle = "Gold";
else              ctx.fillStyle = "Coral";
ctx.fillRect(MEMORY_X+10, MEMORY_Y+10, 80, 20);
ctx.strokeRect(MEMORY_X+10, MEMORY_Y+10, 20, 20);
ctx.strokeRect(MEMORY_X+30, MEMORY_Y+10, 20, 20);
ctx.strokeRect(MEMORY_X+50, MEMORY_Y+10, 40, 20);

if (mem0[step][1].charAt(0) == 'S') ctx.fillStyle = "Gold";
else              ctx.fillStyle = "Coral";
ctx.fillRect(MEMORY_X+110, MEMORY_Y+10, 80, 20);
ctx.strokeRect(MEMORY_X+110, MEMORY_Y+10, 20, 20);
ctx.strokeRect(MEMORY_X+110+20, MEMORY_Y+10, 20, 20);
ctx.strokeRect(MEMORY_X+110+40, MEMORY_Y+10, 40, 20);

if (mem0[step][2].charAt(0) == 'S') ctx.fillStyle = "Gold";
else              ctx.fillStyle = "Coral";
ctx.fillRect(MEMORY_X+210, MEMORY_Y+10, 80, 20);
ctx.strokeRect(MEMORY_X+210, MEMORY_Y+10, 20, 20);
ctx.strokeRect(MEMORY_X+210+20, MEMORY_Y+10, 20, 20);
ctx.strokeRect(MEMORY_X+210+40, MEMORY_Y+10, 40, 20);

ctx.textAlign = "center";
ctx.font = "14px Calibri";
ctx.fillStyle = "Black";
ctx.fillText(mem0[step][0], MEMORY_X + 20, MEMORY_Y+10 + 15);
ctx.fillText(mem1[step][0], MEMORY_X + 40, MEMORY_Y+10 + 15);
ctx.fillText(mem2[step][0], MEMORY_X + 70, MEMORY_Y+10 + 15);
ctx.fillText(mem0[step][1], MEMORY_X + 120, MEMORY_Y+10 + 15);
ctx.fillText(mem1[step][1], MEMORY_X + 140, MEMORY_Y+10 + 15);
ctx.fillText(mem2[step][1], MEMORY_X + 170, MEMORY_Y+10 + 15);
ctx.fillText(mem0[step][2], MEMORY_X + 220, MEMORY_Y+10 + 15);
ctx.fillText(mem1[step][2], MEMORY_X + 240, MEMORY_Y+10 + 15);
ctx.fillText(mem2[step][2], MEMORY_X + 270, MEMORY_Y+10 + 15);

ctx.font = "16px Calibri";
ctx.fillText("Memory pipeline", MEMORY_X+150, MEMORY_Y+10 + 30 + 16);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_ALU()
{
ctx.clearRect(ALU_X-2, ALU_Y-2, 304, 64);
//ctx.strokeRect(ALU_X-2, ALU_Y-2, 304, 64);

ctx.save();

ctx.strokeStyle = "Black";
ctx.fillStyle = BACK;
ctx.fillRect(ALU_X, ALU_Y, 300, 40);
ctx.strokeRect(ALU_X, ALU_Y, 300, 40);

if (alu0[step].charAt(0) == 'S') ctx.fillStyle = "Gold";
else                             ctx.fillStyle = "Coral";

ctx.fillRect(ALU_X+110, ALU_Y+10, 80, 20);
ctx.strokeRect(ALU_X+110, ALU_Y+10, 20, 20);
ctx.strokeRect(ALU_X+130, ALU_Y+10, 20, 20);
ctx.strokeRect(ALU_X+150, ALU_Y+10, 40, 20);

ctx.textAlign = "center";
ctx.font = "14px Calibri";
ctx.fillStyle = "Black";
ctx.fillText(alu0[step], ALU_X + 120, ALU_Y+10 + 15);
ctx.fillText(alu1[step], ALU_X + 140, ALU_Y+10 + 15);
ctx.fillText(alu2[step], ALU_X + 170, ALU_Y+10 + 15);

ctx.font = "16px Calibri";
ctx.fillText("ALU", ALU_X+150, ALU_Y + 40 + 16);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_reorder()
{
var i;

ctx.clearRect(REORDER_X-5, REORDER_Y-2, 110, 124);
//ctx.strokeRect(REORDER_X-5, REORDER_Y-2, 110, 124);

ctx.save();

ctx.strokeStyle = "Black";
ctx.fillStyle = BACK;
ctx.fillRect(REORDER_X, REORDER_Y, 100, 100);
ctx.strokeRect(REORDER_X, REORDER_Y, 100, 100);

ctx.textAlign = "center";
ctx.strokeStyle = "Black";
ctx.font = "16px Calibri";

for (i = 0; i < 4; i++)
  {
  if (buff0[step][i].charAt(0) == '?')      ctx.fillStyle = "Gold";
  else if (buff0[step][i].charAt(0) == 'R') ctx.fillStyle = "Lime";
  else                                      ctx.fillStyle = "Coral";
  ctx.fillRect(REORDER_X+30, REORDER_Y+10 + i * 20, 60, 20);
  ctx.strokeRect(REORDER_X+30, REORDER_Y+10 + i * 20, 20, 20);
  ctx.strokeRect(REORDER_X+50, REORDER_Y+10 + i * 20, 40, 20);

  ctx.fillStyle = "Black";
  ctx.fillText("S"+i, REORDER_X+15, REORDER_Y + i * 20 + 26);
  ctx.fillText(buff0[step][i], REORDER_X+40, REORDER_Y + i * 20 + 26);
  ctx.fillText(buff1[step][i], REORDER_X+70, REORDER_Y + i * 20 + 26);
  }

ctx.fillText("Reorder buffer", REORDER_X + 50, REORDER_Y + 4 * 20 + 36);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_registers()
{
var i;

ctx.clearRect(REGISTER_X-5, REGISTER_Y-2, 90, 124);
//ctx.strokeRect(REGISTER_X-5, REGISTER_Y-2, 90, 124);

ctx.save();

ctx.strokeStyle = "Black";
ctx.fillStyle = BACK;
ctx.fillRect(REGISTER_X, REGISTER_Y, 80, 100);
ctx.strokeRect(REGISTER_X, REGISTER_Y, 80, 100);

ctx.textAlign = "center";
ctx.strokeStyle = "Black";
ctx.font = "16px Calibri";

for (i = 0; i < 4; i++)
  {
  if (regw[step][i].charAt(0) == '-') ctx.fillStyle = "Coral";
  else                                ctx.fillStyle = "Lime";
  ctx.fillRect(REGISTER_X + 30, REGISTER_Y + i * 20 + 10, 40, 20);
  ctx.strokeRect(REGISTER_X + 30, REGISTER_Y + i * 20 + 10, 40, 20);

  ctx.fillStyle = "Black";
  ctx.fillText(R[i], REGISTER_X + 15, REGISTER_Y + i * 20 + 10 + 16);
  ctx.fillText(regw[step][i], REGISTER_X+50, REGISTER_Y + i * 20 + 10 + 16);
  }

ctx.fillText("Registers", REGISTER_X+40, REGISTER_Y + 4 * 20 +20 + 16);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function draw_status()
{
var str;

ctx.clearRect(STATUS_X-5, STATUS_Y, 460, 40);
//ctx.strokeRect(STATUS_X-5, STATUS_Y, 460, 40);

ctx.save();

ctx.fillStyle = "Blue";
ctx.textAlign = "center";
ctx.font = "16px Calibri";

switch (step)
  {
  case 0: str = "Reset.  Pipelines empty."; break;
  case 1: str = "Load in address calculation stage."; break;
  case 2: str = "Load address output; move overtaking through ALU."; break;
  case 3: str = "Data returned from memory; second move in ALU with forwarded R1."; break;
  case 4: str = "S1 was stalled; two more results reach reorder buffer."; break;
  case 5: str = "Oldest reorder entry (S0) retired to registers."; break;
  case 6: str = "S1 retired to registers.  (Sad about previous instruction!)"; break;
  case 7: str = "Second load result arrives; S2 retired."; break;
  case 8: str = "Last result retired.  (Really there would be more results coming.)"; break;
  default: str = "Shouldn't see this!"; break;
  }

ctx.fillText("Cycle: " + step, STATUS_X + 230, STATUS_Y + 16);
ctx.fillText(str, STATUS_X + 230, STATUS_Y + 36);

ctx.restore();
}

//------------------------------------------------------------------------------

}

//==============================================================================
