import { Devvit } from '@devvit/public-api';

import Settings from '../../settings.json';

interface EmojiDrawingProps  {
  data: string[];
  size?: number;
  onPress?: Devvit.Blocks.OnPressEventHandler;
  shadowOffset?: number;
}

export const EmojiDrawing = (props: EmojiDrawingProps): JSX.Element => {
  const { data, size = 288, onPress } = props;
  const shadowOffset = props.shadowOffset ?? 4;
  const height: Devvit.Blocks.SizeString = `${size + shadowOffset}px`;
  const width: Devvit.Blocks.SizeString = `${size + shadowOffset}px`;

  function indexToXY(index: number, resolution: number): { x: number; y: number } {
    return {
      x: index % resolution,
      y: Math.floor(index / resolution),
    };
  }

  // Group pixels by color
  const paths = data.map((emoji, index) => {
    const { x, y } = indexToXY(index, Settings.resolution);
    return `<text x="${x}" y="${y}" font-size="1">${emoji}</text>`;
  });

  // Create SVG string
  const background = `<rect width="${Settings.resolution}" height="${Settings.resolution}" fill="white" />`;
  const svgString = `<svg width="${Settings.resolution}" height="${Settings.resolution}" viewBox="0 0 ${Settings.resolution} ${Settings.resolution}" xmlns="http://www.w3.org/2000/svg">${background}${paths}</svg>`;

  return (
    <zstack height={height} width={width} onPress={onPress} alignment="top start">
      {/* Shadow */}
      <vstack height={height} width={width} alignment="bottom end">
        <hstack height={`${size}px`} width={`${size}px`} backgroundColor={Settings.theme.shadow} />
      </vstack>

      {/* Drawing */}
      <image
        imageWidth={size}
        imageHeight={size}
        height={`${size}px`}
        width={`${size}px`}
        description="Drawing"
        resizeMode="fill"
        url={`data:image/svg+xml,${svgString}`}
      />
    </zstack>
  );
};
