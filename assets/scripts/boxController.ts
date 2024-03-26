import { _decorator, Color, Component, instantiate, Node, Prefab, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { getRandomColor } from './utils/color';

const { ccclass, property } = _decorator;

@ccclass('boxController')
export class boxController extends Component {
    @property({ type: Prefab })
    private lotteryPrefab: Prefab = null;

    // create a hortial scroll item
    private generateScrollItem(index: number) {
        const yCount = 10;

        const item = instantiate(this.lotteryPrefab);
        item.setPosition(new Vec3(200 * (index - 2), 300, 0));

        const ui = item.getComponent(UITransform);
        ui.setAnchorPoint(new Vec2(0.5, 1));
        ui.width = 200;
        ui.height = 200 * yCount;

        const sprite = item.getComponent(Sprite);
        sprite.color = new Color(0, 0, 0);

        console.log(`==========scroll${index}`, item.position);

        for (let i = 1; i <= yCount; i += 1) {
            const citem = instantiate(this.lotteryPrefab);
            citem.setPosition(new Vec3(0, (yCount / 2 - i) * 200, 0));
            console.log(`==item${i}`, citem.position);

            const cui = citem.getComponent(UITransform);
            // ui.setAnchorPoint(new Vec2(0.5, 1));
            cui.width = 200;
            cui.height = 200;

            const csprite = citem.getComponent(Sprite);

            csprite.color = getRandomColor();

            item.addChild(citem);
        }

        return item;
    }

    start() {
        this.node.addChild(this.generateScrollItem(1));
        this.node.addChild(this.generateScrollItem(2));
        this.node.addChild(this.generateScrollItem(3));
        console.log('==item1', this.node.getChildByName('scrollItem_1'));
        // console.log('==node1', this.node.getChildByName('node1'));
        // this.makeBoxes();
    }

    update(deltaTime: number) {}
}
