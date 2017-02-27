(function(){
	$( document ).ready(function() {
		ctxBg = document.getElementById("backgroundCanvas").getContext("2d");
		ctxPlanet = document.getElementById("bgPlanetCanvas").getContext("2d");
		ctxtEnemy = document.getElementById("enemyCanvas").getContext("2d");
		ctxtRock = document.getElementById("rockCanvas").getContext("2d");
		ctxPlayer = document.getElementById("playerCanvas").getContext("2d");
		ctxHalo = document.getElementById("haloCanvas").getContext("2d");
		ctxPcl = document.getElementById("particalCanvas").getContext("2d");
		ctxtJewel = document.getElementById("jewelCanvas").getContext("2d");
		ctxGoodBullet = document.getElementById("goodBulCanvas").getContext("2d");
		ctxBadBullet = document.getElementById("badBulCanvas").getContext("2d");
		ctxMessage = document.getElementById("messageCanvas").getContext("2d");
    	console.log( "ready!" );

    	var
		starts = [],
		width = 500,
		images = [],
		height = 666,
		messageImg = [],
		explodeImg = [],
		bg_pImg = [],
		jewelImg = [],
		rockImg = [],
		haloImg = [],
		Emitters = [],
		explodeSound = new Audio("snd/Explosion.wav"),
		playerShootSound = new Audio("snd/Hit_Hurt_sin.wav"),
		enemyShootSound = new Audio("snd/Hit_Hurt_whistle.wav"),
		BGM = new Audio("snd/BGM.ogg"),
		keys = [],
		doneImages = 0,
		requiredImages = 0,
		
		count = 0,
		division = 48,
		left = false,
		
		gameOver = false,
		gameWon = false,
		moving = false,

		currentstate = 0,
		states = {
			Ready:0,
			Gaming:1,
			Die:2,
			Halt:3,
			Help:4
		},

		player = {
			y: height - 50,
			x: width/2 - 25,
			width: 42,
			height:50,
			Speed : 5,
			unit_dmg :3,
			total_life : 9,
			live: 0,
			been_shoot:false,
			death: false,
			deathTime: 15,  
			rendered: false,
			red_heart : 0,
			dmg_heart : 0,
			gray_heart: 0,
			fullShootTimer: 7,
			shootTimer: 0,
			score: 0,
			best:0,
			jewel_time:0,
			protect_time:0,

			reset: function(){
				this.live = this.total_life;
				this.shootTimer = this.fullShootTimer;
				this.red_heart = 3;
				this.dmg_heart = 0;
				this.gray_heart= 0;
				this.score = 0;
				this.y = height - 50;
				this.x = width/2 - 21;
				this.deathTime = 15;
				this.death = false;
				this.rendered = false;
				this.jewel_time = 0;
				this.protect_time = 0;
			},

			update : function(){
				if (this.death==false) {
					if(keys[38]||keys[87]){
						if(this.y > 0){
							this.rendered = false;
							this.y -=this.Speed;
						}		
					}	
					if(keys[40]||keys[83]){
						if(this.y+this.height< height){
							this.rendered = false;
							this.y+=this.Speed;
						}		
					}	
					if(keys[37]||keys[65]){
						if(this.x > 0){
							this.rendered = false;
							this.x-=this.Speed;
						}		
					}	
					if(keys[39]||keys[68]){
						if(this.x+this.width < width){
							this.rendered = false;
							this.x +=this.Speed;
						}	
					}
					if(this.shootTimer > 0)	
						this.shootTimer--;
					if(this.shootTimer == 0 && keys[32]){
						playerShootSound.play();
						bullet.playerfire(bullet._dir.M);
						if(this.jewel_time>0){
							//console.log("jewel_time = "+this.jewel_time);
							this.jewel_time--;
							bullet.playerfire(bullet._dir.L);
							bullet.playerfire(bullet._dir.R);
						}
						this.shootTimer = this.fullShootTimer;
					}
					if(this.protect_time>0){
						this.protect_time--;
					}
					else if(this.protect_time == 0){
						var _h = msgBox.halo;
						ctxHalo.clearRect(_h.x-15,_h.y-15,_h.width+30,_h.height+30);
						_h.show = false;
					}
					this.red_heart = (this.red_heart==0) ? 0:this.red_heart;
					this.dmg_heart = (this.dmg_heart==1) ? 1:this.dmg_heart;
					if(this.gray_heart>this.total_life/this.unit_dmg){
						this.gray_heart = this.total_life/this.unit_dmg;
					}
				}
				else{
					this.explode();
					//console.log("plaer explode");
				}
				
			},

			crash : function(){
				this.live -= 3;
				this.checkBlood();
			},

			explode: function(){
				this.rendered = false;
				if(this.deathTime<0){
					this.deathTime = 0;
					currentstate = states.Die;
				}
				else{
					this.image = this.deathTime;
					this.deathTime--;
				}
				this.render();
			},

			checkBlood : function(){
				if(this.live<0){
					this.death = true;
					//即使play.death = true,也不能立刻把currentstate置为Die，必须要等爆炸动画结束
					this.live = 0;
					this.explode();
				}
					
				this.red_heart = Math.floor(this.live/this.unit_dmg);
				this.gray_heart = Math.floor((this.total_life-this.live)/this.unit_dmg);					
				this.dmg_heart = Math.floor((this.total_life/this.unit_dmg) - this.red_heart-this.gray_heart);
			},

			getJewel : function(jew){
				if(jew.image == 0)
					this.jewel_time = 80;
				else
				{
					this.protect_time = 1000;
					msgBox.showHalo();
				}
			},

			touch : function(jew){
				var jc_x = jew.x+jew.width/2;
				var jc_y = jew.y+jew.height/2;
				//console.log("jew.cx = "+jc_x+" ; jew.cy = "+jc_y);
				if(jc_x < this.x+this.width && jc_x>this.x &&
				   jc_y > this.y && jc_y < this.y+this.height){
				//	console.log("got the jewel");
					return true;
				}
				else
					return false;
			},

			render : function(){
				if(player.rendered == false){
					ctxPlayer.clearRect(this.x,this.y,this.width,this.height);
					ctxPlayer.save();
					ctxPlayer.clearRect(0,0,width,height);
					if(this.death == false){
						ctxPlayer.drawImage(images[0],player.x,player.y,player.width,player.height);
						player.rendered = true;
					}
					else if(this.death && this.image>=0){//|| this.deathTime>0){
				//		console.log("player Explosion");
						ctxPlayer.drawImage(explodeImg[this.image],this.x,this.y,this.width,this.height);
					}
					ctxPlayer.restore();
				}
			}
		},

		enemie = {
			assBlowTime: 50,
			creatAssTime: 0,
			_enemies:[],
			reset: function() {
				ctxtEnemy.clearRect(0,0,width,height);
				this.creatAssTime = this.assBlowTime;
				this._enemies = [];
				//console.log(this._enemies.length+" this._enemies.length");
			},

			update: function(){
				this.creatAssTime--;
				if (this.creatAssTime == 0) {
					this.addEnemy(1);
					this.creatAssTime = this.assBlowTime;
				}
				for(i in this._enemies){
					var _e = this._enemies[i];
					_e.protect -= (_e.protect === 0) ? 0 : 1;
					_e.shootTimer-=(_e.shootTimer === 0)?0 : 1;
					
					if(_e.shootTimer <= 0 && _e.fire>=5){
						bullet.enemyfire(_e,bullet._dir.M);
						if(_e.multi_b>0){
							bullet.enemyfire(_e,bullet._dir.L);
							bullet.enemyfire(_e,bullet._dir.R);
						}
						enemyShootSound.play();
						_e.shootTimer = Math.floor(Math.random()*10+30);
					}

					if(_e.death){
						_e.deathTime--;
						_e.image = _e.deathTime;
					}
					else if(!_e.death && !player.death && collision(_e,player)){
						_e.death = true;
						player.crash();
					}
					if(_e.deathTime<=0){
						ctxtEnemy.clearRect(_e.x-2, _e.y-2, _e.width+4, _e.height+4);
						this._enemies.splice(i,1);
					}
					if(_e.y>height + _e.height)
						this._enemies.splice(i,1);
					else{
						_e.y++;
					}

				}
			},

			render: function(){
				for(i in this._enemies){
					var enemy = this._enemies[i];
					ctxtEnemy.save();
					if(enemy.death)
						ctxtEnemy.drawImage(explodeImg[enemy.image],enemy.x-2,enemy.y-2,enemy.width+4,enemy.height+4);
					else
						ctxtEnemy.drawImage(images[enemy.image],enemy.x,enemy.y,enemy.width,enemy.height);
					ctxtEnemy.restore();
				}
			},
			//add enemy
			addEnemy: function(num){
				for(var i = 0;i<num;i++){
					//console.log("add enemie");
					this._enemies.push({
						x: 45*(Math.random()*10),
						y: -(Math.random()*10+55),
						width: 50,
						height:50,
						live : Math.floor(Math.random()*3+1),
						shootTimer: Math.floor(Math.random()*10+100),
						image: 1,
						multi_b:ran(-1,1),
						protect:10, 
						fire: Math.random()*10,
						death: false,
						deathTime: 15  
					});
				}
			} 
		},
		
		bullet = {
			_playerBullet: [],
			_enemyBullet: [],
			_dir: {
				M:0,
				L:1,
				R:2,
			},	
			reset: function(){
				ctxBadBullet.clearRect(0,0,width,height);
				this._enemyBullet = [];
				this._playerBullet = [];
				//console.log(this._enemyBullet.length+" this._enemyBullet.length");
				//console.log(this._playerBullet.length+" this._playerBullet.length");
			},

			playerfire: function(dir){
				//console.log("add bullet");
				var w = (dir==0) ? 8:12;
				var h = (dir==0) ? 16:14;
				var d;
				if(dir == 0) d = 0;
				else if(dir == 1) d = -10;
				else if(dir == 2) d = 10; 
				this._playerBullet.push({
					x: player.x+player.width/2-5+d,
					y: player.y - Math.abs(d),
					direction:dir,
					width: w,
					height:h,
					image: 2,
					transition:15,
					blowing:false,
					speed: 10
				});
			},

			enemyfire: function(enemy,dir){
				var w = (dir == 0) ? 8:12;
				var h = (dir == 0) ? 16:14;
				this._enemyBullet.push({
					x: enemy.x+enemy.width/2-5,
					y: enemy.y+50,
					width: w,
					direction:dir,
					height:h,
					image: 5,
					transition:15,
					resolve:false,
					blowing:false,
					speed: 5
				});
			},

			update: function(){
				// player shoot and bullet
				for(i in this._playerBullet){
					var p_b = this._playerBullet[i];

					p_b.y -= (p_b.blowing==false)? p_b.speed:0;
					if(p_b.direction == bullet._dir.R)
						p_b.x+=2.88;
					else if(p_b.direction == bullet._dir.L)
						p_b.x-=2.88;
					
					if(p_b.y <= -(p_b.height*2))
						this._playerBullet.splice(i,1);
					if(p_b.x >= width+p_b.width ||p_b.x <= -p_b.width)
						this._playerBullet.splice(i,1);
					else if(!p_b.blowing){
						for(e in enemie._enemies){
							var _e = enemie._enemies[e];
							//玩家击中了敌机。
							if(collision(_e, p_b) && _e.protect == 0){
								p_b.blowing = true;
								p_b.width = p_b.height = 24;

								if(_e.live>0)
									_e.live--;
								else if(_e.live == 0){
									_e.death = true;
									_e.live = 0;
								}
								player.score += (_e.death === true) ? 1:0;
								explodeSound.play();
								ctxGoodBullet.clearRect(p_b.x, p_b.y, p_b.width , p_b.height+4);
							}
						}

						for(r in msgBox._rocks){
							var _r = msgBox._rocks[r];
							if(collision(_r, p_b)){
								p_b.blowing = true;
								p_b.width = p_b.height = 24;

								if(_r.live>0)
									_r.live--;
								else if(_r.live == 0){
									_r.death = true;
									_r.live = 0;
								}
								explodeSound.play();
								ctxGoodBullet.clearRect(p_b.x, p_b.y, p_b.width , p_b.height+4);
							}

						}
					}
					if(p_b.blowing == true){
						if(p_b.transition <= 0){
							bullet._playerBullet.splice(i,1);
						}
						p_b.image = p_b.transition;
						p_b.transition--;
					}	
				}

				for(i in this._enemyBullet){
					var e_b = this._enemyBullet[i];
					e_b.y += (e_b.blowing==false)? e_b.speed:0;
					if(e_b.direction == bullet._dir.R)
						e_b.x+=2.88;
					else if(e_b.direction == bullet._dir.L)
						e_b.x-=2.88;

					if(e_b.y > height)
						this._enemyBullet.splice(i,1);
					if(e_b.x >= width+e_b.width ||e_b.x <= -e_b.width)
						this._enemyBullet.splice(i,1);
					//发生了碰撞
					if(!e_b.blowing && collision(e_b,player) && player.death == false){
						if(msgBox.halo.show == false){
							player.live -= 1;
							player.checkBlood();
							e_b.blowing = true;
							e_b.width = e_b.height = 24;
						}
						else{
							e_b.transition = 0;
							var c_x = e_b.x+e_b.width/2;
							var c_y = e_b.y+e_b.height;
							Emitters.push(
								new Emitter(c_x,c_y,settings.basic)
							);
							ctxBadBullet.clearRect(e_b.x-5, e_b.y-5, e_b.width+10, e_b.height+10);
							this._enemyBullet.splice(i,1);
							continue;
						}
						if(player.live == 0){
							//console.log("457   death");
							player.death = true;
							player.explode();
						}
					}
					if(e_b.blowing == true ){
						if(e_b.transition <= 0){
							bullet._enemyBullet.splice(i,1);
						}
						if(e_b.blowing == true)
							e_b.image = e_b.transition;
						e_b.transition--;
					}
				}
			},

			render: function(){
				for(i in this._playerBullet){
					var p_b = this._playerBullet[i];
					if(p_b.blowing == false){
						ctxGoodBullet.clearRect(p_b.x-5, p_b.y-5, p_b.width+10, p_b.height+30);
						ctxGoodBullet.drawImage(images[p_b.image+p_b.direction], p_b.x, p_b.y, p_b.width, p_b.height);
					}
					else{
						var X = (p_b.x+4) - p_b.width/2; 
						ctxGoodBullet.clearRect(X-5, p_b.y-15, p_b.width+10 , p_b.height+30);
						ctxGoodBullet.drawImage(explodeImg[p_b.image], X, p_b.y-15, p_b.width, p_b.height);
					}
				}
				for(i in this._enemyBullet){
					var e_b = this._enemyBullet[i];
					var X = (e_b.x+4) - e_b.width/2;
					if(e_b.blowing == false ){
						ctxBadBullet.clearRect(e_b.x-5, e_b.y-5, e_b.width+10, e_b.height+10);
						ctxBadBullet.drawImage(images[e_b.image+e_b.direction], e_b.x, e_b.y, e_b.width, e_b.height);
					}
					else{
						ctxBadBullet.clearRect(X-5, e_b.y-12,e_b.width+10, e_b.height+24);
						ctxBadBullet.drawImage(explodeImg[e_b.image], X, e_b.y+15, e_b.width, e_b.height);
					}
				}
			}
		},

		jewels ={
			_jewel:[],
			j_time:Math.floor(Math.random()*1+10),

			reset: function(){
				this._jewel = [];
				j_time = 0;
				//this.addjewel();
			},

			update: function(){
				for(i in this._jewel){
					var _j = this._jewel[i];
					_j.y += 1;
					_j.x += _j.delX;
					_j.rotation += _j.angle;

					if(!player.death && player.touch(_j)){
						player.getJewel(_j);
						
						ctxtJewel.clearRect(_j.x,_j.y+1,_j.size+2,_j.size+2);
						this._jewel.splice(i,1);
					}
					if(_j.y>height)
						this._jewel.splice(i,1);
				}
				this.j_time--;
				if(this.j_time==0){
					this.addjewel();
					this.j_time=Math.floor(Math.random()*400+800);
				}
			},
			addjewel: function(){
				var _x = Math.random()*500-100;
				var _des = width-_x;
				this._jewel.push({
					image: Math.floor(Math.random()*2),
					speed: 0.5,
					rotation:Math.random()*20+5,
					angle:6,
					size:25,
					width:25,
					height:25,
					x: _x,
					y: -20,
					des: _des,
					delX:(_des-_x)/(height+20)
				});
			},

			render: function(){
				for(i in this._jewel){
					var _j = this._jewel[i];
					var jc_x = _j.x+_j.width/2;
					var jc_y = _j.y+_j.height/2;
					ctxtJewel.clearRect(_j.x-10,_j.y-10,_j.size+20,_j.size+20);
					ctxtJewel.save();
					ctxtJewel.translate(_j.x+(_j.size)/2,_j.y+(_j.size)/2);
					ctxtJewel.rotate(_j.rotation*Math.PI/180);
					ctxtJewel.drawImage(jewelImg[_j.image],-_j.size/2,-_j.size/2,_j.size,_j.size);
					ctxtJewel.restore();
				}
			}

		},

		msgBox = {
			startBox:[300,100],
			overBox:[300, 200],
			haltBox:[340,150],
			hKey_t:5,
			haltK:false,
			_planets:[],
			_rocks:[],
			r_time:Math.floor(Math.random()*100+200),
			p_time:Math.floor(Math.random()*400+400),

			halo : {
				x:0,
				y:0,
				show:false,
				image:0,
				width:63,
				height:63,
				angle:5,
				rotation:0
			},

			reset: function(){
				this._planets = [];
				this._rocks = [];
				this.halo.show = false;
			},

			update: function(){
				if(this.halo.show){
					var _h = this.halo;
					if(player.death){
						ctxHalo.clearRect(_h.x-15,_h.y-15,_h.width+30,_h.height+30);
						this.halo.show = false;
					}
					_h.x = (player.x+(player.width)/2) - (_h.width/2);
					_h.y = (player.y+(player.height)/2) - (_h.height/2);	
					_h.rotation += _h.angle;
				}
				for(i in this._rocks){
					var _r = this._rocks[i];
					_r.y += _r.speed;
					_r.rotation  += _r.angle;

					if(_r.death){
						_r.deathTime--;
						_r.image = _r.deathTime;
					}
					if(currentstate != states.Halt && !player.death && !_r.death && collision(_r,player)){
						//console.log("hit the rock["+i+"]");
						_r.death = true;
						player.crash();
					}
					if(_r.deathTime<=0){
						//console.log("clear rock:"+i);
						ctxtRock.clearRect(_r.x-15, _r.y-15, _r.width+30, _r.height+30);
						this._rocks.splice(i,1);
					}

					if(_r.y > height){

						this._rocks.splice(i,1);
					}
				}
				this.r_time--;
				if(this.r_time==0){
					this.addRock();
					this.r_time = Math.floor(Math.random()*100+200);					
				}

				for(i in this._planets){
					var _p = this._planets[i];
					_p.y -= _p.speed;
					_p.rotation  += _p.angle;
					if(_p.y<-_p.size){
						this._planets.splice(i,1);
					}
				}
				this.p_time--;
				if(this.p_time==0){
					this.addPlanet();
					this.p_time = Math.floor(Math.random()*400+800);					
				}
			},

			showHalo: function(){
				var _h = this.halo;
				_h.x = (player.x+(player.width)/2) - (_h.width/2);
				_h.y = (player.y+(player.height)/2) - (_h.height/2);
				_h.show = true;
				//console.log("show halo");
				//console.log("halo.x = "+_h.x);
				//console.log("halo.y = "+_h.y);				
			},

			addRock: function(){
				//console.log("add a rock");
				var s =Math.random()*30+40;
				this._rocks.push({
					image: Math.floor(Math.random()*7),
					speed: 0.75,
					rotation:ran(30,40),
					angle:Math.random()*0.5+0.1,
					size:s,
					width:s,
					height:s,
					x: ran(-20,width+20),
					y: -20,
					live: ran(10,15),
					death: false,
					deathTime: 15  
				});
			},

			addPlanet: function(){
				//console.log("add a planet");
				var s = Math.random()*250+180;
				this._planets.push({
					image: Math.floor(Math.random()*9),
					speed: 0.5,
					rotation:Math.random()*20+5,
					angle:Math.random()*0.5+0.1,
					size:s,
					x: Math.random()*500-100,
					y: height+20
				});
			},

			render: function(){
				if( this.halo.show){
					var _h = this.halo;
					ctxHalo.clearRect(_h.x-15,_h.y-15,_h.width+30,_h.height+30);
					ctxHalo.save();
					ctxHalo.translate(_h.x+(_h.width)/2,_h.y+(_h.height)/2);
					ctxHalo.rotate(_h.rotation*Math.PI/180);
					ctxHalo.drawImage(haloImg[_h.image],-_h.width/2,-_h.height/2,_h.width,_h.height);
					ctxHalo.restore();
				}
				for(i in this._planets){
					var _p = this._planets[i];
					ctxPlanet.clearRect(_p.x-5,_p.y-5,_p.size+10,_p.size+10);
					ctxPlanet.save();
					ctxPlanet.translate(_p.x+(_p.size)/2,_p.y+(_p.size)/2);
					ctxPlanet.rotate(_p.rotation*Math.PI/180);
					ctxPlanet.drawImage(bg_pImg[_p.image],-_p.size/2,-_p.size/2,_p.size,_p.size);
					ctxPlanet.restore();
				}
				for(i in this._rocks){
					var _r = this._rocks[i];
					ctxtRock.clearRect(_r.x-15, _r.y-15, _r.width+30, _r.height+30);
					ctxtRock.save();
					ctxtRock.translate(_r.x+(_r.size)/2,_r.y+(_r.size)/2);
					ctxtRock.clearRect(-_r.size/2-10,-_r.size/2-1,_r.size+10,_r.size+10);
					ctxtRock.rotate(_r.rotation*Math.PI/180);
					if(_r.death)
						ctxtRock.drawImage(explodeImg[_r.image],-_r.size/2,-_r.size/2,_r.size,_r.size);
					else
						ctxtRock.drawImage(rockImg[_r.image],-_r.size/2,-_r.size/2,_r.size,_r.size);
					ctxtRock.restore();
				}
				
			}

		},

		settings = {
    		'basic': {
        		'emission_rate': 30,
      			'min_life': 3,
	    	    'life_range': 2,
    		    'min_angle': 0,
    		    'angle_range': 360,
	    	    'min_speed': 35,
	    	    'speed_range': 15,
    		    'min_size': 2,
    	    	'size_range': 1,
    		    'colour': '#00e1e1'//'#0000ff'//
    		}
		};

		var Particle = function(x, y, angle, speed, life, size) {
    		this.pos = {	// the particle's position 

   	     	x: x || 0,
  		    y: y || 0
		    };

		    this.speed = speed || 5;	// set specified or default values 
	    	this.life = life || 1;
		    this.size = size || 2;
    		this.lived = 0;

		    var radians = angle * Math.PI / 180;	// the particle's velocity 

	    	this.vel = {

	        x: Math.cos(radians) * speed,
    	    y: -Math.sin(radians) * speed
    		};
		};

		var Emitter = function(x, y, settings) {
    		this.pos = {	// the emitter's position 
        		x: x,
        		y: y
    		};
    		this.resolve_time = 40;
    		this.settings = settings;    // set specified values 
    		this.emission_delay = 1000 / settings.emission_rate;    // How often the emitter needs to create a particle in milliseconds 
    		this.last_update = 0;    // we'll get to these later 
    		this.last_emission = 0;
    		this.particles = [];    // the emitter's particle objects 
		};

		Emitter.prototype.update = function() {
		    // set the last_update variable to now if it's the first update 
		    if (!this.last_update) {
		        this.last_update = Date.now();
		        return;
    		}
    
		    var time = Date.now();	// get the current time 
	    	var dt = time - this.last_update;	    // work out the milliseconds since the last update 
    		this.last_emission += dt;	    // add them to the milliseconds since the last particle emission 
	    	// set last_update to now 
    		this.last_update = time;
	    	// check if we need to emit a new particle 
    		if (this.last_emission > this.emission_delay) {
        		// find out how many particles we need to emit 
        		var i = Math.floor(this.last_emission / this.emission_delay);
        		this.last_emission -= i * this.emission_delay;	// subtract the appropriate amount of milliseconds from last_emission 
        		while (i--) {
            		// calculate the particle's properties based on the emitter's settings 
            		this.particles.push(
                		new Particle(
                    	0,
	                    0,
    	                this.settings.min_angle + Math.random() * this.settings.angle_range,
        	            this.settings.min_speed + Math.random() * this.settings.speed_range,
            	        this.settings.min_life + Math.random() * this.settings.life_range,
                	    this.settings.min_size + Math.random() * this.settings.size_range
                		)
            		);
        		}
    		}

 		   // convert dt to seconds 
		    dt /= 1000;
		    
		    if(this.resolve_time == 0){
		    	this.particles = [];
		    }
		    for (i in this.particles) {
		        var particle = this.particles[i];
		        if (particle.dead) {    //skip if the particle is dead 
		            this.particles.splice(i, 1);
		            continue;   
		        }
		        // add the seconds passed to the particle's life 
		        particle.lived += dt;

		        // check if the particle should be dead 
		        if (particle.lived >= particle.life) {
		            particle.dead = true;
		            continue;
		        }

		        // calculate the particle's new position based on the seconds passed
		        particle.pos.x += particle.vel.x * dt;
		        particle.pos.y += particle.vel.y * dt;

		        // draw the particle 
		        ctxPcl.fillStyle = this.settings.colour;

		        var x = this.pos.x + particle.pos.x;
		        var y = this.pos.y + particle.pos.y;

		        ctxPcl.beginPath();
		        ctxPcl.arc(x, y, particle.size, 0, Math.PI * 2);
		        ctxPcl.fill();
		    }
		    this.resolve_time--;
		};


		function ran(a, b){  
			var max = Math.max(a,b);
			var min = Math.min(a,b);
        	return Math.floor(Math.random() * (max - min + 1)) + min;  
    	} 
		/*
			up - 38;	down - 40;
			left- 37;	right- 39;
			w - 87;		a - 65;
			s - 83;		d - 68;
			space - 32;
		*/
		$( document ).keydown(function(e){
			keys[e.keyCode] = true;
		//	console.log(e.keyCode);
		});

		$( document ).keyup(function(e){
			delete keys[e.keyCode];
		});

		//beckground start
		function addStarts(num){
			for(i = 0;i<num;i++){
				starts.push({
					x: Math.floor(Math.random()*width),
					y: height + 20,
					size: Math.random()*5
				});
			}
		}

		function startUpdate(){
			addStarts(1);
			for(i in starts){
				if(starts[i].y <= -5){
					starts.splice(i,1);
				}
				starts[i].y--;
			}
		}

		function init(){
			starts = [];
			currentstate = states.Ready;
			currentstate = states.Help;
			for(i = 0; i<height; i++){
				starts.push({
					x: Math.floor(Math.random()*width),
					y: Math.floor(Math.random()*height),
					size: Math.random()*5
				});
			}
			Emitters = [];
			jewels.reset();
			player.reset();
			enemie.reset();
			bullet.reset();
			msgBox.reset();
			player.checkBlood();
			enemie.addEnemy(1);
			loop();
		}

		function replay(){
			ctxPcl.clearRect(0, 0, width, height);
			currentstate = states.Ready;
			player.reset();
			enemie.reset();
			bullet.reset();
			Emitters = [];
			player.checkBlood();
		}

		function update(){
			if(currentstate == states.Ready){
				if(keys[13] == true){
					ctxMessage.clearRect(0,0,width,height);
					currentstate = states.Gaming;
					delete keys[13];
				}
			}
			else if(currentstate == states.Gaming){
				if(keys[13] == true){
					currentstate = states.Halt;
					delete keys[13];
				}
				else{
					jewels.update();
					msgBox.update();
					player.update();
					enemie.update();
					bullet.update();
				}
			}
			else if(currentstate == states.Die){
				jewels.update();
				msgBox.update();
				enemie.update();
				bullet.update();
				if(keys[13] == true){
					ctxMessage.clearRect(0,0,width,height);
					delete keys[13];
					replay();
				}
			}
			else if(currentstate == states.Halt){
				if(keys[13] == true){
					ctxMessage.clearRect(0,0,width,height);
					currentstate = states.Gaming;
					delete keys[13];
				}
				jewels.update();
				msgBox.update();
			}
			else{
				if(keys[13] == true){
					ctxMessage.clearRect(0,0,width,height);
					currentstate = states.Ready;
					delete keys[13];
				}
			}
			startUpdate();
			ctxPcl.clearRect(0, 0, width, height);
			for(i in Emitters){
				var _E = Emitters[i];
				if(_E.resolve_time){
					_E.update();
				}
				else
					Emitters.splice(i,1);
			}
		}

		function render(){
			
			ctxBg.clearRect(0,0,width,height);
			ctxBg.fillStyle = "white";
			for(i in starts){
				var star = starts[i];
				ctxBg.fillRect(star.x,star.y,star.size,star.size);
			}
			var _b = msgBox.startBox;
			var _h = msgBox.haltBox;
			var _o = msgBox.overBox;
			if(currentstate == states.Ready ){
				jewels.render();
				msgBox.render();
				ctxMessage.fillStyle="#000";
				ctxMessage.fillRect((width-_b[0])/2+10,(height-_b[1])/2+10,_b[0],_b[1]);
				ctxMessage.fillStyle="#fff";
				ctxMessage.fillRect((width-_b[0])/2,(height-_b[1])/2,_b[0],_b[1]);
				ctxMessage.drawImage(messageImg[3],104,310,292,45);
			}
			else if(currentstate == states.Halt){
				jewels.render();
				msgBox.render();
				ctxMessage.fillStyle="#000";
				ctxMessage.fillRect((width-_h[0])/2+10,(height-_h[1])/2+10,_h[0],_h[1]);
				ctxMessage.fillStyle="#fff";
				ctxMessage.fillRect((width-_h[0])/2,(height-_h[1])/2,_h[0],_h[1]);
				ctxMessage.drawImage(messageImg[5],94,243+30,311,113);
			}
			else if (currentstate == states.Gaming) {
				jewels.render();
				msgBox.render();
				ctxtEnemy.clearRect(0,0,width,height);
				bullet.render();	
				enemie.render();
				player.render();
			}
			else if(currentstate == states.Die){
				ctxtEnemy.clearRect(0,0,width,height);
				jewels.render();
				msgBox.render();
				bullet.render();	
				enemie.render();
				player.best = Math.max(player.best,player.score);
				ctxMessage.fillStyle="#000";
				ctxMessage.fillRect((width-_o[0])/2+10,(height-_o[1])/2-40,_o[0],_o[1]);
				ctxMessage.fillStyle="#fff";
				ctxMessage.fillRect((width-_o[0])/2,(height-_o[1])/2-50,_o[0],_o[1]);
				ctxMessage.drawImage(messageImg[4],111,310,276,44);
				ctxMessage.fillStyle="#000";
				ctxMessage.font = "20px fipps";
				ctxMessage.fillText("Scores",120,240);
				ctxMessage.fillText("Best",292,240);
				ctxMessage.fillText(player.score,128,280);
				ctxMessage.fillText(player.best,300,280);
			}

			else{
				ctxMessage.fillStyle="#000";
				ctxMessage.fillRect(60,223,400,241);
				ctxMessage.drawImage(messageImg[6],50,213,400,241);				
			}

			ctxMessage.font = "15px fipps";
			ctxMessage.fillStyle = "white";
			ctxMessage.clearRect(20,30,500,100);
			ctxMessage.fillText("Scores : "+player.score,50,70);
		//	ctxMessage.fillText("Scores : "+player.score,65,90);
			var x_position = 220;
			for(var i = 0;i<player.red_heart;i++){
				ctxMessage.drawImage(messageImg[0],x_position,47,30,30);
				x_position += 40;
			}
			for(var i = 0;i<player.dmg_heart;i++){
				ctxMessage.drawImage(messageImg[1],x_position,47,30,30);
				x_position += 40;
			}
			for(var i = 0;i<player.gray_heart;i++){
				ctxMessage.drawImage(messageImg[2],x_position,47,30,30);
				x_position += 40;
			}	
		}	
				
		function clear_bad_bullet(Bad_bullet){
			var fire = Bad_bullet;
				ctxBadBullet.clearRect(fire.x, fire.y-10, fire.width, fire.height+10);
		}

		function loop(){
			BGM.play();
			requestAnimFrame(function(){   //Because of requestAnimFrame, it run automatically
				loop();
			});
			update();
			render();
		}

		function initImages(paths_1, paths_2, paths_3, bg, jewel, rocks , halo){
			requiredImages = paths_1.length+paths_2.length+jewel.length+paths_3.length+bg.length+rocks.length+halo.length;
			//console.log(requiredImages);
			for(i in paths_1){
				var img = new Image();
				img.src = paths_1[i];
				//console.log(img.src);
				images[i] = img;
				images[i].onload = function(){
					doneImages++;
					//console.log(doneImages);
				}
			}
			for(i in paths_2){
				var img = new Image();
				img.src = paths_2[i];
				//console.log(img.src);
				explodeImg[i] = img;
				explodeImg[i].onload = function(){
					doneImages++;
					//console.log(doneImages);
				}
			}
			for(i in paths_3){
				var img = new Image();
				img.src = paths_3[i];
				messageImg[i] = img;
				messageImg[i].onload = function(){
					doneImages++;
					//console.log(doneImages);
				}
			}
			for(i in bg){
				var img = new Image();
				img.src = bg[i];
				bg_pImg[i] = img;
				bg_pImg[i].onload = function(){
					doneImages++;
					//console.log(doneImages);
				}
			}
			for(i in jewel){
				var img = new Image();
				img.src = jewel[i];
				jewelImg[i] = img;
				jewelImg[i].onload = function(){
					doneImages++;
				}
			}
			for(i in rocks){
				var img = new Image();
				img.src = rocks[i];
				rockImg[i] = img;
				//console.log(img.src);
				rockImg[i].onload = function(){
					doneImages++;
				}
			}
			for(i in halo){
				var img = new Image();
				img.src = halo[i];
				haloImg[i] = img;
				haloImg[i].onload = function(){
					doneImages++;
				}
			}
		}
		
		function collision(first, second){
			return !(first.x > second.x+second.width || 
					 first.x+first.width <second.x   ||
					 first.y > second.y+second.height||
					 first.y+first.height <second.y  );
		}

		function checkImages(){
			//console.log(doneImages);
			if(doneImages >= requiredImages){
				//console.log(doneImages);
				init();
			}
			else{
				setTimeout(function(){
					checkImages();
				},1);
			}
		}
		initImages( ["sprit/player.png","sprit/enemy.png","sprit/p_b_M.png","sprit/p_b_L.png","sprit/p_b_R.png","sprit/e_b.png","sprit/e_b_L.png","sprit/e_b_R.png"],
					["exp/E16.png","exp/E15.png","exp/E14.png","exp/E13.png","exp/E12.png","exp/E11.png","exp/E10.png",
					"exp/E9.png","exp/E8.png","exp/E7.png","exp/E6.png","exp/E5.png","exp/E4.png","exp/E3.png","exp/E2.png","exp/E1.png"], 
					["msg/live.png","msg/dmg.png","msg/die.png","msg/start.png","msg/over.png","msg/halt.png","msg/help.png"],
					["bg/p1.png","bg/p2.png","bg/p3.png","bg/p4.png","bg/p5.png","bg/p6.png","bg/p7.png","bg/p8.png","bg/p9.png","bg/p10.png","bg/p11.png"],
					["msg/j2.png","msg/j3.png"],
					["rock/r1.png","rock/r2.png","rock/r3.png","rock/r4.png","rock/r5.png","rock/r6.png","rock/r7.png"],
					["halo/halo.png","halo/0.png","halo/1.png","halo/2.png","halo/3.png","halo/4.png"]);
		checkImages();
		//init();
	});
})();



window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.msRequestAnimationFrame     ||
          window.oRequestAnimationFrame      ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();