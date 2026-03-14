// Quick demo. of BTB
// J. Garside - Dec. 2020
// (Not tidied up!  much hackery & many global variables)

function run_BTB(canvas)
{
const INC_X = 100;
const INC_Y = 50;
const INC_YY = INC_Y + 35;
const BTB_X = INC_X;
const BTB_Y = INC_Y + 80;
const BTB_YY = BTB_Y + 75;
const MUX_X = INC_X + 250;
const MUX_Y = INC_Y + 10;
const MUX_YY = (INC_YY + BTB_YY) / 2;
const MUX_DX = 40;
const MUX2_X = MUX_X + MUX_DX + 60;
const MUX2_YY = MUX_YY + 40;
const PC_X = MUX2_X + MUX_DX + 40;
const PC_Y = MUX_YY + 40;
const BR_X = INC_X + 540;
const BR_Y = INC_Y + 210;
const CODE_X = 140;
const CODE_Y = 340;
const REG_X = CODE_X + 400;
const REG_Y = CODE_Y;

const AHL = 5;			// Arrowhead dimensions
const AHW = 8;

const LABEL = ["Reset", "", "loop_2", "loop_1", "", "", "", "skip",
               "", "", "", "stop"];
const CODE0  = ["mov  r0, #0", "mov  r2, #3", "mov  r1, #4", "cmp  r1, r2",
                "bne  skip", "add  r0, r0, r1", "sub  r0, r0, #2",
                "subs r1, r1, #1", "bpl  loop_1", "subs r2, r2, #1",
                "bpl  loop_2", "b    stop"];
const CODE1  = ["mov  r0, #0", "mov  r2, #3", "mov  r1, #4", "cmp  r1, r2",
                "beq  skip", "add  r0, r0, r1", "sub  r0, r0, #2",
                "subs r1, r1, #1", "bpl  loop_1", "subs r2, r2, #1",
                "bpl  loop_2", "b    stop"];

var reset = true;		// Indicates initial condition
var code_opt = 0;
var btb_en = false;
var dyn_en = false;

var pc = 0;			// Init.
var dec = -1;
var exec = -1;

var pc_disp = 0;		// Cosmetic PC copy

var dec_pred = -1;		// Destination: -1 == none
var exec_pred = -1;
var dec_hit;			// BTB entry ID
var exec_hit;

var branch = -1;
var unbranch = -1;
var from = -1;
var source = [-1, -1, -1, -1];
var dest   = [-1, -1, -1, -1];
var state  = [ 0,  0,  0,  0];
var state_inc = -1;
var state_dec = -1;

var r0;
var r1;
var r2;
var r0_def = false;;
var r1_def = false;;
var r2_def = false;;

var replace = 0;
var new_line;

//var predicted;

var buttonCount = 0;
var button = [];

var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

button[buttonCount] = new makeButton(690,  20, 30, 20, "Red", "White", "Reset", f_reset, 1);
button[buttonCount] = new makeButton(690,  70, 30, 20, "Lime", "Black", "Step", f_step, 1);
button[buttonCount] = new makeButton(690, 120, 30, 20, "Coral", "Black", "BTB off", f_btb_en, 1);
button[buttonCount] = new makeButton(690, 170, 30, 20, "Coral", "Black", "Static", f_dyn_en, 1);
button[buttonCount] = new makeButton(690, 220, 30, 20, "Yellow", "Black", "Option A", f_opt, 1);

f_reset();

ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  });

