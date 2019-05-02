var canvas = document.getElementById("map");
canvas.style.cursor = "grab";
var ctx = canvas.getContext("2d");

console.clear();

var scale = 35;

/* Scales:
 *	- Tiny: 	14px (50x50)
 *	- Small: 	20px (35x35)
 *	- Regular: 	35px (20x20)
 *	- Large: 	50px (14x14)
 *	- Huge: 	70px (10x10)
 */

var mouseX = null,
    mouseY = null;
 
var xShift = 0,
	yShift = 0;
	
var hover = false;
	
var mode = "move";

var rivals = false;

var limitMove = false;
var outOfBounds = false;

var brush = false;

var background = "dimgrey";

var paint = [];

var names = false;

var label = false;

var letters = ["A", "B", "C", "D", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ"];

var paintLabel = 0;
var forceLine = false;
var startX = null, startY = null;
var forceX = null, forceY = null;

var mapImg = new Image();
mapImg.src = "";

var fReader = new FileReader();

fReader.onloadend = function(event){
    mapImg.src = event.target.result;
}

var sizeNumber = new Map();
sizeNumber.set("t", scale/7);
sizeNumber.set("s", scale*2/7);
sizeNumber.set("m", scale*3/7);
sizeNumber.set("l", scale*6/7);
sizeNumber.set("h", scale*9/7);
sizeNumber.set("g", scale*13/7);

function Creature(x, y, color, name, size, speed) {
    this.x = x;
    this.y = y;
    this.xGoal = x;
    this.yGoal = y;
    this.mvX;
    this.mvY;
    this.mvW;
    this.a = 0;
    this.z = 0;
    this.size = size;
    this.r = sizeNumber.get(this.size);
    this.rGoal = sizeNumber.get(this.size);
    this.color = color;
    this.name = name;
    this.speed = speed;
    this.notes = "";
    this.selected = false;
    this.held = false;
}

Creature.prototype.draw = function() {
	ctx.fillStyle = "rgba(0,0,0,0.25)";
	ctx.beginPath();
	ctx.arc(this.x - this.z - this.a, this.y + this.z + this.a, this.r, Math.PI * 2, false);
	ctx.fill();
	
    ctx.globalAlpha = 0.8;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.125)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
    ctx.fill();
    
    ctx.globalAlpha = 0.5;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x + this.r / 8, this.y - this.r / 8, this.r * 13 / 16, Math.PI * 2, false);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(this.x + this.r * 2 / 5, this.y - this.r * 2 / 5, this.r / 4, Math.PI * 2, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.r / 2, this.y - this.r / 2, this.r / 8, Math.PI * 2, false);
    ctx.fill();
    
    if (this.selected) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        if (this.size == "t") {
            ctx.beginPath();
            ctx.moveTo(this.x - scale/4, this.y - scale*3/24); //35/4, //35/6
            ctx.lineTo(this.x - scale/4, this.y - scale/4);
            ctx.lineTo(this.x - scale*3/24, this.y - scale/4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x - scale/4, this.y + scale*3/24); //35/4, //35/6
            ctx.lineTo(this.x - scale/4, this.y + scale/4);
            ctx.lineTo(this.x - scale*3/24, this.y + scale/4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale/4, this.y - scale*3/24); //35/4, //35/6
            ctx.lineTo(this.x + scale/4, this.y - scale/4);
            ctx.lineTo(this.x + scale*3/24, this.y - scale/4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale/4, this.y + scale*3/24); //35/4, //35/6
            ctx.lineTo(this.x + scale/4, this.y + scale/4);
            ctx.lineTo(this.x + scale*3/24, this.y + scale/4);
            ctx.stroke();
        }
        else if (this.size == "m" || this.size == "s") {
            ctx.beginPath();
            ctx.moveTo(this.x - scale/2, this.y - scale/3);
            ctx.lineTo(this.x - scale/2, this.y - scale/2);
            ctx.lineTo(this.x - scale/3, this.y - scale/2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x - scale/2, this.y + scale/3);
            ctx.lineTo(this.x - scale/2, this.y + scale/2);
            ctx.lineTo(this.x - scale/3, this.y + scale/2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale/2, this.y - scale/3);
            ctx.lineTo(this.x + scale/2, this.y - scale/2);
            ctx.lineTo(this.x + scale/3, this.y - scale/2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale/2, this.y + scale/3);
            ctx.lineTo(this.x + scale/2, this.y + scale/2);
            ctx.lineTo(this.x + scale/3, this.y + scale/2);
            ctx.stroke();
        }
        else if (this.size == "l") {
            ctx.beginPath();
            ctx.moveTo(this.x - scale, this.y - scale/7*5);
            ctx.lineTo(this.x - scale, this.y - scale);
            ctx.lineTo(this.x - scale/7*5, this.y - scale);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x - scale, this.y + scale/7*5);
            ctx.lineTo(this.x - scale, this.y + scale);
            ctx.lineTo(this.x - scale/7*5, this.y + scale);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale, this.y - scale/7*5);
            ctx.lineTo(this.x + scale, this.y - scale);
            ctx.lineTo(this.x + scale/7*5, this.y - scale);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale, this.y + scale/7*5);
            ctx.lineTo(this.x + scale, this.y + scale);
            ctx.lineTo(this.x + scale/7*5, this.y + scale);
            ctx.stroke();
        }
        else if (this.size == "h") {//52.5 = scale * 1.5, 37.5 = 
            ctx.beginPath();
            ctx.moveTo(this.x - scale*1.5, this.y - scale);
            ctx.lineTo(this.x - scale*1.5, this.y - scale*1.5);
            ctx.lineTo(this.x - scale, this.y - scale*1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x - scale*1.5, this.y + scale);
            ctx.lineTo(this.x - scale*1.5, this.y + scale*1.5);
            ctx.lineTo(this.x - scale, this.y + scale*1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale*1.5, this.y - scale);
            ctx.lineTo(this.x + scale*1.5, this.y - scale*1.5);
            ctx.lineTo(this.x + scale, this.y - scale*1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale*1.5, this.y + scale);
            ctx.lineTo(this.x + scale*1.5, this.y + scale*1.5);
            ctx.lineTo(this.x + scale, this.y + scale*1.5);
            ctx.stroke();
        }
        else if (this.size == "g") {
            ctx.beginPath();
            ctx.moveTo(this.x - scale*2, this.y - scale/7*10);
            ctx.lineTo(this.x - scale*2, this.y - scale*2);
            ctx.lineTo(this.x - scale/7*10, this.y - scale*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x - scale*2, this.y + scale/7*10);
            ctx.lineTo(this.x - scale*2, this.y + scale*2);
            ctx.lineTo(this.x - scale/7*10, this.y + scale*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale*2, this.y - scale/7*10);
            ctx.lineTo(this.x + scale*2, this.y - scale*2);
            ctx.lineTo(this.x + scale/7*10, this.y - scale*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + scale*2, this.y + scale/7*10);
            ctx.lineTo(this.x + scale*2, this.y + scale*2);
            ctx.lineTo(this.x + scale/7*10, this.y + scale*2);
            ctx.stroke();
        }
    }
}

