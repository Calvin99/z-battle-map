var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

console.clear();

var scale = 35;

var mouseX = null,
    mouseY = null;
 
var xShift = 0,
	yShift = 0;
	
var hover = false;
	
var mode = "move";

var brush = false;

var background = "dimgrey";

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
sizeNumber.set("t", scale/7);  //35/7
sizeNumber.set("s", scale*2/7); //35*2/7
sizeNumber.set("m", scale*3/7); //35*3/7
sizeNumber.set("l", scale*6/7); //35*6/7
sizeNumber.set("h", scale*9/7); //35*9/7
sizeNumber.set("g", scale*13/7); //35*13/7

function Creature(x, y, color, name, size) {
    this.x = x;
    this.y = y;
    this.xGoal = x;
    this.yGoal = y;
    this.a = 0;
    this.z = 0;
    this.size = size
    this.r = sizeNumber.get(this.size);
    this.rGoal = sizeNumber.get(this.size);
    this.color = color;
    this.name = name;
    this.notes = "";
    this.selected = false;
    this.held = false;
}

Creature.prototype.draw = function() {
	ctx.fillStyle = "rgba(0,0,0,0.25)";
	ctx.beginPath();
	ctx.arc(this.x - this.z - this.a, this.y + this.z + this.a, this.r, Math.PI * 2, false);
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
}

Creature.prototype.display = function() {
	document.getElementById("name").value = this.name;
	document.getElementById("size").value = this.size;
	document.getElementById("color").value = this.color;
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

players[players.length] = new Creature(385, 385, "silver", "Ally", "l");
players[players.length] = new Creature(332.5, 332.5, "navy", "Alkas", "m");
players[players.length] = new Creature(367.5, 332.5, "#4b784b", "Ploqwat", "m");
players[players.length] = new Creature(332.5, 367.5, "#36393e", "Thia", "m");
players[players.length] = new Creature(332.5, 297.5, "firebrick", "Aatzer", "m");
players[players.length] = new Creature(367.5, 297.5, "steelblue", "Magann", "m");
players[players.length] = new Creature(306.25, 341.25, "white", "A'chuan", "t");
players[players.length] = new Creature(306.25, 358.75, "saddlebrown", "Basil", "t");

function addCreature () {
	players[players.length] = new Creature(scale/2, scale/2, "red", "New Creature", "m");
}

function deleteCreature () {
	players.splice(selected,1);
	if (selected == players.length) selected--;
}

var selected = null;
var held = null;

function swapMode() {
	if (mode == "move") {
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

	} else {
		mode = "move";
		brush = false;
		document.getElementById("mode").innerHTML = "Mode: Move";
		document.getElementById("modeButton").innerHTML = "Paint Mode";
		document.getElementById("paintControls").style.display = "none";
		document.getElementById("creatureStats").style.display = "block";
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

var paint = [];

var label = false;

var letters = ["A", "B", "C", "D", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

setInterval(draw, 20);

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
    ctx.lineWidth = 1;
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
    
    //Draw labels
	ctx.font = (scale / 3) + "px Arial";
	ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	//ctx.fillText("Hello World", canvas.width/2, canvas.height/2);
	if (label) {
		for (x = 0; x < 700 / scale; x++) {
			for (y = 0; y < 700 / scale; y++) {
				ctx.fillText(letters[x]+(y+1), x * scale + scale / 2, y * scale + scale / 2);
			}
		}
	}

    //Draw creatures
    var flying = false;
    for (i = 0; i < players.length; i++) {
        if (players[i].held) {
            players[i].x = mouseX - xShift;
            players[i].y = mouseY - yShift;
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
}

document.onmousemove = function(e) {
    e = window.event || e;

    rect = canvas.getBoundingClientRect();
    mouseX = Math.round((e.clientX - rect.left));
    mouseY = Math.round((e.clientY - rect.top));
    
    if (forceLine) {
    	if (forceX == null && forceY == null) {
    		if (Math.pow(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2), 0.5) > 3) {
    			if (Math.abs(mouseX - startX) > Math.abs(mouseY - startY)) forceY = mouseY;
    			else forceX = mouseX;
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
				if (document.getElementById("paintSize").value > dist ||  paint[i][2] > dist)
					paint.splice(i, 1);
			}
    	} else
    		paint[paint.length] = [mouseX, mouseY, document.getElementById("paintSize").value, document.getElementById("paintColor").value];
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
				document.getElementById("notes").value = "";
			}
		} else {
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
    }
}
document.onkeyup = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    if (hover)
		e.preventDefault();

    if (key === 16) { //shift
    	forceLine = false;
    	startX = null;
    	startY = null;
		forceX = null;
		forceY = null;
    }
}