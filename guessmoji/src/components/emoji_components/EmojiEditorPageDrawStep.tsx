import { Context, Devvit, useInterval, useState } from '@devvit/public-api';

import Settings from '../../settings.json';
import type { CandidateWord, UserData } from '../../types.js';
import { blankCanvas, getLevel, splitArray } from '../../utils.js';
import { PixelSymbol } from '../PixelSymbol.js';
import { PixelText } from '../PixelText.js';
import { Shadow } from '../Shadow.js';
import { StyledButton } from '../StyledButton.js';
import { EmojiKeyboard } from './EmojiKeyboard';

interface EditorPageDrawStepProps {
  username: string | null;
  userData: UserData | null;
  candidate: CandidateWord;
  onNext: (drawing: string[]) => void; // Changed to string[] for emojis
  mode?: 'pixel' | 'emoji'; // Add mode selection
}

export const EditorPageDrawStep = (
  props: EditorPageDrawStepProps,
  _context: Context
): JSX.Element => {
  // Common drawing parameters
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const level = getLevel(props.userData?.levelRank ?? 1);
  const drawingTime = Settings.drawingDuration + level.extraTime;
  const mode = props.mode ?? 'emoji'; // Default to pixel mode

  // Pixel-specific state
  const [currentColor, setCurrentColor] = useState<number>(1);
  const [pixelDrawingData, setPixelDrawingData] = useState<number[]>(blankCanvas);

  // Emoji-specific state
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [emojiDrawingData, setEmojiDrawingData] = useState<string[]>(
    new Array(Settings.resolution * Settings.resolution).fill('')
  );

  // Common emoji options
  const emojiOptions = [
    '🚂', '😍', '🌈', '🚀', '🌟', '🍕', '🐉', '🌞', '🦄', '💖',
    '🌍', '🏄', "🎸", "🐍", "🕷️", "🍎", "📱", "🦁", "👑", "⛄", 
    "🕒", "🚫", "🌌", "🎩", "🍋", "🎂", "🎬", "🕵️‍♂️", "🦇", "🏠"
  ];


  // Time tracking
  useInterval(() => {
    setElapsedTime(Date.now() - startTime);
    const remainingTime = drawingTime * 1000 - elapsedTime;
    if (remainingTime <= 0) {
      props.onNext(mode === 'pixel' ? pixelDrawingData : emojiDrawingData);
    }
  }, 5000).start();

  const secondsLeft = Math.max(
    0,
    Math.round((drawingTime - elapsedTime / 1000) / 5) * 5
  );

  // Pixel drawing grid generator
  const generatePixelGrid = () => {
    const size = '275px';
    const innerSize = 275;
    const pixelSize: Devvit.Blocks.SizeString = `${innerSize / Settings.resolution}px`;

    const pixels = pixelDrawingData.map((pixel, index) => (
      <hstack
        onPress={() => {
          const newData = [...pixelDrawingData];
          newData[index] = currentColor;
          setPixelDrawingData(newData);
        }}
        height={pixelSize}
        width={pixelSize}
        backgroundColor={Settings.colors[pixel]}
      />
    ));

    return (
      <vstack height={size} width={size} padding="none">
        {splitArray(pixels, Settings.resolution).map((row) => (
          <hstack>{row}</hstack>
        ))}
      </vstack>
    );
  };

  // Emoji drawing grid generator
  const generateEmojiGrid = () => {
  const size = '275px';
  const innerSize = 275;
  const pixelSize: Devvit.Blocks.SizeString = `${(innerSize / Settings.resolution)}px`;

  const emojiCells = emojiDrawingData.map((emoji, index) => (
    <hstack
      key={index}
      onPress={() => {
        const newData = [...emojiDrawingData];
        newData[index] = selectedEmoji;
        setEmojiDrawingData(newData);
        console.log('emoji data:', newData);
      }}
      height={pixelSize}
      width={pixelSize}
      backgroundColor={emoji ? Settings.colors[0] : 'transparent'}
      alignment="center middle"
      style={{
        border: '1px solid gray',
        fontSize: '24px',
        flexWrap: 'wrap', // Allows wrapping to the next line
      }}
    >
      <text>{emoji || ''}</text>
    </hstack>
  ));

  return (
    <vstack height={size} width={size} padding="none">
      {splitArray(emojiCells, Settings.resolution).map((row, index) => (
        <hstack key={index}>{row}</hstack>
      ))}
    </vstack>
  );
  };

  // Pixel color palette generator
  const generatePixelColorPalette = () => (
    <hstack>
      {Settings.colors.map((c, i) => (
        <>
          <Shadow height="27.25px" width="27.25px">
            <hstack height="27.25px" width="27.25px" padding="xsmall" backgroundColor="black">
              <hstack
                height="100%"
                width="100%"
                backgroundColor={c}
                alignment="center middle"
                onPress={() => {
                  setCurrentColor(i);
                }}
              >
                {currentColor === i && (
                  <PixelSymbol type="checkmark" color={c === '#FFFFFF' ? 'black' : 'white'} />
                )}
              </hstack>
            </hstack>
          </Shadow>
          {i !== Settings.colors.length - 1 && <spacer size="xsmall" />}
        </>
      ))}
    </hstack>
  );

  // Emoji selection palette generator
  // const generateEmojiPalette = () => (
  //   <hstack gap="small" alignment="center wrap" style={{ overflow: 'auto' }}>
  //     {emojiOptions.map((emoji) => (
  //       <button
  //         onPress={() => {
  //           setSelectedEmoji(emoji);
  //           console.log('selected emoji:', emoji);
  //         }}
  //         style={{
  //           backgroundColor: selectedEmoji === emoji ? 'lightblue' : 'white',
  //           padding: 'small',
  //           borderRadius: 8,
  //           flex: 'none',
  //         }}
  //       >
  //         {emoji}
  //       </button>
  //     ))}
  //   </hstack>
  // );
  const generateEmojiPalette = () => {
    const emojisPerRow = 10; // Adjust this number as needed
    const rows = [];
  
    for (let i = 0; i < emojiOptions.length; i += emojisPerRow) {
      const rowEmojis = emojiOptions.slice(i, i + emojisPerRow);
      rows.push(
        <hstack key={i} gap="small" alignment="center">
          {rowEmojis.map((emoji) => (
            <button
              key={emoji}
              onPress={() => {
                setSelectedEmoji(emoji);
                console.log('selected emoji:', emoji);
              }}
              style={{
                backgroundColor: selectedEmoji === emoji ? 'lightblue' : 'white',
                padding: 'small',
                borderRadius: 8,
                flex: 'none',
              }}
            >
              {emoji}
            </button>
          ))}
        </hstack>
      );
    }
  
    return (
      <vstack gap ="tiny" alignment="center" style={{ overflow: 'auto' }}>
        {rows}
      </vstack>
    );
  };

  // Mode toggle
  const ModeToggle = () => (
    <hstack gap="small" alignment="center middle">
      <StyledButton
        label="Pixel"
        width="80px"
        onPress={() => props.mode !== 'pixel' && window.location.reload()}
        backgroundColor={mode === 'pixel' ? 'blue' : 'gray'}
      />
      <StyledButton
        label="Emoji"
        width="80px"
        onPress={() => props.mode !== 'emoji' && window.location.reload()}
        backgroundColor={mode === 'emoji' ? 'blue' : 'gray'}
      />
    </hstack>
  );

  // Blank check for both modes
  const drawingIsBlank = mode === 'pixel' 
    ? !pixelDrawingData.some((value) => value !== -1)
    : !emojiDrawingData.some(emoji => emoji);

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <vstack alignment="top start">
          <PixelText scale={3}>{props.candidate.word}</PixelText>
          <spacer size="small" />
          <hstack alignment="middle" gap="small">
            <PixelSymbol type="clock" />
            <PixelText>{secondsLeft.toString()}</PixelText>
            <PixelText>s left</PixelText>
          </hstack>
        </vstack>

        <spacer grow />

        <StyledButton
          width="80px"
          label="DONE"
          onPress={() => {
            props.onNext(mode === 'pixel' ? pixelDrawingData : emojiDrawingData);
          }}
        />
      </hstack>

      <spacer size="medium" />
      
      {/* Mode Toggle */}
      {/* <ModeToggle /> */}

      <spacer grow />

      <Shadow height="275px" width="275px">
        <zstack height="275px" width="275px" alignment="middle center" backgroundColor="white">
          {/* <image
            imageHeight={512}
            imageWidth={512}
            height="275px"
            width="275px"
            url="grid-template.png"
          /> */}
          
          {drawingIsBlank && <PixelText color={Settings.theme.weak}>
            {mode === 'pixel' ? 'Tap to draw' : 'Pick emoji to draw'}
          </PixelText>}
          
          
          {mode === 'pixel' ? generatePixelGrid() : generateEmojiGrid()}
        </zstack>
      </Shadow>

      <spacer grow />


      {mode === 'pixel' ? generatePixelColorPalette() : generateEmojiPalette()}
    </vstack>
  );
};