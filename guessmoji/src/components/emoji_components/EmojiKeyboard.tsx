import { Devvit } from '@devvit/public-api';
import Settings from '../../settings.json';1
import { EmojiDrawing } from './EmojiDrawing';

export const EmojiKeyboard: Devvit.BlockComponent = (_, context) => {
    const [selectedEmoji, setSelectedEmoji] = context.useState('');
    const [emojiGrid, setEmojiGrid] = context.useState<string[]>(
      new Array(Settings.resolution * Settings.resolution).fill('')
    );
  
    // Common emojis for users to choose from
    const emojiOptions = [
      '😀', '😍', '🌈', '🚀', '🌟', '🍕', '🐶', '🌺', '🎨', 
      '🦄', '🍦', '💖', '🌍', '🏄', '🎉', '🍩', '🚲', '🌻'
    ];
  
    const handleEmojiSelect = (emoji: string) => {
      setSelectedEmoji(emoji);
    };
  
    const handleGridCellPress = (index: number) => {
      if (!selectedEmoji) {
        context.ui.showToast('Please select an emoji first');
        return;
      }
  
      const newGrid = [...emojiGrid];
      newGrid[index] = selectedEmoji;
      setEmojiGrid(newGrid);
    };
  
    const handleSave = async () => {
      // Similar to how drawings are saved in your existing code
      // You'd implement the save logic here
      try {
        // Example save logic (adjust to match your app's requirements)
        await context.kvStore.put('emoji_drawing', JSON.stringify(emojiGrid));
        context.ui.showToast('Emoji drawing saved!');
      } catch (error) {
        context.ui.showToast('Failed to save emoji drawing');
      }
    };
  
    return (
      <vstack gap="medium" grow>
        {/* Emoji Selection Row */}
        <hstack gap="small" alignment="center wrap">
          {emojiOptions.map((emoji) => (
            <button 
              onPress={() => handleEmojiSelect(emoji)}
              style={{
                backgroundColor: selectedEmoji === emoji ? 'lightblue' : 'white',
                borderRadius: 8,
                padding: 8
              }}
            >
              {emoji}
            </button>
          ))}
        </hstack>
  
        {/* Emoji Grid */}
        {/* <vstack gap="none">
          {[...Array(Settings.resolution)].map((_, rowIndex) => (
            <hstack gap="none">
              {[...Array(Settings.resolution)].map((_, colIndex) => {
                const index = rowIndex * Settings.resolution + colIndex;
                return (
                  <button
                    height="12px"
                    width="12px"
                    onPress={() => handleGridCellPress(index)}
                    style={{
                      backgroundColor: emojiGrid[index] ? 'lightgray' : 'white',
                      border: '1px solid gray'
                    }}
                  >
                    {emojiGrid[index]}
                  </button>
                );
              })}
            </hstack>
          ))}
        </vstack> */}
  
        {/* Save Button */}
        <button onPress={handleSave}>Save Emoji Drawing</button>
  
        {/* Preview */}
        {emojiGrid.some(emoji => emoji) && (
          <EmojiDrawing 
            data={emojiGrid} 
            size={144} 
          />
        )}
      </vstack>
    );
  };