Creature.prototype.align = function() {
    if (this.size == "t") {
        this.xGoal = Math.round((this.x - (scale/4)) / (scale/2)) * (scale/2) + (scale/4);
        this.yGoal = Math.round((this.y - (scale/4)) / (scale/2)) * (scale/2) + (scale/4);
    } else if (this.size == "l" || this.size == "g") {
        this.xGoal = Math.round(this.x / scale) * scale;
        this.yGoal = Math.round(this.y / scale) * scale;
    } else {
        this.xGoal = Math.round((this.x - (scale/2)) / scale) * scale + (scale/2);
        this.yGoal = Math.round((this.y - (scale/2)) / scale) * scale + (scale/2);
    }
}

Creature.prototype.update = function() {
    if (this.x != this.xGoal || this.y != this.yGoal) {
        this.x -= 5 * Math.cos(Math.atan2(this.y - this.yGoal, this.x - this.xGoal));
        this.y -= 5 * Math.sin(Math.atan2(this.y - this.yGoal, this.x - this.xGoal));
        if (Math.pow(Math.pow(this.x - this.xGoal, 2) + Math.pow(this.y - this.yGoal, 2), 0.5) < 3) {
            this.x = this.xGoal;
            this.y = this.yGoal;
        }
    }
    if (this.z > 0) this.z--;
    if (this.r > this.rGoal) this.r--;
    else if (this.r < this.rGoal) this.r++;
    if (Math.abs(this.r - this.rGoal) < 1) this.r = this.rGoal;
    if (limitMove) {
    	var mvBonus = scale;
    	if (this.size == "l") mvBonus = scale * 2;
    	else if (this.size == "h") mvBonus = scale * 3;
    	else if (this.size == "g") mvBonus = scale * 4;
    	this.mvW = this.speed / 5 * scale * 2 + mvBonus;
    	this.mvX = Math.floor((this.x - this.r) / scale) * scale - (this.speed / 5 * scale);
    	this.mvY = Math.floor((this.y - this.r) / scale) * scale - (this.speed / 5 * scale);
    }
}

