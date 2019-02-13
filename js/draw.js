var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

console.clear();

var mode = "draw";

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
setInterval(draw, 20);

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

function updateScale() {
	scale = parseInt(document.getElementById("scale").value);
	for (i = 0; i < rooms.length; i++) {
    	rooms[i].x = Math.round(rooms[i].x/scale)*scale;
    	rooms[i].w = Math.round(rooms[i].w/scale)*scale;
    	rooms[i].y = Math.round(rooms[i].y/scale)*scale;
    	rooms[i].h = Math.round(rooms[i].h/scale)*scale;
	}
}

function draw() {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 700, 700);
    
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
    
    if (newRoom != null) {
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
    
    mode = "draw";
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
    }
}