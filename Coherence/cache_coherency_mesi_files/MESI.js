// Quick demo. of MESI protocol
// J. Garside - Dec. 2020
// (Not tidied up!)
// Line replacement is strictly cyclic: 'better' to search for an invalid line
//  first. @@@

function run_MESI(canvas)
{
const labels = ["0", "1", "2", "3", "4", "5", "6", "7",
                "8", "9", "A", "B", "C", "D", "E", "F"];
const state  = ["M", "E", "S", "I"];
const MODIFIED  = 0;
const EXCLUSIVE = 1;
const SHARED    = 2;
const INVALID   = 3;
var replace = [0, 0, 0, 0];

var caches = createArray(4, 4);
var states = createArray(4, 4);
var memory = [];
var area   = [];

var message_y;

var ctx = canvas.getContext('2d');
var mouse  = { x : 0, y : 0 };

var i, j;

for (i = 0; i < 4; i++)
  {
  caches[i][-1] = -1;
  for (j = 0; j < 4; j++)
    {
    caches[i][j] = -1;
    states[i][j] = INVALID;
    }
  }

for (i = 0; i < 0x10; i++) memory[i] = true;

area[0] = new defineArea( 20, 180, 20, 100);
area[1] = new defineArea(220, 380, 20, 100);
area[2] = new defineArea(420, 580, 20, 100);
area[3] = new defineArea(620, 780, 20, 100);

drawAll();

ctx.canvas.addEventListener('click', f_click);

ctx.canvas.addEventListener('mousemove', function(event)
  {
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  });

return;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createArray(length)
{
var arr = new Array(length || 0),
i = length;

if (arguments.length > 1)
  {
  var args = Array.prototype.slice.call(arguments, 1);
  while(i--) arr[length-1 - i] = createArray.apply(this, args);
  }

return arr;
}

//------------------------------------------------------------------------------

function f_click()
{
var i, n, w, x, y;

for (i = 0; i < 4; i++)
  if ((mouse.x >= area[i].left) && (mouse.x <= area[i].right)
   && (mouse.y >= area[i].top)  && (mouse.y <= area[i].bottom))
    {
    x = mouse.x - area[i].left;
    y = mouse.y - area[i].top;
    wr = (x > 80)
    if (wr) x = x - 80;
    n = 4 * Math.floor(y/20) + Math.floor(x/20);
    f_cache(i, wr, n);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function defineArea(l, r, t, b)	// Presumably there's a more direct way ...
{
this.left   = l;
this.right  = r;
this.top    = t;
this.bottom = b;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function f_cache(proc, wr, line)
{
var i, tag, found;
var finds = [];

message_y = 270;		// Start point for messages
ctx.clearRect(200, 255, 400, 50);
//ctx.strokeRect(200, 255, 400, 50);

found = -1;
for (i = 0; i < 4; i++)		// Search for occurences of line
  {
  finds[i] = find(i, line);
  if (i == proc) tag = finds[i];	// Note own result
  else
    if (finds[i] >= 0) found = finds[i];// One copy to snoop from
  }

if (tag < 0)			// Not found
  {
  if (states[proc][replace[proc]] == MODIFIED)
    {
    memory[caches[proc][replace[proc]]] = true;
    ctx.textAlign = "center";
    ctx.fillStyle = "Blue";
    ctx.font = "16px Calibri";
    ctx.fillText("Capacity flush: line "+labels[caches[proc][replace[proc]]]+
                 " from processor "+proc, 400, message_y);
    message_y = message_y + 20;
    }

  if (wr)
    {
    snoop(wr, proc, finds, line);
    states[proc][replace[proc]] = MODIFIED;
    memory[line] = false;
    }
  else
    {
    snoop(wr, proc, finds, line);
    if (found >= 0) states[proc][replace[proc]] = SHARED;
    else            states[proc][replace[proc]] = EXCLUSIVE;
    }

  caches[proc][replace[proc]] = line;
  replace[proc] = (replace[proc]+1) & 3;
  }
else				// Found
  {
  if (wr)			// Reads bland unless invalid (above)
    {
    if (states[proc][tag] == SHARED) snoop(wr, proc, finds, line);
    states[proc][tag] = MODIFIED;
    memory[line] = false;
    }
  }

drawCaches(0, 130, 200, false);

drawMemory(0, 210, false);

/*
ctx.save();				// DEBUG @@@
ctx.clearRect(0, 187, 350, 20);
ctx.textAlign = "left";
ctx.font = "16px Courier new";
ctx.fillText((wr?"Write ":"Read ")+proc+" line "+line, 10, 200);
//ctx.fillText("Test message", 10, 200);
ctx.fillText(finds[0], 200, 200);
ctx.fillText(finds[1], 230, 200);
ctx.fillText(finds[2], 260, 200);
ctx.fillText(finds[3], 290, 200);
ctx.fillText(tag, 330, 200);
ctx.restore();
*/
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function find(proc, line)
{
var i, n;

n = -1;
for (i = 0; i < 4; i++)
  if ((states[proc][i] != INVALID) && (caches[proc][i] == line)) n = i;
return n
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function snoop(type, proc, finds, line)
{
var i;

for (i = 0; i < 4; i++)
  {
  if (states[i][finds[i]] == MODIFIED)
    {
    memory[line] = true;
    ctx.textAlign = "center";
    ctx.fillStyle = "Blue";
    ctx.font = "16px Calibri";
    ctx.fillText("Memory updated: line "+labels[line]+" from processor "+i,
                  400, message_y);
    message_y = message_y + 20;
    }

  if ((i != proc) && (finds[i] >= 0))	// Found in other cache
    states[i][finds[i]] = wr ? INVALID : SHARED;
  }
return;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function drawAll()
{
ctx.save();

//ctx.clearRect(0, 0, 620, 200);
//ctx.strokeRect(0, 0, 620, 200);

drawProc(0,  20, 20);
drawProc(1, 220, 20);
drawProc(2, 420, 20);
drawProc(3, 620, 20);

drawCaches(0, 130, 200, true);

drawMemory(0, 210, true);

ctx.restore();

return;
}

//------------------------------------------------------------------------------

function drawProc(proc, x, y)
{
var i;

function drawArray(x, y, col)
  {
  var i, j, k;

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = col;
  ctx.fillRect(x, y, 80, 80);
  ctx.strokeStyle = "Grey";
  ctx.font = "12px Courier new";
  ctx.fillStyle = "Black";

  k = 0;
  for  (j = 0; j < 4; j++)
    for  (i = 0; i < 4; i++)
      {
      ctx.strokeRect(x+20*i, y+20*j, 20, 20);
      ctx.fillText(label(k), x+10+20*i, y+14+20*j);
      k++;
      }

  ctx.restore();
  }


drawArray(x, y, "Lime")
drawArray(x+80, y, "Coral")
ctx.strokeStyle = "Black";
ctx.strokeRect(x, y, 160, 80);

ctx.textAlign = "center";
ctx.fillStyle = "Black";
ctx.font = "16px Calibri";
ctx.fillText("Processor " + proc, x+80, 13);
}

//------------------------------------------------------------------------------

function drawCaches(x, y, dx, first)
{
var i;

ctx.save();
ctx.clearRect( x, y-3, 4*dx, 46);
//ctx.strokeRect(x, y-3, 4*dx, 46);
ctx.restore();

for (i = 0; i < 4; i++) drawCache(i, x+20+i*dx, y, first);
}


function drawCache(proc, x, y, first)
{
var i;

ctx.save();
ctx.textAlign = "center";

if (first)
  {
  ctx.font = "16px Calibri";
  ctx.fillText("Cache " + proc, x+80, y-7);
  }

ctx.font = "16px Courier new";
ctx.strokeStyle = "Grey";

for  (i = 0; i < 4; i++)
  {
  switch (states[proc][i])
    {
    case MODIFIED:  ctx.fillStyle = "Gold";        break;
    case EXCLUSIVE: ctx.fillStyle = "SpringGreen"; break;
    case SHARED:    ctx.fillStyle = "PaleGreen";   break;
    case INVALID:   ctx.fillStyle = "Bisque";      break;
    default:        ctx.fillStyle = "White";       break;
    }

  ctx.fillRect(x+i*40, y, 40, 40);
  ctx.strokeRect(x+i*40, y, 40, 40);

  if (states[proc][i] == INVALID) ctx.fillStyle = "Grey";
  else                            ctx.fillStyle = "Black";

  ctx.fillText(label(caches[proc][i]), x+20+i*40, y+14);
  ctx.fillStyle = "Black";
  ctx.fillText(state[states[proc][i]], x+20+i*40, y+34);
  }  

ctx.strokeStyle = "Black";
ctx.strokeRect(x, y, 160, 40);
ctx.restore();
}

function drawMemory(x, y, first)
{
var i, dx;

ctx.save();

ctx.textAlign = "center";
if (first)
  {
  ctx.font = "16px Calibri";
  ctx.fillText("Memory", x+20+760/2, y-7);
  }

ctx.clearRect(0, y-3, 800, 46);
//ctx.strokeRect(0, y-3, 800, 46);

dx = 760/0x10;

ctx.strokeStyle = "Grey";
ctx.font = "20px Courier new";

for (i = 0; i < 0x10; i++)
  {
  if (memory[i]) ctx.fillStyle = "PaleGreen";
  else           ctx.fillStyle = "Bisque";
  ctx.fillRect(20 + i*dx, y, dx, 40);
  ctx.strokeRect(20 + i*dx, y, dx, 40);

  ctx.fillStyle = "Black";
  ctx.fillText(labels[i], 20+dx/2+i*dx, y+26);
  }

ctx.strokeRect(20, y, 760, 40);

ctx.restore();

}

//------------------------------------------------------------------------------

function label(x)
{ if (x < 0) return "?"; else return labels[x]; }

//------------------------------------------------------------------------------

}

//==============================================================================