Creature.prototype.display = function() {
	document.getElementById("name").value = this.name;
	document.getElementById("size").value = this.size;
	document.getElementById("color").value = this.color;
	document.getElementById("speed").value = this.speed;
	document.getElementById("playerAlt").value = this.a;
	document.getElementById('altLabel').innerHTML = 'Altitude: ' + this.a;
	document.getElementById("notes").value = this.notes;
}

Creature.prototype.resize = function() {
	this.size = document.getElementById('size').value;
    this.rGoal = sizeNumber.get(this.size);
    this.align();
}

Creature.prototype.recolor = function() {
	this.color = document.getElementById('color').value;
}

var players = [];

players[players.length] = new Creature(332.5, 332.5, "navy", "Alkas", "m", 30);
players[players.length] = new Creature(367.5, 332.5, "#4b784b", "Ploqwat", "m", 30);
players[players.length] = new Creature(332.5, 367.5, "#36393e", "Thia", "m", 35);
players[players.length] = new Creature(306.25, 341.25, "white", "A'chuan", "t", 50);
players[players.length] = new Creature(306.25, 358.75, "saddlebrown", "Basil", "t", 60);

var npcs = new Map();

npcs.set("Aatzer", new Creature(367.5, 367.5, "firebrick", "Aatzer", "m", 30));
npcs.set("Magann", new Creature(367.5, 367.5, "steelblue", "Magann", "m", 30));

function addCreature () {
	players[players.length] = new Creature(scale/2, scale/2, "red", "New Creature", "m", 30);
}

function deleteCreature () {
	if (players[selected].selected) {
		players.splice(selected,1);
		if (selected == players.length) selected--;
	}
}

function addNPC (name) {
	players[players.length] = npcs.get(name);
	players[players.length - 1].rGoal = sizeNumber.get(players[players.length - 1].size);
	players[players.length - 1].align();
}

function promptNPC () {
	var start = new Map();
	start.set("t", scale * 3 / 4);
	start.set("s", scale / 2);
	start.set("m", scale / 2);
	start.set("l", scale);
	start.set("h", scale * 3 / 2);
	start.set("g", scale * 2);
	var valid = false;
	var name = prompt("What is this NPC's name?");
	var size = prompt("What size is this NPC?").toLowerCase()[0];
	while (!valid) {
		switch (size) {
			case "t":
			case "s":
			case "m":
			case "l":
			case "h":
			case "g":
				valid = true;
				break;
			default:
				size = prompt("Please enter a valid size").toLowerCase()[0];
				break;
		}
	}
	var color = prompt("What color represents this NPC?");
	var speed = parseInt(prompt("What is this NPC's speed?"));
	while (speed == NaN) speed = parseInt(prompt("Please enter a valid speed"));
	players[players.length] = new Creature(start.get(size), start.get(size), color, name, size, speed);
}

