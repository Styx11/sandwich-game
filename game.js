// 游戏常量
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const COLORS = {
    primary: 0x4CAF50,
    secondary: 0x2196F3,
    text: 0x333333,
    success: 0x4CAF50,    // 保持原有的成功提示颜色
    error: 0xFF5252,      // 保持原有的错误提示颜色
    background: 0xF5F5F5,
    ingredients: {        // 将食材颜色单独放在一个对象中
        bread: '#F39C12',    // 面包 - 橙色
        cheese: '#F4D03F',   // 奶酪 - 金黄色
        ham: '#FF9E9E',      // 火腿 - 粉红色（修改）
        lettuce: '#2ECC71',  // 生菜 - 绿色
        tomato: '#E74C3C'    // 番茄 - 鲜红色
    }
};

// SVG 字符串定义
const SVG_STRINGS = {
    crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M50 10 L90 40 L80 80 L20 80 L10 40 Z" fill="#FFD700" stroke="#000" stroke-width="2"/>
        <circle cx="25" cy="40" r="5" fill="#FF0000"/>
        <circle cx="50" cy="30" r="5" fill="#FF0000"/>
        <circle cx="75" cy="40" r="5" fill="#FF0000"/>
    </svg>`,
    ...(window.SVG_ASSETS || {})
};

const SVG_STRINGS_BREAD_BOTTOM = window.SVG_ASSETS_BREAD_BOTTOM;

// 通用函数
function createSkipButton(scene, nextSceneKey) {
    // 创建跳过按钮
    const skipButton = scene.add.text(GAME_WIDTH - 100, 40, '跳过本关', {
        fontSize: '20px',
        backgroundColor: '#cccccc',
        padding: { x: 10, y: 5 },
        color: '#ffffff'
    })
    .setInteractive({ useHandCursor: true })
    .setOrigin(0.5);

    // 根据全局配置设置初始可见性
    skipButton.setVisible(scene.game.config.allowSkip);

    // 添加按钮悬停效果
    skipButton.on('pointerover', () => {
        skipButton.setStyle({ backgroundColor: '#999999' });
    });

    skipButton.on('pointerout', () => {
        skipButton.setStyle({ backgroundColor: '#cccccc' });
    });

    skipButton.on('pointerdown', () => {
        if (scene.game.config.allowSkip) {
            scene.scene.start(nextSceneKey);
        }
    });

    return skipButton;
}

function createHomeButton(scene) {
    // 创建回到首页按钮（添加 setOrigin）
    const homeButton = scene.add.text(100, 40, '回到首页', {
        fontSize: '20px',
        backgroundColor: '#cccccc',
        padding: { x: 10, y: 5 },
        color: '#ffffff'
    })
    .setInteractive({ useHandCursor: true })
    .setOrigin(0.5);

    // 创建确认弹框容器（初始隐藏）
    const confirmDialog = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    confirmDialog.setVisible(false);

    // 创建半透明背景
    const overlay = scene.add.rectangle(
        0, 0,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000,
        0.5
    );
    overlay.setOrigin(0.5);

    // 创建弹框背景
    const dialogBox = scene.add.rectangle(
        0, 0,
        400,
        200,
        0xffffff
    );
    dialogBox.setOrigin(0.5);

    // 创建提示文本
    const confirmText = scene.add.text(
        0, -40,
        '确定要放弃当前进度\n回到首页吗？',
        {
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }
    ).setOrigin(0.5);

    // 创建确认按钮
    const confirmButton = scene.add.text(
        -80, 40,
        '确定',
        {
            fontSize: '20px',
            backgroundColor: COLORS.primary,
            padding: { x: 20, y: 10 },
            color: '#ffffff'
        }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // 创建取消按钮
    const cancelButton = scene.add.text(
        80, 40,
        '取消',
        {
            fontSize: '20px',
            backgroundColor: '#999999',
            padding: { x: 20, y: 10 },
            color: '#ffffff'
        }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // 添加所有元素到确认弹框容器
    confirmDialog.add([overlay, dialogBox, confirmText, confirmButton, cancelButton]);

    // 设置弹框的深度，确保显示在最上层
    confirmDialog.setDepth(1000);

    // 添加按钮交互事件
    homeButton.on('pointerdown', () => {
        confirmDialog.setVisible(true);
    });

    confirmButton.on('pointerdown', () => {
        scene.scene.start('StartScene');
    });

    cancelButton.on('pointerdown', () => {
        confirmDialog.setVisible(false);
    });

    // 添加按钮悬停效果
    [confirmButton, cancelButton].forEach(button => {
        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: button === confirmButton ? '#45a049' : '#777777' });
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: button === confirmButton ? COLORS.primary : '#999999' });
        });
    });

    homeButton.on('pointerover', () => {
        homeButton.setStyle({ backgroundColor: '#999999' });
    });

    homeButton.on('pointerout', () => {
        homeButton.setStyle({ backgroundColor: '#cccccc' });
    });

    return { homeButton, confirmDialog };
}

// 开始场景
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
        this.blobUrls = new Map();
    }

    preload() {
        try {
            // 为每个 SVG 创建 Blob URL 并加载
            Object.entries(SVG_STRINGS).forEach(([key, svgString]) => {
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                this.blobUrls.set(key, url);
                this.load.svg(key, url);
            });

            // 加载面包底部 SVG
            if (SVG_STRINGS_BREAD_BOTTOM) {
                const blob = new Blob([SVG_STRINGS_BREAD_BOTTOM], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                this.blobUrls.set('bread_bottom', url);
                this.load.svg('bread_bottom', url);
            }
        } catch (error) {
            console.error('StartScene preload error:', error);
        }
    }

    create() {
        // 清理 Blob URLs
        this.blobUrls.forEach(url => URL.revokeObjectURL(url));
        this.blobUrls.clear();

        // 创建标题
        const titleStyle = {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: COLORS.text,
            fontWeight: 'bold'
        };
        
        const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.3, '三明治制作大师', titleStyle)
            .setOrigin(0.5);

        // 添加皇冠装饰
        const crown = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT * 0.15, 'crown')
            .setDisplaySize(80, 60);

        // 创建开始按钮
        const buttonWidth = 200;
        const buttonHeight = 60;
        
        // 创建按钮容器
        const buttonContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT * 0.6);

        // 创建按钮背景
        const buttonBackground = this.add.graphics();
        buttonBackground.fillStyle(0x4CAF50, 1);
        buttonBackground.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);

        // 创建按钮文字
        const buttonText = this.add.text(0, 0, '开始游戏', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 将背景和文字添加到容器中
        buttonContainer.add([buttonBackground, buttonText]);

        // 创建交互区域
        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        buttonContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // 添加按钮交互效果
        buttonContainer.on('pointerover', () => {
            buttonBackground.clear();
            buttonBackground.fillStyle(0x45a049, 1);
            buttonBackground.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
            this.game.canvas.style.cursor = 'pointer';
        });

        buttonContainer.on('pointerout', () => {
            buttonBackground.clear();
            buttonBackground.fillStyle(0x4CAF50, 1);
            buttonBackground.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
            this.game.canvas.style.cursor = 'default';
        });

        buttonContainer.on('pointerdown', () => {
            // 确保在开始新游戏时重置所有状态
            this.scene.start('ConnectScene');
        });

        // 添加底部说明文字
        const instructionText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.8, 
            '一起来学习制作美味三明治吧！', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: COLORS.text
        }).setOrigin(0.5);

        // 添加跳过关卡控制组件
        const switchContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT * 0.9);

        // 调整间距
        const labelWidth = 120; // "允许跳过关卡"的估计宽度
        const switchWidth = 50; // 开关的宽度
        const statusWidth = 40; // "开启/关闭"文本的估计宽度
        const leftSpacing = 40;  // 左侧间距增加到 40
        const rightSpacing = 10; // 右侧间距减少到 10
        const totalWidth = labelWidth + switchWidth + statusWidth + leftSpacing + rightSpacing;
        const startX = -totalWidth / 2;

        // 添加文字标签
        const labelText = this.add.text(startX, 0, '允许跳过关卡', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: COLORS.text
        }).setOrigin(0, 0.5);
        switchContainer.add(labelText);

        // 创建开关背景（调整位置）
        const switchBackground = this.add.rectangle(
            startX + labelWidth + leftSpacing, // 使用新的左侧间距
            0,
            switchWidth,
            24,
            0xcccccc,
            1
        ).setInteractive({ useHandCursor: true });
        switchBackground.setOrigin(0.5);
        switchBackground.radius = 12;
        switchBackground.setStrokeStyle(1, 0xbbbbbb);
        switchContainer.add(switchBackground);

        // 创建开关滑块（调整位置）
        const switchHandle = this.add.circle(
            startX + labelWidth + leftSpacing - 12, // 使用新的左侧间距
            0,
            9,
            0xffffff
        );
        switchHandle.setStrokeStyle(1, 0xdddddd);
        switchContainer.add(switchHandle);

        // 添加状态文字（调整位置）
        const statusText = this.add.text(
            startX + labelWidth + leftSpacing + switchWidth + rightSpacing, // 使用新的间距
            0,
            '关闭',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: COLORS.text
            }
        ).setOrigin(0, 0.5);
        switchContainer.add(statusText);

        // 根据全局配置设置开关的初始状态
        if (this.game.config.allowSkip) {
            switchBackground.setFillStyle(0x4CAF50);
            switchHandle.x = startX + labelWidth + leftSpacing + 12; // 调整滑块位置
            statusText.setText('开启');
        } else {
            switchBackground.setFillStyle(0xcccccc);
            switchHandle.x = startX + labelWidth + leftSpacing - 12; // 调整滑块位置
            statusText.setText('关闭');
        }

        // 添加开关交互
        switchBackground.on('pointerdown', () => {
            this.game.config.allowSkip = !this.game.config.allowSkip;
            
            if (this.game.config.allowSkip) {
                switchBackground.setFillStyle(0x4CAF50);
                this.tweens.add({
                    targets: switchHandle,
                    x: startX + labelWidth + leftSpacing + 12, // 调整滑块动画终点
                    duration: 100,
                    ease: 'Power1'
                });
                statusText.setText('开启');
                this.game.events.emit('toggleSkipButton', true);
            } else {
                switchBackground.setFillStyle(0xcccccc);
                this.tweens.add({
                    targets: switchHandle,
                    x: startX + labelWidth + leftSpacing - 12, // 调整滑块动画终点
                    duration: 100,
                    ease: 'Power1'
                });
                statusText.setText('关闭');
                this.game.events.emit('toggleSkipButton', false);
            }
        });

        // 添加悬停效果
        switchBackground.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            if (!this.game.config.allowSkip) { // 修改这里，使用全局配置
                switchBackground.setFillStyle(0xbbbbbb);
            }
        });

        switchBackground.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            if (!this.game.config.allowSkip) { // 修改这里，使用全局配置
                switchBackground.setFillStyle(0xcccccc);
            }
        });
    }
}

// 连连看场景
class ConnectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConnectScene' });
        this.connections = [];
        this.selectedObject = null;
        this.graphics = null;
    }

    create() {
        // 重置状态
        this.connections = [];
        this.selectedObject = null;
        if (this.graphics) {
            this.graphics.clear();
        }
        this.graphics = this.add.graphics();

        // 添加回到首页按钮
        const { homeButton, confirmDialog } = createHomeButton(this);
        
        this.graphics = this.add.graphics();
        
        // 场景标题
        this.add.text(GAME_WIDTH / 2, 50, '食材连连看', {
            fontSize: '36px',
            color: COLORS.text,
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 创建食材数据
        const ingredients = [
            { name: '面包', image: 'bread' },
            { name: '奶酪', image: 'cheese' },
            { name: '火腿', image: 'ham' },
            { name: '生菜', image: 'lettuce' },
            { name: '番茄', image: 'tomato' }
        ];

        // 打乱食材顺序
        const shuffledIngredients = [...ingredients].sort(() => Math.random() - 0.5);

        // 创建左侧文字卡片
        const leftCards = ingredients.map((item, index) => {
            const y = 150 + index * 80;
            const text = this.add.text(200, y, item.name, {
                fontSize: '24px',
                backgroundColor: '#ffffff',
                padding: { x: 20, y: 10 },
                color: '#333333',  // 确保文字颜色足够深
                fontFamily: 'Arial'
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            text.originalItem = item;
            text.isText = true;
            return text;
        });

        // 创建右侧图片卡片
        const rightCards = shuffledIngredients.map((item, index) => {
            const y = 150 + index * 80;
            const image = this.add.image(600, y, item.image)
                .setInteractive({ useHandCursor: true });

            // 设置最大尺寸
            const maxSize = 170;
            const scale = Math.min(maxSize / image.width, maxSize / image.height);
            image.setScale(scale);

            image.originalItem = item;
            image.isImage = true;
            return image;
        });

        // 添加点击事件
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            // 如果没有选中对象，则选中当前对象
            if (!this.selectedObject) {
                this.selectedObject = gameObject;
                // 添加视觉反馈
                gameObject.setTint(0x00ff00);
                return;
            }

            // 如果点击的是同一个对象，取消选中
            if (this.selectedObject === gameObject) {
                this.selectedObject.clearTint();
                this.selectedObject = null;
                return;
            }

            // 检查是否是有效的连接（一个文字和一个图片）
            if ((this.selectedObject.isText && gameObject.isImage) ||
                (this.selectedObject.isImage && gameObject.isText)) {
                
                // 创建连线
                const line = {
                    start: this.selectedObject,
                    end: gameObject,
                    startItem: this.selectedObject.originalItem,
                    endItem: gameObject.originalItem
                };

                // 检查是否已经连接过
                const alreadyConnected = this.connections.some(conn => 
                    (conn.start === line.start || conn.start === line.end) ||
                    (conn.end === line.start || conn.end === line.end)
                );

                if (!alreadyConnected) {
                    this.connections.push(line);
                    this.drawConnections();
                }
            }

            // 清除选中状态
            this.selectedObject.clearTint();
            this.selectedObject = null;

            // 检查是否完成所有连接
            if (this.connections.length === ingredients.length) {
                this.checkConnections();
            }
        });

        // 添加跳过按钮
        const skipButton = createSkipButton(this, 'ColoringScene');

        // 添加事件监听
        this.game.events.on('toggleSkipButton', (visible) => {
            skipButton.setVisible(visible);
        });
    }

    drawConnections() {
        // 清除之前的连线
        this.graphics.clear();
        
        // 绘制新的连线
        this.graphics.lineStyle(3, 0x4CAF50);
        this.connections.forEach(line => {
            this.graphics.beginPath();
            
            // 获取对象的中心点
            const startX = line.start.x;
            const startY = line.start.y;
            const endX = line.end.x;
            const endY = line.end.y;
            
            // 绘制连接线
            this.graphics.moveTo(startX, startY);
            this.graphics.lineTo(endX, endY);
            this.graphics.strokePath();
        });
    }

    checkConnections() {
        let correct = true;
        this.connections.forEach(connection => {
            if (connection.startItem.name !== connection.endItem.name) {
                correct = false;
            }
        });

        if (correct) {
            this.showSuccess();
        } else {
            this.showRetry();
        }
    }

    showSuccess() {
        const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '闯关成功！', {
            fontSize: '48px',
            color: '#4CAF50',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            this.scene.start('ColoringScene');
        });
    }

    showRetry() {
        const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '再试一次！', {
            fontSize: '48px',
            color: '#FF5252',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            retryText.destroy();
            this.resetConnections();
        });
    }

    resetConnections() {
        this.connections = [];
        this.selectedObject = null;
        this.graphics.clear();
        
        // 清除所有对象的 tint
        this.children.list.forEach(child => {
            if (child.clearTint) {
                child.clearTint();
            }
        });
    }
}

// 上色场景
class ColoringScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ColoringScene' });
        this.selectedColor = null;
        this.coloredAreas = new Map();
        this.colorButtons = [];
        this.correctColors = COLORS.ingredients;
    }

    create() {
        try {
            // 重置状态
            this.selectedColor = null;
            this.coloredAreas.clear();
            this.colorButtons = [];

            // 添加回到首页按钮
            const { homeButton, confirmDialog } = createHomeButton(this);
            
            // 场景标题
            this.add.text(GAME_WIDTH / 2, 50, '给三明治上色', {
                fontSize: '36px',
                color: COLORS.text,
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // 定义食材
            const ingredients = [
                { name: 'bread', label: '面包', svg: 'bread' },
                { name: 'cheese', label: '奶酪', svg: 'cheese' },
                { name: 'ham', label: '火腿', svg: 'ham' },
                { name: 'lettuce', label: '生菜', svg: 'lettuce' },
                { name: 'tomato', label: '番茄', svg: 'tomato' }
            ];

            // 计算左右区域的分界线
            const dividerX = GAME_WIDTH * 0.35; // 左侧区域占35%，稍微向右移动
            
            // 创建颜色选择器（放在左侧）
            const colors = Object.values(this.correctColors);
            const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
            
            // 清空之前的颜色按钮数组
            this.colorButtons = [];

            // 在左侧垂直排列颜色按钮
            shuffledColors.forEach((color, index) => {
                const x = dividerX / 2 + 30; // 居中于左侧区域，并向右偏移30像素
                const y = 150 + index * 80; // 从上到下排列，间距80
                
                // 创建颜色按钮容器
                const buttonContainer = this.add.container(x, y);
                
                // 创建颜色按钮
                const colorButton = this.add.circle(0, 0, 25, 
                    Phaser.Display.Color.HexStringToColor(color).color)
                    .setInteractive({ useHandCursor: true });

                // 创建选中状态指示器（初始隐藏）
                const selectedIndicator = this.add.circle(0, 0, 30, 0xffffff, 0)
                    .setStrokeStyle(3, 0xffffff);
                selectedIndicator.visible = false;

                // 将按钮和指示器添加到容器
                buttonContainer.add([selectedIndicator, colorButton]);
                
                // 存储按钮相关对象
                this.colorButtons.push({
                    container: buttonContainer,
                    button: colorButton,
                    indicator: selectedIndicator,
                    color: color
                });

                colorButton.on('pointerover', () => {
                    this.game.canvas.style.cursor = 'pointer';
                    if (this.selectedColor !== color) {
                        buttonContainer.setScale(1.1);
                    }
                });

                colorButton.on('pointerout', () => {
                    this.game.canvas.style.cursor = 'default';
                    if (this.selectedColor !== color) {
                        buttonContainer.setScale(1);
                    }
                });

                colorButton.on('pointerdown', () => {
                    // 取消之前选中的颜色按钮效果
                    this.colorButtons.forEach(btn => {
                        if (btn.color !== color) {
                            btn.container.setScale(1);
                            btn.indicator.visible = false;
                        }
                    });

                    // 如果点击的是当前选中的颜色，则取消选中
                    if (this.selectedColor === color) {
                        this.selectedColor = null;
                        selectedIndicator.visible = false;
                        buttonContainer.setScale(1);
                    } else {
                        // 选中新的颜色
                        this.selectedColor = color;
                        selectedIndicator.visible = true;
                        buttonContainer.setScale(1.1);
                    }
                });
            });

            // 创建食材区域（放在右侧）
            ingredients.forEach((item, index) => {
                const y = 150 + index * 70; // 从上到下排列，间距70
                const x = dividerX + 150; // 从分界线右侧开始，留出更多空间

                // 创建食材图片
                const image = this.add.image(x, y, item.svg)
                    .setInteractive({ useHandCursor: true });
                
                // 设置图片大小
                const maxSize = 170;
                const scale = Math.min(maxSize / image.width, maxSize / image.height);
                image.setScale(scale);
                
                // 设置初始颜色为黑色
                image.setTint(0x000000);
                
                image.name = item.name;
                
                // 添加点击事件
                image.on('pointerdown', () => {
                    if (this.selectedColor) {
                        // 检查是否是正确颜色
                        const correctColor = this.correctColors[item.name];
                        
                        if (this.selectedColor === correctColor) {
                            // 如果是正确颜色，清除颜色滤镜，显示原始颜色
                            image.clearTint();
                        } else {
                            // 如果是错误颜色，应用颜色滤镜
                            image.setTint(Phaser.Display.Color.HexStringToColor(this.selectedColor).color);
                        }
                        
                        this.coloredAreas.set(item.name, this.selectedColor);
                        
                        // 不要在这里重置 selectedColor，让用户可以继续使用当前选中的颜色
                        // this.selectedColor = null;

                        if (this.coloredAreas.size === ingredients.length) {
                            this.checkColors();
                        }
                    }
                });
            });

            // 添加跳过按钮
            const skipButton = createSkipButton(this, 'DragDropScene');

            // 添加事件监听
            this.game.events.on('toggleSkipButton', (visible) => {
                skipButton.setVisible(visible);
            });
            
        } catch (error) {
            console.error('ColoringScene create error:', error);
        }
    }

    checkColors() {
        let isCorrect = true;
        const correctAnswers = COLORS.ingredients;

        this.coloredAreas.forEach((color, ingredient) => {
            if (color !== correctAnswers[ingredient]) {
                isCorrect = false;
            }
        });

        if (isCorrect && this.coloredAreas.size === Object.keys(correctAnswers).length) {
            this.showSuccess();
        } else {
            this.showRetry();
        }
    }

    showSuccess() {
        const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '闯关成功！', {
            fontSize: '48px',
            color: '#4CAF50',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            this.scene.start('DragDropScene');
        });
    }

    showRetry() {
        const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '再试一次！', {
            fontSize: '48px',
            color: '#FF5252',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            retryText.destroy();
            this.coloredAreas.clear();
            this.scene.restart();
        });
    }
}

// 拖放场景
class DragDropScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DragDropScene' });
        this.totalIngredients = 5;
    }

    init() {
        this.placedIngredients = new Map();
        this.zones = {};
        // 使用全局颜色定义
        this.ingredientColors = COLORS.ingredients;
    }

    create() {
        try {
            // 重置状态
            this.placedIngredients = new Map();
            this.zones = {};

            // 添加回到首页按钮
            const { homeButton, confirmDialog } = createHomeButton(this);
            
            // 场景标题
            this.add.text(GAME_WIDTH / 2, 50, '制作三明治', {
                fontSize: '36px',
                color: COLORS.text,
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // 添加提示文字
            this.add.text(GAME_WIDTH / 2, 85, '将食材拖动到对应位置', {
                fontSize: '16px',
                color: '#999999',  // 使用灰色
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // 定义食材
            const ingredients = [
                { name: 'bread', label: '面包' },
                { name: 'cheese', label: '奶酪' },
                { name: 'ham', label: '火腿' },
                { name: 'lettuce', label: '生菜' },
                { name: 'tomato', label: '番茄' }
            ];

            // 计算左右区域的分界线
            const dividerX = GAME_WIDTH * 0.35; // 左侧区域占35%

            // 创建三明治放置区域（右侧）
            ingredients.forEach((item, index) => {
                const y = 150 + index * 70; // 从上到下排列，间距70
                const x = dividerX + 150; // 从分界线右侧开始，留出更多空间

                // 创建食材图片（初始为黑色）
                const image = this.add.image(x, y, item.name)
                    .setInteractive({ useHandCursor: true });
                
                // 设置图片大小
                const maxSize = 170;
                const scale = Math.min(maxSize / image.width, maxSize / image.height);
                image.setScale(scale);
                
                // 设置初始颜色为黑色
                image.setTint(0x000000);
                
                image.name = item.name;
                this.zones[item.name] = { image };
            });

            // 添加面包底部装饰
            const breadBottom = this.add.image(dividerX + 150, 150 + ingredients.length * 70, 'bread_bottom')
                .setDepth(-1); // 确保在食材图片下方
            // 设置图片大小
            const maxSize = 170;
            const scale = Math.min(maxSize / breadBottom.width, maxSize / breadBottom.height);
            breadBottom.setScale(scale);

            // 创建可拖动的食材（左侧）
            const shuffledIngredients = [...ingredients].sort(() => Math.random() - 0.5);
            
            shuffledIngredients.forEach((item, index) => {
                const x = dividerX / 2; // 居中于左侧区域
                const y = 150 + index * 65; // 从上到下排列，间距65
                
                const ingredient = this.add.image(x, y, item.name)
                    .setScale(0.25)
                    .setInteractive({ useHandCursor: true });
                
                ingredient.name = item.name;
                this.input.setDraggable(ingredient);

                const placeholder = this.add.image(x, y, item.name)
                    .setScale(0.25)
                    .setAlpha(0.3)
                    .setVisible(false);

                ingredient.placeholder = placeholder;

                ingredient.on('pointerover', () => {
                    this.game.canvas.style.cursor = 'grab';
                    ingredient.setScale(0.3);
                });

                ingredient.on('pointerout', () => {
                    this.game.canvas.style.cursor = 'default';
                    ingredient.setScale(0.25);
                });
            });

            // 设置拖放事件
            this.input.on('dragstart', (pointer, gameObject) => {
                gameObject.placeholder.setVisible(true);
                gameObject.setAlpha(0.8);
                this.game.canvas.style.cursor = 'grabbing';
                gameObject.setScale(0.35);
            });

            this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            this.input.on('dragend', (pointer, gameObject) => {
                const dropZone = this.getDropZone(gameObject.x, gameObject.y);
                
                if (dropZone) {
                    // 检查该区域是否已经有食材
                    const existingPlacement = Array.from(this.placedIngredients.values())
                        .find(p => p.zoneName === dropZone.name);
                    
                    if (!existingPlacement) {
                        // 记录放置的食材和位置
                        this.placedIngredients.set(gameObject.name, {
                            zoneName: dropZone.name,
                            ingredientName: gameObject.name
                        });

                        // 获取对应的区域
                        const zoneInfo = this.zones[dropZone.name];
                        
                        // 检查是否是正确的位置
                        if (gameObject.name === dropZone.name) {
                            // 如果是正确的位置，显示原始颜色
                            zoneInfo.image.clearTint();
                        } else {
                            // 如果是错误的位置，保持黑色，并在上层显示错误图片
                            const wrongImage = this.add.image(zoneInfo.image.x, zoneInfo.image.y, gameObject.name)
                                .setScale(0.3)
                                .setAlpha(1);
                            zoneInfo.wrongImage = wrongImage;
                        }

                        // 淡出并销毁食材
                        this.tweens.add({
                            targets: [gameObject, gameObject.placeholder],
                            alpha: 0,
                            duration: 200,
                            onComplete: () => {
                                gameObject.placeholder.destroy();
                                gameObject.destroy();
                                
                                // 只在所有食材都放置完成后检查
                                if (this.placedIngredients.size === this.totalIngredients) {
                                    this.time.delayedCall(500, () => {
                                        this.checkPlacement();
                                    });
                                }
                            }
                        });
                    } else {
                        // 区域已被占用，返回原位
                        this.returnToOrigin(gameObject);
                    }
                } else {
                    // 未放在任何区域，返回原位
                    this.returnToOrigin(gameObject);
                }
                
                this.game.canvas.style.cursor = 'default';
            });

            // 添加跳过按钮
            const skipButton = createSkipButton(this, 'SortingScene');

            // 添加事件监听
            this.game.events.on('toggleSkipButton', (visible) => {
                skipButton.setVisible(visible);
            });
            
        } catch (error) {
            console.error('DragDropScene create error:', error);
        }
    }

    returnToOrigin(gameObject) {
        gameObject.placeholder.setVisible(false);
        gameObject.setAlpha(1);
        gameObject.setScale(0.25);
        gameObject.x = gameObject.placeholder.x;
        gameObject.y = gameObject.placeholder.y;
    }

    getDropZone(x, y) {
        for (const [name, zoneInfo] of Object.entries(this.zones)) {
            const zone = zoneInfo.image;
            const bounds = zone.getBounds();
            if (x >= bounds.left && x <= bounds.right && 
                y >= bounds.top && y <= bounds.bottom) {
                return { name, image: zone };
            }
        }
        return null;
    }

    checkPlacement() {
        let correct = true;
        
        // 检查每个放置的食材是否在正确的位置
        for (const [ingredientName, placement] of this.placedIngredients) {
            if (placement.zoneName !== ingredientName) {
                correct = false;
                break;
            }
        }

        if (correct) {
            this.showSuccess();
        } else {
            this.showRetry();
        }
    }

    showSuccess() {
        const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '闯关成功！', {
            fontSize: '48px',
            color: '#4CAF50',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            this.scene.start('SortingScene');
        });
    }

    showRetry() {
        const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '再试一次！', {
            fontSize: '48px',
            color: '#FF5252',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            retryText.destroy();
            this.scene.restart();
        });
    }
}

// 排序场景
class SortingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SortingScene' });
        this.steps = [
            { text: '把面包片放在盘子上 🍞' },
            { text: '在面包上涂上黄油 🧈' },
            { text: '放上奶酪、番茄和火腿 🧀' },
            { text: '盖上另一片面包 🥪' }
        ];
        this.baseX = 0;
        this.baseY = 150;
        this.stepSpacing = 80;
    }

    create() {
        try {
            // 重置状态
            this.baseX = GAME_WIDTH / 2 - 250;
            
            // 添加回到首页按钮
            const { homeButton, confirmDialog } = createHomeButton(this);
            
            // 场景标题
            this.add.text(GAME_WIDTH / 2, 50, '制作步骤', {
                fontSize: '36px',
                color: COLORS.text,
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // 打乱步骤顺序
            const shuffledSteps = [...this.steps].map((step, originalIndex) => ({
                ...step,
                correctOrder: originalIndex + 1 // 保存正确顺序
            })).sort(() => Math.random() - 0.5);

            // 创建步骤卡片
            shuffledSteps.forEach((step, index) => {
                const y = this.baseY + index * this.stepSpacing;
                this.createStepCard(step, this.baseX, y);
            });

            // 创建确认按钮（更靠右）
            const confirmButton = this.add.rectangle(GAME_WIDTH - 100, GAME_HEIGHT - 80, 140, 50, COLORS.primary)
                .setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(GAME_WIDTH - 100, GAME_HEIGHT - 80, '检查顺序', {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            confirmButton.on('pointerover', () => {
                confirmButton.setFillStyle(0x45a049);
            });

            confirmButton.on('pointerout', () => {
                confirmButton.setFillStyle(COLORS.primary);
            });

            confirmButton.on('pointerdown', () => {
                this.checkOrder();
            });

            // 添加跳过按钮
            const skipButton = createSkipButton(this, 'EndScene');

            // 添加事件监听
            this.game.events.on('toggleSkipButton', (visible) => {
                skipButton.setVisible(visible);
            });
            
        } catch (error) {
            console.error('SortingScene create error:', error);
        }
    }

    createStepCard(step, x, y) {
        // 创建更宽的背景
        const background = this.add.rectangle(x, y, 500, 60, 0xffffff) // 将宽度从 400 改为 500
            .setOrigin(0)
            .setStrokeStyle(2, 0x000000)
            .setInteractive({ useHandCursor: true, draggable: true });

        // 添加当前位置序号
        const currentOrder = Math.floor((y - this.baseY) / this.stepSpacing) + 1;
        const numberText = this.add.text(x + 20, y + 30, `${currentOrder}.`, {
            fontSize: '24px',
            color: COLORS.primary,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);

        // 添加步骤文字
        const stepText = this.add.text(x + 60, y + 30, step.text, {
            fontSize: '22px', // 稍微增加字体大小
            color: COLORS.text,
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);

        // 创建组
        const group = [background, numberText, stepText];
        background.stepGroup = group;
        background.correctOrder = step.correctOrder; // 保存正确顺序

        // 添加拖动事件
        background.on('dragstart', () => {
            group.forEach(item => item.setAlpha(0.8));
            background.setFillStyle(0xf0f0f0);
        });

        background.on('drag', (pointer, dragX, dragY) => {
            const dx = dragX - background.x;
            const dy = dragY - background.y;
            group.forEach(item => {
                item.x += dx;
                item.y += dy;
            });
        });

        background.on('dragend', () => {
            group.forEach(item => item.setAlpha(1));
            background.setFillStyle(0xffffff);
            this.arrangeSteps();
        });
    }

    arrangeSteps() {
        // 获取所有步骤背景并按Y坐标排序
        const backgrounds = this.children.list
            .filter(child => child instanceof Phaser.GameObjects.Rectangle && child.stepGroup)
            .sort((a, b) => a.y - b.y);

        // 为每个步骤分配新的位置并创建动画
        backgrounds.forEach((background, index) => {
            const targetY = this.baseY + index * this.stepSpacing;
            const group = background.stepGroup;
            const currentOrder = index + 1;

            // 为组中的每个元素创建动画
            group.forEach(item => {
                // 如果是序号文本，更新序号
                if (item === group[1]) {
                    item.setText(`${currentOrder}.`);
                }

                this.tweens.add({
                    targets: item,
                    x: item === background ? this.baseX : 
                        (item === group[1] ? this.baseX + 20 : this.baseX + 60),
                    y: item === background ? targetY : targetY + 30,
                    duration: 200,
                    ease: 'Power2'
                });
            });
        });
    }

    checkOrder() {
        const backgrounds = this.children.list
            .filter(child => child instanceof Phaser.GameObjects.Rectangle && child.stepGroup)
            .sort((a, b) => a.y - b.y);

        const correct = backgrounds.every((background, index) => 
            background.correctOrder === index + 1
        );

        if (correct) {
            this.showSuccess();
        } else {
            this.showRetry();
        }
    }

    showSuccess() {
        const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '闯关成功！', {
            fontSize: '48px',
            color: '#4CAF50',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            this.scene.start('EndScene');
        });
    }

    showRetry() {
        const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '再试一次！', {
            fontSize: '48px',
            color: '#FF5252',  // 使用十六进制颜色值
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            retryText.destroy();
            this.shuffleSteps();
        });
    }

    shuffleSteps() {
        // 获取所有步骤卡片并随机打乱顺序
        const cards = this.children.list
            .filter(child => child instanceof Phaser.GameObjects.Rectangle && child.stepGroup)
            .sort(() => Math.random() - 0.5);

        // 重新排列卡片
        cards.forEach((card, index) => {
            const targetY = this.baseY + index * this.stepSpacing;
            const group = card.stepGroup;

            group.forEach(item => {
                if (item === group[1]) {
                    item.setText(`${index + 1}.`);
                }

                this.tweens.add({
                    targets: item,
                    x: item === card ? this.baseX : 
                        (item === group[1] ? this.baseX + 20 : this.baseX + 60),
                    y: item === card ? targetY : targetY + 30,
                    duration: 400,
                    ease: 'Power2'
                });
            });
        });
    }
}

// 结算场景
class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    create() {
        try {
            // 添加皇冠图片
            const crown = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT * 0.3, 'crown')
                .setDisplaySize(100, 80);

            // 添加祝贺文本
            const congratsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.5, '恭喜你完成了所有关卡！', {
                fontSize: '36px',
                color: COLORS.text,
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // 创建居中的回到首页按钮
            const buttonWidth = 200;
            const buttonHeight = 60;
            
            // 创建按钮容器（居中）
            const buttonContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT * 0.7);

            // 创建按钮背景
            const buttonBackground = this.add.graphics();
            buttonBackground.fillStyle(0x4CAF50, 1);
            buttonBackground.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);

            // 创建按钮文字
            const buttonText = this.add.text(0, 0, '回到首页', {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);

            // 将背景和文字添加到容器中
            buttonContainer.add([buttonBackground, buttonText]);

            // 创建交互区域
            const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
            buttonContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

            // 添加按钮交互效果
            buttonContainer.on('pointerover', () => {
                buttonBackground.clear();
                buttonBackground.fillStyle(0x45a049, 1);
                buttonBackground.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
                this.game.canvas.style.cursor = 'pointer';
            });

            buttonContainer.on('pointerout', () => {
                buttonBackground.clear();
                buttonBackground.fillStyle(0x4CAF50, 1);
                buttonBackground.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
                this.game.canvas.style.cursor = 'default';
            });

            buttonContainer.on('pointerdown', () => {
                this.scene.start('StartScene');
            });

        } catch (error) {
            console.error('EndScene create error:', error);
        }
    }
}

// 游戏配置
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.background,
    allowSkip: false,
    scene: [
        StartScene,
        ConnectScene,
        ColoringScene,
        DragDropScene,
        SortingScene,
        EndScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 创建游戏实例
const game = new Phaser.Game(config);
