/**
 * Created by Administrator on 2017/1/8.
 */
function getById(id) {
    return !id ? null : document.getElementById(id);
}

function getAttr(el, k) {
    if (el) {
        var v = el.getAttribute[k] ? el.getAttribute[k] : null;
        return v;
    }
}

function setAttr(el, k, v) {
    if (el) {
        el.setAttribute(k, v);
    }
}

function getCss(el, k) {
    if (el) {

        if (el.style[k]) {
            return el.style[k];
        }
        return null;
    }
}

function setCss(el, k, v) {
    if (el) {
        if (!el.style || el.style.length == 0) {
            el.style = {};
        }
        el.style[k] = v;
    }
}

var MyGlobal = {
    mapWidth: 416,
    mapHeight: 416,
    width: 448,
    height: 512
};

//子弹对象
var Bullet = function (dir) {
    this.direction = dir ? dir : 'up';
    this.speed = 5;
    var factor = 0;
    this.tid = null;
    this.activeState = 0;
    this.blastState = 0; //爆炸状态 0-4
    this.blastReason = 0; //爆炸原因 0一般爆炸，4 集中坦克 3......
    this.x = 0;
    this.y = 0;
    if (dir) {
        switch (dir) {
            case 'up': factor = 0; break;
            case 'right': factor = 1; break;
            case 'down': factor = 2; break;
            case 'left': factor = 3; break;
        }
    }
    var el = document.createElement('div');
    var bp = 'background-position :' + (0 - 8 * factor) + 'px  0 ;';
    el.setAttribute('style', bp);
    el.setAttribute('class', 'bullet');
    this.el = el;
};

Bullet.prototype.move = function () {

    var bullet = this.el;
    var dir = this.direction;
    var xpos = getCss(bullet, 'left') ? getCss(bullet, 'left') : 0;
    var ypos = getCss(bullet, 'top') ? getCss(bullet, 'top') : 0;
    xpos = parseInt(xpos);
    ypos = parseInt(ypos);
    var mx = MyGlobal.mapWidth - 8;
    var my = MyGlobal.mapHeight - 8;
    var stop = false;
    switch (dir) {
        case 'up':
            if (ypos <= 0) {
                stop = true;
            } else {
                ypos--;
            }
            break;
        case 'right':
            if (xpos >= mx) {
                stop = true;
            } else {
                xpos++;
            }
            break;
        case 'down':
            if (ypos >= my) {
                stop = true;
            } else {
                ypos++;
            }
            break;
        case 'left':
            if (xpos <= 0) {
                stop = true;
            } else {
                xpos--;
            }
            break;
    }

    setCss(bullet, 'left', xpos + 'px');
    setCss(bullet, 'top', ypos + 'px');
    this.x = xpos;
    this.y = ypos;

    var scope = this;
    var speed = this.speed;
    var repeat = function () {
        scope.move();
    };
    if (this.tid) {
        clearTimeout(this.tid);
        this.tid = null;
    }
    if (!this.tid) {
        this.tid = setTimeout(repeat, speed);
    }
    if (stop) {
        this.blast();
    }
};

Bullet.prototype.blast = function (reason) {
    var el = this.el;
    var x = this.x - 28;
    var y = this.y - 28;
    setCss(el, 'left', x + 'px');
    setCss(el, 'top', y + 'px');
    this.x = x;
    this.y = y;
    var scope = this;
    setAttr(el, 'class', 'Boom');
    setCss(scope.el, 'backgroundPosition', '0 0');
    var action = function () {
        if (scope.blastState < (scope.blastReason + 1)) {
            var b = scope.blastState * 64 * (-1);
            b = b + 'px 0';
            setCss(scope.el, 'backgroundPosition', b);
            scope.blastState++;
            setTimeout(action, 20);
        } else {
            getById('map').removeChild(scope.el);
            delete scope;
        }
    };
    if (reason) {
        this.blastReason = reason;
    }
    setTimeout(action, 20);

    clearTimeout(this.tid);
    this.tid = null;

    //    this.blastState

};

//坦克对象
var Tank = function (id, dir, x, y) {
    this.el = getById(id);
    this.direction = dir ? dir : 'up';
    this.tid = null;
    this.speed = 10;
    //坦克活动状态 0 未活动 1 正在活动
    this.activeState = 0;
    this.x = x ? x : 100;
    this.y = y ? y : 200;
    this.dirState = {
        up: 1,
        right: 1,
        down: 1,
        left: 1
    };
};
Tank.prototype.init = function () {
    var dir = this.direction;
    var tank = this.el;
    setCss(tank, 'left', this.x + 'px');
    setCss(tank, 'top', this.y + 'px');
    this.setDirection(dir);
};
Tank.prototype.setDirection = function (dir) {
    var tank = this.el;
    if (dir == 'up') {
        setCss(tank, 'backgroundPosition', '0 0');
    }
    if (dir == 'right') {
        setCss(tank, 'backgroundPosition', '-5px -36px');
    }
    if (dir == 'down') {
        setCss(tank, 'backgroundPosition', '0 -73px');
    }
    if (dir == 'left') {
        setCss(tank, 'backgroundPosition', '0 -105px');
    }
    this.dirState[dir] = 1;
};

