var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

console.clear();

var mode = "draw";

var brush = false;

var forceLine = false;
var startX = null, startY = null;
var forceX = null, forceY = null;

var scale = 35;

var mouseX = null,
    mouseY = null;
 
var xStart = 0,
	yStart = 0;
	
var hover = false;

var selected = null;

var background = "white";
var room = "saddlebrown";
var wall = "black";
var door = "grey";

var mapImg = new Image();
mapImg.src = "";

var fReader = new FileReader();

fReader.onloadend = function(event){
    mapImg.src = event.target.result;
}

function Room(x, y, w, h) {
	this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dx = x;
    this.dy = y;
    this.da = 1;
    this.select = false;
    this.wallSelect = null;
    this.pulse = 0;
    this.pulseAdd = 0.25;
}

Room.prototype.draw = function() {
	ctx.fillStyle = wall;
	ctx.fillRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
	ctx.fillStyle = room;
	ctx.fillRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6);
	if (this.select) {
		ctx.fillStyle = "#fff8e7";
    	ctx.globalAlpha = this.pulse/20;
    	this.pulse += this.pulseAdd;
    	if (this.pulse == 0 || this.pulse == 10)
    		this.pulseAdd *= -1;
		ctx.fillRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
    	ctx.globalAlpha = 1;
	}
}

Room.prototype.drawDoor = function() {
	var w, h, xS = 0, yS = 0;
	if (this.da == 1) {
		dw = scale;
		dh = 8;
		yS = -4;
	} else {
		dw = 8;
		dh = scale;
		xS = -4;
	}
	ctx.fillStyle = door;
	ctx.fillRect(this.dx + xS, this.dy + yS, dw, dh);
	if (this.select) {
		ctx.fillStyle = "#fff8e7";
    	ctx.globalAlpha = this.pulse/20;
    	this.pulse += this.pulseAdd;
    	if (this.pulse == 0 || this.pulse == 10)
    		this.pulseAdd *= -1;
		ctx.fillRect(this.dx + xS, this.dy + yS, dw, dh);
    	ctx.globalAlpha = 1;
	}
}

var rooms = [];
var newRoom = null;

function swapMode() {
	if (document.getElementById("mode").innerHTML == "Mode: Room") {
		document.getElementById("mode").innerHTML = "Mode: Paint";
		document.getElementById("modeButton").innerHTML = "Room Mode";
		document.getElementById("paintControls").style.display = "block";
		document.getElementById("roomControls").style.display = "none";
		mode = "paint";

	} else {
		document.getElementById("mode").innerHTML = "Mode: Room";
		document.getElementById("modeButton").innerHTML = "Paint Mode";
		document.getElementById("paintControls").style.display = "none";
		document.getElementById("roomControls").style.display = "block";
		mode = "draw";
	}
}

function updateScale() {
	scale = parseInt(document.getElementById("scale").value);
	for (i = 0; i < rooms.length; i++) {
    	rooms[i].x = Math.round(rooms[i].x/scale)*scale;
    	rooms[i].w = Math.round(rooms[i].w/scale)*scale;
    	rooms[i].y = Math.round(rooms[i].y/scale)*scale;
    	rooms[i].h = Math.round(rooms[i].h/scale)*scale;
	}
}

var paint = [];

setInterval(draw, 20);

function draw() {
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
    
    //Rooms
    for (j = 0; j < rooms.length; j++) {
    	rooms[j].draw();
    }
    
	if (selected != null)
		rooms[selected].draw();
    
	if (newRoom != null)
		newRoom.draw();
		
	for (j = 0; j < rooms.length; j++) {
    	rooms[j].drawDoor();
    }
    
    //Draw grid
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    if (document.getElementById('grid').checked) {
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
    }
}