return;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function f_click()
{
var i;

// Scan buttons and call function of any found.
for (i = 0; i < buttonCount; i++)
  if ((mouse.x >= button[i].left) && (mouse.x <= button[i].right)
   && (mouse.y >= button[i].top)  && (mouse.y <= button[i].bottom))
    updated = button[i].func(i);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_step(x)
{
var new_pc;
var hit;
var pred;

function bcc(cond, dest)
  {
  if (cond)
    {
    if (exec_pred < 0) branch = dest;
    if (exec_hit >= 0) state_inc = exec_hit;
    }
  else
    {
    if (exec_pred >= 0) unbranch = exec + 1;
    if (exec_hit >= 0)  state_dec = exec_hit;
    }
  }

reset = false;

hit = (pc < 0) ? -1 : find(pc);
pred = (branch < 0) && (hit >= 0);
if (dyn_en) pred = pred && (state[hit] > 1);

if (unbranch >= 0) new_pc = unbranch;
else
  if (branch >= 0) new_pc = branch;
  else
    {
    if (pred) new_pc = dest[hit];
    else      new_pc = pc + 1;
    }

exec = dec;
exec_pred = dec_pred;
exec_hit = dec_hit;
dec = pc;
dec_pred = pred ? dest[hit] : -1;
//dec_hit = (dec_pred >= 0) ? hit : -1;
dec_hit = hit;

pc = new_pc;

branch   = -1;
unbranch = -1;
//predicted = false;
state_inc = -1;
state_dec = -1;

switch (code_opt)
  {
  case 0:
    switch (exec)
      {
      case 0:  r0 = 0; r0_def = true;    break;
      case 1:  r2 = 3; r2_def = true;    break;
      case 2:  r1 = 4; r1_def = true;    break;
      case 4:  bcc((r1 != r2), 7);       break;
      case 5:  r0 = r0 + r1; break;
      case 6:  r0 = r0 - 2;  break;
      case 7:  r1 =  r1 - 1; break;
      case 8:  bcc((r1 >= 0), 3);        break;
      case 9:  r2 =  r2 - 1; break;
      case 10: bcc((r2 >= 0), 2);        break;
      case 11: bcc(true, 11);            break;
      default: break;
      }
    break;

  case 1:
    switch (exec)
      {
      case 0:  r0 = 0; r0_def = true;    break;
      case 1:  r2 = 3; r2_def = true;    break;
      case 2:  r1 = 4; r1_def = true;    break;
      case 4:  bcc((r1 == r2), 7);       break;	// Different from case 0
      case 5:  r0 = r0 + r1; break;
      case 6:  r0 = r0 - 2;  break;
      case 7:  r1 =  r1 - 1; break;
      case 8:  bcc((r1 >= 0), 3);        break;
      case 9:  r2 =  r2 - 1; break;
      case 10: bcc((r2 >= 0), 2);        break;
      case 11: bcc(true, 11);            break;
      default: break;
      }
    break;
  }

pc_disp = pc;
new_line = -1;

if ((branch >= 0) || (unbranch >= 0))
  {
  if (btb_en && (branch >= 0) && (find(exec) < 0))
    {
    new_line = replace;
    source[replace] = exec;
    dest[replace]   = branch;
    state[replace]  = 2;		// Begin weakly taken
    replace  = (replace  + 1) & 3;
    }
  pc = -1;
  dec = -1;
  }

if (state_inc >= 0)
  {
  if (state[state_inc] < 3) state[state_inc]++;
  }
else
if (state_dec >= 0)
  {
  if (state[state_dec] > 0) state[state_dec]--;
  }

drawAll();
drawCode();
drawReg();
drawBranch();

redrawButton(x, "Orange", "");		// Flash button
setTimeout(function()
  { redrawButton(x, "", ""); }, 200);

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_reset(x)
{
var i;

pc = 0;
dec = -1;
exec = -1;
dec_pred  = -1;
exec_pred = -1;
dec_hit   = -1;
exec_hit  = -1;
pc_disp   = 0

r0_def = false;
r1_def = false;
r2_def = false;

for (i = 0; i < 4; i++) source[i] = -1;
replace = 0;

branch = -1;
unbranch = -1;

drawAll();
drawCode();
drawReg();
drawBranch();

reset = true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_opt(x)
{
if (reset)
  {
/*
ctx.font = "16px Calibri";
ctx.textAlign = "center";
ctx.fillText("test "+code_opt, 700, 230);
*/
  code_opt = (code_opt + 1) % 2;
  switch (code_opt)
    {
    case 0:  redrawButton(x, "Yellow", "Option A");       break;
    case 1:  redrawButton(x, "LightSkyBlue", "Option B"); break;
    default: redrawButton(x, "", "");                     break;
    }
  }
//else drawMessage("Choose code -before- use", "Orange");
drawCode();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_btb_en(x)
{
btb_en = !btb_en;
if (btb_en) redrawButton(x, "Lime", "BTB on");
else        redrawButton(x, "Coral", "BTB off");
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_dyn_en(x)
{
if (reset)
  {
  dyn_en = !dyn_en;
  if (dyn_en) redrawButton(x, "Lime", "Dynamic");
  else        redrawButton(x, "Coral", "Static");
  }
drawAll();
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

function redrawButton(i, col, text)
{  // Redraws in original colour if col == ""
var bcol, txt;

if (col) bcol = col; else bcol = button[i].bg_col;
if (text) txt = text; else txt = button[i].text;
drawButton(button[i].x, button[i].y,
           button[i].width, button[i].height, bcol,
	   button[i].fg_col, txt);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function find(pc)
{
var hit;
var i;

hit = -1;
if (btb_en) for (i = 0; i < 4; i++) if (pc == source[i]) hit = i;

return hit;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function hexString(x)	// Add leading zero to hex (<256 only)
{
if (x > 15) return x.toString(16);
else        return "0" + x.toString(16);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawCode()
{
var i, y;

ctx.save();

ctx.clearRect(CODE_X, CODE_Y, 340, 250);
//ctx.strokeRect(CODE_X, CODE_Y, 340, 250);

ctx.font = "16px Courier new";

for (i = 0; i < 12; i++)
  {
  ctx.fillStyle = "Black";
  y = 20*i + 20 + CODE_Y;
  if (i == pc)  ctx.fillStyle = "ForestGreen";
  else
  if (i == dec)  ctx.fillStyle = "DarkOrange";
  else
  if (i == exec)  ctx.fillStyle = "Red";
  ctx.fillText("000000" + hexString(4*i), CODE_X + 10, y);
  ctx.fillText(LABEL[i], CODE_X + 100, y);
  switch (code_opt)
    {
    case 0:  ctx.fillText(CODE0[i], CODE_X + 180, y); break;
    case 1:  ctx.fillText(CODE1[i], CODE_X + 180, y); break;
    default: ctx.fillText("Undefined", CODE_X + 180, y); break;
    }
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawReg()
{

ctx.save();

ctx.clearRect(REG_X, REG_Y, 260, 230);
//ctx.strokeRect(400, 340, 260, 230);

ctx.font = "16px Calibri";
ctx.fillText("R0:", REG_X + 10, REG_Y + 20);
ctx.fillText("R1:", REG_X + 10, REG_Y + 40);
ctx.fillText("R2:", REG_X + 10, REG_Y + 60);

ctx.font = "16px Courier new";
ctx.textAlign = "right";
if (r0_def) ctx.fillText(r0.toString(16), REG_X + 60, REG_Y + 20);
else        ctx.fillText("--",            REG_X + 60, REG_Y + 20);
if (r1_def) ctx.fillText(r1.toString(16), REG_X + 60, REG_Y + 40);
else        ctx.fillText("--",            REG_X + 60, REG_Y + 40);
if (r2_def) ctx.fillText(r2.toString(16), REG_X + 60, REG_Y + 60);
else        ctx.fillText("--",            REG_X + 60, REG_Y + 60);

/*
ctx.fillText(dec, REG_X + 80, REG_Y + 20);		// Debug prints
ctx.fillText(dec_pred, REG_X + 120, REG_Y + 20);
ctx.fillText(dec_hit, REG_X + 160, REG_Y + 20);
ctx.fillText(exec, REG_X + 80, REG_Y + 40);
ctx.fillText(exec_pred, REG_X + 120, REG_Y + 40);
ctx.fillText(exec_hit, REG_X + 160, REG_Y + 40);

ctx.fillText(state_dec, REG_X + 80, REG_Y + 80);
ctx.fillText(state_inc, REG_X + 120, REG_Y + 80);
*/

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawBranch()
{
ctx.save();

ctx.clearRect(BR_X, BR_Y, 80, 70);
//ctx.strokeRect(BR_X, BR_Y, 80, 70);

ctx.font = "16px Calibri";
ctx.textAlign = "center";

if (unbranch >= 0)			// i.e. predicted incorrectly
  {
  ctx.fillStyle = "DarkOrange";
  ctx.fillText("Unbranch", BR_X + 40, BR_Y + 16);
  ctx.fillText("To: " + hexString(4*(unbranch)), BR_X + 40, BR_Y + 36);
//ctx.fillText("From:", BR_X + 40, BR_Y + 56);
  }
else
if (branch >= 0)
  {
  ctx.fillStyle = "Red";
  ctx.fillText("Branch", BR_X + 40, BR_Y + 16);
  ctx.fillText("To: "   + hexString(4*branch), BR_X + 40, BR_Y + 36);
  if (btb_en)
    ctx.fillText("From: " + hexString(4*exec), BR_X + 40, BR_Y + 56);
  }
else
//if (state_inc >= 0)			// i.e. predicted correctly
if (exec_hit >= 0)			// i.e. predicted correctly
  {
  ctx.fillStyle = "ForestGreen";
  ctx.fillText("Prediction", BR_X + 40, BR_Y + 36);
  ctx.fillText("successful", BR_X + 40, BR_Y + 56);
  }
/*
else
if (dyn_en && (state_dec >= 0))		// i.e. predicted incorrectly
  {
  ctx.fillStyle = "DarkOrange";
  ctx.fillText("Prediction", BR_X + 40, BR_Y + 36);
  ctx.fillText("unsuccessful", BR_X + 40, BR_Y + 56);
  }
*/
ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawAll()
{
var hit;
var m1, m2;
var pc_col, pc_col2;

hit = find(pc_disp);
var btb_hit = (hit >= 0) && (!dyn_en || (state[hit] > 1));

if (!btb_hit) m1 = pc_disp + 1;
else          m1 = dest[hit];

if (unbranch >= 0)    m2 = unbranch;
else if (branch >= 0) m2 = branch;
else                  m2 = m1;

if (unbranch >= 0)    { pc_col = "Orange"; pc_col2 = "DarkOrange"; }
else if (branch >= 0) { pc_col = "Coral";  pc_col2 = "Red"; }
else                  { pc_col = "Lime";   pc_col2 = "ForestGreen"; }

ctx.save();

ctx.clearRect(INC_X - 60, 0, 600, 330);
//ctx.strokeRect(INC_X - 60, 0, 600, 330);

drawInc(INC_X, INC_Y, pc_disp, btb_hit);

drawBTB(BTB_X, BTB_Y, pc_disp, hit);	// 'hit' highlight (even unused) line

ctx.fillStyle = "Lime";

ctx.beginPath();
ctx.moveTo(INC_X + 200, INC_YY - 5);
ctx.lineTo(MUX_X-AHL, INC_YY - 5);
ctx.lineTo(MUX_X-AHL, INC_YY - AHW);
ctx.lineTo(MUX_X, INC_YY);
ctx.lineTo(MUX_X-AHL, INC_YY + AHW);
ctx.lineTo(MUX_X-AHL, INC_YY + 5);
ctx.lineTo(INC_X + 200, INC_YY + 5);
ctx.closePath();
if (!btb_hit) ctx.fill();
ctx.stroke();

ctx.beginPath();
ctx.moveTo(BTB_X + 200, BTB_YY - 5);
ctx.lineTo(MUX_X-AHL, BTB_YY - 5);
ctx.lineTo(MUX_X-AHL, BTB_YY - AHW);
ctx.lineTo(MUX_X, BTB_YY);
ctx.lineTo(MUX_X-AHL, BTB_YY + AHW);
ctx.lineTo(MUX_X-AHL, BTB_YY + 5);
ctx.lineTo(BTB_X + 200, BTB_YY + 5);
ctx.closePath();
if (btb_hit) ctx.fill();
ctx.stroke();

drawMux(MUX_X, MUX_YY, INC_YY, m1, ((branch < 0) && (unbranch < 0)) ?
                                   "DarkGreen" : "LightSteelBlue");

ctx.beginPath();
ctx.moveTo(MUX_X + MUX_DX, MUX_YY - 5);
ctx.lineTo(MUX2_X-AHL, MUX_YY - 5);
ctx.lineTo(MUX2_X-AHL, MUX_YY - AHW);
ctx.lineTo(MUX2_X, MUX_YY);
ctx.lineTo(MUX2_X-AHL, MUX_YY + AHW);
ctx.lineTo(MUX2_X-AHL, MUX_YY + 5);
ctx.lineTo(MUX_X + MUX_DX, MUX_YY + 5);
ctx.closePath();
if ((branch < 0) && (unbranch < 0)) ctx.fill();
ctx.stroke();

drawMux(MUX2_X, PC_Y, MUX_YY, m2, pc_col2);

ctx.beginPath();
ctx.moveTo(MUX2_X + MUX_DX, MUX2_YY - 5);
ctx.lineTo(PC_X-AHL, MUX2_YY - 5);
ctx.lineTo(PC_X-AHL, MUX2_YY - AHW);
ctx.lineTo(PC_X, MUX2_YY);
ctx.lineTo(PC_X-AHL, MUX2_YY + AHW);
ctx.lineTo(PC_X-AHL, MUX2_YY + 5);
ctx.lineTo(MUX2_X + MUX_DX, MUX2_YY + 5);
ctx.closePath();

var grad = ctx.createLinearGradient(MUX2_X + MUX_DX, 0, PC_X, 0);
grad.addColorStop(0, pc_col);
grad.addColorStop(1, "White");
ctx.fillStyle = grad;

ctx.fill();
ctx.stroke();

drawPC(PC_X, PC_Y);

ctx.fillStyle = "Lime";

ctx.beginPath();
ctx.moveTo(PC_X + 40, PC_Y - 5);
ctx.lineTo(PC_X + 65, PC_Y - 5);
ctx.lineTo(PC_X + 65, INC_Y -  25);
ctx.lineTo(INC_X - 40, INC_Y -  25);
ctx.lineTo(INC_X - 40, INC_YY - 5);
ctx.lineTo(INC_X-AHL, INC_YY - 5);
ctx.lineTo(INC_X-AHL, INC_YY - AHW);
ctx.lineTo(INC_X, INC_YY);
ctx.lineTo(INC_X-AHL, INC_YY + AHW);
ctx.lineTo(INC_X-AHL, INC_YY + 5);
ctx.lineTo(INC_X - 40, INC_YY + 5);

ctx.lineTo(INC_X - 40, BTB_YY - 5);
ctx.lineTo(BTB_X-AHL, BTB_YY - 5);
ctx.lineTo(BTB_X-AHL, BTB_YY - AHW);
ctx.lineTo(BTB_X, BTB_YY);
ctx.lineTo(BTB_X-AHL, BTB_YY + AHW);
ctx.lineTo(BTB_X-AHL, BTB_YY + 5);
ctx.lineTo(INC_X - 50, BTB_YY + 5);

ctx.lineTo(INC_X - 50, INC_Y -  35);
ctx.lineTo(PC_X + 75, INC_Y -  35);
ctx.lineTo(PC_X + 75, PC_Y - 5);
ctx.lineTo(PC_X + 100-AHL, PC_Y - 5);
ctx.lineTo(PC_X + 100-AHL, PC_Y - AHW);
ctx.lineTo(PC_X + 100, PC_Y);
ctx.lineTo(PC_X + 100-AHL, PC_Y + AHW);
ctx.lineTo(PC_X + 100-AHL, PC_Y + 5);
ctx.lineTo(PC_X + 40, PC_Y + 5);
ctx.closePath();
ctx.fill();
ctx.stroke();

var yy = PC_Y + (PC_Y - MUX_YY);

ctx.beginPath();
ctx.moveTo(PC_X + 100, BTB_Y + 160 - 5);
//ctx.lineTo(PC_X + 25, BTB_Y + 160 - 5);
//ctx.lineTo(PC_X + 25, PC_Y + 60);
ctx.lineTo(MUX2_X - 25, BTB_Y + 160 - 5);
ctx.lineTo(MUX2_X - 25, yy+5);
ctx.lineTo(MUX2_X-AHL, yy+5);
ctx.lineTo(MUX2_X-AHL, yy+AHW);
ctx.lineTo(MUX2_X, yy);
ctx.lineTo(MUX2_X-AHL, yy-AHW);
ctx.lineTo(MUX2_X-AHL, yy-5);
ctx.lineTo(MUX2_X - 35, yy-5);
ctx.lineTo(MUX2_X - 35, BTB_Y + 160 - 5);
//ctx.lineTo(PC_X + 15, PC_Y + 60);
//ctx.lineTo(PC_X + 15, BTB_Y + 160 - 5);
ctx.lineTo(BTB_X + 155, BTB_Y + 160 - 5);
ctx.lineTo(BTB_X + 155, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 150+AHW, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 150, BTB_Y + 125);
ctx.lineTo(BTB_X + 150-AHW, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 145, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 145, BTB_Y + 160 + 5);
ctx.lineTo(PC_X + 100, BTB_Y + 160 + 5);
ctx.closePath();
ctx.fillStyle = pc_col;
if ((branch >= 0) || (unbranch >= 0)) ctx.fill();
ctx.stroke();


ctx.beginPath();
ctx.moveTo(PC_X + 100, BTB_Y + 180 - 5);
ctx.lineTo(BTB_X + 55, BTB_Y + 180 - 5);
ctx.lineTo(BTB_X + 55, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 50+AHW, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 50, BTB_Y + 125);
ctx.lineTo(BTB_X + 50-AHW, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 45, BTB_Y + 125+AHL);
ctx.lineTo(BTB_X + 45, BTB_Y + 180 + 5);
ctx.lineTo(PC_X + 100, BTB_Y + 180 + 5);
ctx.closePath();
if (btb_en && (branch >= 0)) ctx.fill();
ctx.stroke();

/*
ctx.textAlign = "left";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("TEST 99", 10, 80);
*/

ctx.restore();

return;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawInc(x, y, pc, hit)
{
var pc1 = pc + 1;

ctx.save();

ctx.fillStyle = "Bisque";
ctx.strokeStyle = "Black";
ctx.fillRect(x, y, 200, 50);
ctx.strokeRect(x, y, 200, 50);

ctx.textAlign = "center";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("Incrementer", x+100, y+15);
ctx.fillStyle = (!hit) ? "DarkGreen" : "LightSteelBlue";
ctx.font = "16px Courier new";
//ctx.fillText(pc.toString() + " + 1 = " + (pc+1).toString(), x + 100, y + 38);
ctx.fillText(hexString(4*pc) + " + 4 = " + hexString(4*(pc+1)), x + 100, y + 38);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawBTB(x, y, pc, hit)
{

function BTB_line(n, x, y)
  {
  var i;
  ctx.save();
  ctx.font = "16px Courier new";

  if (n == new_line) ctx.fillStyle = "Red";
  else if (n == hit) ctx.fillStyle = "DarkGreen";
  else               ctx.fillStyle = "LightSteelBlue";

  if (source[n] >= 0)
    {
    ctx.fillText(hexString(4*source[n]), x + 50, y + 13);
    ctx.fillText(hexString(4*dest[n]),  x + 150, y + 13);
    }
  else
    {
    ctx.fillText("----", x +  50, y + 13);
    ctx.fillText("----", x + 150, y + 13);
    }

  if (dyn_en)
    for (i = 0; i < 4; i++)
      {
      if (source[n] < 0)
        drawDot(x + 85 + 10*i, y + 10, "LightSteelBlue", false);
      else
        if (n == hit)
          drawDot(x + 85 + 10*i, y + 10, (i < 2) ? "Red" : "Green", state[n] == i);
        else
          drawDot(x + 85 + 10*i, y + 10, (i < 2) ? "Salmon" : "LightGreen", state[n] == i);
      }

  ctx.restore();
  }


function drawDot(x, y, col, fill)
  {
  ctx.save(); // save state
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
  ctx.fillStyle = col;
  ctx.strokeStyle = col;
//ctx.lineWidth = stroke;
  if (fill) ctx.fill();
  ctx.stroke();
  ctx.restore(); // restore to original state
  }			// End of function drawDot


ctx.save();

ctx.fillStyle = "Bisque";
ctx.strokeStyle = "Black";
ctx.fillRect(x, y, 200, 125);
ctx.strokeRect(x, y, 200, 125);

ctx.textAlign = "center";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("Branch Target Buffer", x+100, y+15);
ctx.fillText("Source", x +  50, y + 38);
ctx.fillText("Destination", x + 150, y + 38);
BTB_line(0, x, y +  45);
BTB_line(1, x, y +  65);
BTB_line(2, x, y +  85);
BTB_line(3, x, y + 105);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawMux(x, y, inY, n, txtCol)
{
var h2 = (inY - y) * 1.6;

ctx.save();

ctx.fillStyle = "Bisque";
ctx.strokeStyle = "Black";
ctx.beginPath();
ctx.moveTo(x, y - h2);
ctx.lineTo(x, y + h2);
ctx.lineTo(x+MUX_DX, y + (h2 * 0.8));
ctx.lineTo(x+MUX_DX, y - (h2 * 0.8));
ctx.closePath();
ctx.fill();
ctx.stroke();

ctx.textAlign = "center";
ctx.fillStyle = txtCol;
ctx.font = "16px Courier new";
ctx.fillText(hexString(4*n), x+20, y+6);

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawPC(x, y)
{
ctx.save();

ctx.fillStyle = "Bisque";
ctx.strokeStyle = "Black";

ctx.fillRect(x, y-60, 40, 120);
ctx.strokeRect(x, y-60, 40, 120);

ctx.textAlign = "center";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("PC", x+20, y-60+16);
ctx.font = "16px Courier new";
ctx.fillText(hexString(4*pc_disp), x+20, y+6);

ctx.beginPath();
ctx.moveTo(x+10, y + 60);
ctx.lineTo(x+20, y + 50);
ctx.lineTo(x+30, y + 60);
//ctx.closePath();
//ctx.fill();
ctx.stroke();

ctx.beginPath();
ctx.moveTo(x+20, y + 60);
ctx.lineTo(x+20, y + 75);
ctx.stroke();

ctx.restore();
}

//------------------------------------------------------------------------------

}

//==============================================================================