var presets = new Map();

/*presets.set("Coruscare", [20, "images/Airship.png",
	[270, 190, "#822222", "Ophelia", "m", 40],
	[270, 230, "#bad8aa", "Ras", "m", 30],
	[310, 230, "#faa61a", "Teno", "m", 30],
	[310, 190, "purple", "Naivara", "m", 30],
	[470, 70, "fuchsia", "Rolen", "m", 30],
	[550, 90, "violet", "Crew Member", "m", 30],
	[230, 590, "violet", "Crew Member", "m", 30],
	[250, 590, "violet", "Crew Member", "m", 30],
	[550, 450, "violet", "Crew Member", "m", 30],
	[390, 150, "violet", "Crew Member", "m", 30],
	[490, 50, "violet", "Crew Member", "m", 30],
	[330, 590, "violet", "Crew Member", "m", 30],
	[210, 630, "violet", "Crew Member", "m", 30],
	[170, 390, "violet", "Crew Member", "m", 30],
	[250, 630, "violet", "Crew Member", "m", 30],
	[270, 630, "violet", "Crew Member", "m", 30],
	[570, 70, "violet", "Crew Member", "m", 30],
	[210, 250, "violet", "Crew Member", "m", 30],
	[330, 630, "violet", "Crew Member", "m", 30]
]);*/

function usePreset (name) {
	preset = presets.get(name);
	document.getElementById("scale").value = preset[0];
	updateScale();
	mapImg.src = preset[1];
	players = [];
	for (i = 2; i < preset.length; i++) {
		players[players.length] = new Creature(preset[i][0], preset[i][1], preset[i][2], preset[i][3], preset[i][4], preset[i][5]);
	}
	paint = [];
}

var selected = null;
var held = null;

function swapMode() {
	if (mode == "move" || mode == "walk") {
		if (selected != null) players[selected].selected = false;
		selected = null;
		document.getElementById("name").value = "None selected";
		document.getElementById("size").value = "t";
		document.getElementById("color").value = "white";
		document.getElementById("notes").innerHTML = "";
		mode = "paint";
		document.getElementById("mode").innerHTML = "Mode: Paint";
		document.getElementById("modeButton").innerHTML = "Move Mode";
		document.getElementById("paintControls").style.display = "block";
		document.getElementById("creatureStats").style.display = "none";
		canvas.style.cursor = "crosshair";

	} else {
		mode = "move";
		brush = false;
		document.getElementById("mode").innerHTML = "Mode: Move";
		document.getElementById("modeButton").innerHTML = "Paint Mode";
		document.getElementById("paintControls").style.display = "none";
		document.getElementById("creatureStats").style.display = "block";
		canvas.style.cursor = "grab";
	}
}

function updateScale() {
	scale = parseInt(document.getElementById("scale").value);
	sizeNumber.set("t", scale/7);
	sizeNumber.set("s", scale*2/7);
	sizeNumber.set("m", scale*3/7);
	sizeNumber.set("l", scale*6/7);
	sizeNumber.set("h", scale*9/7);
	sizeNumber.set("g", scale*13/7);
	for (i = 0; i < players.length; i++) {
    	players[i].rGoal = sizeNumber.get(players[i].size);
		players[i].align();
		//players[i].update();
	}
}

function undoPaint() {
	var i = paint.length-1;
	if (i > 0) {
		var flag = paint[i][4];
		while (i >= 0 && paint[i][4] == flag)
			paint.splice(i--, 1);
	}
}

setInterval(draw, 20);
var ticker = 0;