document.onmousemove = function(e) {
    e = window.event || e;

    rect = canvas.getBoundingClientRect();
    mouseX = Math.round((e.clientX - rect.left));
    mouseY = Math.round((e.clientY - rect.top));
    
    if (mode == "paint") {
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
		
    	if (brush) {
			if ("erase" == document.getElementById("paintColor").value) {
				for (i = 0; i < paint.length; i++) {
					var dist = Math.pow(Math.pow(paint[i][0] - mouseX, 2) + Math.pow(paint[i][1] - mouseY, 2), 0.5);
					if (document.getElementById("paintSize").value > dist ||  paint[i][2] > dist)
						paint.splice(i, 1);
				}
			} else
				paint[paint.length] = [mouseX, mouseY, document.getElementById("paintSize").value, document.getElementById("paintColor").value];
		}
    } else if (newRoom != null) {
    	if (mouseX > xStart) {
    		newRoom.w = Math.round((mouseX-xStart)/scale)*scale;
    		newRoom.x = xStart;
    	} else {
    		newRoom.w = Math.round((xStart-mouseX)/scale)*scale;
    		newRoom.x = Math.round(mouseX/scale)*scale;
    	}
    	if (mouseY > yStart) {
    		newRoom.h = Math.round((mouseY-yStart)/scale)*scale;
    		newRoom.y = yStart;
    	} else {
    		newRoom.h = Math.round((yStart-mouseY)/scale)*scale;
    		newRoom.y = Math.round(mouseY/scale)*scale;
    	}
    } else if (mode == "door") {
    	var least = Math.min(Math.abs(rooms[selected].x - mouseX), Math.abs(rooms[selected].y - mouseY), Math.abs(rooms[selected].x + rooms[selected].w - mouseX), Math.abs(rooms[selected].y + rooms[selected].h - mouseY));
		if (least == Math.abs(rooms[selected].x - mouseX)) {
			rooms[selected].da = -1;
			rooms[selected].dx = rooms[selected].x;
			rooms[selected].dy = Math.max(Math.min(rooms[selected].y + rooms[selected].h - scale, Math.round((mouseY - scale / 2) / scale) * scale), rooms[selected].y);
		} else if (least == Math.abs(rooms[selected].y - mouseY)) {
			rooms[selected].da = 1;
			rooms[selected].dx = Math.max(Math.min(rooms[selected].x + rooms[selected].w - scale, Math.round((mouseX - scale / 2) / scale) * scale), rooms[selected].x);
			rooms[selected].dy = rooms[selected].y;
		} else if (least == Math.abs(rooms[selected].x + rooms[selected].w - mouseX)) {
			rooms[selected].da = -1;
			rooms[selected].dx = rooms[selected].x + rooms[selected].w;
			rooms[selected].dy = Math.max(Math.min(rooms[selected].y + rooms[selected].h - scale, Math.round((mouseY - scale / 2) / scale) * scale), rooms[selected].y);
		} else {
			rooms[selected].da = 1;
			rooms[selected].dx = Math.max(Math.min(rooms[selected].x + rooms[selected].w - scale, Math.round((mouseX - scale / 2) / scale) * scale), rooms[selected].x);
			rooms[selected].dy = rooms[selected].y + rooms[selected].h;
		}
	}
}

document.onmousedown = function(e) {
    e = window.event || e;
    
    xStart = Math.round(mouseX/scale)*scale;
    yStart = Math.round(mouseY/scale)*scale;
    
    var hit = false;
    
    var deselect = false;
    
    if (mode == "paint") {
    	brush = true;
    	return;
    }
    
    if (selected != null) {
		if (rooms[selected].da == 1 && mouseX > rooms[selected].dx && mouseX < rooms[selected].dx + scale && mouseY > rooms[selected].dy - 4  && mouseY < rooms[selected].dy + 4 || rooms[selected].da == -1 && mouseX > rooms[selected].dx - 4 && mouseX < rooms[selected].dx + 4 && mouseY > rooms[selected].dy  && mouseY < rooms[selected].dy + scale) {
			mode = "door";
			return;
		} else {
			rooms[selected].select = false;
			selected = null;
			deselect = true;
    	}
    }
    
    for (i = rooms.length - 1; i >= 0; i--) {
    	if (mouseX > rooms[i].x && mouseX < rooms[i].x + rooms[i].w && mouseY > rooms[i].y && mouseY < rooms[i].y + rooms[i].h) {
    		selected = i;
    		rooms[i].select = true;
    		hit = true;
    		return;
    	}
    }
    
    if (!hit && !deselect)
		newRoom = new Room(Math.round(mouseX/scale)*scale, Math.round(mouseY/scale)*scale, scale, scale);
}

document.onmouseup = function(e) {
    e = window.event || e;
    
    if (newRoom != null)
    	rooms[rooms.length] = newRoom;
    newRoom = null;
    
    if (mode == "paint")
		brush = false;
	else
		mode = "draw";
}


document.onkeydown = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    if (hover)
		e.preventDefault();

	if (key === 16) { //shift
		if (mode == "paint") {
			forceLine = true;
			startX = mouseX;
			startY = mouseY;
			forceX = null;
			forceY = null;
		}
    }
}

document.onkeyup = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    if (hover)
		e.preventDefault();

    if (key === 8) { //Backspace
    	if (selected != null) {
    		rooms.splice(selected,1);
    		selected = null;
    	}
    } else if (key === 16) { //shift
    	forceLine = false;
    	startX = null;
    	startY = null;
		forceX = null;
		forceY = null;
    }
}