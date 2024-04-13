import {
    _decorator,
    Component,
    Graphics,
    Input,
    instantiate,
    Label,
    Node,
    randomRangeInt,
    tween,
    UITransform,
    Widget,
} from 'cc';
import { cloneDeep, shuffle } from 'lodash-es';

const { ccclass } = _decorator;

enum RewardEnum {
    NONE = 1,
    CASH_10,
    CASH_30,
    CASH_100,
    CASH_1000,
    GOODS_MOUTAI,
}

const REWARD_VALUES = Object.values(RewardEnum).slice(Object.values(RewardEnum).length / 2);

const REWARD_CONFIG: Record<
    RewardEnum,
    {
        name: string;
    }
> = {
    [RewardEnum.NONE]: { name: '谢谢参与' },
    [RewardEnum.CASH_10]: { name: '0.1元' },
    [RewardEnum.CASH_30]: { name: '0.3元' },
    [RewardEnum.CASH_100]: { name: '1元' },
    [RewardEnum.CASH_1000]: { name: '10元' },
    [RewardEnum.GOODS_MOUTAI]: { name: '茅台酒' },
};

// 每个滚动节点里包含的奖项数量
const SCROLL_ITEMS_COUNT = 100;

@ccclass('boxController')
export class boxController extends Component {
    onLoad() {
        this.main();
    }

    main() {
        // 临时外框
        const g = this.node.parent.getChildByName('tmpNode').getComponent(Graphics);
        g.moveTo(-300, 300);
        g.lineTo(300, 300);
        g.lineTo(300, -300);
        g.lineTo(-300, -300);
        g.close();
        g.stroke();

        // 生成第一次的3个列
        for (let i = 0; i < 3; i += 1) {
            const cNode = this.generateScrollItem(i);
            this.node.addChild(cNode);
            this.rewardResult[i] = {
                scrollIndex: i,
                rewardIndex: 1,
            };
        }

        this.node.parent.getChildByName('newRoundButton').on(Input.EventType.TOUCH_END, () => {
            this.generateNewRound(shuffle(REWARD_VALUES)[0] as RewardEnum);
        });
    }

    // 生成一个scroll节点
    private getBaseScrollNode() {
        const node = new Node();
        const ui = node.addComponent(UITransform);
        const widget = node.addComponent(Widget);

        ui.width = 200;
        ui.height = 200;

        widget.isAlignLeft = true;
        widget.isAlignTop = true;

        return { node, ui, widget };
    }

    // 生成一个奖品节点
    private getBaseRewardNode() {
        const node = new Node();
        const ui = node.addComponent(UITransform);
        const widget = node.addComponent(Widget);

        ui.width = 200;
        ui.height = 200;

        widget.isAlignLeft = true;
        widget.isAlignTop = true;

        const labelNode = new Node();
        labelNode.name = 'labelNode';
        labelNode.addComponent(Label);

        node.addChild(labelNode);

        return node;
    }

    // 正在开奖中
    private isDrawLottery = false;

    // 中奖结果
    private rewardResult: Partial<
        Record<
            number,
            {
                // 第几列
                scrollIndex: number;
                // 第几个奖品
                rewardIndex: number;
            }
        >
    > = {};

    // 新一轮中奖
    private generateNewRound(reward: RewardEnum) {
        if (this.isDrawLottery) {
            throw new Error('==正在开奖中');
        }

        console.log('==中奖奖品', REWARD_CONFIG[reward]);

        this.isDrawLottery = true;

        // 上一轮中奖结果
        const prevRewardResult = cloneDeep(this.rewardResult);
        // 上一次的所有列的前三项的部分信息
        const prevScrollItems = cloneDeep(
            this.node.children.map((v) => {
                return v.children.map((v1) => {
                    return {
                        rewardName: v1.getChildByName('labelNode').getComponent(Label).string,
                    };
                });
            }),
        );

        this.node.removeAllChildren();

        // 生成新一轮中奖结果
        for (let i = 0; i < 3; i += 1) {
            this.rewardResult[i] = {
                // 第几列
                scrollIndex: i,
                // 随机中奖索引
                rewardIndex: randomRangeInt(30, SCROLL_ITEMS_COUNT - 5),
            };
        }

        for (let i = 0; i < 3; i += 1) {
            // 生成新列
            const cNode = this.generateScrollItem(i);

            // 将本列前3项，换成上一轮中奖结果
            const prevReward = prevRewardResult[i];
            if (prevReward) {
                for (let j = 0; j < 3; j += 1) {
                    cNode.children[j].getChildByName('labelNode').getComponent(Label).string =
                        prevScrollItems[i][prevReward.rewardIndex - 1 + j].rewardName;
                }
            }

            // TODO 在合适的位置，替换中奖项，且保证中奖项的上下项不会连线
            const rewardNode = cNode.children[this.rewardResult[i].rewardIndex];
            rewardNode.getChildByName('labelNode').getComponent(Label).string = REWARD_CONFIG[reward].name;

            this.node.addChild(cNode);

            tween()
                .target(cNode.getComponent(Widget))
                .delay(i * 0.5)
                .by(
                    5,
                    {
                        top: 0 - rewardNode.getComponent(Widget).top + 200,
                    },
                    {
                        // easing: 'circInOut',
                        easing: 'cubicInOut',
                        onComplete: (target: Widget) => {
                            cNode.getComponent(Widget).top = target.top;
                            this.isDrawLottery = false;
                        },
                    },
                )
                .start();
        }
    }

    // 生成一列奖品项
    private generateScrollItem(index: number) {
        const { node, ui, widget } = this.getBaseScrollNode();

        widget.left = 200 * index;
        widget.top = 0;

        ui.width = 200;
        ui.height = 200 * SCROLL_ITEMS_COUNT;

        const baseNode = this.getBaseRewardNode();

        const rewardValues = Object.values(REWARD_CONFIG);

        for (let i = 0; i < SCROLL_ITEMS_COUNT; i += 1) {
            const cNode = instantiate(baseNode);

            const cwidget = cNode.getComponent(Widget);
            cwidget.left = 0;
            cwidget.top = 200 * i;

            // 在节点上放一个随机奖品
            const randReward = shuffle(rewardValues)[0];
            const labelNode = cNode.getChildByName('labelNode');
            labelNode.getComponent(Label).string = randReward.name;

            node.addChild(cNode);
        }

        return node;
    }
}