function draw() {
    //Draw background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 700, 700);
    
    if (mapImg.src != null) {
    	ctx.drawImage(mapImg, 0, 0);
    }
    
    //Paint
    for (i = 0; i < paint.length; i++) {
        ctx.fillStyle = paint[i][3];
        ctx.beginPath();
        ctx.arc(paint[i][0], paint[i][1], paint[i][2], Math.PI * 2, false);
        ctx.fill();
    }
    
    if (mode == "paint") {
		ctx.fillStyle = "rgba(25, 25, 25, 0.25)";
		ctx.beginPath();
		ctx.arc(mouseX, mouseY, document.getElementById("paintSize").value, Math.PI * 2, false);
		ctx.fill();
	}

    //Draw grid
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.5;
    for (i = 0; i < (700 / scale) - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(0, scale + i * scale);
        ctx.lineTo(700, scale + i * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(scale + i * scale, 0);
        ctx.lineTo(scale + i * scale, 700);
        ctx.stroke();
    }
    
    //Highlight and cursor for walking
    if (mode == "walk") {
		ctx.fillStyle = "rgba(25, 25, 25, 0.25)";
		
		if (players[selected].size == "t") {
			ctx.fillRect(Math.round((mouseX - (scale/4)) / (scale/2)) * (scale/2), Math.round((mouseY - (scale/4)) / (scale/2)) * (scale/2), scale / 2, scale / 2);
		} else if (players[selected].size == "s" || players[selected].size == "m") {
			ctx.fillRect(Math.round((mouseX - (scale/2)) / scale) * scale, Math.round((mouseY - (scale/2)) / scale) * scale, scale, scale);
		} else if (players[selected].size == "l") {
			ctx.fillRect(Math.round(mouseX / scale) * scale - scale, Math.round(mouseY / scale) * scale - scale, scale * 2, scale * 2);
		} else if (players[selected].size == "h") {
			ctx.fillRect(Math.round((mouseX - (scale/2)) / scale) * scale - scale, Math.round((mouseY - (scale/2)) / scale) * scale - scale, scale * 3, scale * 3);
		} else if (players[selected].size == "g") {
			ctx.fillRect(Math.round(mouseX / scale) * scale - scale * 2, Math.round(mouseY / scale) * scale - scale * 2, scale * 4, scale * 4);
		}
		
		if (mouseX < Math.floor((players[selected].x - players[selected].r) / scale) * scale - players[selected].speed / 5 * scale) outOfBounds = true;
		else if (mouseX > Math.ceil((players[selected].x + players[selected].r) / scale) * scale + players[selected].speed / 5 * scale) outOfBounds = true;		
		else if (mouseY < Math.floor((players[selected].y - players[selected].r) / scale) * scale - players[selected].speed / 5 * scale) outOfBounds = true;
		else if (mouseY > Math.ceil((players[selected].y + players[selected].r) / scale) * scale + players[selected].speed / 5 * scale) outOfBounds = true;
		else outOfBounds = false;
		
		if (outOfBounds) canvas.style.cursor = "not-allowed";
		else { 
			var dx = mouseX - players[selected].x;
			var dy = mouseY - players[selected].y;
			var dh = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
			var th = Math.atan2(dy, dx) * 180 / Math.PI;
			if (dh < scale) canvas.style.cursor = "move";

			else if (-22.5 < th && th <= 22.5) canvas.style.cursor = "e-resize";
			else if (22.5 < th && th <= 67.5) canvas.style.cursor = "se-resize";
			else if (67.5 < th && th <= 112.5) canvas.style.cursor = "s-resize";
			else if (112.5 < th && th <= 157.5) canvas.style.cursor = "sw-resize";
			else if (157.5 < th || th < -157.5) canvas.style.cursor = "w-resize";
			else if (-112.5 > th && th >= -157.5) canvas.style.cursor = "nw-resize";
			else if (-67.5 > th && th >= -112.5) canvas.style.cursor = "n-resize";
			else canvas.style.cursor = "ne-resize";
		}
	}
    
    //Draw labels
	//ctx.fillText("Hello World", canvas.width/2, canvas.height/2);
	if (label) {
		ctx.font = (scale / 3) + "px Arial";
		ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		for (x = 0; x < 700 / scale; x++) {
			for (y = 0; y < 700 / scale; y++) {
				ctx.fillText(letters[x]+(y+1), x * scale + scale / 2, y * scale + scale / 2);
			}
		}
	}

    //Draw creatures
    if (limitMove && selected != null) {
    	ctx.fillStyle = players[selected].color;
    	ctx.globalAlpha = 0.125;
    	ctx.fillRect(players[selected].mvX, players[selected].mvY, players[selected].mvW, players[selected].mvW);
    	ctx.globalAlpha = 1;
    }
    
    var flying = false;
    for (i = 0; i < players.length; i++) {
        if (players[i].held) {
            players[i].x = mouseX - xShift;
            players[i].y = mouseY - yShift;
            
            if (limitMove) {
				if (players[i].x < players[i].mvX + scale / 8) players[i].x = players[i].mvX + scale / 8;
				else if (players[i].x > players[i].mvX + players[i].mvW - scale / 8) players[i].x = players[i].mvX + players[i].mvW - scale / 8;
				if (players[i].y < players[i].mvY + scale / 8) players[i].y = players[i].mvY + scale / 8;
				else if (players[i].y > players[i].mvY + players[i].mvW - scale / 8) players[i].y = players[i].mvY + players[i].mvW - scale / 8;
            }
            
            if (players[i].z < 5) players[i].z++;
        }
        else players[i].update();
        if (i != selected && players[i].a == 0) players[i].draw();
        if (i == selected){
        	players[i].a = parseInt(document.getElementById('playerAlt').value);
        	document.getElementById('altLabel').innerHTML = 'Altitude: ' + players[i].a;
        }
        if (players[i].a > 0) flying = true;
    }
    if (flying) {
		for (i = 0; i < players.length; i++) {
			if (i != selected && players[i].a > 0) players[i].draw();
		}
    }
    if (selected != null) players[selected].draw();
    
    if (names) {
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		for (i = 0; i < players.length; i++) {
			ctx.font = "bold " + (players[i].r) + "px Arial";
			ctx.fillText(players[i].name[0], players[i].x, players[i].y);// + (players[i].r * 1.5));	
		}
    }
    
    ++ticker;
}

document.onmousemove = function(e) {
    e = window.event || e;

    rect = canvas.getBoundingClientRect();
    mouseX = Math.round((e.clientX - rect.left));
    mouseY = Math.round((e.clientY - rect.top));
    
    if (forceLine) {
    	if (forceX == null && forceY == null) {
    		if (Math.pow(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2), 0.5) > 3) {
    			if (Math.abs(mouseX - startX) > Math.abs(mouseY - startY))  {
    				forceY = mouseY;
    				canvas.style.cursor = "vertical-text";
				}
    			else {
    				forceX = mouseX;
    				canvas.style.cursor = "text";
    			}
    		}
    	} else {
    		if (forceX != null) mouseX = forceX;
    		if (forceY != null) mouseY = forceY;
    	}
    }
    
    if (mode == "paint" && brush) {
    	if ("erase" == document.getElementById("paintColor").value) {
    		for (i = 0; i < paint.length; i++) {
    			var dist = Math.pow(Math.pow(paint[i][0] - mouseX, 2) + Math.pow(paint[i][1] - mouseY, 2), 0.5);
				//if (document.getElementById("paintSize").value > dist ||  paint[i][2] > dist)	
				if (parseInt(document.getElementById("paintSize").value) + parseInt(paint[i][2]) > dist) {
					 paint.splice(i, 1);
				}
			}
    	} else
    		paint[paint.length] = [mouseX, mouseY, parseInt(document.getElementById("paintSize").value), document.getElementById("paintColor").value, paintLabel];
    }
}

