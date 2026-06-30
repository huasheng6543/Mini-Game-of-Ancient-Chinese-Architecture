export const GAME_CONFIG = {
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,
    TILE_SIZE: 64,
    MAP_WIDTH: 30,
    MAP_HEIGHT: 20,
    PLAYER_SPEED: 200,
    
    MATERIALS: {
        wood: { name: '木材', icon: '🪵', color: '#8B4513' },
        stone: { name: '石材', icon: '🪨', color: '#808080' },
        brick: { name: '青砖', icon: '🧱', color: '#8B7355' },
        tile: { name: '瓦片', icon: '🏺', color: '#CD853F' },
        wood_joint: { name: '榫卯', icon: '🔩', color: '#DAA520' }
    },
    
    TASKS: [
        {
            id: 0,
            name: '初来乍到',
            description: '欢迎来到古代！先去村口找到张木匠，他会告诉你接下来该做什么。',
            npcId: 'mujiang',
            requirement: null,
            reward: null,
            knowledge: {
                title: '中国古代建筑概述',
                content: '中国古代建筑历史悠久，从原始社会的穴居、巢居发展到明清时期的宫殿、园林，形成了独特的建筑体系。\n\n主要特点：\n1. 以木材为主要建筑材料，采用榫卯结构\n2. 注重中轴线对称布局\n3. 建筑与自然环境和谐统一\n4. 装饰艺术丰富多彩，包括彩画、雕刻等\n\n中国古代建筑不仅是技术的结晶，更是中华文化的重要载体。'
            }
        },
        {
            id: 1,
            name: '砍伐木材',
            description: '建造房屋首先需要木材。走到地图上的树林区域（🌲），点击即可采集木材！需要收集5个木材。',
            npcId: 'mujiang',
            requirement: { material: 'wood', count: 5 },
            collectArea: 'forest',
            reward: null,
            knowledge: {
                title: '木材的选择',
                content: '中国古代建筑对木材的选择十分讲究：\n\n常用木材：\n1. 松 木：质地松软，易加工，多用于次要建筑\n2. 柏 木：质地坚硬，耐腐朽，多用于重要建筑\n3. 杉 木：纹理直，易干燥，是南方建筑的首选\n4. 楠 木：珍贵木材，质地细密，多用于宫殿\n\n采伐原则：\n- 因材施用，根据建筑部位选择不同木材\n- 适时采伐，冬季采伐的木材质量更好\n- 保护生态，讲究"伐一补三"'
            }
        },
        {
            id: 2,
            name: '采集石材',
            description: '地基需要坚固的石材。去采石场采集3块石材！',
            npcId: 'shijiang',
            requirement: { material: 'stone', count: 3 },
            collectArea: 'quarry',
            reward: null,
            knowledge: {
                title: '台基与石作',
                content: '台基是中国古代建筑的重要组成部分：\n\n台基的作用：\n1. 防潮防水，保护木构架\n2. 突出建筑的雄伟气势\n3. 等级制度的象征\n\n台基等级：\n- 普通台基：用于小式建筑\n- 较高级台基：有栏杆，用于大式建筑\n- 更高台基：须弥座，用于宫殿、寺庙\n- 最高级台基：多层须弥座，仅用于最高等级建筑\n\n石材加工讲究"平整如镜，缝隙如线"。'
            }
        },
        {
            id: 3,
            name: '制作榫卯',
            description: '木材准备好了，现在学习制作榫卯！向张木匠请教榫卯技艺，制作3个榫卯构件。',
            npcId: 'mujiang',
            requirement: { material: 'wood_joint', count: 3 },
            collectArea: 'workshop',
            reward: null,
            knowledge: {
                title: '榫卯结构',
                content: '榫卯是中国古代建筑的核心技术：\n\n什么是榫卯？\n- 榫：凸出的部分\n- 卯：凹进的部分\n- 榫卯结合，不用钉子，牢固无比\n\n榫卯的优点：\n1. 抗震性能好，有一定的伸缩空间\n2. 便于维修和拆卸\n3. 节省金属材料\n4. 工艺精湛，体现智慧\n\n著名榫卯类型：\n- 燕尾榫：用于平板连接\n- 粽角榫：用于角部连接\n- 霸王拳：用于梁头装饰'
            }
        },
        {
            id: 4,
            name: '烧制青砖',
            description: '墙体需要青砖。去窑厂向李窑工学习，烧制8块青砖！',
            npcId: 'kilnWorker',
            requirement: { material: 'brick', count: 8 },
            collectArea: 'kiln',
            reward: null,
            knowledge: {
                title: '砖瓦制作',
                content: '中国古代砖瓦制作工艺精湛：\n\n青砖烧制流程：\n1. 选土：选择细腻的黏土\n2. 制坯：将泥土制成砖坯\n3. 晾干：自然阴干，避免暴晒\n4. 装窑：将砖坯整齐码放窑中\n5. 烧制：控制火候，约需数日\n6. 浇水：关键步骤！浇水使红砖变青砖\n7. 出窑：待冷却后取出\n\n青砖比红砖更坚固耐久，是古建筑的首选材料。'
            }
        },
        {
            id: 5,
            name: '制作瓦片',
            description: '屋顶需要瓦片。向瓦匠学习，制作10片瓦片！',
            npcId: 'wajiang',
            requirement: { material: 'tile', count: 10 },
            collectArea: 'tileWorkshop',
            reward: null,
            knowledge: {
                title: '屋顶与瓦作',
                content: '屋顶是中国古代建筑最具特色的部分：\n\n屋顶类型（按等级）：\n1. 庑殿顶：最高等级，四面坡，用于皇宫\n2. 歇山顶：次之，常用于宫殿、寺庙\n3. 悬山顶：两面坡，山墙挑出\n4. 硬山顶：两面坡，山墙封闭\n5. 攒尖顶：用于亭、塔、阁\n\n瓦的种类：\n- 板瓦：片状，铺设基层\n- 筒瓦：半圆筒状，覆盖板瓦缝隙\n- 瓦当：筒瓦顶端的装饰，有文字或图案\n- 滴水：板瓦下端的装饰，引导雨水\n\n"秦砖汉瓦"是中国古代建筑的骄傲！'
            }
        },
        {
            id: 6,
            name: '建造房屋',
            description: '太好了！材料都准备好了！现在在空地上开始建造你的古代房屋吧！',
            npcId: 'master',
            requirement: null,
            collectArea: 'buildingSite',
            reward: null,
            knowledge: {
                title: '建筑施工顺序',
                content: '中国古代建筑施工有严格的顺序：\n\n施工步骤：\n1. 定位放线：确定建筑位置和尺寸\n2. 筑基：建造台基和地基\n3. 立柱：竖立木柱，这是关键步骤\n4. 架梁：安装梁枋，形成屋架\n5. 铺椽：铺设椽子和望板\n6. 盖瓦：铺设瓦片，完成屋顶\n7. 砌墙：砌筑墙体\n8. 装修：安装门窗、进行装饰\n\n"墙倒屋不塌"——因为木构架才是承重主体！\n\n恭喜你！你已经掌握了中国古代建筑的基本知识！'
            }
        }
    ],
    
    NPCS: [
        {
            id: 'mujiang',
            name: '张木匠',
            role: '木匠师傅',
            position: { x: 280, y: 360 },
            color: '#8B4513',
            dialogues: {
                initial: '年轻人，你终于来了！我是张木匠，这村里的房子大多是我建的。',
                task_intro: '要建房子，首先得有木材。走，我带你去树林看看。记住，好的木材是好房子的基础！',
                task_complete: '不错！砍得有模有样！现在让我给你讲讲木材的知识...',
                next_task: '木材有了，但光有木材还不够。你需要去村东找石匠老李，他会教你关于石材的知识。',
                task3_intro: '回来得正好！现在我们来学习最重要的技艺——榫卯！去木工坊制作3个榫卯构件吧！',
                task3_complete: '太棒了！榫卯做得非常完美！现在让我给你讲讲榫卯的奥秘...',
                task3_next: '榫卯学好了！接下来我们需要青砖来砌墙。去找村南的李窑工，他会教你烧砖！'
            }
        },
        {
            id: 'shijiang',
            name: '李石匠',
            role: '石匠师傅',
            position: { x: 750, y: 200 },
            color: '#696969',
            dialogues: {
                initial: '你就是张木匠说的那个年轻人？我是李石匠。',
                task_intro: '台基不稳，房子就不牢。跟我去采石场，我教你怎么选石材。',
                task_complete: '好！石材采得不错。来，我给你讲讲台基的学问...',
                next_task: '石材有了。接下来你需要回到张木匠那里，学习最重要的技艺——榫卯！'
            }
        },
        {
            id: 'kilnWorker',
            name: '李窑工',
            role: '窑厂师傅',
            position: { x: 300, y: 550 },
            color: '#8B0000',
            dialogues: {
                initial: '欢迎欢迎！我是这里的窑工，烧了三十年砖了。',
                task_intro: '青砖青砖，关键在"青"。走，我教你怎么烧出好砖！',
                task_complete: '火候掌握得不错！来，我给你讲讲烧砖的工艺...',
                next_task: '砖有了。现在去找瓦匠老王，他会教你做瓦片！'
            }
        },
        {
            id: 'wajiang',
            name: '王瓦匠',
            role: '瓦匠师傅',
            position: { x: 800, y: 480 },
            color: '#CD853F',
            dialogues: {
                initial: '你好！我是王瓦匠，专门管屋顶的。',
                task_intro: '屋顶是房子的"帽子"，可马虎不得。来，我教你做瓦！',
                task_complete: '瓦做得很好！让我给你讲讲屋顶的知识...',
                next_task: '太棒了！所有材料都齐了！现在去村中广场，找建房大师，他会指导你完成最后的建造！'
            }
        },
        {
            id: 'master',
            name: '建房大师',
            role: '建房大师',
            position: { x: 640, y: 360 },
            color: '#FFD700',
            dialogues: {
                initial: '年轻人，你来了！我听说你学得很快。',
                task_intro: '所有材料都准备好了！现在，让我们开始建造吧！',
                task_complete: '太棒了！房子建得很好！你已经掌握了中国古代建筑的精髓！',
                next_task: null
            }
        }
    ],
    
    COLLECT_AREAS: {
        forest: { x: 50, y: 500, width: 350, height: 200, name: '树林', icon: '🌲', hidden: true },
        quarry: { x: 900, y: 500, width: 200, height: 180, name: '采石场', icon: '⛏️' },
        workshop: { x: 180, y: 280, width: 120, height: 120, name: '木工坊', icon: '🔨' },
        kiln: { x: 200, y: 580, width: 130, height: 130, name: '窑厂', icon: '🏭' },
        tileWorkshop: { x: 900, y: 400, width: 120, height: 120, name: '瓦坊', icon: '🏺' },
        buildingSite: { x: 550, y: 300, width: 200, height: 200, name: '建房工地', icon: '🏗️' }
    }
};