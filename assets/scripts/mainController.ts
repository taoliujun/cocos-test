import { _decorator, Component, instantiate, Prefab, Sprite, UITransform } from 'cc';
import { getRandomColor } from './utils/color';

const { ccclass, property } = _decorator;

@ccclass('mainController')
export class mainController extends Component {
    @property({ type: Prefab })
    private lotteryPrefab: Prefab = null;

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
        this.makeBoxes();
    }

    update(deltaTime: number) {}
}
