// Intro. pop-up page
// J. Garside - June 2024
// (Not tidied up!)

function run_timeline(canvas)
{
const PIC_L = 0;
const PIC_R = 670;
const PIC_T = 0;
const PIC_B = 345;

const RECT = 0;		// Shapes
const CIRC = 1;

const WEEKS   =  18;
//const ROWS    =   8;
const ROWS    =   7;
const WEEK_X  = 120;
const WEEK_DX =  30;
const WEEK_Y  =   5;
const WEEK_DY =  20;

const TEXT_T = WEEK_Y + ROWS * WEEK_DY + 20;
const TEXT_L = WEEK_X;
const TEXT_R = WEEK_X + WEEKS * WEEK_DX;

const SUBJECT = ["Month", "Background", "Memory", "Processors",
//               "Future",
                 "Recapitulation",
                 "Vacation (etc.)", "Exercises", "", ""];

const WEEK = ["1", "2", "3", "4", "5", "6", "7", "8", "", "", "", "9", "10", "11", "12", "13", "14", "15"]

const ITEMS = 2;
// const TASKS = 21;	// Usually 20

const ITEM_1_X  = 120;
const ITEM_1_Y  = TEXT_T + 30
const ITEM_1_DX = 200;
const ITEM_1_DY =  50;
const ITEM_2_X  = 360;
const ITEM_2_Y  = TEXT_T + 20
const ITEM_2_DX = 100;
const ITEM_2_DY =  60;
const ITEM_3_X  = ITEM_1_X;
const ITEM_3_Y  =  90;
const ITEM_3_DX = ITEM_1_DX;
const ITEM_3_DY =  80;
/*
const ITEM_1_X  = 120;
const ITEM_1_Y  =  10;
const ITEM_1_DX = 200;
const ITEM_1_DY =  50;
const ITEM_2_X  = 360;
const ITEM_2_Y  =  10;
const ITEM_2_DX = 100;
const ITEM_2_DY = 160;
const ITEM_3_X  = ITEM_1_X;
const ITEM_3_Y  =  90;
const ITEM_3_DX = ITEM_1_DX;
const ITEM_3_DY =  80;
const ITEM_4_X  = ITEM_1_X;
const ITEM_4_Y  = 200
const ITEM_4_DX = 460;
const ITEM_4_DY =  20;
const ITEM_5_X  = ITEM_1_X;
const ITEM_5_Y  = 240;
const ITEM_5_DX = 180;
const ITEM_5_DY =  80;
const ITEM_6_X  = ITEM_5_X + ITEM_5_DX + 20;
const ITEM_6_Y  = ITEM_5_Y;
const ITEM_6_DX = 180;
const ITEM_6_DY =  80;
const ITEM_7_X  = ITEM_6_X + ITEM_6_DX + 20;
const ITEM_7_Y  = ITEM_6_Y;
const ITEM_7_DX =  60;
const ITEM_7_DY =  80;
const ITEM_8_X  =  40;
const ITEM_8_Y  =  10;
const ITEM_8_DX =  60;
const ITEM_8_DY = 310;
const ITEM_9_X  = 540;
const ITEM_9_Y  =  50;
const ITEM_9_R  =  40;
*/
var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

var state = 0;
var old_state = 0;

//var itemCount = 0;
var item = [];
var task = [];
var active = -1;		// Index of chosen task in array
var i;

task[0]  = new makeTask( 0, 0,  0.0, 4.0, "Yellow", "February");
task[1]  = new makeTask( 0, 0,  4.0, 8.2, "Coral", "March");
task[2]  = new makeTask( 0, 0,  8.2, 12.7, "Yellow", "April");
task[3]  = new makeTask( 0, 0, 12.7, 17.0, "Coral", "May");
task[4]  = new makeTask( 0, 0, 17.0, 18.0, "Yellow", "June");
task[5]  = new makeTask( 1, 1,  0,    1,   "LightBlue", "Intro");
task[6]  = new makeTask( 2, 2,  1,    4,   "LightGreen", "Memory");
task[7]  = new makeTask( 3, 2,  4,    5,   "Lime", "Disks");
task[8]  = new makeTask( 4, 3,  5,    9, "Bisque", "Single");
//task[9] = new makeTask(4, 4, 9, 10, "Bisque", "?!");
task[9]  = new makeTask(14, 5, 8, 11, "Lime", "Easter");
task[10] = new makeTask( 5, 3,  9, 10, "Pink", "Multi");
task[11] = new makeTask( 6, 3, 13, 14, "Pink", "proc");
//task[11] = new makeTask( 6, 4, 12, 13, "CornflowerBlue", "?");
task[12] = new makeTask( 0, 5, 15, 18, "Lime", "Exams.");
task[13] = new makeTask( 7, 4,  4,  5, "Khaki", "f/b");
task[14] = new makeTask( 8, 2, 14, 15, "LightGreen", "Mem");
task[15] = new makeTask( 9, 4, 14, 15, "Gold", "Rev.");
task[16] = new makeTask(10, 6,  1,  4, "LightGrey", "Ex. 1");
task[17] = new makeTask(11, 6,  4,  7, "Grey", "Ex. 2");
task[18] = new makeTask(12, 6,  7, 10, "LightGrey", "Ex.3");
task[19] = new makeTask(15, 2,  0,  1, "Lime", "Bus");
//task[20] = new makeTask(5, 3, 7, 8, "Pink", "Multi");
//task[20] = new makeTask( 0, 0,  0, 1.0, "Coral", "Jan");// January crept in!

item[0] = new makeItem(1, RECT, ITEM_1_X, ITEM_1_Y, ITEM_1_DX, ITEM_1_DY);
item[1] = new makeItem(2, RECT, ITEM_2_X, ITEM_2_Y, ITEM_2_DX, ITEM_2_DY);
/*
item[2] = new makeItem(3, RECT, ITEM_3_X, ITEM_3_Y, ITEM_3_DX, ITEM_3_DY);
item[3] = new makeItem(4, RECT, ITEM_4_X, ITEM_4_Y, ITEM_4_DX, ITEM_4_DY);
item[4] = new makeItem(5, RECT, ITEM_5_X, ITEM_5_Y, ITEM_5_DX, ITEM_5_DY);
item[5] = new makeItem(6, RECT, ITEM_6_X, ITEM_6_Y, ITEM_6_DX, ITEM_6_DY);
item[6] = new makeItem(7, RECT, ITEM_7_X, ITEM_7_Y, ITEM_7_DX, ITEM_7_DY);
item[7] = new makeItem(8, RECT, ITEM_8_X, ITEM_8_Y, ITEM_8_DX, ITEM_8_DY);
item[8] = new makeItem(9, CIRC, ITEM_9_X, ITEM_9_Y, ITEM_9_R,  0);
*/

drawAll();

//ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top; 

  active = -1;
  state = 0;			// Default
  if (in_area(PIC_L, PIC_T, PIC_R - PIC_L, PIC_B - PIC_T))
    {				// Coarse area filter
/*
//  for (i = 0; i < ITEMS; i++)
    for (i = 0; i < 2; i++)
      {
      switch (item[i].shape)
        {
        case RECT:
          if (in_area(item[i].x, item[i].y, item[i].dx, item[i].dy))
            {
            state = item[i].number;
            }
          break;
        case CIRC:
          if (in_circle(item[i].x, item[i].y, item[i].dx))
            {
            state = item[i].number;
            }
          break;
        }
      }
*/
    for (i = 0; i < task.length; i++)
      {
      if (in_area(WEEK_X + task[i].start * WEEK_DX,
                  WEEK_Y + task[i].row * WEEK_DY,
                 (task[i].end - task[i].start) * WEEK_DX,
                  WEEK_DY))
        {
        state = task[i].number;
        active = i;
        }
      }

    if (state != old_state)	// Redraw on change
      {
      drawAll();
      old_state = state;
      }
    }

  });

