export default class NPC {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.id = config.id;
        
        if (this.id === 'master') {
            this.sprite = scene.add.image(config.position.x, config.position.y, config.id);
            this.sprite.setDisplaySize(64, 80);
        } else if (this.id === 'kilnWorker' || this.id === 'wajiang') {
            this.sprite = scene.add.sprite(config.position.x, config.position.y, config.id);
            this.sprite.setDisplaySize(80, 100);
            this.sprite.play(`${this.id}-idle`);
        } else {
            this.sprite = scene.add.sprite(config.position.x, config.position.y, config.id);
            this.sprite.setDisplaySize(64, 80);
            this.sprite.play(`${this.id}-idle`);
        }
        
        this.sprite.setDepth(5);
        this.sprite.setOrigin(0.5, 1);
        
        this.originalY = config.position.y;
        this.breathTime = Math.random() * Math.PI * 2;
        
        this.interactionRadius = 120;
        this.isInteractable = true;
    }
    
    update() {
        this.breathTime += 0.02;
        const breath = Math.sin(this.breathTime) * 1.5;
        this.sprite.y = this.originalY + breath;
    }
    
    distanceTo(playerPos) {
        const dx = this.sprite.x - playerPos.x;
        const dy = this.originalY - playerPos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isInRange(playerPos) {
        return this.distanceTo(playerPos) <= this.interactionRadius;
    }
    
    highlight(active) {
        if (active) {
            this.sprite.setTint(0x88ff88);
        } else {
            this.sprite.clearTint();
        }
    }
    
    destroy() {
        this.sprite.destroy();
    }
}