Tank.prototype.move = function (dir) {
    if (this.activeState != 0) return false; //正在运动我们便不管他
    this.activeState = 1; //将当前状态设置为正在运动
    if (this.direction != dir) {
        this.direction = dir;
        this.setDirection(dir);
    }
    //处理运动中的定时器
    if (this.tid) {
        clearTimeout(this.tid);
        this.tid = null;
    }
    var state = this.dirState[dir];
    var tank = this.el;
    if (state == 1 || state == -1) {
        var strPos = getCss(tank, 'backgroundPosition');
        var arrPos = strPos.split(' ');
        var l = arrPos ? arrPos[0] : 0;
        var t = arrPos ? arrPos[1] : 0;
        var curPos = parseInt(l);
        var top = parseInt(t);
        var po = curPos - (40) * (state);
        var curPos = po + 'px ' + top + 'px';
        setCss(tank, 'backgroundPosition', curPos);
        this.dirState[dir] = state == 1 ? -1 : 1;

    }
    var xpos = getCss(tank, 'left') ? getCss(tank, 'left') : 0;
    var ypos = getCss(tank, 'top') ? getCss(tank, 'top') : 0;
    xpos = parseInt(xpos);
    ypos = parseInt(ypos);
    var mx = MyGlobal.mapWidth - 32;
    var my = MyGlobal.mapHeight - 32;
    switch (dir) {
        case 'up': ypos <= 0 ? 0 : ypos--; break;
        case 'right': xpos >= mx ? mx : xpos++; break;
        case 'down': ypos >= my ? my : ypos++; break;
        case 'left': xpos <= 0 ? 0 : xpos--; break;
    }
    setCss(tank, 'left', xpos + 'px');
    setCss(tank, 'top', ypos + 'px');
    this.x = xpos;
    this.y = ypos;
    var scope = this;
    var speed = this.speed;
    var repeat = function () {
        scope.move(dir);
    };
    if (!this.tid) {
        this.tid = setTimeout(repeat, speed);
    }
    //移动结束
    this.activeState = 0;
};

Tank.prototype.stop = function () {
    clearTimeout(this.tid);
    this.tid = null;
};

Tank.prototype.fire = function () {
    var bullet = new Bullet(this.direction);
    var l = (this.x + 12) + 'px';
    var t = (this.y + 12) + 'px'
    //    top:12px;left:12px;
    var el = bullet.el;
    setCss(el, 'top', t);
    setCss(el, 'left', l);
    bullet.y = this.y + 12;
    bullet.x = this.x + 12;
    getById('map').appendChild(el);
    //    bullet.el = this.el.getElementsByTagName('div')[0];
    bullet.move();
};


//实际应用
var tank = new Tank('me', 'right', 100, 100);
tank.init();

function getDir(code) {
    if (code == '87' || code == '119') {
        return 'up';
    }
    if (code == '100' || code == '68') {
        return 'right';
    }
    if (code == '115' || code == '83') {
        return 'down';
    }
    if (code == '97' || code == '65') {
        return 'left';
    }
    return null;
}

document.onkeydown = function (evt) {
    evt = (evt) ? evt : window.event;
    var keyCode = evt.keyCode;
    var charCode = evt.charCode;
    var dir = getDir();
    if (keyCode) {
        dir = getDir(keyCode.toString());
    }
    if (charCode) {
        dir = getDir(charCode.toString());
    }
    if (dir)
        tank.move(dir);
    if (charCode == '106' || keyCode == '74') {
        tank.fire();
    }
    evt.preventDefault();
    return false;
};
document.onkeyup = function (evt) {
    tank.stop();
};
document.onkeypress = function (evt) {
    evt = (evt) ? evt : window.event;
    var keyCode = evt.keyCode;
    var charCode = evt.charCode;
    var dir = getDir();
    if (keyCode) {
        dir = getDir(keyCode.toString());
    }
    if (charCode) {
        dir = getDir(charCode.toString());
    }
    if (dir)
        tank.move(dir);
    if (charCode == '106' || keyCode == '74') {
        tank.fire();
    }
    evt.preventDefault();
    return false;
};