document.onmousedown = function(e) {
    e = window.event || e;
	
	if (hover) {
		if (mode == "move") {
			var playerClicked = false;
			for (i = players.length - 1; i >= 0; i--) {
				if (Math.pow(Math.pow(mouseX - players[i].x, 2) + Math.pow(mouseY - players[i].y, 2), 0.5) < players[i].r) {
					if (selected != null) players[selected].selected = false;
					players[i].selected = true;
					players[i].held = true;
					players[i].display();
					selected = i;
					held = i;
					xShift = mouseX - players[i].x;
					yShift = mouseY - players[i].y;
					playerClicked = true;
					break;
				}
			}
			if (!playerClicked) {
				if (selected != null) players[selected].selected = false;
				selected = null;
				document.getElementById("name").value = "None selected";
				document.getElementById("size").value = "t";
				document.getElementById("color").value = "white";
				document.getElementById("speed").value = "";
				document.getElementById("notes").value = "";
			}
			canvas.style.cursor = "grabbing";
		} else if (mode == "walk") {
			if (!outOfBounds) {
				if (players[selected].size == "t") {
					players[selected].xGoal = Math.round((mouseX - (scale/4)) / (scale/2)) * (scale/2) + (scale/4);
					players[selected].yGoal = Math.round((mouseY - (scale/4)) / (scale/2)) * (scale/2) + (scale/4);
				} else if (players[selected].size == "l" || players[selected].size == "g") {
					players[selected].xGoal = Math.round(mouseX / scale) * scale;
					players[selected].yGoal = Math.round(mouseY / scale) * scale;
				} else {
					players[selected].xGoal = Math.round((mouseX - (scale/2)) / scale) * scale + (scale/2);
					players[selected].yGoal = Math.round((mouseY - (scale/2)) / scale) * scale + (scale/2);
				}
			}
		} else {
			paintLabel = ticker;
			brush = true;
		}
    }
}

