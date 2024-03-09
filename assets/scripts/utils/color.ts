import { Color } from 'cc';

const getRandomChannelColor = () => {
    return Math.floor(Math.random() * 256);
};

export const getRandomColor = (alpha = 255) => {
    return new Color(getRandomChannelColor(), getRandomChannelColor(), getRandomChannelColor(), alpha);
};
