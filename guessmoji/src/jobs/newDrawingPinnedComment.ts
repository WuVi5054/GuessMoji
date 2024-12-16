import { Devvit } from '@devvit/public-api';

export const newDrawingPinnedComment = Devvit.addSchedulerJob<{
  postId: string;
}>({
  name: 'DRAWING_PINNED_TLDR_COMMENT',
  onRun: async (event, context) => {
    if (event.data) {
      try {
        const comment = await context.reddit.submitComment({
          id: event.data.postId,
          text: `GuessMoji is a new emoji-based guessing game built on [Reddit's developer platform](https://developers.reddit.com). To play, press the "Guess" button to submit a guess or "Draw" button to create your own drawing. [Submit feedback](https://www.reddit.com/r/Pixelary/comments/1f578ps/hello_pixelary_community/).`,
        });
        await comment.distinguish(true);
      } catch (error) {
        console.error('Failed to submit TLDR comment:', error);
      }
    }
  },
});