return;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function in_area(x, y, dx, dy)
{
return (mouse.x >= x) && (mouse.x <= (x + dx))
    && (mouse.y >= y) && (mouse.y <= (y + dy));
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function in_circle(x, y, r)
{
return (mouse.x - x) * (mouse.x - x) + (mouse.y - y) * (mouse.y - y) <= r * r;
}

//------------------------------------------------------------------------------

function makeItem(number, shape, x_org, y_org, x_dim, y_dim)
{
this.shape  = shape;
this.x      = x_org;
this.y      = y_org;
this.dx     = x_dim;
this.dy     = y_dim;
this.number = number;
}

//------------------------------------------------------------------------------

function makeTask(number, row, start, end, col, text)
{
this.number = number;
this.row    = row;
this.start  = start;
this.end    = end;
this.col    = col;
this.text   = text;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function drawAll()
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.clearRect(PIC_L, PIC_T, PIC_R - PIC_L, PIC_B - PIC_T);
//ctx.strokeRect(PIC_L, PIC_T, PIC_R - PIC_L, PIC_B - PIC_T);

drawGrid();
for (i = 0; i < TASKS; i++) drawTask(i);

drawApps(false);
drawCode(false);
/*
drawOS(false);
drawBus(false);
drawProc(false);
drawMem(false);
drawIO(false);
drawMon(false);
// Virtualisation?

drawBlob(false);
*/

if (active >= 0) drawBox(active);

switch (state)
  {
//case 1:  drawApps(true); break;
  case 1:
    textOut(1.25, "Context of the module"); 
    textOut(2.75, "Topic overview"); 
    break;
//case 2:  drawCode(true); break;
  case 2:
    textOut(1, "Memory hierarchy and technology"); 
    textOut(2, "Caches"); 
    textOut(3, "MMU etc."); 
    break;
  case 3:
    textOut(2, "Disks and filing"); 
//  textOut(2, "TWO LINES"); 
    break;
  case 4:
    textOut(0.5, "Pipelining & Data dependencies");
    textOut(1.5, "Control dependencies & Superscalar"); 
    textOut(2.5, "Reorder Buffer & Out-of-Order Execution"); 
//    textOut(3.5, "Precise exceptions"); 
    break;
  case 5:
    textOut(1.25, "Out of order execution"); 
    textOut(2.75, "Multithreading");; 
    break;
  case 6:
    textOut(2, "Multicore"); 
    break;
  case 7:
    textOut(2, "Feedback on memory and system architecture"); 
    break;
  case 8:
    textOut(1.25, "Memory consistency"); 
    textOut(2.75, "Cache coherency"); 
    break;
  case 9:
    textOut(2, "Revision examples"); 
    break;
  case 10:
    textOut(1.25, "Cache Modelling"); 
    textOut(2.75, "Deadline: by 28th February"); 
    break;
  case 11:
    textOut(1.00, "Code Tracing"); 
    textOut(2.00, "& Branch Prediction"); 
    textOut(3.00, "Deadline: by 21st March"); 
    break;
  case 12:
    textOut(1.25, "Matrix Multiplication"); 
    textOut(2.75, "Deadline: by 11th April"); 
    break;
  case 13:
    textOut(1.25, "Leftover :-)"); 
    textOut(2.75, "Deadline before 12th Never"); 
    break;
  case 14:
    textOut(1, "Bank holidays on:"); 
    textOut(2, "Friday 18th April"); 
    textOut(3, "Monday 21st April"); 
    break
  case 15:
    textOut(1.25, "Address spaces"); 
    textOut(2.75, "Buses"); 
    break;
  default: break;
  }


//ctx.fillStyle = "Black";
//ctx.fillText(state, 20, 20);	// Debug @@@


ctx.restore();

return;
}

//------------------------------------------------------------------------------

function drawGrid()
{
var i;

ctx.save();

ctx.textAlign = "right";
ctx.font = "16px Calibri";
ctx.fillStyle = "Black";

for (i = 0; i < ROWS; i++)
  {
  ctx.fillText(SUBJECT[i], WEEK_X - 10, WEEK_Y + i * WEEK_DY + 15);
  }

ctx.strokeStyle = "Grey";

for (i = 0; i <= WEEKS; i++)
  {
  ctx.beginPath();
  ctx.moveTo(WEEK_X + i * WEEK_DX, WEEK_Y);
  ctx.lineTo(WEEK_X + i * WEEK_DX, WEEK_Y + ROWS * WEEK_DY);
  ctx.stroke();
  }

ctx.textAlign = "center";
for (i = 0; i < WEEKS; i++)
  ctx.fillText(WEEK[i], WEEK_X + (i+0.5) * WEEK_DX, WEEK_Y + ROWS * WEEK_DY + 15);

ctx.restore();
}

//------------------------------------------------------------------------------

function drawTask(t)
{
var i;

ctx.save();

ctx.fillStyle = task[t].col;
ctx.fillRect(WEEK_X + task[t].start * WEEK_DX, WEEK_Y + task[t].row * WEEK_DY,
             (task[t].end - task[t].start) * WEEK_DX, WEEK_DY);

ctx.fillStyle = "Black";
ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.fillText(task[t].text,
             WEEK_X + (task[t].start + task[t].end) * WEEK_DX / 2,
             WEEK_Y + task[t].row * WEEK_DY + 15);

ctx.restore();
}

//------------------------------------------------------------------------------

function drawBox(t)
{
ctx.save();

//ctx.textAlign = "center";
//ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = "Bisque";

ctx.beginPath();
ctx.moveTo(WEEK_X + (task[t].start + task[t].end) * WEEK_DX / 2,
           WEEK_Y + (task[t].row + 1) * WEEK_DY);

ctx.lineTo(WEEK_X + (task[t].start + task[t].end) * WEEK_DX / 2 + 10,
           TEXT_T);

ctx.lineTo(TEXT_R, TEXT_T);

ctx.lineTo(TEXT_R, TEXT_T+100);	// @@@
ctx.lineTo(TEXT_L, TEXT_T+100);	// @@@

ctx.lineTo(TEXT_L, TEXT_T);

ctx.lineTo(WEEK_X + (task[t].start + task[t].end) * WEEK_DX / 2 - 10,
           TEXT_T);

ctx.closePath();

ctx.fill();
ctx.stroke();

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function textOut(line, text)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";
ctx.fillStyle = "Black";

ctx.fillText(text, (TEXT_L + TEXT_R) / 2, TEXT_T + 15 + 20 * line);


ctx.restore();
}


//------------------------------------------------------------------------------

function drawApps(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Cyan";

if (chosen)
  {
  ctx.fillRect(ITEM_1_X, ITEM_1_Y, ITEM_1_DX, ITEM_1_DY);
  ctx.strokeRect(ITEM_1_X, ITEM_1_Y, ITEM_1_DX, ITEM_1_DY);
  ctx.fillStyle = "Black";

  ctx.fillText("Orientation", ITEM_1_X + ITEM_1_DX/2, ITEM_1_Y + ITEM_1_DY/2 + 5);
  }
/*
else
  ctx.fillText("Applications", ITEM_1_X + ITEM_1_DX/2, ITEM_1_Y + ITEM_1_DY/2 + 5);
*/
ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawCode(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Yellow";

if (chosen)
  {
  ctx.fillRect(ITEM_2_X, ITEM_2_Y, ITEM_2_DX, ITEM_2_DY);
  ctx.strokeRect(ITEM_2_X, ITEM_2_Y, ITEM_2_DX, ITEM_2_DY);

  ctx.fillStyle = "Black";

  ctx.fillText("Illustration", ITEM_2_X + ITEM_2_DX/2, ITEM_2_Y + ITEM_2_DY/2 - 5);
  ctx.fillText("here", ITEM_2_X + ITEM_2_DX/2, ITEM_2_Y + ITEM_2_DY/2 + 15);
  }
/*
else
  {
  ctx.fillText("Compilation", ITEM_2_X + ITEM_2_DX/2, ITEM_2_Y + ITEM_2_DY/2 + 5);
  }
*/
ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawOS(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";

ctx.fillStyle = chosen ? "Red" : "Lime";

ctx.fillRect(ITEM_3_X, ITEM_3_Y, ITEM_3_DX, ITEM_3_DY);
ctx.strokeRect(ITEM_3_X, ITEM_3_Y, ITEM_3_DX, ITEM_3_DY);

ctx.fillStyle = "Black";

if (chosen)
  {
  ctx.fillText("Operating system", ITEM_3_X + ITEM_3_DX/2, ITEM_3_Y + ITEM_3_DY/2 + 5);
  }
else
  {
  ctx.fillText("Operating system", ITEM_3_X + ITEM_3_DX/2, ITEM_3_Y + ITEM_3_DY/2 + 5);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawProc(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Lime";

ctx.fillRect(ITEM_5_X, ITEM_5_Y, ITEM_5_DX, ITEM_5_DY);
ctx.strokeRect(ITEM_5_X, ITEM_5_Y, ITEM_5_DX, ITEM_5_DY);

ctx.fillStyle = "Black";

if (chosen)
  {
  ctx.fillText("Pipelines", ITEM_5_X + ITEM_5_DX/2, ITEM_5_Y + ITEM_5_DY/2 - 15);
  ctx.fillText("Hazards", ITEM_5_X + ITEM_5_DX/2, ITEM_5_Y + ITEM_5_DY/2 + 5);
  ctx.fillText("Threading", ITEM_5_X + ITEM_5_DX/2, ITEM_5_Y + ITEM_5_DY/2 + 25 );
  }
else
  {
  ctx.fillText("Processor", ITEM_5_X + ITEM_5_DX/2, ITEM_5_Y + ITEM_5_DY/2 + 5);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawMem(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Yellow";

ctx.fillRect(ITEM_6_X, ITEM_6_Y, ITEM_6_DX, ITEM_6_DY);
ctx.strokeRect(ITEM_6_X, ITEM_6_Y, ITEM_6_DX, ITEM_6_DY);

ctx.fillStyle = "Black";

if (chosen)
  {
  ctx.fillText("Technology implications", ITEM_6_X + ITEM_6_DX/2, ITEM_6_Y + ITEM_6_DY/2 - 5);
  ctx.fillText("Caches", ITEM_6_X + ITEM_6_DX/2, ITEM_6_Y + ITEM_6_DY/2 + 15);
  }
else
  {
  ctx.fillText("Memory", ITEM_6_X + ITEM_6_DX/2, ITEM_6_Y + ITEM_6_DY/2 + 5);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawIO(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Yellow";

ctx.fillRect(ITEM_7_X, ITEM_7_Y, ITEM_7_DX, ITEM_7_DY);
ctx.strokeRect(ITEM_7_X, ITEM_7_Y, ITEM_7_DX, ITEM_7_DY);

ctx.fillStyle = "Black";

if (chosen)
  {
  ctx.fillText("Not", ITEM_7_X + ITEM_7_DX/2, ITEM_7_Y + ITEM_7_DY/2 - 15);
  ctx.fillText("much", ITEM_7_X + ITEM_7_DX/2, ITEM_7_Y + ITEM_7_DY/2 + 5);
  ctx.fillText("to say", ITEM_7_X + ITEM_7_DX/2, ITEM_7_Y + ITEM_7_DY/2 + 25);
  }
else
  {
  ctx.fillText("I/O", ITEM_7_X + ITEM_7_DX/2, ITEM_7_Y + ITEM_7_DY/2 + 5);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawBus(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Yellow";

ctx.fillRect(ITEM_4_X, ITEM_4_Y, ITEM_4_DX, ITEM_4_DY);
ctx.strokeRect(ITEM_4_X, ITEM_4_Y, ITEM_4_DX, ITEM_4_DY);

ctx.fillStyle = "Black";

if (chosen)
  {
  ctx.fillText("Bandwidth (etc.)", ITEM_4_X + ITEM_4_DX/2, ITEM_4_Y + ITEM_4_DY/2 + 5);
  }
else
  {
  ctx.fillText("Bus", ITEM_4_X + ITEM_4_DX/2, ITEM_4_Y + ITEM_4_DY/2 + 5);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawMon(chosen)
{
ctx.save();

ctx.textAlign = "center";
ctx.font = "16px Calibri";

ctx.strokeStyle = "Black";
ctx.fillStyle = chosen ? "Red" : "Yellow";

ctx.fillRect(ITEM_8_X, ITEM_8_Y, ITEM_8_DX, ITEM_8_DY);
ctx.strokeRect(ITEM_8_X, ITEM_8_Y, ITEM_8_DX, ITEM_8_DY);

ctx.fillStyle = "Black";

if (chosen)
  {
  ctx.fillText("Monitor", ITEM_8_X + ITEM_8_DX/2, ITEM_8_Y + ITEM_8_DY/2 + 5);
  }
else
  {
  ctx.fillText("Monitor", ITEM_8_X + ITEM_8_DX/2, ITEM_8_Y + ITEM_8_DY/2 + 5);
  }

ctx.restore();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawBlob(chosen)
{
if (chosen)
  circle(ITEM_9_X, ITEM_9_Y, ITEM_9_R, "Red", 1);
else
  circle(ITEM_9_X, ITEM_9_Y, ITEM_9_R, "Yellow", 1);
}

//------------------------------------------------------------------------------

function circle(cx, cy, r, col, stroke)
{
ctx.save(); // save state
ctx.beginPath();
ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
ctx.fillStyle = col;
ctx.fill();
if (stroke > 0)
  {
  ctx.strokeStyle = "black";
  ctx.lineWidth = stroke;
  ctx.stroke();
  }
ctx.restore(); // restore to original state
}

//------------------------------------------------------------------------------

}

//==============================================================================