document.onmouseup = function(e) {
    e = window.event || e;

	if (hover) {
		if (mode == "move") {
			if (held != null) {
				players[held].align();
				players[held].held = false;
				held = null;
			}
			canvas.style.cursor = "grab";
		} else {
			brush = false;
		}
    }
}

document.onkeydown = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    if (hover)
		e.preventDefault();

    if (key === 16) { //shift
    	forceLine = true;
    	startX = mouseX;
    	startY = mouseY;
    } else if (key === 18) { //ctrl
    	if (mode == "move" && selected != null) {
    		mode = "walk";
    		canvas.style.cursor = "move";
    	}
    } else if (key === 82) { //R
    	if (!rivals && hover) {
    		rivals = true;
			players[players.length] = new Creature(Math.floor(192.5/scale)*scale + scale/2, Math.floor(297.5/scale)*scale + scale/2, "firebrick", "Cinder", "m", 30);
			players[players.length] = new Creature(Math.floor(192.5/scale)*scale + scale/2, Math.floor(332.5/scale)*scale + scale/2, "teal", "Zephyr", "m", 40);
			players[players.length] = new Creature(Math.floor(192.5/scale)*scale + scale/2, Math.floor(367.5/scale)*scale + scale/2, "lightpink", "Sock", "m", 30);
    	}
    } else if (key === 84) { //T
    	if (rivals && hover) {
    		for (i = 0; i < players.length; ++i) {
    			if (players[i].name == "Cinder") {
    				players[players.length] = new Creature(players[i].x + scale, players[i].y + scale, "grey", "Arcane Turret", "m", 15);
    				break;
    			}
    		}
    	}
    }
}

document.onkeyup = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    if (hover)
		e.preventDefault();
		canvas.style.cursor = "crosshair";
    if (key === 16) { //shift
    	forceLine = false;
    	startX = null;
    	startY = null;
		forceX = null;
		forceY = null;
		
    } else if (key === 18) { //ctrl
    	if (mode == "walk") {
    		mode = "move";
    		canvas.style.cursor = "grab";
    	}
    }
}