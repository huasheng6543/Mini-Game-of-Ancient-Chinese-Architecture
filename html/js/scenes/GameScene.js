import { GAME_CONFIG } from '../config.js';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import Backpack from '../utils/Backpack.js';
import DialogueManager from '../utils/DialogueManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.npcs = [];
        this.backpack = null;
        this.dialogueManager = null;
        this.currentTaskId = 0;
        this.collectAreas = [];
        this.isCollecting = false;
        this.gameStarted = false;
        this.buildingProgress = 0;
        this.knowledgeCallback = null;
        this.currentCollectArea = null;
        this.choppingCount = 0;
        this.choppingTimer = null;
        this.choppingTimeLeft = 5;
        this.choppingInterval = null;
        this.treeSprite = null;
        this.stoneCount = 0;
        this.stoneTimeLeft = 60;
        this.stoneInterval = null;
        this.filledSlots = [];
        this.selectedPiece = null;
        this.availablePieces = [];
        this.placementHistory = [];
        this.mortiseSelectedTenon = null;
        this.mortisePairs = [];
        this.mortiseMatched = 0;
        this.mortiseTimeLeft = 90;
        this.mortiseInterval = null;
        this.brickTemperature = 600;
        this.brickStableTime = 0;
        this.brickTimeLeft = 30;
        this.brickInterval = null;
        this.brickCount = 0;
        this.temperatureAdjustment = 0;
        this.lastHeatTime = Date.now();
        this.heatClickCount = 0;
        this.tileLevel = 1;
        this.tileTimeLeft = 60;
        this.tileProgress = 0;
        this.selectedTile = null;
        this.tileSlots = [];
        this.tileInterval = null;
    }
    
    create() {
        this.createBackground();
        this.createCollectAreas();
        this.createPlayer();
        this.createNPCAnimations();
        this.createNPCs();
        this.setupSystems();
        this.setupInput();
        this.updateTaskUI();
        
        if (typeof setGameScene === 'function') {
            setGameScene(this);
        }
    }
    
    createBackground() {
        const mapBg = this.add.image(0, 0, 'map_bg');
        mapBg.setOrigin(0);
        mapBg.setDepth(0);
        
        // 输出地图大小和采石场位置
        console.log('地图尺寸:', mapBg.width, 'x', mapBg.height);
        console.log('采石场位置:', GAME_CONFIG.COLLECT_AREAS.quarry);
        
        // 设置相机边界，使玩家可以在整个地图上移动
        this.cameras.main.setBounds(0, 0, mapBg.width, mapBg.height);
    }
    
    createCollectAreas() {
        Object.entries(GAME_CONFIG.COLLECT_AREAS).forEach(([key, area]) => {
            let rect = null;
            let label = null;
            let buildingSprite = null;
            
            // 输出每个区域的信息
            console.log('创建收集区域:', key, area);
            
            if (!area.hidden) {
                const centerX = area.x + area.width / 2;
                const centerY = area.y + area.height / 2;
                
                if (key === 'workshop') {
                    buildingSprite = this.add.sprite(centerX, centerY, 'gongfang');
                    buildingSprite.setFrame('gongfang.stand');
                    buildingSprite.setDisplaySize(area.width, area.height);
                    buildingSprite.setOrigin(0.5, 0.8);
                    buildingSprite.setDepth(1);
                } else if (key === 'kiln') {
                    buildingSprite = this.add.sprite(centerX, centerY, 'yaochang');
                    buildingSprite.setDisplaySize(area.width, area.height);
                    buildingSprite.setOrigin(0.5, 0.8);
                    buildingSprite.setDepth(1);
                    this.createBuildingAnimation('yaochang', ['yaochang.0', 'yaochang.1', 'yaochang.2', 'yaochang.3']);
                    buildingSprite.play('yaochang-animate');
                } else if (key === 'tileWorkshop') {
                    buildingSprite = this.add.sprite(centerX, centerY, 'wafang');
                    buildingSprite.setDisplaySize(area.width, area.height);
                    buildingSprite.setOrigin(0.5, 0.8);
                    buildingSprite.setDepth(1);
                    this.createBuildingAnimation('wafang', ['wafang.0', 'wafang.1', 'wafang.2', 'wafang.3']);
                    buildingSprite.play('wafang-animate');
                } else {
                    rect = this.add.rectangle(
                        centerX,
                        centerY,
                        area.width,
                        area.height,
                        0x000000,
                        0.2
                    );
                    rect.setStrokeStyle(3, 0xffd700, 0.8);
                    rect.setDepth(1);
                }
                
                label = this.add.text(
                    centerX,
                    area.y - 20,
                    `${area.icon} ${area.name}`,
                    {
                        fontSize: '16px',
                        fill: '#ffd700',
                        fontStyle: 'bold',
                        backgroundColor: 'rgba(0,0,0,0.6)'
                    }
                ).setOrigin(0.5).setPadding(5, 3).setDepth(2);
            }
            
            this.collectAreas.push({
                key,
                area,
                rect,
                label,
                buildingSprite
            });
        });
    }
    
    createBuildingAnimation(atlasKey, frameNames) {
        this.anims.create({
            key: `${atlasKey}-animate`,
            frames: frameNames.map(frame => ({ key: atlasKey, frame: frame })),
            frameRate: 5,
            repeat: -1
        });
    }
    
    createNPCAnimation(atlasKey, frameCount) {
        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            frames.push({ key: atlasKey, frame: `${atlasKey}.${i}` });
        }
        this.anims.create({
            key: `${atlasKey}-idle`,
            frames: frames,
            frameRate: 3,
            repeat: -1
        });
    }
    
    createNPCAnimations() {
        this.createNPCAnimation('mujiang', 4);
        this.createNPCAnimation('shijiang', 2);
        this.createNPCAnimation('kilnWorker', 4);
        this.createNPCAnimation('wajiang', 2);
        this.createTreeAnimation();
    }
    
    createTreeAnimation() {
        this.anims.create({
            key: 'tree-idle',
            frames: [{ key: 'shumu', frame: 'shumu.0' }],
            frameRate: 1,
            repeat: -1
        });
        
        this.anims.create({
            key: 'tree-shake',
            frames: [
                { key: 'shumu', frame: 'shumu.0' },
                { key: 'shumu', frame: 'shumu.1' },
                { key: 'shumu', frame: 'shumu.2' }
            ],
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'tree-fall',
            frames: [
                { key: 'shumu', frame: 'shumu.2' },
                { key: 'shumu', frame: 'shumu.3' }
            ],
            frameRate: 2,
            repeat: 0
        });
    }
    
    createPlayer() {
        this.player = new Player(this, 150, 500);
        
        // 让相机跟随玩家，使玩家可以探索整个地图
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    }
    
    createNPCs() {
        GAME_CONFIG.NPCS.forEach(config => {
            const npc = new NPC(this, config);
            this.npcs.push(npc);
        });
    }
    
    setupSystems() {
        this.backpack = new Backpack();
        this.dialogueManager = new DialogueManager();
    }
    
    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            if (!this.gameStarted) return;
            if (this.isCollecting) return;
            
            const knowledgeModal = document.getElementById('knowledge-modal');
            if (knowledgeModal && knowledgeModal.classList.contains('active')) return;
            
            if (this.dialogueManager.isDialogueActive()) return;
            
            const clickedNPC = this.checkNPCClick(pointer);
            if (clickedNPC) {
                this.interactWithNPC(clickedNPC);
                return;
            }
            
            const clickedArea = this.checkCollectAreaClick(pointer);
            if (clickedArea) {
                this.tryCollect(clickedArea);
                return;
            }
            
            this.player.moveTo(pointer.worldX, pointer.worldY);
        });
    }
    
    checkNPCClick(pointer) {
        for (const npc of this.npcs) {
            const bounds = new Phaser.Geom.Rectangle(
                npc.sprite.x - 30,
                npc.sprite.y - 40,
                60,
                80
            );
            if (bounds.contains(pointer.worldX, pointer.worldY)) {
                return npc;
            }
        }
        return null;
    }
    
    checkCollectAreaClick(pointer) {
        for (const areaData of this.collectAreas) {
            const { key, area } = areaData;
            const bounds = new Phaser.Geom.Rectangle(
                area.x,
                area.y,
                area.width,
                area.height
            );
            if (bounds.contains(pointer.worldX, pointer.worldY)) {
                return areaData;
            }
        }
        return null;
    }
    
    interactWithNPC(npc) {
        const currentTask = GAME_CONFIG.TASKS[this.currentTaskId];
        if (!currentTask) return;
        
        if (!npc.isInRange(this.player.getPosition())) {
            this.showHint(`请靠近${npc.config.name}再交谈`);
            return;
        }
        
        const npcConfig = GAME_CONFIG.NPCS.find(n => n.id === npc.id);
        
        if (currentTask.npcId === npc.id) {
            this.handleTaskNPCInteraction(npc, npcConfig, currentTask);
        } else {
            this.dialogueManager.startDialogue(
                [`你好，我是${npcConfig.name}，现在很忙，稍后再来找我吧！`],
                npcConfig.name
            );
        }
    }
    
    handleTaskNPCInteraction(npc, npcConfig, currentTask) {
        console.log('当前任务ID:', this.currentTaskId);
        console.log('当前任务:', currentTask);
        console.log('点击的NPC ID:', npc.id);
        console.log('任务要求:', currentTask.requirement);
        if (currentTask.requirement) {
            console.log('背包材料数量:', this.backpack.getItemCount(currentTask.requirement.material));
            console.log('是否满足要求:', this.backpack.hasItems(currentTask.requirement.material, currentTask.requirement.count));
        }
        
        if (this.currentTaskId === 0) {
            this.dialogueManager.startDialogue(
                [npcConfig.dialogues.initial, npcConfig.dialogues.task_intro],
                npcConfig.name,
                () => {
                    this.showKnowledge(currentTask.knowledge, () => {
                        this.currentTaskId = 1;
                        console.log('更新任务ID为:', this.currentTaskId);
                        this.updateTaskUI();
                    });
                }
            );
        } else if (currentTask.requirement) {
            const taskIntro = this.getTaskIntro(npcConfig, this.currentTaskId);
            const taskComplete = this.getTaskComplete(npcConfig, this.currentTaskId);
            const nextTask = this.getNextTask(npcConfig, this.currentTaskId);
            
            console.log('任务介绍:', taskIntro);
            console.log('任务完成:', taskComplete);
            console.log('下一个任务:', nextTask);
            
            if (this.backpack.hasItems(currentTask.requirement.material, currentTask.requirement.count)) {
                console.log('满足任务要求，显示完成对话');
                this.dialogueManager.startDialogue(
                    [taskComplete],
                    npcConfig.name,
                    () => {
                        console.log('完成对话结束，显示知识');
                        this.showKnowledge(currentTask.knowledge, () => {
                            console.log('知识显示结束');
                            if (nextTask) {
                                console.log('有下一个任务对话，显示');
                                this.dialogueManager.startDialogue(
                                    [nextTask],
                                    npcConfig.name,
                                    () => {
                                        this.currentTaskId++;
                                        console.log('更新任务ID为:', this.currentTaskId);
                                        this.updateTaskUI();
                                    }
                                );
                            } else {
                                this.currentTaskId++;
                                console.log('更新任务ID为:', this.currentTaskId);
                                this.updateTaskUI();
                            }
                        });
                    }
                );
            } else {
                console.log('不满足任务要求，显示介绍对话');
                this.dialogueManager.startDialogue(
                    [taskIntro],
                    npcConfig.name
                );
            }
        } else if (currentTask.id === 6) {
            console.log('开始建造任务');
            this.startBuilding(npc, npcConfig, currentTask);
        }
    }
    
    getTaskIntro(npcConfig, taskId) {
        if (taskId === 3 && npcConfig.dialogues.task3_intro) {
            return npcConfig.dialogues.task3_intro;
        }
        return npcConfig.dialogues.task_intro;
    }
    
    getTaskComplete(npcConfig, taskId) {
        if (taskId === 3 && npcConfig.dialogues.task3_complete) {
            return npcConfig.dialogues.task3_complete;
        }
        return npcConfig.dialogues.task_complete;
    }
    
    getNextTask(npcConfig, taskId) {
        if (taskId === 3 && npcConfig.dialogues.task3_next) {
            return npcConfig.dialogues.task3_next;
        }
        return npcConfig.dialogues.next_task;
    }
    
    tryCollect(areaData) {
        const currentTask = GAME_CONFIG.TASKS[this.currentTaskId];
        if (!currentTask || !currentTask.collectArea) return;
        
        if (areaData.key !== currentTask.collectArea) {
            this.showHint('这里现在不需要采集');
            return;
        }
        
        const playerPos = this.player.getPosition();
        const area = areaData.area;
        const areaCenter = { x: area.x + area.width / 2, y: area.y + area.height / 2 };
        const distance = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, areaCenter.x, areaCenter.y);
        
        if (distance > 100) {
            this.showHint('请靠近采集区域');
            return;
        }
        
        if (currentTask.requirement.material === 'wood') {
            this.startChoppingGame();
        } else if (currentTask.requirement.material === 'stone') {
            this.startStoneGame();
        } else if (currentTask.requirement.material === 'wood_joint') {
            this.startMortiseGame();
        } else if (currentTask.requirement.material === 'brick') {
            this.startBrickGame();
        } else if (currentTask.requirement.material === 'tile') {
            this.startTileGame();
        } else {
            this.collectMaterial(currentTask.requirement.material, areaData);
        }
    }
    
    collectMaterial(material, areaData) {
        if (this.isCollecting) return;
        this.isCollecting = true;
        
        const materialConfig = GAME_CONFIG.MATERIALS[material];
        const currentCount = this.backpack.getItemCount(material);
        const needed = GAME_CONFIG.TASKS[this.currentTaskId].requirement.count;
        
        if (currentCount >= needed) {
            this.showHint('材料已经足够了，去找NPC交任务吧！');
            this.isCollecting = false;
            return;
        }
        
        this.showCollectAnimation(areaData, materialConfig, () => {
            this.backpack.addItem(material, 1);
            this.showHint(`获得 ${materialConfig.name} ×1！`);
            this.updateTaskUI();
            this.isCollecting = false;
        });
    }
    
    showCollectAnimation(areaData, materialConfig, callback) {
        const area = areaData.area;
        const particles = this.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: area.x + area.width / 2,
            y: area.y + area.height / 2,
            speed: { min: 50, max: 100 },
            angle: { min: 220, max: 320 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 5
        });
        
        if (!this.textures.exists('particle')) {
            const texture = this.textures.createCanvas('particle', 16, 16);
            const ctx = texture.getContext();
            ctx.fillStyle = materialConfig.color;
            ctx.fillRect(0, 0, 16, 16);
            texture.refresh();
        }
        
        this.tweens.add({
            targets: emitter,
            quantity: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                emitter.stop();
                particles.destroy();
                callback();
            }
        });
    }
    
    startBuilding(npc, npcConfig, currentTask) {
        this.dialogueManager.startDialogue(
            [npcConfig.dialogues.initial, npcConfig.dialogues.task_intro],
            npcConfig.name,
            () => {
                this.performBuilding();
            }
        );
    }
    
    performBuilding() {
        const site = GAME_CONFIG.COLLECT_AREAS.buildingSite;
        const centerX = site.x + site.width / 2;
        const centerY = site.y + site.height / 2;
        
        this.buildingProgress = 0;
        const steps = ['筑基', '立柱', '架梁', '砌墙', '盖瓦', '装修'];
        
        const buildStep = (index) => {
            if (index >= steps.length) {
                this.finishBuilding();
                return;
            }
            
            this.showHint(`正在${steps[index]}...`);
            
            this.tweens.addCounter({
                from: 0,
                to: 100,
                duration: 1500,
                onUpdate: (tween) => {
                    this.buildingProgress = tween.getValue / 100 * (index + 1) / steps.length;
                },
                onComplete: () => {
                    buildStep(index + 1);
                }
            });
        };
        
        const house = this.add.rectangle(centerX, centerY, 100, 80, 0x8B4513);
        house.setStrokeStyle(4, 0x5D3A1A);
        house.setDepth(3);
        
        const roof = this.add.triangle(centerX, centerY - 50, 0, 40, -70, -20, 70, -20, 0xCD853F);
        roof.setStrokeStyle(3, 0x8B5A2B);
        roof.setDepth(4);
        
        buildStep(0);
    }
    
    finishBuilding() {
        const currentTask = GAME_CONFIG.TASKS[6];
        this.showKnowledge(currentTask.knowledge, () => {
            this.currentTaskId = 7;
            this.updateTaskUI();
        });
    }
    
    showKnowledge(knowledge, callback = null) {
        this.knowledgeCallback = callback;
        const modal = document.getElementById('knowledge-modal');
        document.getElementById('knowledge-title').textContent = knowledge.title;
        document.getElementById('knowledge-content').textContent = knowledge.content;
        modal.classList.add('active');
    }
    
    closeKnowledgeModal() {
        const modal = document.getElementById('knowledge-modal');
        modal.classList.remove('active');
        if (this.knowledgeCallback) {
            const callback = this.knowledgeCallback;
            this.knowledgeCallback = null;
            callback();
        }
    }
    
    showHint(text) {
        const hint = document.getElementById('action-hint');
        if (hint.textContent === text && hint.classList.contains('active')) {
            return;
        }
        hint.textContent = text;
        hint.classList.add('active');
        
        if (this.hintTimeout) {
            this.hintTimeout.remove();
        }
        this.hintTimeout = this.time.delayedCall(3000, () => {
            hint.classList.remove('active');
        });
    }
    
    updateTaskUI() {
        const taskContent = document.getElementById('task-content');
        const taskProgress = document.getElementById('task-progress');
        
        if (this.currentTaskId >= GAME_CONFIG.TASKS.length) {
            taskContent.textContent = '🎉 恭喜你！你已经成功建造了一座古代房屋，掌握了中国古代建筑的基本知识！';
            taskProgress.textContent = '';
            return;
        }
        
        const task = GAME_CONFIG.TASKS[this.currentTaskId];
        taskContent.textContent = task.description;
        
        if (task.requirement) {
            const current = this.backpack.getItemCount(task.requirement.material);
            const needed = task.requirement.count;
            const material = GAME_CONFIG.MATERIALS[task.requirement.material];
            taskProgress.textContent = `${material.name}: ${current}/${needed}`;
        } else {
            taskProgress.textContent = '';
        }
    }
    
    update() {
        if (this.player) {
            this.player.update();
            
            // 更新地图标记位置
            this.updateMapMarker();
        }
        
        this.npcs.forEach(npc => {
            npc.update();
        });
        
        if (this.gameStarted) {
            this.checkNPCProximity();
            this.checkCollectAreaProximity();
        }
        
        if (this.isCollecting && this.collectingStartTime && !this.requiredChops) {
            const elapsed = Date.now() - this.collectingStartTime;
            const progress = Math.min(elapsed / 3000, 1);
            this.updateCollectProgress(progress);
            
            if (elapsed >= 3000) {
                this.finishCollect();
            }
        }
        
        this.checkDialogueState();
    }
    
    updateMapMarker() {
        const playerMarker = document.getElementById('player-marker');
        if (!playerMarker) return;
        
        // 获取玩家位置
        const playerPos = this.player.getPosition();
        
        // 获取地图背景大小
        const mapBg = this.children.getByName('map_bg') || this.children.getAt(0);
        if (!mapBg) return;
        
        // 计算地图标记位置（相对于地图容器）
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            const mapWidth = mapContainer.offsetWidth;
            const mapHeight = mapContainer.offsetHeight;
            
            // 计算玩家位置在地图上的相对比例
            const relativeX = playerPos.x / mapBg.width;
            const relativeY = playerPos.y / mapBg.height;
            
            // 计算地图标记的实际位置
            const markerX = relativeX * mapWidth;
            const markerY = relativeY * mapHeight;
            
            // 更新玩家标记位置
            playerMarker.style.left = `${markerX}px`;
            playerMarker.style.top = `${markerY}px`;
            
            // 更新任务地点标记位置
            this.updateAreaMarkers(mapWidth, mapHeight, mapBg.width, mapBg.height);
        }
    }
    
    updateAreaMarkers(mapWidth, mapHeight, worldWidth, worldHeight) {
        const markers = document.querySelectorAll('.map-marker');
        markers.forEach(marker => {
            const areaKey = marker.dataset.area;
            const area = GAME_CONFIG.COLLECT_AREAS[areaKey];
            if (area) {
                // 计算区域中心位置
                const areaCenterX = area.x + area.width / 2;
                const areaCenterY = area.y + area.height / 2;
                
                // 计算相对位置
                const relativeX = areaCenterX / worldWidth;
                const relativeY = areaCenterY / worldHeight;
                
                // 计算地图上的位置
                const markerX = relativeX * mapWidth;
                const markerY = relativeY * mapHeight;
                
                // 更新标记位置
                marker.style.left = `${markerX}px`;
                marker.style.top = `${markerY}px`;
            }
        });
    }
    
    checkDialogueState() {
        const dialogueModal = document.getElementById('dialogue-modal');
        const knowledgeModal = document.getElementById('knowledge-modal');
        
        if (dialogueModal && !dialogueModal.classList.contains('active')) {
            if (this.dialogueManager && this.dialogueManager.isDialogueActive()) {
                this.dialogueManager.isActive = false;
            }
        }
    }
    
    checkCollectAreaProximity() {
        const playerPos = this.player.getPosition();
        const currentTask = GAME_CONFIG.TASKS[this.currentTaskId];
        
        if (!currentTask || !currentTask.collectArea) {
            this.hideCollectButton();
            return;
        }
        
        let nearCollectArea = false;
        let currentAreaData = null;
        
        for (const areaData of this.collectAreas) {
            if (areaData.key === currentTask.collectArea) {
                const area = areaData.area;
                const areaCenterX = area.x + area.width / 2;
                const areaCenterY = area.y + area.height / 2;
                const distance = Phaser.Math.Distance.Between(
                    playerPos.x,
                    playerPos.y,
                    areaCenterX,
                    areaCenterY
                );
                
                const maxDistance = Math.max(area.width, area.height) / 2 + 80;
                
                if (distance < maxDistance) {
                    nearCollectArea = true;
                    currentAreaData = areaData;
                    break;
                }
            }
        }
        
        if (nearCollectArea && currentAreaData) {
            this.currentCollectArea = currentAreaData;
            this.showCollectButton();
        } else {
            this.hideCollectButton();
        }
    }
    
    showCollectButton() {
        const btn = document.getElementById('collect-button');
        if (btn && !this.isCollecting) {
            btn.classList.add('active');
        }
    }
    
    hideCollectButton() {
        const btn = document.getElementById('collect-button');
        const progress = document.getElementById('collect-progress');
        if (btn) btn.classList.remove('active');
        if (progress) progress.classList.remove('active');
    }
    
    startCollect() {
        if (this.isCollecting || !this.currentCollectArea) return;
        
        const currentTask = GAME_CONFIG.TASKS[this.currentTaskId];
        if (!currentTask || !currentTask.requirement) return;
        
        const currentCount = this.backpack.getItemCount(currentTask.requirement.material);
        const needed = currentTask.requirement.count;
        
        if (currentCount >= needed) {
            this.showHint('材料已经足够了，去找NPC交任务吧！');
            return;
        }
        
        if (currentTask.requirement.material === 'wood') {
            this.startChoppingGame();
        } else if (currentTask.requirement.material === 'stone') {
            this.startStoneGame();
        } else if (currentTask.requirement.material === 'wood_joint') {
            this.startMortiseGame();
        } else if (currentTask.requirement.material === 'brick') {
            this.startBrickGame();
        } else if (currentTask.requirement.material === 'tile') {
            this.startTileGame();
        } else {
            this.isCollecting = true;
            this.collectingStartTime = Date.now();
            
            const btn = document.getElementById('collect-button');
            const progress = document.getElementById('collect-progress');
            if (btn) {
                btn.classList.add('collecting');
                btn.classList.remove('active');
            }
            if (progress) {
                progress.classList.add('active');
            }
            
            this.showCollectingAnimation();
        }
    }
    
    showCollectingAnimation() {
        if (this.player && this.player.sprite) {
            const originalX = this.player.sprite.x;
            const originalY = this.player.sprite.y;
            
            this.tweens.add({
                targets: this.player.sprite,
                x: [originalX, originalX + 5, originalX - 5, originalX],
                y: [originalY, originalY - 3, originalY],
                duration: 300,
                repeat: 9,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    updateCollectProgress(progress) {
        const progressBar = document.getElementById('collect-progress-bar');
        if (progressBar) {
            progressBar.style.width = (progress * 100) + '%';
        }
    }
    
    finishCollect() {
        const currentTask = GAME_CONFIG.TASKS[this.currentTaskId];
        if (!currentTask || !currentTask.requirement) return;
        
        const material = currentTask.requirement.material;
        const materialConfig = GAME_CONFIG.MATERIALS[material];
        
        this.backpack.addItem(material, 1);
        this.showHint(`获得 ${materialConfig.name} ×1！`);
        this.updateTaskUI();
        this.updateBackpackUI();
        
        this.isCollecting = false;
        this.collectingStartTime = null;
        
        const btn = document.getElementById('collect-button');
        const progress = document.getElementById('collect-progress');
        const progressBar = document.getElementById('collect-progress-bar');
        
        if (btn) btn.classList.remove('collecting');
        if (progress) progress.classList.remove('active');
        if (progressBar) progressBar.style.width = '0%';
    }
    
    updateBackpackUI() {
        const slots = document.querySelectorAll('.backpack-slot');
        let slotIndex = 0;
        
        Object.entries(GAME_CONFIG.MATERIALS).forEach(([key, material]) => {
            const count = this.backpack.getItemCount(key);
            if (count > 0 && slotIndex < slots.length) {
                const slot = slots[slotIndex];
                slot.classList.add('filled');
                slot.innerHTML = `
                    <span class="backpack-icon">${material.icon}</span>
                    <span class="backpack-count">${count}</span>
                    <span class="backpack-name">${material.name}</span>
                `;
                slotIndex++;
            }
        });
        
        for (let i = slotIndex; i < slots.length; i++) {
            slots[i].classList.remove('filled');
            slots[i].innerHTML = '';
        }
    }
    
    checkNPCProximity() {
        const playerPos = this.player.getPosition();
        let nearNPC = null;
        
        this.npcs.forEach(npc => {
            const inRange = npc.isInRange(playerPos);
            npc.highlight(inRange);
            if (inRange) {
                nearNPC = npc;
            }
        });
        
        if (nearNPC) {
            this.showHint(`点击 ${nearNPC.config.name} 交谈`);
        }
    }
    
    startGame() {
        this.gameStarted = true;
        document.getElementById('start-screen').classList.add('hidden');
        this.updateTaskUI();
        this.updateBackpackUI();
    }
    
    getRequiredChops() {
        const woodCount = this.backpack.getItemCount('wood');
        if (woodCount === 0) return 6;
        if (woodCount === 1) return 7;
        if (woodCount === 2) return 8;
        if (woodCount === 3) return 9;
        return 10;
    }
    
    startChoppingGame() {
        this.choppingCount = 0;
        this.choppingTimeLeft = 5;
        this.requiredChops = this.getRequiredChops();
        this.isCollecting = true;
        
        const modal = document.getElementById('chopping-modal');
        const countEl = document.getElementById('chopping-count');
        const timerEl = document.getElementById('chopping-timer');
        const treeEl = document.getElementById('tree');
        const treeImage = document.getElementById('tree-image');
        const axeEl = document.getElementById('axe');
        
        countEl.textContent = `进度: 0/${this.requiredChops}`;
        timerEl.textContent = '剩余时间: 5.0s';
        timerEl.classList.remove('urgent');
        treeEl.classList.remove('tree-fall');
        treeEl.style.transform = 'translateX(-50%) rotate(0deg)';
        treeImage.src = 'assets/shu.png';
        
        modal.classList.add('active');
        
        this.choppingInterval = setInterval(() => {
            this.choppingTimeLeft -= 0.1;
            const displayTime = Math.max(0, this.choppingTimeLeft).toFixed(1);
            timerEl.textContent = `剩余时间: ${displayTime}s`;
            
            if (this.choppingTimeLeft <= 2) {
                timerEl.classList.add('urgent');
            }
            
            if (this.choppingTimeLeft <= 0) {
                this.endChoppingGame(false);
            }
        }, 100);
    }
    
    chopTree() {
        if (!this.isCollecting) return;
        
        const axeEl = document.getElementById('axe');
        const treeEl = document.getElementById('tree');
        const treeImage = document.getElementById('tree-image');
        const countEl = document.getElementById('chopping-count');
        const sceneEl = document.getElementById('chopping-scene');
        
        axeEl.classList.remove('chopping-axe');
        void axeEl.offsetWidth;
        axeEl.classList.add('chopping-axe');
        
        treeEl.classList.remove('tree-shake');
        void treeEl.offsetWidth;
        treeEl.classList.add('tree-shake');
        
        this.createWoodChips(sceneEl);
        
        this.choppingCount++;
        countEl.textContent = `进度: ${this.choppingCount}/${this.requiredChops}`;
        
        const progress = this.choppingCount / this.requiredChops;
        if (progress >= 0.75) {
            treeImage.src = 'assets/shu2.png';
        } else if (progress >= 0.5) {
            treeImage.src = 'assets/shu1.png';
        } else if (progress >= 0.25) {
            treeImage.src = 'assets/shu1 - 副本.png';
        }
        
        if (this.choppingCount >= this.requiredChops) {
            this.endChoppingGame(true);
        }
    }
    
    createWoodChips(sceneEl) {
        for (let i = 0; i < 3; i++) {
            const chip = document.createElement('div');
            chip.className = 'wood-chip';
            chip.style.left = (200 + Math.random() * 50) + 'px';
            chip.style.bottom = (100 + Math.random() * 50) + 'px';
            
            const angle = -60 + Math.random() * 40;
            const distance = 50 + Math.random() * 100;
            const duration = 300 + Math.random() * 200;
            
            chip.style.transition = `all ${duration}ms ease-out`;
            sceneEl.appendChild(chip);
            
            requestAnimationFrame(() => {
                chip.style.transform = `rotate(${angle}deg) translate(${distance}px, -${distance}px)`;
                chip.style.opacity = '0';
            });
            
            setTimeout(() => {
                chip.remove();
            }, duration + 50);
        }
    }
    
    endChoppingGame(success) {
        clearInterval(this.choppingInterval);
        
        const modal = document.getElementById('chopping-modal');
        const treeEl = document.getElementById('tree');
        
        if (success) {
            treeEl.classList.add('tree-fall');
            
            setTimeout(() => {
                modal.classList.remove('active');
                this.backpack.addItem('wood', 1);
                const materialConfig = GAME_CONFIG.MATERIALS.wood;
                this.showHint(`获得 ${materialConfig.name} ×1！`);
                this.updateTaskUI();
                this.updateBackpackUI();
                this.isCollecting = false;
                this.requiredChops = null;
            }, 1000);
        } else {
            modal.classList.remove('active');
            this.showHint('时间到了！再试一次吧！');
            this.isCollecting = false;
            this.requiredChops = null;
        }
    }
    
    startStoneGame() {
        this.stoneCount = 0;
        this.stoneTimeLeft = 60;
        this.filledSlots = new Array(16).fill(false);
        this.selectedPiece = null;
        this.placementHistory = [];
        this.isCollecting = true;
        
        const modal = document.getElementById('stone-modal');
        const countEl = document.getElementById('stone-count');
        const timerEl = document.getElementById('stone-timer');
        const foundationEl = document.getElementById('stone-foundation');
        const paletteEl = document.getElementById('stone-palette');
        
        countEl.textContent = '进度: 0/16';
        timerEl.textContent = '剩余时间: 60.0s';
        timerEl.classList.remove('urgent');
        
        foundationEl.innerHTML = '';
        paletteEl.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'foundation-slot';
            slot.dataset.index = i;
            slot.addEventListener('click', () => this.placePiece(i));
            foundationEl.appendChild(slot);
        }
        
        const guaranteedCombinations = [
            [
                { name: 'T形石块', shape: [[1,1,1],[1,1,1],[1,0,0]], blocks: 8 },
                { name: 'Z形石块', shape: [[0,0,1],[0,1,1],[1,1,0]], blocks: 4 },
                { name: '小L形石块', shape: [[1,1,0],[1,0,0]], blocks: 3 },
                { name: '小反L形石块', shape: [[0,1,1],[0,0,1]], blocks: 3 }
            ],
            [
                { name: 'T形石块', shape: [[1,1,1],[0,1,0],[0,1,0]], blocks: 5 },
                { name: 'Z形石块', shape: [[1,1,0],[0,1,1],[0,0,1]], blocks: 5 },
                { name: '方形石块', shape: [[1,1,1,1]], blocks: 4 },
                { name: '小方块', shape: [[1,1]], blocks: 2 }
            ],
            [
                { name: '大L形', shape: [[1,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0]], blocks: 8 },
                { name: '小L形', shape: [[1,1,1],[1,0,0]], blocks: 4 },
                { name: '小L形', shape: [[1,1,1],[1,0,0]], blocks: 4 }
            ]
        ];
        
        const selectedCombination = guaranteedCombinations[Math.floor(Math.random() * guaranteedCombinations.length)];
        
        this.availablePieces = [];
        let totalBlocks = 0;
        
        selectedCombination.forEach((piece, idx) => {
            this.availablePieces.push({ 
                ...piece, 
                used: false, 
                placed: false, 
                placedPositions: [], 
                index: idx,
                originalShape: JSON.parse(JSON.stringify(piece.shape)),
                rotation: 0
            });
            totalBlocks += piece.blocks;
        });
        
        this.availablePieces.forEach((piece, idx) => {
            const container = document.createElement('div');
            container.className = 'piece-container';
            container.dataset.pieceIndex = idx;
            
            const pieceEl = document.createElement('div');
            pieceEl.className = 'stone-piece';
            pieceEl.dataset.pieceIndex = idx;
            pieceEl.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 1fr)`;
            
            piece.shape.forEach(row => {
                row.forEach(cell => {
                    const block = document.createElement('div');
                    if (cell) {
                        block.className = 'stone-block';
                    } else {
                        block.style.visibility = 'hidden';
                        block.className = 'stone-block';
                    }
                    pieceEl.appendChild(block);
                });
            });
            
            const label = document.createElement('div');
            label.className = 'piece-label';
            label.textContent = piece.name;
            
            container.appendChild(pieceEl);
            container.appendChild(label);
            container.addEventListener('click', () => this.selectOrUndoPiece(idx));
            paletteEl.appendChild(container);
        });
        
        const undoBtn = document.getElementById('undo-button');
        undoBtn.addEventListener('click', () => this.undoPlacement());
        undoBtn.disabled = true;
        
        const rotateBtn = document.getElementById('rotate-button');
        rotateBtn.addEventListener('click', () => this.rotateSelectedPiece());
        rotateBtn.disabled = true;
        
        modal.classList.add('active');
        
        this.stoneInterval = setInterval(() => {
            this.stoneTimeLeft -= 0.1;
            const displayTime = Math.max(0, this.stoneTimeLeft).toFixed(1);
            timerEl.textContent = `剩余时间: ${displayTime}s`;
            
            if (this.stoneTimeLeft <= 10) {
                timerEl.classList.add('urgent');
            }
            
            if (this.stoneTimeLeft <= 0) {
                this.endStoneGame(false);
            }
        }, 100);
    }
    
    selectOrUndoPiece(pieceIndex) {
        const piece = this.availablePieces[pieceIndex];
        
        if (piece.used && !piece.placed) {
            this.undoPiece(pieceIndex);
        } else if (!piece.used) {
            this.selectPiece(pieceIndex);
        }
    }
    
    selectPiece(pieceIndex) {
        const piece = this.availablePieces[pieceIndex];
        if (piece.used) return;
        
        document.querySelectorAll('.piece-container').forEach((el, idx) => {
            el.classList.remove('selected');
        });
        
        if (this.selectedPiece === pieceIndex) {
            this.selectedPiece = null;
            document.getElementById('rotate-button').disabled = true;
        } else {
            this.selectedPiece = pieceIndex;
            document.querySelector(`.piece-container[data-piece-index="${pieceIndex}"]`).classList.add('selected');
            document.getElementById('rotate-button').disabled = false;
        }
    }
    
    rotateShape(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = [];
        
        for (let c = 0; c < cols; c++) {
            const newRow = [];
            for (let r = rows - 1; r >= 0; r--) {
                newRow.push(shape[r][c]);
            }
            rotated.push(newRow);
        }
        
        return rotated;
    }
    
    updatePieceDisplay(pieceIndex) {
        const piece = this.availablePieces[pieceIndex];
        const pieceEl = document.querySelector(`.stone-piece[data-piece-index="${pieceIndex}"]`);
        
        if (!pieceEl) return;
        
        pieceEl.innerHTML = '';
        pieceEl.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 1fr)`;
        
        piece.shape.forEach(row => {
            row.forEach(cell => {
                const block = document.createElement('div');
                if (cell) {
                    block.className = 'stone-block';
                } else {
                    block.style.visibility = 'hidden';
                    block.className = 'stone-block';
                }
                pieceEl.appendChild(block);
            });
        });
    }
    
    rotateSelectedPiece() {
        if (this.selectedPiece === null) return;
        
        const piece = this.availablePieces[this.selectedPiece];
        if (piece.used) return;
        
        piece.shape = this.rotateShape(piece.shape);
        piece.rotation = (piece.rotation + 1) % 4;
        
        this.updatePieceDisplay(this.selectedPiece);
    }
    
    placePiece(slotIndex) {
        if (this.selectedPiece === null) return;
        
        const piece = this.availablePieces[this.selectedPiece];
        if (piece.used) return;
        
        const shape = piece.shape;
        const rows = shape.length;
        const cols = shape[0].length;
        
        const startRow = Math.floor(slotIndex / 4);
        const startCol = slotIndex % 4;
        
        let canPlace = true;
        const positions = [];
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c]) {
                    const targetRow = startRow + r;
                    const targetCol = startCol + c;
                    if (targetRow >= 4 || targetCol >= 4) {
                        canPlace = false;
                        break;
                    }
                    const targetSlot = targetRow * 4 + targetCol;
                    if (this.filledSlots[targetSlot]) {
                        canPlace = false;
                        break;
                    }
                    positions.push(targetSlot);
                }
            }
            if (!canPlace) break;
        }
        
        if (canPlace && positions.length > 0) {
            positions.forEach(slotIdx => {
                this.filledSlots[slotIdx] = true;
                const slot = document.querySelector(`.foundation-slot[data-index="${slotIdx}"]`);
                slot.classList.add('filled');
                const block = document.createElement('div');
                block.className = 'foundation-block';
                slot.appendChild(block);
            });
            
            piece.used = true;
            piece.placed = true;
            piece.placedPositions = [...positions];
            const pieceContainer = document.querySelector(`.piece-container[data-piece-index="${this.selectedPiece}"]`);
            pieceContainer.classList.remove('selected');
            pieceContainer.classList.add('used', 'can-undo');
            
            this.placementHistory.push({ pieceIndex: this.selectedPiece, positions: [...positions] });
            
            this.stoneCount += positions.length;
            const countEl = document.getElementById('stone-count');
            countEl.textContent = `进度: ${this.stoneCount}/16`;
            
            this.selectedPiece = null;
            
            document.getElementById('undo-button').disabled = false;
            
            if (this.stoneCount >= 16) {
                const foundationEl = document.getElementById('stone-foundation');
                foundationEl.style.animation = 'foundation-complete 0.5s ease-out';
                setTimeout(() => {
                    this.endStoneGame(true);
                }, 500);
            }
        }
    }
    
    undoPiece(pieceIndex) {
        const piece = this.availablePieces[pieceIndex];
        if (!piece.used || !piece.placed) return;
        
        piece.placedPositions.forEach(slotIdx => {
            this.filledSlots[slotIdx] = false;
            const slot = document.querySelector(`.foundation-slot[data-index="${slotIdx}"]`);
            slot.classList.remove('filled');
            const block = slot.querySelector('.foundation-block');
            if (block) block.remove();
        });
        
        this.stoneCount -= piece.placedPositions.length;
        const countEl = document.getElementById('stone-count');
        countEl.textContent = `进度: ${this.stoneCount}/16`;
        
        piece.used = false;
        piece.placed = false;
        piece.placedPositions = [];
        piece.shape = JSON.parse(JSON.stringify(piece.originalShape));
        piece.rotation = 0;
        
        this.updatePieceDisplay(pieceIndex);
        
        const pieceContainer = document.querySelector(`.piece-container[data-piece-index="${pieceIndex}"]`);
        pieceContainer.classList.remove('used', 'can-undo');
        
        this.placementHistory = this.placementHistory.filter(h => h.pieceIndex !== pieceIndex);
        
        if (this.placementHistory.length === 0) {
            document.getElementById('undo-button').disabled = true;
        }
    }
    
    undoPlacement() {
        if (this.placementHistory.length === 0) return;
        
        const lastPlacement = this.placementHistory.pop();
        this.undoPiece(lastPlacement.pieceIndex);
    }
    
    endStoneGame(success) {
        clearInterval(this.stoneInterval);
        
        const modal = document.getElementById('stone-modal');
        
        if (success) {
            setTimeout(() => {
                modal.classList.remove('active');
                this.backpack.addItem('stone', 1);
                const materialConfig = GAME_CONFIG.MATERIALS.stone;
                this.showHint(`获得 ${materialConfig.name} ×1！`);
                this.updateTaskUI();
                this.updateBackpackUI();
                this.isCollecting = false;
            }, 500);
        } else {
            modal.classList.remove('active');
            this.showHint('时间到了！再试一次吧！');
            this.isCollecting = false;
        }
    }
    
    startMortiseGame() {
        this.mortiseSelectedTenon = null;
        this.mortiseMatched = 0;
        this.mortiseTimeLeft = 90;
        this.isCollecting = true;
        
        this.mortisePairs = [
            { 
                tenon: '直榫', 
                hole: '直榫眼', 
                knowledge: {
                    title: '直榫（Straight Tenon）',
                    content: '直榫是最基本的榫卯结构，榫头呈直线形，插入对应的卯眼中。它结构简单，制作方便，广泛应用于建筑框架的连接中。直榫的强度取决于木材的质量和榫卯的配合精度。'
                }
            },
            { 
                tenon: '燕尾榫', 
                hole: '燕尾榫眼', 
                knowledge: {
                    title: '燕尾榫（Dovetail Tenon）',
                    content: '燕尾榫的榫头像燕子的尾巴，一头宽一头窄，一旦插入卯眼就无法直接拔出。这种榫卯结构具有极强的抗拉能力，常用于家具和建筑的关键连接部位，是中国传统木工技艺的精髓之一。'
                }
            },
            { 
                tenon: '格肩榫', 
                hole: '格肩榫眼', 
                knowledge: {
                    title: '格肩榫（Shoulder Tenon）',
                    content: '格肩榫在榫头两侧有肩部，可以增加接触面，提高连接的稳定性和美观度。常用于家具的框架结构，既能保证结构牢固，又能展现精湛的工艺。'
                }
            },
            { 
                tenon: '粽角榫', 
                hole: '粽角榫眼', 
                knowledge: {
                    title: '粽角榫（Zongjiao Tenon）',
                    content: '粽角榫因其形似粽子角而得名，常用于三根木料在一个角上的交汇连接。它结构精巧，能同时连接三个方向的木料，是中国传统建筑中常用的复杂榫卯结构之一。'
                }
            },
            { 
                tenon: '楔钉榫', 
                hole: '楔钉榫眼', 
                knowledge: {
                    title: '楔钉榫（Wedge Tenon）',
                    content: '楔钉榫是一种用于连接弧形构件的榫卯结构，通过在榫卯之间打入楔钉来紧固。它不仅能牢固连接，还便于拆卸维修，常用于圆形家具和建筑构件的连接。'
                }
            }
        ];
        
        const modal = document.getElementById('mortise-modal');
        const countEl = document.getElementById('mortise-count');
        const timerEl = document.getElementById('mortise-timer');
        const tenonsEl = document.getElementById('mortise-tenons');
        const holesEl = document.getElementById('mortise-holes');
        const knowledgeEl = document.getElementById('mortise-knowledge');
        
        countEl.textContent = '进度: 0/5';
        timerEl.textContent = '剩余时间: 90.0s';
        timerEl.classList.remove('urgent');
        knowledgeEl.classList.remove('active');
        tenonsEl.innerHTML = '';
        holesEl.innerHTML = '';
        
        const shuffledTenons = [...this.mortisePairs].sort(() => Math.random() - 0.5);
        const shuffledHoles = [...this.mortisePairs].sort(() => Math.random() - 0.5);
        
        shuffledTenons.forEach((pair, idx) => {
            const tenon = document.createElement('div');
            tenon.className = 'tenon-piece';
            tenon.textContent = pair.tenon;
            tenon.dataset.tenonIndex = this.mortisePairs.indexOf(pair);
            tenon.addEventListener('click', () => this.selectTenon(this.mortisePairs.indexOf(pair)));
            tenonsEl.appendChild(tenon);
        });
        
        shuffledHoles.forEach((pair, idx) => {
            const hole = document.createElement('div');
            hole.className = 'mortise-hole';
            hole.dataset.holeIndex = this.mortisePairs.indexOf(pair);
            hole.innerHTML = `
                <div class="mortise-name">${pair.hole}</div>
                <div class="mortise-hint">点击匹配</div>
            `;
            hole.addEventListener('click', () => this.matchMortise(this.mortisePairs.indexOf(pair)));
            holesEl.appendChild(hole);
        });
        
        modal.classList.add('active');
        
        this.mortiseInterval = setInterval(() => {
            this.mortiseTimeLeft -= 0.1;
            const displayTime = Math.max(0, this.mortiseTimeLeft).toFixed(1);
            timerEl.textContent = `剩余时间: ${displayTime}s`;
            
            if (this.mortiseTimeLeft <= 15) {
                timerEl.classList.add('urgent');
            }
            
            if (this.mortiseTimeLeft <= 0) {
                this.endMortiseGame(false);
            }
        }, 100);
    }
    
    selectTenon(tenonIndex) {
        if (this.mortisePairs[tenonIndex].matched) return;
        
        document.querySelectorAll('.tenon-piece').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelectorAll('.mortise-hole').forEach(el => {
            el.classList.remove('highlight');
        });
        
        if (this.mortiseSelectedTenon === tenonIndex) {
            this.mortiseSelectedTenon = null;
        } else {
            this.mortiseSelectedTenon = tenonIndex;
            document.querySelector(`.tenon-piece[data-tenon-index="${tenonIndex}"]`).classList.add('selected');
        }
    }
    
    matchMortise(holeIndex) {
        if (this.mortiseSelectedTenon === null) return;
        if (this.mortisePairs[holeIndex].matched) return;
        
        const pair = this.mortisePairs[holeIndex];
        
        if (this.mortiseSelectedTenon === holeIndex) {
            pair.matched = true;
            this.mortiseMatched++;
            
            const tenonEl = document.querySelector(`.tenon-piece[data-tenon-index="${holeIndex}"]`);
            const holeEl = document.querySelector(`.mortise-hole[data-hole-index="${holeIndex}"]`);
            
            tenonEl.classList.add('used');
            tenonEl.classList.remove('selected');
            holeEl.classList.add('filled');
            holeEl.classList.remove('highlight');
            
            const knowledgeEl = document.getElementById('mortise-knowledge');
            const knowledgeTitle = document.getElementById('mortise-knowledge-title');
            const knowledgeContent = document.getElementById('mortise-knowledge-content');
            knowledgeTitle.textContent = pair.knowledge.title;
            knowledgeContent.textContent = pair.knowledge.content;
            knowledgeEl.classList.add('active');
            
            const countEl = document.getElementById('mortise-count');
            countEl.textContent = `进度: ${this.mortiseMatched}/5`;
            
            this.mortiseSelectedTenon = null;
            
            if (this.mortiseMatched >= 5) {
                setTimeout(() => {
                    this.endMortiseGame(true);
                }, 2000);
            }
        } else {
            this.showHint('配对错误，请重试！');
            document.querySelectorAll('.tenon-piece').forEach(el => {
                el.classList.remove('selected');
            });
            this.mortiseSelectedTenon = null;
        }
    }
    
    endMortiseGame(success) {
        clearInterval(this.mortiseInterval);
        
        const modal = document.getElementById('mortise-modal');
        
        if (success) {
            setTimeout(() => {
                modal.classList.remove('active');
                this.backpack.addItem('wood_joint', 1);
                const materialConfig = GAME_CONFIG.MATERIALS.wood_joint;
                this.showHint(`获得 ${materialConfig.name} ×1！`);
                this.updateTaskUI();
                this.updateBackpackUI();
                this.isCollecting = false;
            }, 500);
        } else {
            modal.classList.remove('active');
            this.showHint('时间到了！再试一次吧！');
            this.isCollecting = false;
        }
    }
    
    startBrickGame() {
        this.brickTemperature = 600;
        this.brickStableTime = 0;
        this.brickTimeLeft = 30;
        this.brickCount = 0;
        this.isCollecting = true;
        this.temperatureAdjustment = 0;
        this.lastHeatTime = Date.now();
        this.heatClickCount = 0;
        
        const modal = document.getElementById('brick-modal');
        const countEl = document.getElementById('brick-count');
        const timerEl = document.getElementById('brick-timer');
        const tempValueEl = document.getElementById('temperature-value');
        
        countEl.textContent = '进度: 0/8';
        timerEl.textContent = '剩余时间: 30.0s';
        timerEl.classList.remove('urgent');
        tempValueEl.textContent = '600°C';
        
        this.updateTemperature();
        
        modal.classList.add('active');
        
        this.brickInterval = setInterval(() => {
            this.brickTimeLeft -= 0.1;
            const displayTime = Math.max(0, this.brickTimeLeft).toFixed(1);
            timerEl.textContent = `剩余时间: ${displayTime}s`;
            
            if (this.brickTimeLeft <= 10) {
                timerEl.classList.add('urgent');
            }
            
            // 检查是否2秒内未点击升温
            const currentTime = Date.now();
            if (currentTime - this.lastHeatTime > 2000) {
                // 2秒内未点击升温，温度缓慢下降
                this.brickTemperature -= 2;
            }
            
            // 温度随机波动
            const randomChange = (Math.random() - 0.5) * 10; // -5 到 +5 的随机波动
            this.brickTemperature += randomChange;
            
            // 应用温度调整（有延迟效果）
            if (this.temperatureAdjustment !== 0) {
                // 根据2秒内点击次数调整升温速度
                const heatMultiplier = Math.min(1 + this.heatClickCount * 0.3, 3); // 最多3倍速度
                this.brickTemperature += this.temperatureAdjustment * 0.2 * heatMultiplier; // 每次应用20%的调整量，乘以点击次数的倍数
                this.temperatureAdjustment *= 0.7; // 调整量逐渐减少
                if (Math.abs(this.temperatureAdjustment) < 1) {
                    this.temperatureAdjustment = 0;
                }
            }
            
            // 温度范围限制
            this.brickTemperature = Math.max(400, Math.min(1200, this.brickTemperature));
            
            this.updateTemperature();
            
            if (this.brickTemperature >= 800 && this.brickTemperature <= 1000) {
                this.brickStableTime += 0.1;
                const stableProgress = Math.min(this.brickStableTime / 10, 1);
                document.getElementById('brick-progress-fill').style.width = (stableProgress * 100) + '%';
                document.getElementById('brick-progress-text').textContent = `稳定时间: ${this.brickStableTime.toFixed(1)}/10s`;
                
                if (this.brickStableTime >= 10) {
                    this.endBrickGame(true);
                }
            } else {
                this.brickStableTime = 0;
                document.getElementById('brick-progress-fill').style.width = '0%';
                document.getElementById('brick-progress-text').textContent = `稳定时间: 0/10s`;
            }
            
            if (this.brickTimeLeft <= 0) {
                this.endBrickGame(false);
            }
        }, 100);
    }
    
    updateTemperature() {
        const tempFill = document.getElementById('temperature-fill');
        const tempIndicator = document.getElementById('temperature-indicator');
        const tempValue = document.getElementById('temperature-value');
        
        const minTemp = 400;
        const maxTemp = 1200;
        const percentage = (this.brickTemperature - minTemp) / (maxTemp - minTemp) * 100;
        
        tempFill.style.width = percentage + '%';
        tempIndicator.style.left = percentage + '%';
        tempValue.textContent = `${Math.round(this.brickTemperature)}°C`;
    }
    
    heatTemperature() {
        this.temperatureAdjustment += 50; // 增加升温调整量
        this.lastHeatTime = Date.now(); // 重置最后点击时间
        this.heatClickCount++; // 增加点击次数
        
        // 2秒后重置点击次数
        setTimeout(() => {
            if (Date.now() - this.lastHeatTime > 2000) {
                this.heatClickCount = 0;
            }
        }, 2000);
    }
    
    coolTemperature() {
        this.temperatureAdjustment -= 50; // 增加降温调整量
    }
    
    endBrickGame(success) {
        clearInterval(this.brickInterval);
        
        const modal = document.getElementById('brick-modal');
        
        if (success) {
            setTimeout(() => {
                modal.classList.remove('active');
                this.backpack.addItem('brick', 1);
                const materialConfig = GAME_CONFIG.MATERIALS.brick;
                this.showHint(`获得 ${materialConfig.name} ×1！`);
                this.updateTaskUI();
                this.updateBackpackUI();
                this.isCollecting = false;
            }, 500);
        } else {
            modal.classList.remove('active');
            this.showHint('时间到了！再试一次吧！');
            this.isCollecting = false;
        }
    }
    
    startTileGame() {
        this.tileLevel = 1;
        this.tileTimeLeft = 60;
        this.tileProgress = 0;
        this.selectedTile = null;
        this.tileSlots = [];
        this.isCollecting = true;
        
        const modal = document.getElementById('tile-modal');
        const levelEl = document.getElementById('tile-level');
        const timerEl = document.getElementById('tile-timer');
        const progressEl = document.getElementById('tile-progress-text');
        const roofEl = document.getElementById('roof');
        const paletteEl = document.getElementById('tile-palette');
        const tutorialEl = document.getElementById('tile-tutorial');
        
        levelEl.textContent = `关卡: ${this.tileLevel}/3`;
        timerEl.textContent = '剩余时间: 60.0s';
        timerEl.classList.remove('urgent');
        progressEl.textContent = '进度: 0/12';
        document.getElementById('tile-progress-fill').style.width = '0%';
        
        roofEl.innerHTML = '';
        
        for (let i = 0; i < 12; i++) {
            const slot = document.createElement('div');
            slot.className = 'roof-slot';
            slot.dataset.index = i;
            slot.addEventListener('click', () => this.placeTile(i));
            roofEl.appendChild(slot);
            this.tileSlots.push({ filled: false, tileType: null, correctType: this.getCorrectTileType(i) });
        }
        
        paletteEl.innerHTML = '';
        const tileTypes = [
            { type: 'banwa', name: '板瓦', desc: '片状，铺设基层' },
            { type: 'tongwa', name: '筒瓦', desc: '半圆筒状，覆盖缝隙' },
            { type: 'wadang', name: '瓦当', desc: '筒瓦顶端，有装饰' },
            { type: 'dishui', name: '滴水', desc: '板瓦下端，引导雨水' }
        ];
        
        tileTypes.forEach(tile => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile-type';
            tileEl.dataset.tile = tile.type;
            tileEl.innerHTML = `
                <div class="tile-icon">${tile.name}</div>
                <div class="tile-desc">${tile.desc}</div>
            `;
            tileEl.addEventListener('click', () => this.selectTile(tile.type));
            paletteEl.appendChild(tileEl);
        });
        
        modal.classList.add('active');
        
        // 直接显示教程界面，不使用动画
        tutorialEl.style.display = 'flex';
        tutorialEl.style.opacity = '1';
        tutorialEl.style.visibility = 'visible';
        tutorialEl.style.transform = 'scale(1)';
        tutorialEl.classList.add('active');
    }
    
    startTileGameWithoutTutorial() {
        const tutorialEl = document.getElementById('tile-tutorial');
        const timerEl = document.getElementById('tile-timer');
        
        // 直接隐藏教程界面
        tutorialEl.style.opacity = '0';
        tutorialEl.style.visibility = 'hidden';
        tutorialEl.style.transform = 'scale(0.95)';
        tutorialEl.classList.remove('active');
        
        // 启动游戏计时器
        this.tileInterval = setInterval(() => {
            this.tileTimeLeft -= 0.1;
            const displayTime = Math.max(0, this.tileTimeLeft).toFixed(1);
            timerEl.textContent = `剩余时间: ${displayTime}s`;
            
            if (this.tileTimeLeft <= 20) {
                timerEl.classList.add('urgent');
            }
            
            if (this.tileTimeLeft <= 0) {
                this.endTileGame(false);
            }
        }, 100);
    }
    
    getCorrectTileType(index) {
        if (index < 4) return 'banwa';
        if (index < 8) return 'tongwa';
        if (index === 8 || index === 9) return 'dishui';
        return 'wadang';
    }
    
    selectTile(tileType) {
        document.querySelectorAll('.tile-type').forEach(el => {
            el.classList.remove('selected');
        });
        
        if (this.selectedTile === tileType) {
            this.selectedTile = null;
        } else {
            this.selectedTile = tileType;
            document.querySelector(`.tile-type[data-tile="${tileType}"]`).classList.add('selected');
        }
    }
    
    placeTile(slotIndex) {
        if (!this.selectedTile) return;
        
        const slot = this.tileSlots[slotIndex];
        if (slot.filled) return;
        
        const roofSlot = document.querySelector(`.roof-slot[data-index="${slotIndex}"]`);
        
        if (this.selectedTile === slot.correctType) {
            const tile = document.createElement('div');
            tile.className = `tile ${this.selectedTile}`;
            tile.textContent = this.getTileName(this.selectedTile);
            roofSlot.appendChild(tile);
            roofSlot.classList.add('filled');
            
            slot.filled = true;
            slot.tileType = this.selectedTile;
            this.tileProgress++;
            
            document.getElementById('tile-progress-fill').style.width = (this.tileProgress / 12 * 100) + '%';
            document.getElementById('tile-progress-text').textContent = `进度: ${this.tileProgress}/12`;
            
            if (this.tileProgress >= 12) {
                this.endTileGame(true);
            }
        } else {
            roofSlot.classList.add('wrong');
            
            const drop = document.createElement('div');
            drop.className = 'water-drop';
            roofSlot.appendChild(drop);
            
            setTimeout(() => {
                roofSlot.classList.remove('wrong');
                if (drop) drop.remove();
            }, 1000);
        }
    }
    
    getTileName(tileType) {
        const names = {
            banwa: '板瓦',
            tongwa: '筒瓦',
            wadang: '瓦当',
            dishui: '滴水'
        };
        return names[tileType] || tileType;
    }
    
    endTileGame(success) {
        clearInterval(this.tileInterval);
        
        const modal = document.getElementById('tile-modal');
        
        if (success) {
            setTimeout(() => {
                modal.classList.remove('active');
                this.backpack.addItem('tile', 1);
                const materialConfig = GAME_CONFIG.MATERIALS.tile;
                this.showHint(`获得 ${materialConfig.name} ×1！`);
                this.updateTaskUI();
                this.updateBackpackUI();
                this.isCollecting = false;
            }, 500);
        } else {
            modal.classList.remove('active');
            this.showHint('时间到了！再试一次吧！');
            this.isCollecting = false;
        }
    }
}
