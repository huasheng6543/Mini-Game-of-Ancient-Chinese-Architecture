export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    
    preload() {
        this.createLoadingBar();
        
        this.load.atlas('player', 'assets/characters/player.png', 'assets/characters/player.atlas.json');
        this.load.atlas('gongfang', 'assets/buildings/gongfang.atlas.png', 'assets/buildings/gongfang.atlas.json');
        this.load.atlas('wafang', 'assets/buildings/wafang.atlas.png', 'assets/buildings/wafang.atlas.json');
        this.load.atlas('yaochang', 'assets/buildings/yaochang.atlas.png', 'assets/buildings/yaochang.atlas.json');
        this.load.atlas('mujiang', 'assets/characters/mujiang.atlas.png', 'assets/characters/mujiang.atlas.json');
        this.load.atlas('shijiang', 'assets/characters/shijiang.atlas.png', 'assets/characters/shijiang.atlas.json');
        this.load.atlas('kilnWorker', 'assets/characters/kilnWorker.atlas.png', 'assets/characters/kilnWorker.atlas.json');
        this.load.atlas('wajiang', 'assets/characters/wajiang.atlas.png', 'assets/characters/wajiang.atlas.json');
        this.load.atlas('shumu', 'assets/characters/shumu.atlas.png', 'assets/characters/shumu.atlas.json');
        this.load.image('master', 'assets/characters/master.png');
        this.load.image('map_bg', 'assets/map/map.png');
    }
    
    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();
        
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
        
        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: '准备建造...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);
        
        this.percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        this.percentText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            this.updateLoadingBar(value);
        });
        
        this.load.on('complete', () => {
            this.destroyLoadingBar();
        });
    }
    
    updateLoadingBar(value) {
        if (this.percentText && this.progressBar) {
            this.percentText.setText(parseInt(value * 100) + '%');
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffd700, 1);
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;
            this.progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        }
    }
    
    destroyLoadingBar() {
        if (this.progressBar) this.progressBar.destroy();
        if (this.progressBox) this.progressBox.destroy();
        if (this.loadingText) this.loadingText.destroy();
        if (this.percentText) this.percentText.destroy();
    }
    
    create() {
        this.scene.start('GameScene');
    }
}
