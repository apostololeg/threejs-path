import { useCallback } from 'react';
import { withStore } from 'justorm/react';
import cn from 'classnames';
import { Button, Container, Spinner, Lazy } from '@foreverido/uilib';

import S from './StartScreen.styl';

export default withStore({
  user: ['isLoading', 'data'],
  game: ['isStarted'],
})(function StartScreen({ store: { user, game } }) {
  const renderContent = useCallback(() => {
    if (user.isLoading) return <Spinner size="l" />;
    if (user.data) return <Button onClick={() => game.start()}>Enter</Button>;
    // @ts-ignore
    return <Lazy loader={() => import('components/Auth/Auth')} />;
  }, [user.isLoading, user.data]);

  return (
    // @ts-ignore
    <Container
      alignItemsCenter
      justifyContentCenter
      className={cn(S.root, game.isStarted && S.isStarted)}
    >
      {renderContent()}
    </Container>
  );
});
