/* eslint-disable max-lines-per-function */
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

// 未中奖的值
const REWARD_EMPTY = -1;

// 至少3个奖项
enum RewardEnum {
    CASH_10,
    // CASH_30,
    // CASH_100,
    CASH_1000,
    GOODS_MOUTAI,
}

// 数组 - 奖品的值
const REWARD_VALUES = Object.values(RewardEnum).slice(Object.values(RewardEnum).length / 2);

const REWARD_CONFIG: Record<
    RewardEnum,
    {
        name: string;
    }
> = {
    [RewardEnum.CASH_10]: { name: '0.1元' },
    // [RewardEnum.CASH_30]: { name: '0.3元' },
    // [RewardEnum.CASH_100]: { name: '1元' },
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

        // 临时按钮
        this.node.parent.getChildByName('newRoundButton').on(Input.EventType.TOUCH_END, () => {
            // this.generateNewRound(shuffle(REWARD_VALUES)[0] as RewardEnum);
            this.generateNewRound(Math.random() > 0.8 ? REWARD_EMPTY : (shuffle(REWARD_VALUES)[0] as RewardEnum));
            // this.generateNewRound(REWARD_EMPTY);
        });

        // 生成第一次的3个列
        for (let i = 0; i < 3; i += 1) {
            const cNode = this.generateScrollItem(i);
            this.node.addChild(cNode);
            this.rewardResult[i] = {
                rewardIndex: 1,
            };
        }
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
        labelNode.name = 'rewardName';
        labelNode.addComponent(Label);

        node.addChild(labelNode);

        return node;
    }

    // 正在开奖中
    private isLotteryAnim = false;

    // 中奖结果
    private rewardResult: Record<
        number,
        {
            // 第几个奖品
            rewardIndex: number;
        }
    > = {};

    // 新一轮中奖
    private generateNewRound(reward: RewardEnum | typeof REWARD_EMPTY) {
        if (this.isLotteryAnim) {
            throw new Error('==正在开奖中');
        }

        console.log('==中奖奖品', REWARD_CONFIG[reward]);

        this.isLotteryAnim = true;

        // 上一轮中奖结果
        const prevRewardResult = cloneDeep(this.rewardResult);
        // 上一轮的所有列的前三项的部分信息
        const prevScrollItems = this.node.children.map((v) => {
            return v.children.map((v1) => {
                return {
                    // 奖品名称
                    rewardName: v1.getChildByName('rewardName').getComponent(Label).string,
                };
            });
        });
        // 清空绘制区域
        this.node.removeAllChildren();

        // 生成新一轮中奖结果
        for (let i = 0; i < 3; i += 1) {
            this.rewardResult[i] = {
                // 随机中奖索引
                rewardIndex: randomRangeInt(30, SCROLL_ITEMS_COUNT - 5),
            };
        }

        // 生成新3列
        const cNodes: Node[] = [];
        const regenerate = () => {
            for (let i = 0; i < 3; i += 1) {
                cNodes[i] = this.generateScrollItem(i);
            }

            // 不要横线连线
            for (let m = -1; m <= 1; m += 1) {
                if (
                    Array.from(
                        new Set([
                            cNodes[0].children[this.rewardResult[0].rewardIndex + m]
                                .getChildByName('rewardName')
                                .getComponent(Label).string,
                            cNodes[1].children[this.rewardResult[1].rewardIndex + m]
                                .getChildByName('rewardName')
                                .getComponent(Label).string,
                            cNodes[2].children[this.rewardResult[2].rewardIndex + m]
                                .getChildByName('rewardName')
                                .getComponent(Label).string,
                        ]),
                    ).length === 1
                ) {
                    console.log('==横向连线，重置==');
                    regenerate();
                }
            }
            // 不要斜角连线
            if (
                Array.from(
                    new Set([
                        cNodes[0].children[this.rewardResult[0].rewardIndex + -1]
                            .getChildByName('rewardName')
                            .getComponent(Label).string,
                        cNodes[1].children[this.rewardResult[1].rewardIndex + 0]
                            .getChildByName('rewardName')
                            .getComponent(Label).string,
                        cNodes[2].children[this.rewardResult[2].rewardIndex + 1]
                            .getChildByName('rewardName')
                            .getComponent(Label).string,
                    ]),
                ).length === 1 ||
                Array.from(
                    new Set([
                        cNodes[2].children[this.rewardResult[0].rewardIndex + -1]
                            .getChildByName('rewardName')
                            .getComponent(Label).string,
                        cNodes[1].children[this.rewardResult[1].rewardIndex + 0]
                            .getChildByName('rewardName')
                            .getComponent(Label).string,
                        cNodes[0].children[this.rewardResult[2].rewardIndex + 1]
                            .getChildByName('rewardName')
                            .getComponent(Label).string,
                    ]),
                ).length === 1
            ) {
                console.log('==斜角连线，重置==');
                regenerate();
            }
        };
        regenerate();

        // 指定部分特殊的商品
        for (let i = 0; i < 3; i += 1) {
            const cNode = cNodes[i];
            const rewardNode = cNode.children[this.rewardResult[i].rewardIndex];

            // 将本列前3项，换成上一轮中奖结果
            const prevReward = prevRewardResult[i];
            if (prevReward) {
                for (let j = 0; j < 3; j += 1) {
                    cNode.children[j].getChildByName('rewardName').getComponent(Label).string =
                        prevScrollItems[i][prevReward.rewardIndex - 1 + j].rewardName;
                }
            }

            // 替换中奖项
            if (reward !== REWARD_EMPTY) {
                // 特殊全屏奖品
                if (reward === RewardEnum.GOODS_MOUTAI) {
                    [
                        this.rewardResult[i].rewardIndex - 1,
                        this.rewardResult[i].rewardIndex,
                        this.rewardResult[i].rewardIndex + 1,
                    ].forEach((ri) => {
                        cNode.children[ri].getChildByName('rewardName').getComponent(Label).string =
                            REWARD_CONFIG[reward].name;
                    });
                } else {
                    rewardNode.getChildByName('rewardName').getComponent(Label).string = REWARD_CONFIG[reward].name;
                }
            }

            this.node.addChild(cNode);
        }

        // 开始动画
        for (let i = 0; i < 3; i += 1) {
            const cNode = cNodes[i];
            const rewardNode = cNode.children[this.rewardResult[i].rewardIndex];

            tween()
                .target(cNode.getComponent(Widget))
                .delay(i * 0.5)
                .by(
                    3,
                    {
                        top: 0 - rewardNode.getComponent(Widget).top + 200,
                    },
                    {
                        // easing: 'circInOut',
                        easing: 'cubicInOut',
                        onComplete: (target: Widget) => {
                            cNode.getComponent(Widget).top = target.top;
                            this.isLotteryAnim = false;
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
            const labelNode = cNode.getChildByName('rewardName');
            labelNode.getComponent(Label).string = randReward.name;

            node.addChild(cNode);
        }

        return node;
    }
}
