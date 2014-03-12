GisMap.Tasks = {

	top : null,
	last : null,
	running : false,

	init : function() {
		setInterval(function() {
			GisMap.Tasks.update()
		}, 300);
	},

	update : function() {
		if (this.top == null)
			return;
		if (this.top.getRunning() == false) {
			this.top.run();
		}
		if (this.top.completed == true) {
			this.pop();
		}

	},

	push : function(task) {
		n = new Node({
			info : task
		});

		if (this.top == null) {
			this.top = n;
			this.last = n;
			return;
		}

		if (this.last != undefined)
			this.last.setLink(n);
		this.last = n;
	},

	pop : function() {
		this.top = this.top.getLink();
	}
}

function Node(opts) {

	this.link = null;
	this.info = opts.info;
	this.running = false;
	this.completed = false;

}

Node.prototype.complete = function(){ this.completed = true;}
Node.prototype.getRunning = function(){return this.running};
Node.prototype.setRunning = function(y){ this.running = y;};
Node.prototype.run = function(){ this.info(function(){GisMap.Tasks.top.complete()}); this.setRunning(true)};
Node.prototype.getLink = function(){return this.link};
Node.prototype.setLink = function(l){this.link = l};
