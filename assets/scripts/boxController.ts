import {
    _decorator,
    Color,
    Component,
    Graphics,
    instantiate,
    Node,
    Prefab,
    Sprite,
    UITransform,
    Vec2,
    Vec3,
    Widget,
} from 'cc';
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
        item.addComponent(Widget);

        const widget = item.getComponent(Widget);
        widget.isAlignLeft = true;
        widget.isAlignTop = true;
        widget.left = 200 * (index - 1);
        widget.top = 0;

        const ui = item.getComponent(UITransform);
        ui.width = 200;
        ui.height = 200 * yCount;

        const sprite = item.getComponent(Sprite);
        sprite.color = getRandomColor();

        // console.log(`==========scroll${index}`, item.position);

        for (let i = 1; i <= yCount; i += 1) {
            const citem = instantiate(this.lotteryPrefab);
            citem.addComponent(Widget);

            const cwidget = citem.getComponent(Widget);
            cwidget.isAlignLeft = true;
            cwidget.isAlignTop = true;
            cwidget.left = 0;
            cwidget.top = 200 * (i - 1);

            const cui = citem.getComponent(UITransform);
            cui.width = 200;
            cui.height = 200;

            const csprite = citem.getComponent(Sprite);
            csprite.color = getRandomColor();

            // console.log(`==item${i}`, citem.position);

            item.addChild(citem);
        }

        return item;
    }

    start() {
        const g = this.node.parent.getChildByName('tmpNode').getComponent(Graphics);
        g.moveTo(-300, 300);
        g.lineTo(300, 300);
        g.lineTo(300, -300);
        g.lineTo(-300, -300);
        g.close();
        g.stroke();

        this.node.addChild(this.generateScrollItem(1));
        this.node.addChild(this.generateScrollItem(2));
        this.node.addChild(this.generateScrollItem(3));
        console.log('==item1', this.node.children[0].children[1].getComponent(Widget));

        // console.log('==node1', this.node.getChildByName('node1'));
        // this.makeBoxes();
    }

    update(deltaTime: number) {}
}
