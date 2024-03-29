import {
    _decorator,
    Color,
    Component,
    Graphics,
    instantiate,
    Node,
    randomRangeInt,
    resources,
    Sprite,
    SpriteFrame,
    tween,
    UITransform,
    Widget,
} from 'cc';
import { shuffle } from 'lodash-es';

const { ccclass } = _decorator;

enum RewardEnum {
    NONE = 1,
    CASH_10,
    CASH_30,
    CASH_100,
    GOODS_MOUTAI,
}

const rewardsConfig: Record<
    RewardEnum,
    {
        name: string;
        color: Color;
    }
> = {
    [RewardEnum.NONE]: { name: '谢谢参与', color: Color.WHITE },
    [RewardEnum.CASH_10]: { name: '0.1元', color: Color.BLUE },
    [RewardEnum.CASH_30]: { name: '0.3元', color: Color.GREEN },
    [RewardEnum.CASH_100]: { name: '1元', color: Color.MAGENTA },
    [RewardEnum.GOODS_MOUTAI]: { name: '茅台酒', color: Color.RED },
};

// 每个滚动里包含的奖项数量
const SCROLL_ITEMS_COUNT = 100;

@ccclass('boxController')
export class boxController extends Component {
    private splash: SpriteFrame = null;

    onLoad() {
        resources.load('splash/spriteFrame', SpriteFrame, (err, data) => {
            if (err) {
                console.log('==err', err);
            }
            this.splash = data;
            this.main();
        });
    }

    main() {
        const g = this.node.parent.getChildByName('tmpNode').getComponent(Graphics);
        g.moveTo(-300, 300);
        g.lineTo(300, 300);
        g.lineTo(300, -300);
        g.lineTo(-300, -300);
        g.close();
        g.stroke();

        // this.node.addChild(this._getBaseSprite().node);

        const reward = RewardEnum.CASH_100;

        for (let i = 1; i <= 3; i += 1) {
            const cNode = this.generateScrollItem(i);
            this.node.addChild(cNode);

            // 在合适的位置，替换中奖项，且保证中奖项的上下项不会连线
            const rewardIndex = randomRangeInt(30, SCROLL_ITEMS_COUNT - 5);
            const rewardNode = cNode.children[rewardIndex];
            rewardNode.getComponent(Sprite).color = rewardsConfig[reward].color;

            console.log('==item1', cNode.position.y, cNode.getComponent(Widget).top);

            tween()
                .target(cNode.getComponent(Widget))
                .by(
                    5,
                    {
                        top: 0 - rewardNode.getComponent(Widget).top + 200,
                    },
                    {
                        // easing: 'circInOut',
                        easing: 'cubicInOut',
                        onUpdate: (target) => {
                            // item1.position = target;
                        },
                    },
                )
                .call(() => {
                    console.log('==item2', cNode.position.y, cNode.getComponent(Widget).top);
                })
                .start();
        }

        // console.log('==node1', this.node.getChildByName('node1'));
        // this.makeBoxes();
    }

    private _getBaseSprite() {
        const node = new Node();
        const ui = node.addComponent(UITransform);
        const sprite = node.addComponent(Sprite);
        const widget = node.addComponent(Widget);

        ui.width = 200;
        ui.height = 200;

        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = this.splash;
        sprite.color = Color.WHITE;

        widget.isAlignLeft = true;
        widget.isAlignTop = true;

        return { node, ui, sprite, widget };
    }

    // create a hortial scroll item
    private generateScrollItem(index: number) {
        const { node, ui, widget } = this._getBaseSprite();

        widget.left = 200 * (index - 1);
        widget.top = 0;

        ui.width = 200;
        ui.height = 200 * SCROLL_ITEMS_COUNT;

        const baseNode = this._getBaseSprite().node;

        const allColors = Object.values(rewardsConfig).map((v) => v.color);

        for (let i = 1; i <= SCROLL_ITEMS_COUNT; i += 1) {
            const cNode = instantiate(baseNode);

            const cwidget = cNode.getComponent(Widget);
            cwidget.left = 0;
            cwidget.top = 200 * (i - 1);

            const cui = cNode.getComponent(UITransform);
            cui.width = 200;
            cui.height = 200;

            const csprite = cNode.getComponent(Sprite);
            [csprite.color] = shuffle(allColors);

            node.addChild(cNode);
        }

        return node;
    }
}
