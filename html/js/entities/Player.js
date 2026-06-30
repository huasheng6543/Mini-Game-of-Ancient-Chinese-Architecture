export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, 'player');
        this.sprite.setDepth(10);
        this.sprite.setOrigin(0.5, 0.85);
        
        this.targetX = x;
        this.targetY = y;
        this.speed = 120;
        this.isMoving = false;
        this.walkTime = 0;
        this.originalY = y;
        this.currentDirection = 'down';
        
        this.createAnimations();
        this.sprite.play('player-down-stand');
    }
    
    createAnimations() {
        const directions = ['down', 'left', 'right', 'up'];
        
        directions.forEach(dir => {
            this.scene.anims.create({
                key: `player-${dir}-walk`,
                frames: [
                    { key: 'player', frame: `${dir}.step1` },
                    { key: 'player', frame: `${dir}.step2` }
                ],
                frameRate: 6,
                repeat: -1
            });
            
            this.scene.anims.create({
                key: `player-${dir}-stand`,
                frames: [{ key: 'player', frame: `${dir}.stand` }],
                frameRate: 1,
                repeat: 0
            });
        });
    }
    
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
    }
    
    update() {
        if (!this.isMoving) {
            return;
        }
        
        const dx = this.targetX - this.sprite.x;
        const dy = this.targetY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.isMoving = false;
            this.sprite.y = this.originalY;
            this.sprite.play(`player-${this.currentDirection}-stand`);
            return;
        }
        
        const moveX = (dx / distance) * this.speed * (1/60);
        const moveY = (dy / distance) * this.speed * (1/60);
        
        this.sprite.x += moveX;
        this.sprite.y += moveY;
        this.originalY += moveY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                this.currentDirection = 'right';
            } else {
                this.currentDirection = 'left';
            }
        } else {
            if (dy > 0) {
                this.currentDirection = 'down';
            } else {
                this.currentDirection = 'up';
            }
        }
        
        const currentAnim = this.sprite.anims.currentAnim;
        if (!currentAnim || currentAnim.key !== `player-${this.currentDirection}-walk`) {
            this.sprite.play(`player-${this.currentDirection}-walk`);
        }
    }
    
    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
    
    destroy() {
        this.sprite.destroy();
    }
}
