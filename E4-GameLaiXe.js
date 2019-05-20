let l = console.log;
let myCanvas = document.getElementById('myCanvas');
let ctx = myCanvas.getContext('2d');
let myCanvas2 = document.getElementById('myCanvas2');
let ctx2 = myCanvas2.getContext('2d');
const EASY_SPEED=0.5;
const MEDIUM_SPEED=1;
const HARD_SPEED=3;
const INCREASE_SPEED = 2;
const DEFAULT_ACCELERATION = 1;//gia tốc xe
const ORIENTATION_UP = 'up';
const ORIENTATION_DOWN = 'down';
const ORIENTATION_LEFT = 'left';
const ORIENTATION_RIGHT = 'right';
const DEFAULT_ORIENTATION = ORIENTATION_RIGHT;
const CV_WIDTH = myCanvas.width;
const CV_HEIGHT = myCanvas.height;
const CTRL_KEY = 17;
const IMG_SIZE = 50;
const DELAY_TIME = 0;
const NUMBERS_OBSTACLES = 10;
const NUMBERS_BAITS = 10;
const BAIT_SIZE = 30;
//khai báo lớp Chướng ngại vật
let Obstacles = function () {
    this.x = Math.floor(Math.random() * (CV_WIDTH - 150) + 100); //việc -150 và +100 là để tránh sinh chướng ngại vật gần điểm xuất phát của ô tô
    this.y = Math.floor(Math.random() * (CV_HEIGHT - 150) + 100);
    this.color = getRandomColor();
    this.size = Math.floor(Math.random() * 50 + 10);//kích thước nhỏ nhất sẽ bằng 10, lớn nhất bằng 50+10
    this.draw = function () {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
};
//khai báo lớp Mồi
// let Bait = function () {
//     this.x = Math.floor(Math.random() * (CV_WIDTH - 40) + 20); //việc -40 và +20 là để tránh sinh mồi sát đường biên
//     this.y = Math.floor(Math.random() * (CV_HEIGHT - 40) + 20);
//     this.size = BAIT_SIZE;
//     this.color = 'red';
//     this.draw = function () {
//         ctx2.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
//         ctx2.beginPath();
//         ctx2.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
//         ctx2.fillStyle = this.color;
//         ctx2.fill();
//         ctx2.closePath();
//         setTimeout(this.draw, 100);
//     }
// }
// khai báo lớp mồi là ảnh
let Bait=function(){
    this.x = Math.floor(Math.random() * (CV_WIDTH - BAIT_SIZE*2) + BAIT_SIZE); //việc -BAIT_SIZE*2 và +BAIT_SIZE là để tránh sinh mồi sát đường biên
    this.y = Math.floor(Math.random() * (CV_HEIGHT - BAIT_SIZE*2) + BAIT_SIZE);
    this.size = BAIT_SIZE;
    this.draw=function () {
        ctx2.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
        let img=new Image();
        let x=this.x;
        let y=this.y;
        let sizeWidth=this.size;
        let sizeHeight=this.size;
        img.src='Diamond.png';
        img.onload=function () {
            ctx2.drawImage(img,x,y,sizeWidth,sizeHeight);
        };
        setTimeout(this.draw, 100);
    };
};
//khai báo lớp Xe
let Car = function () {
    //để tránh nhầm lẫn trong việc thực thi từ 'this' trong function, ta đặt self=this ở ngay đầu khai báo lớp để dùng trong function
    let self = this;
    this.x = 0;
    this.y = 0;
    this.sizeWidth = IMG_SIZE;
    this.sizeHeight = IMG_SIZE - 20;
    this.acceleration = DEFAULT_ACCELERATION;
    this.setSpeed=function () {
        let easy=document.getElementById('easy').checked;
        let medium=document.getElementById('medium').checked;
        let hard=document.getElementById('hard').checked;
        if (easy){
            this.speed=EASY_SPEED;
        } else if (medium){
            this.speed=MEDIUM_SPEED;
        } else {
            this.speed=HARD_SPEED;
        }
    }
    this.orientation = DEFAULT_ORIENTATION;
    this.image = 'yellowCar-' + this.orientation + '.png';
    this.show = function () {
        let image = new Image();
        let x = this.x;
        let y = this.y;
        let imageSizeWidth = this.sizeWidth;
        let imageSizeHeight = this.sizeHeight;
        image.onload = function () {
            ctx.drawImage(image, x, y, imageSizeWidth, imageSizeHeight);
        };
        image.src = this.image;

    };
    //cho phương thức này khai báo ở thẻ body với sự kiện onkeydown
    this.changeOrientation = function (event) {
        switch (event.keyCode) {
            case 37:
                this.orientation = ORIENTATION_LEFT;
                break;
            case 38:
                this.orientation = ORIENTATION_UP;
                break;
            case 39:
                this.orientation = ORIENTATION_RIGHT;
                break;
            case 40:
                this.orientation = ORIENTATION_DOWN;
                break;
        }
        //khi thay ảnh cần set lại kích thước để ảnh không bị méo, do mình set kích thước 2 chiều ko bằng nhau
        if (this.orientation == 'left' || this.orientation == 'right') {
            this.sizeWidth = IMG_SIZE;
            this.sizeHeight = IMG_SIZE - 20;
        } else {
            this.sizeWidth = IMG_SIZE - 20;
            this.sizeHeight = IMG_SIZE;
        }
        this.image = 'yellowCar-' + this.orientation + '.png';
    };
    this.move = function () {
        switch (this.orientation) {
            case ORIENTATION_UP:
                this.y -= this.speed;
                break;
            case ORIENTATION_DOWN:
                this.y += this.speed;
                break;
            case ORIENTATION_LEFT:
                this.x -= this.speed;
                break;
            case ORIENTATION_RIGHT:
                this.x += this.speed;
                break;
        }
    };
    this.fastSpeed = function () {
        this.setSpeed();
        this.speed += INCREASE_SPEED;
    };
    this.eatBait = function (bait) {
        //điều kiện dành cho mồi là hình tròn
        // let carTouchBait = this.x + this.sizeWidth >= bait.x - bait.size && this.x <= bait.x + bait.size &&
        //     this.y + this.sizeHeight >= bait.y - bait.size && this.y <= bait.y + bait.size;
        //điều kiện dành cho mồi là ảnh
        let carTouchBait = this.x + this.sizeWidth >= bait.x && this.x <= bait.x + bait.size &&
            this.y + this.sizeHeight >= bait.y && this.y <= bait.y + bait.size;
        if (carTouchBait) {
            return true;
        }
        return false;

    }
};
//khai báo lớp Game
let Game = function () {
    let self = this;
    this.car = new Car();
    //set speed theo level ng choi lua chon
    this.car.setSpeed();
    this.bait = new Bait();
    //khởi tạo nhiều chướng ngại vật và lưu vào mảng đc khai báo Global
    this.createMultipleObstacles = function () {
        for (let i = 0; i < NUMBERS_OBSTACLES; i++) {
            this.obstacle = new Obstacles();
            obstacles.push(this.obstacle);
        }
        this.obstacles = obstacles;
    };
    //vẽ nhiều chướng ngại vật từ thông số đã khởi tạo ở trên
    this.drawMultipleObstacles = function () {
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].draw();
        }
    };
    self.createBait = function () {
        this.bait = new Bait();
        for (let i = 0; i < this.obstacles.length; i++) {
            //điều kiện trung của hình tròn
            // let isDuplicated = this.bait.x + this.bait.size >= this.obstacles[i].x &&
            //     this.bait.x - this.bait.size <= this.obstacles[i].x + this.obstacles[i].size &&
            //     this.bait.y + this.bait.size >= this.obstacles[i].y &&
            //     this.bait.y - this.bait.size <= this.obstacles[i].y + this.obstacles[i].size;
            //điều kiện trùng của ảnh
            let isDuplicated = this.bait.x + this.bait.size >= this.obstacles[i].x &&
                this.bait.x <= this.obstacles[i].x + this.obstacles[i].size &&
                this.bait.y + this.bait.size >= this.obstacles[i].y &&
                this.bait.y <= this.obstacles[i].y + this.obstacles[i].size;
            if (isDuplicated) {
                this.bait = new Bait();
            }
        }
    }
    this.start = function () {
        ctx.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
        //để tránh nhầm lẫn trong việc thực thi từ 'this' trong function, ta đặt self=this ở ngay đầu khai báo lớp để dùng trong function
        self.car.move();
        self.car.show();
        self.drawMultipleObstacles();
        self.bait.draw();
        if (self.car.eatBait(self.bait)) {
            self.createBait();
            self.bait.draw();
            scores++;
            document.getElementById('scores').innerHTML = scores;
            // ctx.clearRect(self.bait.x-self.bait.size,self.bait.y-self.bait.size,self.bait.x+self.bait.size,self.bait.y+self.bait.size);
        }
        window.addEventListener('keydown', function (e) {
            if (e.keyCode == CTRL_KEY) {
                self.car.fastSpeed();
            }
        });
//trở về tốc độ bình thường khi ng dùng nhả phím Ctrl
        window.addEventListener('keyup', function (e) {
            if (e.keyCode == CTRL_KEY) {
                self.car.setSpeed();
            }
        });
        if (self.gameOver()) {
            return; //nếu game over thì thoát
        }

        mySettimeout_Start=setTimeout(self.start, DELAY_TIME);
    };
    this.gameOver = function () {
        for (let i = 0; i < self.obstacles.length; i++) {
            let carTouchObstacle = ((this.car.x + this.car.sizeWidth >= this.obstacles[i].x && this.car.x <= (this.obstacles[i].x + this.obstacles[i].size)) &&
                (this.car.y + this.car.sizeHeight >= this.obstacles[i].y && this.car.y <= (this.obstacles[i].y + this.obstacles[i].size)));
            let carTouchWall = (this.car.x < 0 || this.car.x + this.car.sizeWidth > CV_WIDTH || this.car.y < 0 || this.car.y + this.car.sizeHeight > CV_HEIGHT);
            if (carTouchObstacle || carTouchWall) {
                alert('Game Over');
                return true;
            }
        }


    }
};
//hàm để chọn ngẫu nhiên các số từ 0 đến 255
function getRandomHex() {
    return Math.floor(Math.random() * 255);
}
//hàm để chọn ngẫu nhiên màu (rgb('red','green','blue') dựa vào mã ngẫu nhiên (0-255) đã chọn ở trên
function getRandomColor() {
    let red = getRandomHex();
    let green = getRandomHex();
    let blue = getRandomHex();
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
}
function playReady() {
    countDown(3);
}
function countDown(time) {
    if (time>0){
        ctx.clearRect(0,0,CV_WIDTH,CV_HEIGHT);
        ctx.textAlign="center";
        ctx.font="150px Comic Sans MS";
        ctx.fillStyle='green';
        ctx.fillText(time,CV_WIDTH/2,CV_HEIGHT/2);
        l(time);
        setTimeout(function(){countDown(time-1)},1000);
    } else {
        game = new Game();
        obstacles = [];
        scores = 0;
        game.createMultipleObstacles();
        game.car.show();
        game.drawMultipleObstacles();
        game.bait.draw();
        game.start();
    }
}
function playReset() {
    ctx.clearRect(0,0,CV_WIDTH,CV_HEIGHT);
    ctx2.clearRect(0,0,CV_WIDTH,CV_HEIGHT);
    game = new Game();
    obstacles = [];
    scores = 0;
    document.getElementById('scores').innerHTML = scores;
    window.clearTimeout(mySettimeout_Start);
}
let game = new Game();
let obstacles = [];
let scores = 0;
let mySettimeout_Start;