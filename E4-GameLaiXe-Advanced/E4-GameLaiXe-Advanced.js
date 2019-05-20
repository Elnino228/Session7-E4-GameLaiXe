let l = console.log;
let myCanvas = document.getElementById('myCanvas');
let ctx = myCanvas.getContext('2d');
let myCanvas2 = document.getElementById('myCanvas2');
let ctx2 = myCanvas2.getContext('2d');
const EASY_SPEED = 0.3;
const MEDIUM_SPEED = 0.4;
const HARD_SPEED = 0.5;
const DEFAULT_SPEED = 0.5;
const INCREASE_SPEED = 2;
const ORIENTATION_UP = 'up';
const ORIENTATION_DOWN = 'down';
const ORIENTATION_LEFT = 'left';
const ORIENTATION_RIGHT = 'right';
const DEFAULT_ORIENTATION = ORIENTATION_UP;
const CV_WIDTH = myCanvas.width;
const CV_HEIGHT = myCanvas.height;
const CTRL_KEY = 17;
const SPACE_KEY = 32;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;
const IMG_SIZE = 50;
const DELAY_TIME = 0;
const NUMBERS_OBSTACLES = 20;
const OBSTACLES_SIZE = 30;
const NUMBERS_BAITS = 10;
const BULLET_SIZE = 10;
const BULLET_SPEED = 4;
//khai báo lớp Chướng ngại vật
let Obstacles = function () {
    this.x = Math.floor(Math.random() * (CV_WIDTH - OBSTACLES_SIZE*2) + OBSTACLES_SIZE); //việc -150 và +100 là để tránh sinh chướng ngại vật gần điểm xuất phát của ô tô
    this.y = Math.floor(Math.random() * (-CV_HEIGHT));
    this.color = getRandomColor();
    this.size = OBSTACLES_SIZE;
    this.setSpeed = function () {
        let easy = document.getElementById('easy').checked;
        let medium = document.getElementById('medium').checked;
        let hard = document.getElementById('hard').checked;
        if (easy) {
            this.speed = EASY_SPEED;
        } else if (medium) {
            this.speed = MEDIUM_SPEED;
        } else {
            this.speed = HARD_SPEED;
        }
    }
    this.draw = function () {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    this.moveDown = function () {
        this.y += this.speed;
    }
};
//khai báo lớp Mồi
let Bullet = function () {
    let self=this;
    this.x;
    this.y;
    this.size = BULLET_SIZE;
    this.color = 'red';
    this.speed = BULLET_SPEED;
    this.draw = function () {
        // ctx2.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
        ctx2.beginPath();
        ctx2.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx2.fillStyle = this.color;
        ctx2.fill();
        ctx2.closePath();
        // setTimeout(this.draw, 100);
    }
    this.moveUp = function () {
        ctx2.clearRect(0,0,CV_WIDTH,CV_HEIGHT);
        self.y -= self.speed;
        self.draw();
        if (self.stop()){
            // clearTimeout(mySettimeout_MoveUp);
            ctx2.clearRect(self.x-self.size,self.y-self.size,self.size*2,self.size*2);
            return;
        }
        mySettimeout_MoveUp=setTimeout(self.moveUp, DELAY_TIME);
    }
    this.stop = function () {
        for (let i=0;i<obstacles.length;i++){
            let bulletTouchObstacle = (this.x + this.size >= obstacles[i].x && this.x - this.size <= obstacles[i].x + obstacles[i].size &&
                this.y - this.size <= obstacles[i].y + obstacles[i].size);
            let bulletTouchTopWall=this.y+this.size<=0;
            if (bulletTouchObstacle) {
                let removeItem=obstacles.splice(i,1);
                let obstacle=new Obstacles();
                obstacle.setSpeed();
                obstacles.push(obstacle);
            }
            if (bulletTouchObstacle || bulletTouchObstacle) return true;
        }

        return false;
    }
}
// khai báo lớp mồi là ảnh
// let Bait = function () {
//     this.x = Math.floor(Math.random() * (CV_WIDTH - BAIT_SIZE * 2) + BAIT_SIZE); //việc -BAIT_SIZE*2 và +BAIT_SIZE là để tránh sinh mồi sát đường biên
//     this.y = Math.floor(Math.random() * (CV_HEIGHT - BAIT_SIZE * 2) + BAIT_SIZE);
//     this.size = BAIT_SIZE;
//     this.draw = function () {
//         ctx2.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
//         let img = new Image();
//         let x = this.x;
//         let y = this.y;
//         let sizeWidth = this.size;
//         let sizeHeight = this.size;
//         img.src = 'Diamond.png';
//         img.onload = function () {
//             ctx2.drawImage(img, x, y, sizeWidth, sizeHeight);
//         };
//         setTimeout(this.draw, 100);
//     };
// };
//khai báo lớp Xe
let Car = function () {
    //để tránh nhầm lẫn trong việc thực thi từ 'this' trong function, ta đặt self=this ở ngay đầu khai báo lớp để dùng trong function
    let self = this;
    this.x = CV_WIDTH / 2;
    this.y = CV_HEIGHT - IMG_SIZE;
    this.sizeWidth = IMG_SIZE - 20;
    this.sizeHeight = IMG_SIZE;
    this.speed = DEFAULT_SPEED;
    this.orientation = DEFAULT_ORIENTATION;
    this.image = 'yellowCar-up.png';
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
        l(event.keyCode);
        switch (event.keyCode) {
            case LEFT_ARROW_KEY:
                this.orientation = ORIENTATION_LEFT;
                break;
            case RIGHT_ARROW_KEY:
                this.orientation = ORIENTATION_RIGHT;
                break;
        }
    };
    this.move = function () {
        switch (this.orientation) {
            case ORIENTATION_LEFT:
                if (this.x <= 0) {
                    this.x = CV_WIDTH;
                }
                this.x -= this.speed;
                break;
            case ORIENTATION_RIGHT:
                if (this.x >= CV_WIDTH) {
                    this.x = 0;
                }
                this.x += this.speed;
                break;
        }
    };
    this.fastSpeed = function () {
        this.setSpeed();
        this.speed += INCREASE_SPEED;
    };
    this.loadedBullet = function () {
        let bullet = new Bullet();
        this.bullet = bullet;
        this.bullet.x = this.x + this.sizeWidth / 2;
        this.bullet.y = this.y;
    }
    this.shoot = function () {
        // ctx2.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
        self.loadedBullet();
        self.bullet.moveUp();
    }
};
//khai báo lớp Game
let Game = function () {
    let self = this;
    this.car = new Car();
    //set speed theo level ng choi lua chon
    //khởi tạo nhiều chướng ngại vật và lưu vào mảng đc khai báo Global
    this.createMultipleObstacles = function () {
        for (let i = 0; i < NUMBERS_OBSTACLES; i++) {
            this.obstacle = new Obstacles();
            this.obstacle.setSpeed();
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
    this.start = function () {
        ctx.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
        // ctx2.clearRect(0,0,CV_WIDTH,CV_HEIGHT);
        self.car.move();
        self.car.show();
        for (let i = 0; i < self.obstacles.length; i++) {
            self.obstacles[i].moveDown();
            if (self.obstacles[i].y >= CV_HEIGHT) {
                self.obstacles[i].x = Math.floor(Math.random() * (CV_WIDTH - 150) + 100);
                self.obstacles[i].y = Math.floor(Math.random() * (-CV_HEIGHT));
            }
            self.obstacles[i].draw();
        }
        if (self.gameOver()) {
            return; //nếu game over thì thoát
        }
        mySettimeout_Start = setTimeout(self.start, DELAY_TIME);
    };
    this.gameOver = function () {
        for (let i = 0; i < self.obstacles.length; i++) {
            let carTouchObstacle = this.car.x + this.car.sizeWidth >= this.obstacles[i].x &&
                this.car.x <= this.obstacles[i].x + this.obstacles[i].size &&
                this.car.y <= this.obstacles[i].y+this.obstacles[i].size;
            let wallTouchObstacle = this.obstacles[i].y+this.obstacles[i].size>=CV_HEIGHT;
            if (carTouchObstacle || wallTouchObstacle) {
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
    if (time > 0) {
        ctx.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
        ctx.textAlign = "center";
        ctx.font = "150px Comic Sans MS";
        ctx.fillStyle = 'green';
        ctx.fillText(time, CV_WIDTH / 2, CV_HEIGHT / 2);
        l(time);
        setTimeout(function () {
            countDown(time - 1)
        }, 1000);
    } else {
        game = new Game();
        obstacles = [];
        scores = 0;
        game.createMultipleObstacles();
        game.car.show();
        game.drawMultipleObstacles();
        game.start();
    }
}

function playReset() {
    ctx.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
    ctx2.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
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
let mySettimeout_MoveUp;
window.addEventListener('keydown',function (e) {
    if (e.keyCode==CTRL_KEY){
        game.car.shoot();
        l('ok');
    }
});