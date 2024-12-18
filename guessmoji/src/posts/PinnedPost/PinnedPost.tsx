import { Context, Devvit, useAsync, useState } from '@devvit/public-api';

import { EditorPage } from '../../components/EditorPage.js';
import { HowToPlayPage } from '../../components/HowToPlayPage.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import { LevelPage } from '../../components/LevelPage.js';
import { LoadingState } from '../../components/LoadingState.js';
import { MyDrawingsPage } from '../../components/MyDrawingsPage.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { PixelText } from '../../components/PixelText.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { Dictionary, GameSettings, PostData, UserData } from '../../types.js';
import { getLevelByScore } from '../../utils.js';

interface PinnedPostProps {
  postData: PostData;
  userData: UserData | null;
  username: string | null;
  gameSettings: GameSettings;
  dictionaries: Dictionary[];
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('menu');
  const buttonWidth = '256px';
  const buttonHeight = '48px';

  const { data: user, loading } = useAsync<{
    rank: number;
    score: number;
  }>(async () => {
    return await service.getUserScore(props.username);
  });

  if (user === null || loading) {
    return <LoadingState />;
  }

  // For now we assume that there is only one takeover active at a time
  const isTakeoverActive = props.dictionaries.some((dictionary) => dictionary.name !== 'main');
  const dictionary = props.dictionaries.find((dictionary) => dictionary.name !== 'main');

  const level = getLevelByScore(user?.score ?? 0);

  // each level has a "min" and "max" score value
  // the score can be inside or outside this range.

  // I want the percentage to be calculated based on the user's score relative to the level's min and max score values.

  // the score does not reset per level, so the user's score can be higher than the max score of the current level.

  // If out of bounds, clip to 0 or 100.

  const percentage = Math.round(
    Math.min(100, Math.max(0, (((user?.score ?? 0) - level.min) / (level.max - level.min)) * 100))
  );

  const Menu = (
    <vstack width="100%" height="100%" alignment="center middle">
      <spacer grow />
      {/* Logo */}
      
      <spacer height="100px" />

      {/* Wordmark */}
      <PixelText scale={4}>GuessMoji</PixelText>

      {/* Takeover banner */}
      {isTakeoverActive && dictionary?.name ? (
        <>
          <spacer height="16px" />
          <PixelText
            color={Settings.theme.secondary}
            scale={2}
          >{`${dictionary?.name} ${dictionary?.name.startsWith('r/') ? 'takeover' : 'event'}`}</PixelText>
        </>
      ) : null}

      <spacer grow />

      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <StyledButton
          width={buttonWidth}
          appearance="primary"
          height={buttonHeight}
          onPress={() => setPage('draw')}
          leadingIcon="+"
          label="DRAW"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('my-drawings')}
          label="MY DRAWINGS"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('leaderboard')}
          label="LEADERBOARD"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('how-to-play')}
          label="HOW TO PLAY"
        />
      </vstack>
      <spacer grow />

      {/* Experience Bar */}
      <vstack alignment="center middle" onPress={() => setPage('level')}>
        <hstack>
          <spacer width="20px" />
          <PixelText scale={2}>{`Level ${props.userData?.levelRank ?? 1}`}</PixelText>
          <spacer width="8px" />
          <PixelSymbol type="arrow-right" scale={2} color={Settings.theme.tertiary} />
        </hstack>
        <spacer height="8px" />

        <ProgressBar percentage={percentage} width={256} />
      </vstack>

      <spacer grow />
    </vstack>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    draw: <EditorPage {...props} onCancel={onClose} />,
    'my-drawings': <MyDrawingsPage {...props} onClose={onClose} onDraw={() => setPage('draw')} />,
    leaderboard: <LeaderboardPage {...props} onClose={onClose} />,
    'how-to-play': <HowToPlayPage onClose={onClose} />,
    level: (
      <LevelPage {...props} user={user} percentage={percentage} level={level} onClose={onClose} />
    ),
  };

  return pages[page] || Menu;
};
