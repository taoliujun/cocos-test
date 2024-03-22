import {
    _decorator,
    Component,
    instantiate,
    Node,
    Prefab,
    resources,
    Sprite,
    SpriteFrame,
    UITransform,
    Vec3,
} from 'cc';
import { getRandomColor } from './utils/color';

const { ccclass, property } = _decorator;

@ccclass('mainController')
export class mainController extends Component {
    @property({ type: Prefab })
    private lotteryPrefab: Prefab = null;

    // create a hortial scroll item
    private generateScrollItem() {
        const item = new Node('scrollItem');
        item.setPosition(new Vec3(0, 0, 0));
        item.addComponent(UITransform);
        item.addComponent(Sprite);

        const ui = item.getComponent(UITransform);
        ui.width = 200;
        ui.height = 200;

        resources.load('1/spriteFrame', SpriteFrame, (err, frame) => {
            const sprite = item.getComponent(Sprite);
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = frame;
        });

        return item;
    }

    // make 9 boxes
    private makeBoxes() {
        const nodeUI = this.node.getComponent(UITransform);
        const perWidth = nodeUI.width / 3;
        const perHeight = nodeUI.height / 3;
        const points = {
            x: [-perWidth, 0, perWidth],
            y: [perHeight, 0, -perHeight],
        };

        for (let y = 1; y <= 3; y += 1) {
            for (let x = 1; x <= 3; x += 1) {
                if (x === 2 && y === 2) {
                    continue;
                }
                const box = instantiate(this.lotteryPrefab);
                box.getComponent(Sprite).color = getRandomColor();
                this.node.addChild(box);
                console.log(x, y);
                box.setPosition(points.x[Math.floor((x - 1) % 3)], points.y[Math.floor((y - 1) % 3)]);
            }
        }
    }

    start() {
        this.node.addChild(this.generateScrollItem());
        console.log('==item1', this.node.getChildByName('scrollItem'));
        console.log('==node1', this.node.getChildByName('node1'));
        // this.makeBoxes();
    }

    update(deltaTime: number) {}
}
